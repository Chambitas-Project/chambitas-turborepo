import os
import json
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

def extract_real_dataset_from_supabase(output_filename="students_data_real.csv"):
    base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
    output_path = os.path.join(base_data_path, output_filename)
    
    # Cargar variables de entorno
    root_env = Path(__file__).resolve().parent.parent.parent.parent / '.env'
    load_dotenv(dotenv_path=root_env)
    load_dotenv()

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError("SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son necesarios para extraer datos reales.")

    supabase: Client = create_client(url, key)

    print("[DB Extractor] Obteniendo postulaciones reales desde Supabase...")
    apps_res = supabase.table("applications").select("*").execute()
    apps = apps_res.data if apps_res.data else []

    if not apps:
        print("[DB Extractor] ADVERTENCIA: No hay postulaciones registradas en la BD. Se generará un dataset de estructura vacía.")
        # Retornamos dataset mínimo para evitar crash
        empty_df = pd.DataFrame(columns=[
            'est_id', 'est_university_id', 'est_carrera', 'est_ciclo', 'est_gpa', 
            'est_is_gpa_verified', 'est_evidence_url', 'est_hours_available', 'est_availability', 
            'pub_id', 'pub_title', 'pub_max_hours', 'pub_schedule', 'pub_req_json', 
            'est_mandatory_match', 'est_skill_match_ratio', 'es_apto', 
            'est_h_skills', 'est_s_skills', 'pub_req_h_skills', 'pub_req_s_skills', 
            'pub_title_full', 'pub_description', 'pub_complexity'
        ])
        empty_df.to_csv(output_path, index=False)
        return output_path

    # Obtener proyectos y perfiles
    project_ids = list(set([a['project_id'] for a in apps if a.get('project_id')]))
    student_ids = list(set([a['student_id'] for a in apps if a.get('student_id')]))

    projects_map = {}
    if project_ids:
        p_res = supabase.table("projects").select("*").in_("id", project_ids).execute()
        for p in (p_res.data or []):
            projects_map[p['id']] = p

    profiles_map = {}
    if student_ids:
        s_res = supabase.table("student_profiles").select("*").in_("user_id", student_ids).execute()
        for s in (s_res.data or []):
            profiles_map[s['user_id']] = s

    reviews_map = {}
    app_ids = [a['id'] for a in apps]
    if app_ids:
        r_res = supabase.table("reviews").select("*").in_("application_id", app_ids).execute()
        for r in (r_res.data or []):
            reviews_map[r['application_id']] = r

    rows = []
    for a in apps:
        p = projects_map.get(a.get('project_id'), {})
        s = profiles_map.get(a.get('student_id'), {})
        r = reviews_map.get(a.get('id'))

        status = a.get('status', 'pending')
        # Determinar etiqueta real es_apto (1 = exitoso, 0 = no exitoso)
        if status in ['accepted', 'completed']:
            es_apto = 1
            if r and r.get('rating', 5) < 3:
                es_apto = 0
        else:
            es_apto = 0

        # Formatear habilidades del estudiante
        raw_h_skills = s.get('h_skills') or s.get('hard_skills') or []
        if isinstance(raw_h_skills, list):
            est_h_skills = ", ".join([str(item) for item in raw_h_skills])
        else:
            est_h_skills = str(raw_h_skills)

        raw_s_skills = s.get('s_skills') or s.get('soft_skills') or []
        if isinstance(raw_s_skills, list):
            est_s_skills = ", ".join([str(item) for item in raw_s_skills])
        else:
            est_s_skills = str(raw_s_skills)

        # Formatear habilidades del proyecto
        raw_req = p.get('requirements') or []
        pub_req_h_skills = ", ".join([r.get('name', '') if isinstance(r, dict) else str(r) for r in raw_req])

        # Disponibilidad horarios por defecto si es nulo
        def_schedule = json.dumps({day: "11111111111111111111111111111111" for day in ['mon','tue','wed','thu','fri','sat','sun']})
        est_avail = json.dumps(s.get('availability')) if isinstance(s.get('availability'), dict) else (s.get('availability') or def_schedule)
        pub_sched = json.dumps(p.get('schedule_json')) if isinstance(p.get('schedule_json'), dict) else (p.get('schedule_json') or def_schedule)

        row = {
            'est_id': s.get('user_id', a.get('student_id')),
            'est_university_id': s.get('university_id', '59a91332-e18f-4e68-8061-fe83f4c7610f'),
            'est_carrera': s.get('career', 'Ingeniería de Software'),
            'est_ciclo': s.get('ciclo', 7),
            'est_gpa': s.get('gpa', 15.0),
            'est_is_gpa_verified': 1 if s.get('is_gpa_verified') else 0,
            'est_evidence_url': s.get('gpa_evidence_url', ''),
            'est_hours_available': s.get('hours_available', 20),
            'est_availability': est_avail,
            'pub_id': p.get('id', a.get('project_id')),
            'pub_title': p.get('title', 'Proyecto Real'),
            'pub_max_hours': p.get('max_hours', 20),
            'pub_schedule': pub_sched,
            'pub_req_json': json.dumps(raw_req) if isinstance(raw_req, list) else str(raw_req),
            'est_mandatory_match': 1,
            'est_skill_match_ratio': 1.0,
            'es_apto': es_apto,
            'est_h_skills': est_h_skills,
            'est_s_skills': est_s_skills,
            'pub_req_h_skills': pub_req_h_skills,
            'pub_req_s_skills': 'Trabajo en equipo, Comunicación',
            'pub_title_full': p.get('title', 'Proyecto Real'),
            'pub_description': p.get('description', ''),
            'pub_complexity': p.get('complexity', 'Media')
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"[DB Extractor] ✅ Dataset real de {len(df)} muestras extraído exitosamente en: {output_path}")
    return output_path

if __name__ == "__main__":
    extract_real_dataset_from_supabase()
