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

    print("[DB Extractor] Obteniendo perfiles, proyectos y postulaciones reales desde Supabase...")
    
    # 1. Obtener perfiles de estudiantes y proyectos reales
    students_res = supabase.table("student_profiles").select("*").execute()
    students = students_res.data if students_res.data else []

    # Solo considerar proyectos que estén en estado 'open'
    projects_res = supabase.table("projects").select("*").eq("status", "open").execute()
    projects = projects_res.data if projects_res.data else []

    apps_res = supabase.table("applications").select("*").execute()
    apps = apps_res.data if apps_res.data else []

    reviews_res = supabase.table("reviews").select("*").execute()
    reviews = reviews_res.data if reviews_res.data else []

    if not students or not projects:
        print("[DB Extractor] ADVERTENCIA: No se encontraron perfiles de estudiantes o proyectos en Supabase.")
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

    # Mapeo de postulaciones existentes (student_id + project_id -> application)
    apps_map = {}
    for a in apps:
        key_pair = f"{a.get('student_id')}_{a.get('project_id')}"
        apps_map[key_pair] = a

    reviews_map = {r.get('application_id'): r for r in reviews if r.get('application_id')}

    rows = []
    # Generar pares entre los estudiantes reales y los proyectos reales de la BD
    for s in students:
        s_id = s.get('user_id') or s.get('id')
        
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

        def_schedule = json.dumps({day: "11111111111111111111111111111111" for day in ['mon','tue','wed','thu','fri','sat','sun']})
        est_avail = json.dumps(s.get('availability')) if isinstance(s.get('availability'), dict) else (s.get('availability') or def_schedule)

        for p in projects:
            p_id = p.get('id')
            raw_req = p.get('requirements') or []
            pub_req_h_skills = ", ".join([r.get('name', '') if isinstance(r, dict) else str(r) for r in raw_req])
            pub_sched = json.dumps(p.get('schedule_json')) if isinstance(p.get('schedule_json'), dict) else (p.get('schedule_json') or def_schedule)

            # Verificar si hay postulación/reseña real en Supabase para este par
            pair_key = f"{s_id}_{p_id}"
            app = apps_map.get(pair_key)

            if app:
                status = app.get('status', 'pending')
                rev = reviews_map.get(app.get('id'))
                if status in ['accepted', 'completed']:
                    es_apto = 1
                    if rev and rev.get('rating', 5) < 3:
                        es_apto = 0
                else:
                    es_apto = 0
            else:
                # Lógica realista basada en habilidades, horarios y horas (igual que en datos sintéticos)
                es_apto = 0
                s_hours = s.get('hours_available', 20)
                p_hours = p.get('max_hours', 20)
                
                hours_ok = s_hours >= p_hours
                
                schedule_ok = False
                try:
                    est_sched = json.loads(est_avail) if isinstance(est_avail, str) else est_avail
                    pub_sch = json.loads(pub_sched) if isinstance(pub_sched, str) else pub_sched
                    t_req, t_over = 0, 0
                    for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
                        e_bits = est_sched.get(day, "0"*32)
                        p_bits = pub_sch.get(day, "0"*32)
                        for eb, pb in zip(e_bits, p_bits):
                            if pb == '1':
                                t_req += 1
                                if eb == '1': t_over += 1
                    schedule_ok = (t_over / t_req) >= 0.5 if t_req > 0 else True
                except:
                    pass
                
                if hours_ok and schedule_ok:
                    match_score = 0
                    mandatory_fail = False
                    
                    est_skills_lower = []
                    for sk in (raw_h_skills + raw_s_skills):
                        val = sk.get('name', '').lower() if isinstance(sk, dict) else str(sk).lower()
                        est_skills_lower.append(val)
                    
                    for req in raw_req:
                        r_name = req.get('name', '').lower() if isinstance(req, dict) else str(req).lower()
                        is_mand = req.get('mandatory', False) if isinstance(req, dict) else False
                        
                        if r_name in est_skills_lower:
                            match_score += 1
                        else:
                            if is_mand:
                                mandatory_fail = True
                                
                    match_ratio = (match_score / len(raw_req)) if len(raw_req) > 0 else 1.0
                    
                    if not mandatory_fail and match_ratio >= 0.4: es_apto = 1
                    elif match_ratio >= 0.7: es_apto = 1
            row = {
                'est_id': s_id,
                'est_university_id': s.get('university_id', '59a91332-e18f-4e68-8061-fe83f4c7610f'),
                'est_carrera': s.get('career', 'Ingeniería de Software'),
                'est_ciclo': s.get('ciclo', 7),
                'est_gpa': s.get('gpa', 15.0),
                'est_is_gpa_verified': 1 if s.get('is_gpa_verified') else 0,
                'est_evidence_url': s.get('gpa_evidence_url', ''),
                'est_hours_available': s.get('hours_available', 20),
                'est_availability': est_avail,
                'pub_id': p_id,
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
    print(f"[DB Extractor] ✅ Dataset real de {len(df)} registros ({len(students)} estudiantes x {len(projects)} proyectos) guardado en: {output_path}")
    return output_path

if __name__ == "__main__":
    extract_real_dataset_from_supabase()
