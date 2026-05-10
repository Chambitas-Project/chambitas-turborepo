from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import joblib
import json
from scipy.stats import spearmanr
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Cargar modelos y datos (Versión 10.0.0 Híbrida)
try:
    vectorizer = joblib.load('data/vectorizer_tesis.pkl')
    rf_model = joblib.load('data/model_rf_tesis.pkl')
    kmeans_model = joblib.load('data/model_kmeans_tesis.pkl')
    knn_model = joblib.load('data/model_knn_tesis.pkl')
    cat_cols = joblib.load('data/model_cat_cols_tesis.pkl')
    df_data = pd.read_csv('data/students_data_tesis_final.csv')
except Exception as e:
    print(f"Error cargando modelos V10: {e}. Ejecuta train_model.py primero.")

def check_schedule_overlap(est_availability, pub_schedule):
    try:
        est = json.loads(est_availability)
        pub = json.loads(pub_schedule)
        total_requested_bits = 0
        overlap_bits = 0
        for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
            for e, p in zip(est[day], pub[day]):
                if p == '1':
                    total_requested_bits += 1
                    if e == '1': overlap_bits += 1
        return (overlap_bits / total_requested_bits) if total_requested_bits > 0 else 1.0
    except:
        return 0.0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # 1. Inputs del Alumno
        est_uni_id = data.get('university_id', "59a91332-e18f-4e68-8061-fe83f4c7610f")
        est_carrera = data.get('carrera', 'Ingeniería de Software')
        est_ciclo = int(data.get('ciclo', 1))
        est_gpa = float(data.get('gpa', 15.0))
        est_is_verified = bool(data.get('is_gpa_verified', False))
        est_h_skills = data.get('h_skills', '')
        est_s_skills = data.get('s_skills', '')
        est_hours = int(data.get('hours_week', 20))
        est_availability = data.get('availability', '{"mon":["1","1","1","1","1","1","1","1"],"tue":["1","1","1","1","1","1","1","1"],"wed":["1","1","1","1","1","1","1","1"],"thu":["1","1","1","1","1","1","1","1"],"fri":["1","1","1","1","1","1","1","1"],"sat":["0","0","0","0","0","0","0","0"],"sun":["0","0","0","0","0","0","0","0"]}')
        
        combined_est = f"{est_h_skills} {est_s_skills}"
        v_est = vectorizer.transform([combined_est]).toarray()
        
        matches = []
        proyectos_unicos = df_data.drop_duplicates(subset=['pub_req_json']).head(50)
        
        for idx, row in proyectos_unicos.iterrows():
            # --- FASE 1: HARD FILTERS ---
            if est_uni_id != row['pub_university_id']: continue
            if est_hours < row['pub_max_hours']: continue
            overlap = check_schedule_overlap(est_availability, row['pub_schedule'])
            if overlap < 0.5: continue
            
            # Cálculo de Business Features para la IA
            pub_req_data = json.loads(row['pub_req_json'])
            match_score = 0
            mandatory_fail = False
            for req in pub_req_data:
                if req['name'].lower() in combined_est.lower():
                    match_score += 1
                elif req.get('mandatory'):
                    mandatory_fail = True
            
            skill_match_ratio = match_score / len(pub_req_data)
            if mandatory_fail: continue

            # --- FASE 2: IA & SCORING ---
            # 1. Similitud TF-IDF
            v_pub = vectorizer.transform([row['pub_req_h_skills']]).toarray()
            cos_sim = cosine_similarity(v_est, v_pub)[0][0]
            if cos_sim < 0.3: continue # Umbral de seguridad

            # 2. Segmentación K-Means (Perfil del alumno)
            profile_cluster = kmeans_model.predict([[est_gpa, est_ciclo, cos_sim]])[0]

            # 3. Clasificación Supervisada (Random Forest)
            x_num = [est_ciclo, est_gpa, int(est_is_verified), 0 if mandatory_fail else 1, skill_match_ratio, est_hours, row['pub_max_hours'], cos_sim, overlap, profile_cluster]
            x_cat = [1 if f"est_carrera_{est_carrera}" in col or f"pub_complexity_{row['pub_complexity']}" in col else 0 for col in cat_cols]
            
            ml_prob = rf_model.predict_proba([x_num + x_cat])[0][1]

            # 4. Score Híbrido Final (Promediando ML con tu fórmula)
            # Damos 50% al ML (que ya sabe de gpa y skills) y 50% a la consistencia académica manual
            weighted_score = (ml_prob * 0.7) + (est_gpa/20 * 0.2) + (0.1 if est_is_verified else 0)
            
            # Fase 3: Categorización
            category = "Potential"
            if weighted_score >= 0.85: category = "Top Match"
            elif weighted_score >= 0.65: category = "Good Match"
            
            matches.append({
                'id': idx,
                'title': f"Proyecto en {row['pub_category']}",
                'category_label': category,
                'score': round(weighted_score * 100, 1),
                'ml_confidence': round(ml_prob * 100, 1),
                'cluster': int(profile_cluster),
                'verified': est_is_verified,
                'h_skills': row['pub_req_h_skills'],
                'overlap': round(overlap * 100, 1)
            })
        
        matches = sorted(matches, key=lambda x: x['score'], reverse=True)
        return jsonify({'success': True, 'matches': matches[:10]})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/dashboard')
def dashboard():
    try:
        with open('data/metrics_tesis.json', 'r') as f:
            metrics = json.load(f)
    except:
        metrics = {}
    return render_template('dashboard.html', metrics=metrics)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
