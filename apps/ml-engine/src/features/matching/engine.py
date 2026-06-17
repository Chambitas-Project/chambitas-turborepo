import os
import json
import joblib
import numpy as np
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer

# Asegurar recursos de NLTK
nltk.download('stopwords', quiet=True)

class MatchingEngine:
    def __init__(self):
        self.base_path = os.path.join(os.path.dirname(__file__), '../../../data')
        self.stemmer = SnowballStemmer('spanish')
        self.stop_words = set(stopwords.words('spanish'))
        self.load_models()

    def load_models(self):
        try:
            self.rf = joblib.load(os.path.join(self.base_path, 'model_rf_tesis.pkl'))
            self.vectorizer = joblib.load(os.path.join(self.base_path, 'vectorizer_tesis.pkl'))
            self.svd = joblib.load(os.path.join(self.base_path, 'svd_tesis.pkl'))
            self.kmeans = joblib.load(os.path.join(self.base_path, 'model_kmeans_tesis.pkl'))
            self.cat_cols = joblib.load(os.path.join(self.base_path, 'model_cat_cols_tesis.pkl'))
            print(f"[OK] Matching Engine: Modelos V12 (SVD {self.svd.components_.shape[0]}D) cargados correctamente.")
        except Exception as e:
            print(f"[ERROR] No se pudieron cargar los modelos ML: {e}")
            self.rf = None

    def clean_and_lemmatize(self, text):
        if not text:
            return ""
        # Minúsculas
        text = str(text).lower()
        # Eliminar números y caracteres especiales
        text = re.sub(r'[^a-záéíóúñ\s]', '', text)
        # Tokenización, stopwords y stemming
        words = text.split()
        words = [self.stemmer.stem(w) for w in words if w not in self.stop_words]
        return " ".join(words)

    def get_text_embedding(self, text):
        """
        Devuelve un array nativo de Python correspondiente a la representación SVD del texto,
        rellenado con ceros (padding) para cumplir estrictamente con pgvector(300).
        """
        if not self.svd or not self.vectorizer:
            return [0.0] * 300
        cleaned_text = self.clean_and_lemmatize(text)
        vector_denso = self.svd.transform(self.vectorizer.transform([cleaned_text]))[0].tolist()
        
        # Zero-Padding hasta llegar a 300
        if len(vector_denso) < 300:
            vector_denso.extend([0.0] * (300 - len(vector_denso)))
            
        return vector_denso

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

        # 1. NLP PIPELINE Y FEATURE ENGINEERING (SVD 300D)
        combined_est = f"{student_data.hSkills} {student_data.sSkills}"
        combined_pub = f"{project_data.reqHSkills}"
        
        # Generar las representaciones densas
        v_est = self.get_text_embedding(combined_est)
        v_pub = self.get_text_embedding(combined_pub)
        
        # Matriz densa comprimida como diferencia absoluta
        svd_diff = np.abs(np.array(v_est) - np.array(v_pub)).tolist()

        # 2. FEATURE ENGINEERING (Filtros y Negocio)
        schedule_overlap = self.check_schedule_overlap(student_data.availabilityJson, project_data.scheduleJson)
        
        req_data = json.loads(project_data.reqJson)
        est_skills = student_data.hSkills.split(", ")
        
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

        # 3. K-MEANS (Clustering de Perfil usando la matriz densa de 300D)
        # Features base + 300D vector
        kmeans_features = [student_data.gpa, student_data.ciclo] + v_est
        
        # Generamos nombres de columnas dinámicos (fijos a 300 por el padding)
        kmeans_cols = ['est_gpa', 'est_ciclo'] + [f'svd_{i}' for i in range(300)]
        kmeans_df = pd.DataFrame([kmeans_features]) 
        cluster = int(self.kmeans.predict(kmeans_df.values)[0])

        # 4. PREDICCIÓN RANDOM FOREST
        X_numeric_base = [
            student_data.ciclo, student_data.gpa, int(student_data.isGpaVerified),
            mandatory_match, skill_match_ratio,
            student_data.hoursAvailable, project_data.maxHours,
            schedule_overlap, cluster
        ]
        
        # One-Hot Encoding dinámico basado en lo guardado en el entrenamiento
        current_features = {
            f"est_carrera_{student_data.career}": 1,
            f"pub_complexity_{project_data.complexity}": 1
        }
        
        X_cat = [current_features.get(col, 0) for col in self.cat_cols]
        
        # Combinar todo: Numéricas Base + Matriz de 300D (SVD Diff) + Categóricas OHE
        X_final = X_numeric_base + svd_diff + X_cat

        # Obtener probabilidad de clase 1 (Apto)
        proba = self.rf.predict_proba([X_final])[0][1]

        return {
            "score": round(float(proba), 4),
            "cluster": cluster,
            "skill_match_ratio": round(skill_match_ratio, 4),
            "mandatory_match": bool(mandatory_match)
        }

# Instancia única (Singleton-like) para ser usada por el servidor gRPC
engine = MatchingEngine()
