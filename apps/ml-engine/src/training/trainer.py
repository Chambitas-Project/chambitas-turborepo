import pandas as pd
import numpy as np
import json
import joblib
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
from dotenv import load_dotenv
from supabase import create_client, Client
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import f1_score, precision_score, recall_score
from imblearn.over_sampling import SMOTE

# Download NLTK resources
nltk.download('stopwords', quiet=True)

stemmer = SnowballStemmer('spanish')
stop_words = set(stopwords.words('spanish'))

def clean_and_lemmatize(text):
    if pd.isna(text):
        return ""
    # Convert to lowercase
    text = str(text).lower()
    # Remove special characters and numbers (Regex)
    text = re.sub(r'[^a-záéíóúñ\s]', '', text)
    # Tokenize, remove stopwords and stem
    words = text.split()
    words = [stemmer.stem(w) for w in words if w not in stop_words]
    return " ".join(words)

def check_schedule_overlap(est_availability_json, pub_schedule_json):
    try:
        est = json.loads(est_availability_json)
        pub = json.loads(pub_schedule_json)
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

def train_tesis_v10_hybrid():
    base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
    data_path = os.path.join(base_data_path, 'students_data_tesis_final.csv')
    df = pd.read_csv(data_path)

    # 1. NLP PIPELINE: LIMPIEZA, LEMATIZACIÓN, TF-IDF Y SVD
    df['combined_est'] = (df['est_h_skills'].fillna('') + " " + df['est_s_skills'].fillna('')).apply(clean_and_lemmatize)
    df['combined_pub'] = (df['pub_title'].fillna('') + " " + df['pub_description'].fillna('') + " " + df['pub_req_h_skills'].fillna('') + " " + df['pub_req_s_skills'].fillna('')).apply(clean_and_lemmatize)
    
    # TF-IDF
    vectorizer = TfidfVectorizer()
    all_text = pd.concat([df['combined_est'], df['combined_pub']])
    vectorizer.fit(all_text)
    joblib.dump(vectorizer, os.path.join(base_data_path, 'vectorizer_tesis.pkl'))

    # TruncatedSVD (hasta 300 dimensiones, dinámico según el corpus)
    X_tfidf = vectorizer.transform(all_text)
    n_features = X_tfidf.shape[1]
    # SVD requiere n_components < n_features
    n_comps = min(300, n_features - 1) if n_features > 1 else 1
    
    svd = TruncatedSVD(n_components=n_comps, random_state=42)
    svd.fit(X_tfidf)
    joblib.dump(svd, os.path.join(base_data_path, 'svd_tesis.pkl'))
    print(f"[OK] Pipeline NLP: Vectorizer y SVD ({n_comps} dims) entrenados y guardados.")

    # Extraer características densas
    v_est_tfidf = vectorizer.transform(df['combined_est'])
    v_pub_tfidf = vectorizer.transform(df['combined_pub'])
    
    X_svd_est_raw = svd.transform(v_est_tfidf)
    X_svd_pub_raw = svd.transform(v_pub_tfidf)
    
    # Padding de ceros para garantizar exactamente 300 dimensiones (pgvector requirement)
    pad_width = 300 - X_svd_est_raw.shape[1]
    if pad_width > 0:
        X_svd_est = np.pad(X_svd_est_raw, ((0, 0), (0, pad_width)), mode='constant')
        X_svd_pub = np.pad(X_svd_pub_raw, ((0, 0), (0, pad_width)), mode='constant')
    else:
        X_svd_est = X_svd_est_raw
        X_svd_pub = X_svd_pub_raw
    
    # Para el modelo predictivo de Match usaremos la Similitud Coseno (como dicta la Fase 2 del paper)
    from sklearn.metrics.pairwise import paired_cosine_distances
    # paired_cosine_distances devuelve 1 - sim(u, v). Para obtener similitud: 1 - dist
    cosine_sims = 1.0 - paired_cosine_distances(X_svd_est, X_svd_pub)
    X_cosine_sim = cosine_sims.reshape(-1, 1)

    # Variables adicionales
    overlaps = [check_schedule_overlap(df['est_availability'][i], df['pub_schedule'][i]) for i in range(len(df))]
    df['schedule_overlap'] = overlaps
    df['est_is_gpa_verified'] = df['est_is_gpa_verified'].astype(int)

    # 3. K-MEANS (Segmentación basada en la representación densa de 300D del Estudiante)
    kmeans_base = df[['est_gpa', 'est_ciclo']].values
    X_kmeans = np.hstack([kmeans_base, X_svd_est])
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['profile_cluster'] = kmeans.fit_predict(X_kmeans)
    joblib.dump(kmeans, os.path.join(base_data_path, 'model_kmeans_tesis.pkl'))
    print(f"[OK] K-Means: Entrenado usando matriz densa ({X_kmeans.shape[1]} features). {len(df['profile_cluster'].unique())} clústeres generados.")

    # 4. KNN (Emparejamiento por Cercanía)
    knn = NearestNeighbors(n_neighbors=5, metric='euclidean')
    knn.fit(X_kmeans)
    joblib.dump(knn, os.path.join(base_data_path, 'model_knn_tesis.pkl'))
    print("[OK] KNN: Modelo de cercanía entrenado con matriz densa.")

    # 5. RANDOM FOREST (Clasificación Híbrida usando Similitud Coseno)
    X_numeric_base = df[[
        'est_ciclo', 'est_gpa', 'est_is_gpa_verified', 
        'est_mandatory_match', 'est_skill_match_ratio',
        'est_hours_available', 'pub_max_hours', 
        'schedule_overlap', 'profile_cluster'
    ]].values
    
    # Concatenamos las características numéricas base con la Similitud Coseno
    X_numeric = np.hstack([X_numeric_base, X_cosine_sim])
    
    df_cat = pd.get_dummies(df[['est_carrera', 'pub_complexity']])
    X = np.hstack([X_numeric, df_cat.values])
    y = df['es_apto']
    
    joblib.dump(list(df_cat.columns), os.path.join(base_data_path, 'model_cat_cols_tesis.pkl'))
    
    # DIVISIÓN DE DATOS
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # BALANCEO CON SMOTE
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    print(f"[OK] SMOTE: Dataset balanceado ({len(y_train)} -> {len(y_train_res)} muestras).")

    # ENTRENAMIENTO RF
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_train_res, y_train_res)
    joblib.dump(rf, os.path.join(base_data_path, 'model_rf_tesis.pkl'))

    # 6. MÉTRICAS FINALES
    from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix, classification_report
    y_pred = rf.predict(X_test)
    f1 = f1_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    
    metrics = {
        'precision': round(prec, 3),
        'recall': round(rec, 3),
        'f1_score': round(f1, 3)
    }
    
    print("\n" + "="*50)
    print("--- ENTRENAMIENTO V12 COMPLETADO (HÍBRIDO 300D SVD) ---")
    print(f"F1-Score:  {f1:.3f}")
    print(f"Precision: {prec:.3f}")
    print(f"Recall:    {rec:.3f}")
    print("\n--- MATRIZ DE CONFUSIÓN ---")
    print(confusion_matrix(y_test, y_pred))
    print("\n--- REPORTE DE CLASIFICACIÓN ---")
    print(classification_report(y_test, y_pred, digits=3))
    print("="*50)

    # 7. REGISTRO EN SUPABASE
    register_model_version_in_supabase(metrics, "v12.0.0", n_comps)

def get_next_version(supabase: Client, base_version="v12.0.0"):
    try:
        prefix = base_version.split('.')[0]
        response = supabase.table("ml_model_versions") \
            .select("version_tag") \
            .ilike("version_tag", f"{prefix}.%") \
            .order("trained_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not response.data:
            return base_version
        
        last_version = response.data[0]['version_tag']
        parts = last_version.replace('v', '').split('.')
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        return f"v{major}.{minor}.{patch + 1}"
    except Exception as e:
        print(f"[DEBUG] Error en get_next_version: {e}")
        return base_version

def register_model_version_in_supabase(metrics, version="v12.0.0", n_comps=300):
    from pathlib import Path
    root_env = Path(__file__).resolve().parent.parent.parent.parent.parent / '.env'
    load_dotenv(dotenv_path=root_env)
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("\n[SKIP] Supabase credentials not found. skipping version registration.")
        return

    try:
        supabase: Client = create_client(url, key)
        version_tag = get_next_version(supabase, version)
        h_params = {
            "smote": True, 
            "clusters": 3, 
            "n_estimators": 100, 
            "svd_components": 300,
            "scenario": "upc_standard_academic_limits",
            "gpa_range": [13, 20],
            "n_samples": 20000,
            "skills_per_student": [3, 10]
        }

        data = {
            "algorithm": "Hybrid (RF + KNN + KMeans + TFIDF + SVD300_Padded)",
            "version_tag": version_tag,
            "f1_score": float(metrics['f1_score']),
            "precision_val": float(metrics['precision']),
            "recall_val": float(metrics['recall']),
            "hyperparameters": h_params,
            "active": True,
            "trained_at": pd.Timestamp.now().isoformat()
        }
        
        supabase.table("ml_model_versions").update({"active": False}).eq("active", True).execute()
        supabase.table("ml_model_versions").insert(data).execute()
        
        print(f"\n[OK] Model version '{version_tag}' registered and activated in Supabase.")
    except Exception as e:
        print(f"\n[ERROR] Failed to register model version in Supabase: {str(e)}")

if __name__ == "__main__":
    train_tesis_v10_hybrid()
