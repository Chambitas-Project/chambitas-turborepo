import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

class MatchingEngine:
    def __init__(self):
        self.base_path = os.path.join(os.path.dirname(__file__), '../../../data')
        self.load_models()

    def load_models(self):
        try:
            self.rf = joblib.load(os.path.join(self.base_path, 'model_rf_tesis.pkl'))
            self.vectorizer = joblib.load(os.path.join(self.base_path, 'vectorizer_tesis.pkl'))
            self.kmeans = joblib.load(os.path.join(self.base_path, 'model_kmeans_tesis.pkl'))
            self.cat_cols = joblib.load(os.path.join(self.base_path, 'model_cat_cols_tesis.pkl'))
            print("[OK] Matching Engine: Modelos V11 cargados correctamente.")
        except Exception as e:
            print(f"[ERROR] No se pudieron cargar los modelos ML: {e}")
            self.rf = None

    def check_schedule_overlap(self, est_avail, pub_sched):
        try:
            est = json.loads(est_avail)
            pub = json.loads(pub_sched)
            total_req = 0
            overlap = 0
            for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
                for e, p in zip(est[day], pub[day]):
                    if p == '1':
                        total_req += 1
                        if e == '1': overlap += 1
            return (overlap / total_req) if total_req > 0 else 1.0
        except:
            return 0.0

    def calculate_match(self, student_data, project_data):
        if not self.rf:
            return {"score": 0.0, "cluster": -1, "error": "Modelos no cargados"}

        # 1. FEATURE ENGINEERING (Similitud Semántica)
        combined_est = f"{student_data.hSkills} {student_data.sSkills}"
        combined_pub = f"{project_data.reqHSkills}" # Podríamos añadir soft si existieran en el proto
        
        v_est = self.vectorizer.transform([combined_est])
        v_pub = self.vectorizer.transform([combined_pub])
        cosine_sim = float(cosine_similarity(v_est, v_pub)[0][0])

        # 2. FEATURE ENGINEERING (Filtros y Negocio)
        schedule_overlap = self.check_schedule_overlap(student_data.availabilityJson, project_data.scheduleJson)
        
        # Calcular mandatory_match y skill_match_ratio (Lógica de Negocio V11)
        # Nota: Aquí asumimos que el orquestador ya filtró lo básico, 
        # pero recalculamos para el Random Forest.
        req_data = json.loads(project_data.reqJson)
        est_skills = student_data.hSkills.split(", ") # Simplificación para el prototipo
        
        match_score = 0
        mandatory_fail = False
        for req in req_data:
            skill_obj = req.get('skills', {})
            skill_name = skill_obj.get('name', '')
            if skill_name in est_skills: 
                match_score += 1
            elif req.get('mandatory', False): 
                mandatory_fail = True
        
        skill_match_ratio = match_score / len(req_data) if req_data else 0
        mandatory_match = 0 if mandatory_fail else 1

        # 3. K-MEANS (Clustering de Perfil)
        # Usamos DataFrame para evitar el UserWarning de feature names
        kmeans_df = pd.DataFrame(
            [[student_data.gpa, student_data.ciclo, cosine_sim]], 
            columns=['gpa', 'ciclo', 'cosine_sim']
        )
        cluster = int(self.kmeans.predict(kmeans_df)[0])

        # 4. PREDICCIÓN RANDOM FOREST
        # Reconstruir el vector de entrada con One-Hot Encoding para Carrera y Complejidad
        X_numeric = [
            student_data.ciclo, student_data.gpa, int(student_data.isGpaVerified),
            mandatory_match, skill_match_ratio,
            student_data.hoursAvailable, project_data.maxHours,
            cosine_sim, schedule_overlap, cluster
        ]
        
        # One-Hot Encoding dinámico basado en lo guardado en el entrenamiento
        current_features = {
            f"est_carrera_{student_data.career}": 1,
            f"pub_complexity_{project_data.complexity}": 1
        }
        
        # 4. PREDICCIÓN RANDOM FOREST
        X_cat = [current_features.get(col, 0) for col in self.cat_cols]
        
        # Combinar todo en un DataFrame con nombres de columnas
        numeric_cols = [
            'ciclo', 'gpa', 'is_gpa_verified', 'mandatory_match', 
            'skill_match_ratio', 'hours_available', 'max_hours', 
            'cosine_sim', 'schedule_overlap', 'cluster'
        ]
        X_final_df = pd.DataFrame([X_numeric + X_cat], columns=numeric_cols + list(self.cat_cols))

        # Obtener probabilidad de clase 1 (Apto)
        proba = self.rf.predict_proba(X_final_df)[0][1]

        return {
            "score": round(float(proba), 4),
            "cluster": cluster,
            "skill_match_ratio": round(skill_match_ratio, 4),
            "mandatory_match": bool(mandatory_match)
        }

# Instancia única (Singleton-like) para ser usada por el servidor gRPC
engine = MatchingEngine()
