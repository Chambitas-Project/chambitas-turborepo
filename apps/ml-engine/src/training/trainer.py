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

def train_tesis_v10_hybrid(data_filename='students_data_tesis_final.csv', use_real_data=False):
    base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
    
    if use_real_data:
        from src.training.db_extractor import extract_real_dataset_from_supabase
        data_path = extract_real_dataset_from_supabase("students_data_real.csv")
    else:
        data_path = os.path.join(base_data_path, data_filename)
        
    df = pd.read_csv(data_path)
    if len(df) == 0:
        print("[ERROR] No hay datos disponibles en la base de datos para entrenar.")
        return

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
    
    pad_width = 300 - X_svd_est_raw.shape[1]
    if pad_width > 0:
        X_svd_est = np.pad(X_svd_est_raw, ((0, 0), (0, pad_width)), mode='constant')
        X_svd_pub = np.pad(X_svd_pub_raw, ((0, 0), (0, pad_width)), mode='constant')
    else:
        X_svd_est = X_svd_est_raw
        X_svd_pub = X_svd_pub_raw
    
    from sklearn.metrics.pairwise import paired_cosine_distances
    cosine_sims = 1.0 - paired_cosine_distances(X_svd_est, X_svd_pub)
    X_cosine_sim = cosine_sims.reshape(-1, 1)

    overlaps = [check_schedule_overlap(df['est_availability'][i], df['pub_schedule'][i]) for i in range(len(df))]
    df['schedule_overlap'] = overlaps
    df['est_is_gpa_verified'] = df['est_is_gpa_verified'].astype(int)

    # 3. K-MEANS
    kmeans_base = df[['est_gpa', 'est_ciclo']].values
    X_kmeans = np.hstack([kmeans_base, X_svd_est])
    
    n_clusters = min(3, max(1, len(df)))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['profile_cluster'] = kmeans.fit_predict(X_kmeans)
    joblib.dump(kmeans, os.path.join(base_data_path, 'model_kmeans_tesis.pkl'))
    print(f"[OK] K-Means: Entrenado usando matriz densa ({X_kmeans.shape[1]} features).")

    # 4. KNN
    n_neighbors = min(5, max(1, len(df)))
    knn = NearestNeighbors(n_neighbors=n_neighbors, metric='euclidean')
    knn.fit(X_kmeans)
    joblib.dump(knn, os.path.join(base_data_path, 'model_knn_tesis.pkl'))
    print("[OK] KNN: Modelo de cercanía entrenado con matriz densa.")

    # 5. RANDOM FOREST
    X_numeric_base = df[[
        'est_ciclo', 'est_gpa', 'est_is_gpa_verified', 
        'est_mandatory_match', 'est_skill_match_ratio',
        'est_hours_available', 'pub_max_hours', 
        'schedule_overlap', 'profile_cluster'
    ]].values
    
    X_numeric = np.hstack([X_numeric_base, X_cosine_sim])
    df_cat = pd.get_dummies(df[['est_carrera', 'pub_complexity']])
    X = np.hstack([X_numeric, df_cat.values])
    y = df['es_apto'].values
    
    joblib.dump(list(df_cat.columns), os.path.join(base_data_path, 'model_cat_cols_tesis.pkl'))
    
    # DIVISIÓN Y BALANCEO SEGURO
    if len(df) > 5 and len(np.unique(y)) > 1:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        try:
            smote = SMOTE(random_state=42, k_neighbors=min(5, max(1, len(X_train)-1)))
            X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
        except Exception as smote_err:
            print(f"[INFO] Omitiendo SMOTE por tamaño de muestra reducido: {smote_err}")
            X_train_res, y_train_res = X_train, y_train
    else:
        X_train_res, y_train_res = X, y
        X_test, y_test = X, y

    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_train_res, y_train_res)
    joblib.dump(rf, os.path.join(base_data_path, 'model_rf_tesis.pkl'))

    # 6. MÉTRICAS FINALES
    from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix, classification_report
    y_pred = rf.predict(X_test)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    
    try:
        cm = confusion_matrix(y_test, y_pred)
        cm_dict = {
            'tn': int(cm[0][0]) if cm.shape == (2,2) else int(cm[0][0]),
            'fp': int(cm[0][1]) if cm.shape == (2,2) else 0,
            'fn': int(cm[1][0]) if cm.shape == (2,2) else 0,
            'tp': int(cm[1][1]) if cm.shape == (2,2) else 0
        }
    except Exception:
        cm_dict = {'tn': 0, 'fp': 0, 'fn': 0, 'tp': len(y_test)}

    metrics = {
        'precision': round(float(prec), 3),
        'recall': round(float(rec), 3),
        'f1_score': round(float(f1), 3),
        'confusion_matrix': cm_dict
    }
    
    print("\n" + "="*50)
    print(f"--- ENTRENAMIENTO COMPLETADO ({'REAL BD' if use_real_data else 'SINTÉTICO'}) ---")
    print(f"F1-Score:  {f1:.3f}")
    print(f"Precision: {prec:.3f}")
    print(f"Recall:    {rec:.3f}")
    print("="*50)

    # 7. REGISTRO EN SUPABASE
    scenario_tag = "real_database_extracted" if use_real_data else "upc_standard_academic_limits"
    register_model_version_in_supabase(metrics, "v12.0.0", n_comps, scenario=scenario_tag, n_samples=len(df))

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

def register_model_version_in_supabase(metrics, version="v12.0.0", n_comps=300, scenario="upc_standard_academic_limits", n_samples=5000):
    from pathlib import Path
    root_env = Path(__file__).resolve().parent.parent.parent.parent / '.env'
    load_dotenv(dotenv_path=root_env)
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
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
            "svd_components": n_comps,
            "scenario": scenario,
            "n_samples": n_samples,
            "confusion_matrix": metrics.get('confusion_matrix')
        }

        data = {
            "algorithm": f"Hybrid ({'Real BD Data' if scenario == 'real_database_extracted' else 'Synthetic Data'})",
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
    import sys
    use_real = "--use-real-data" in sys.argv or "true" in [a.lower() for a in sys.argv]
    train_tesis_v10_hybrid(use_real_data=use_real)

