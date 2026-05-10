import pandas as pd
import numpy as np
import json
import joblib
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from scipy.stats import spearmanr
from sklearn.metrics.pairwise import cosine_similarity

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

    # 1. VECTORIZACIÓN (TF-IDF - Aprendizaje No Supervisado para Semántica)
    df['combined_est'] = df['est_h_skills'].fillna('') + " " + df['est_s_skills'].fillna('')
    df['combined_pub'] = df['pub_req_h_skills'].fillna('') + " " + df['pub_req_s_skills'].fillna('')
    
    vectorizer = TfidfVectorizer()
    vectorizer.fit(pd.concat([df['combined_est'], df['combined_pub']]))
    joblib.dump(vectorizer, os.path.join(base_data_path, 'vectorizer_tesis.pkl'))

    # 2. FEATURE ENGINEERING (Similitudes y Filtros Críticos)
    cosine_sims = []
    overlaps = []
    for i in range(len(df)):
        v_est = vectorizer.transform([df['combined_est'][i]]).toarray()
        v_pub = vectorizer.transform([df['combined_pub'][i]]).toarray()
        cosine_sims.append(cosine_similarity(v_est, v_pub)[0][0])
        overlaps.append(check_schedule_overlap(df['est_availability'][i], df['pub_schedule'][i]))
    
    df['cosine_sim'] = cosine_sims
    df['schedule_overlap'] = overlaps
    df['est_is_gpa_verified'] = df['est_is_gpa_verified'].astype(int)

    # 3. K-MEANS (Aprendizaje No Supervisado - Segmentación de Perfiles)
    # Agrupamos por GPA, Ciclo y Similitud Técnica para crear "Arquetipos de Estudiante"
    kmeans_features = df[['est_gpa', 'est_ciclo', 'cosine_sim']]
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['profile_cluster'] = kmeans.fit_predict(kmeans_features)
    joblib.dump(kmeans, os.path.join(base_data_path, 'model_kmeans_tesis.pkl'))
    print(f"[OK] K-Means: {len(df['profile_cluster'].unique())} clústeres generados.")

    # 4. KNN (Aprendizaje Supervisado/No Supervisado - Emparejamiento por Cercanía)
    # Entrenamos KNN sobre los perfiles exitosos para encontrar similitudes rápidas
    knn = NearestNeighbors(n_neighbors=5, metric='euclidean')
    knn.fit(kmeans_features)
    joblib.dump(knn, os.path.join(base_data_path, 'model_knn_tesis.pkl'))
    print("[OK] KNN: Modelo de cercanía espacial entrenado.")

    # 5. RANDOM FOREST (Aprendizaje Supervisado - Clasificación Final)
    # Incluimos las nuevas "Business Features" para alcanzar el 85%
    X_numeric = df[[
        'est_ciclo', 'est_gpa', 'est_is_gpa_verified', 
        'est_mandatory_match', 'est_skill_match_ratio',
        'est_hours_available', 'pub_max_hours', 
        'cosine_sim', 'schedule_overlap', 'profile_cluster'
    ]]
    df_cat = pd.get_dummies(df[['est_carrera', 'pub_complexity']])
    X = np.hstack([X_numeric.values, df_cat.values])
    y = df['es_apto']
    
    joblib.dump(list(df_cat.columns), os.path.join(base_data_path, 'model_cat_cols_tesis.pkl'))
    
    # DIVISIÓN DE DATOS
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # BALANCEO CON SMOTE (Para alcanzar el >85% de métricas)
    # SMOTE crea ejemplos sintéticos de la clase minoritaria (matches exitosos)
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    print(f"[OK] SMOTE: Dataset balanceado ({len(y_train)} -> {len(y_train_res)} muestras).")

    # ENTRENAMIENTO RF
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_train_res, y_train_res)
    joblib.dump(rf, os.path.join(base_data_path, 'model_rf_tesis.pkl'))

    # 6. MÉTRICAS FINALES
    y_pred = rf.predict(X_test)
    f1 = f1_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    
    metrics = {
        'precision': round(prec, 3),
        'recall': round(rec, 3),
        'f1_score': round(f1, 3),
        'importance': {
            'Cluster_KMeans': round(rf.feature_importances_[7], 3),
            'Similitud_TFIDF': round(rf.feature_importances_[5], 3),
            'GPA': round(rf.feature_importances_[1], 3),
            'Horario': round(rf.feature_importances_[6], 3)
        }
    }
    
    print("\n" + "="*50)
    print("--- ENTRENAMIENTO V11 COMPLETADO (HÍBRIDO FINAL) ---")
    print(f"F1-Score:  {f1:.3f} (Meta: >0.85)")
    print(f"Precision: {prec:.3f}")
    print(f"Recall:    {rec:.3f}")
    print("="*50)

    # 7. REGISTRO EN SUPABASE
    register_model_version_in_supabase(metrics, "v11.0.0")

def get_next_version(supabase: Client, base_version="v10.0.0"):
    try:
        # Buscamos cualquier versión que empiece con v10.
        prefix = base_version.split('.')[0] # "v10"
        response = supabase.table("ml_model_versions") \
            .select("version_tag") \
            .ilike("version_tag", f"{prefix}.%") \
            .order("trained_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not response.data:
            return base_version
        
        last_version = response.data[0]['version_tag']
        # Manejar incrementos de patch de forma segura
        parts = last_version.replace('v', '').split('.')
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        return f"v{major}.{minor}.{patch + 1}"
    except Exception as e:
        print(f"[DEBUG] Error en get_next_version: {e}")
        return base_version

def register_model_version_in_supabase(metrics, version="v10.0.0"):
    from pathlib import Path
    # Subir 4 niveles desde src/training/ para llegar a ml-engine, luego apps, luego root
    # trainer.py -> training -> src -> ml-engine -> apps -> root
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
        
        # Cargar configuración del dataset para hyperparameters
        try:
            base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
            with open(os.path.join(base_data_path, 'data_config.json'), 'r') as f:
                data_config = json.load(f)
        except:
            data_config = {}

        h_params = {"smote": True, "clusters": 3, "n_estimators": 100}
        h_params.update(data_config) # Mezclamos config de datos con config de modelo

        data = {
            "algorithm": "Hybrid (RF + KNN + KMeans + TFIDF)",
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
        
        # Guardar copia del CSV con el nombre de la versión para trazabilidad física
        try:
            import shutil
            base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
            src_csv = os.path.join(base_data_path, 'students_data_tesis_final.csv')
            dst_csv = os.path.join(base_data_path, f'students_data_{version_tag}.csv')
            shutil.copy2(src_csv, dst_csv)
            print(f"[OK] Dataset versionado guardado en: data/students_data_{version_tag}.csv")
        except Exception as e:
            print(f"[WARN] No se pudo crear la copia versionada del CSV: {e}")

        print(f"\n[OK] Model version '{version_tag}' registered and activated in Supabase.")
    except Exception as e:
        print(f"\n[ERROR] Failed to register model version in Supabase: {str(e)}")

if __name__ == "__main__":
    train_tesis_v10_hybrid() # El registro interno usará v11.0.0 como base
