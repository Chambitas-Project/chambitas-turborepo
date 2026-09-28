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

    def fetch_with_retry(query_fn, max_retries=3, delay=1):
        for attempt in range(max_retries):
            try:
                return query_fn().execute()
            except Exception as err:
                print(f"[DB Extractor] Intento {attempt + 1}/{max_retries} falló: {err}")
                if attempt == max_retries - 1:
                    raise err
                import time
                time.sleep(delay)

    print("[DB Extractor] Obteniendo perfiles, proyectos y postulaciones reales desde Supabase...")
    
    # 1. Obtener diccionarios de soporte (Skills y Careers)
    skills_res = fetch_with_retry(lambda: supabase.table("skills").select("id, name, type"))
    skill_map = {s['id']: s for s in (skills_res.data or [])}

    careers_res = fetch_with_retry(lambda: supabase.table("careers").select("id, name"))
    career_map = {c['id']: c['name'] for c in (careers_res.data or [])}

    # Obtener perfiles de estudiantes y proyectos reales
    students_res = fetch_with_retry(lambda: supabase.table("student_profiles").select("*"))
    students = students_res.data if students_res.data else []

    # Incluir estrictamente proyectos abiertos (status == 'open') disponibles para recomendación
    projects_res = fetch_with_retry(lambda: supabase.table("projects").select("*").eq("status", "open"))
    projects = projects_res.data if projects_res.data else []

    apps_res = fetch_with_retry(lambda: supabase.table("applications").select("*"))
    apps = apps_res.data if apps_res.data else []

    reviews_res = fetch_with_retry(lambda: supabase.table("reviews").select("*"))
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
        s_id = s.get('id')
        
        # En la BD de Supabase la columna del ciclo se llama academic_cycle (o ciclo)
        raw_ciclo = s.get('ciclo') if s.get('ciclo') is not None else s.get('academic_cycle')
        raw_gpa = s.get('gpa')

        try:
            gpa_val = float(raw_gpa) if raw_gpa is not None else None
        except (ValueError, TypeError):
            gpa_val = None

        try:
            ciclo_val = int(raw_ciclo) if raw_ciclo is not None else None
        except (ValueError, TypeError):
            ciclo_val = None

        # Descartar perfil solo si realmente no cuenta con GPA o Ciclo
        if gpa_val is None or ciclo_val is None:
            print(f"[DB Extractor] Omitiendo perfil de estudiante {s_id}: falta GPA ({raw_gpa}) o Ciclo ({raw_ciclo}).")
            continue
        
        # Mapear carrera
        c_id = s.get('career_id')
        career_name = career_map.get(c_id, 'Ingeniería de Software')

        # Formatear habilidades del estudiante mapeando UUIDs
        raw_skills = s.get('skills') or []
        h_skills_list = []
        s_skills_list = []
        for sk in raw_skills:
            if isinstance(sk, str) and sk in skill_map:
                sk_obj = skill_map[sk]
                if sk_obj.get('type') == 'soft':
                    s_skills_list.append(sk_obj.get('name', ''))
                else:
                    h_skills_list.append(sk_obj.get('name', ''))
            elif isinstance(sk, str):
                h_skills_list.append(sk)
            elif isinstance(sk, dict):
                name = sk.get('name', '')
                if sk.get('type') == 'soft':
                    s_skills_list.append(name)
                else:
                    h_skills_list.append(name)

        est_h_skills = ", ".join(h_skills_list)
        est_s_skills = ", ".join(s_skills_list)

        def_schedule = json.dumps({day: "11111111111111111111111111111111" for day in ['mon','tue','wed','thu','fri','sat','sun']})
        raw_avail = s.get('availability_blocks') or s.get('availability')
        est_avail = json.dumps(raw_avail) if isinstance(raw_avail, dict) else (raw_avail or def_schedule)

        for p in projects:
            p_id = p.get('id')
            raw_req = p.get('requirements') or []
            pub_req_h_skills = ", ".join([r.get('name', '') if isinstance(r, dict) else str(r) for r in raw_req])
            
            raw_p_sched = p.get('schedule_constraints') or p.get('schedule_json')
            pub_sched = json.dumps(raw_p_sched) if isinstance(raw_p_sched, dict) else (raw_p_sched or def_schedule)

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
                p_hours = p.get('max_hours_week') or p.get('max_hours') or 20
                
                hours_ok = s_hours >= p_hours
                
                schedule_ok = False
                try:
                    est_sched = json.loads(est_avail) if isinstance(est_avail, str) else est_avail
                    pub_sch = json.loads(pub_sched) if isinstance(pub_sched, str) else pub_sched
                    
                    if not raw_p_sched:
                        schedule_ok = True
                    else:
                        t_req, t_over = 0, 0
                        for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
                            p_day = pub_sch.get(day, "")
                            e_day = est_sched.get(day, "")
                            for i, pb in enumerate(p_day):
                                if pb == '1':
                                    t_req += 1
                                    if i < len(e_day) and e_day[i] == '1':
                                        t_over += 1
                        schedule_ok = (t_over / t_req) >= 0.25 if t_req > 0 else True
                except:
                    schedule_ok = True
                
                if hours_ok and schedule_ok:
                    match_score = 0
                    mandatory_fail = False
                    
                    est_skills_lower = [sk.strip().lower() for sk in (h_skills_list + s_skills_list)]
                    
                    for req in raw_req:
                        r_name = req.get('name', '').lower() if isinstance(req, dict) else str(req).lower()
                        is_mand = req.get('mandatory', False) if isinstance(req, dict) else False
                        
                        # Coincidencia exacta o parcial de skill
                        matched = any((r_name in esk or esk in r_name) for esk in est_skills_lower)
                        if matched:
                            match_score += 1
                        else:
                            if is_mand:
                                mandatory_fail = True
                                
                    match_ratio = (match_score / len(raw_req)) if len(raw_req) > 0 else 1.0
                    
                    if not mandatory_fail and match_ratio >= 0.3: es_apto = 1
                    elif match_ratio >= 0.5: es_apto = 1

                # En caso de postulación aceptada en Supabase, forzar match de skills
                if app and es_apto == 1:
                    match_ratio = 1.0
                    mandatory_match = 1
                elif app and es_apto == 0:
                    match_ratio = 0.0
                    mandatory_match = 0
                else:
                    mandatory_match = 0 if mandatory_fail else 1

            row = {
                'est_id': s_id,
                'est_university_id': s.get('university_id', '59a91332-e18f-4e68-8061-fe83f4c7610f'),
                'est_carrera': s.get('career', 'Ingeniería de Software'),
                'est_ciclo': int(ciclo_val),
                'est_gpa': float(gpa_val),
                'est_is_gpa_verified': 1 if s.get('is_gpa_verified') else 0,
                'est_evidence_url': s.get('gpa_evidence_url', ''),
                'est_hours_available': s.get('hours_available', 20),
                'est_availability': est_avail,
                'pub_id': p_id,
                'pub_title': p.get('title', 'Proyecto Real'),
                'pub_max_hours': p_hours,
                'pub_schedule': pub_sched,
                'pub_req_json': json.dumps(raw_req) if isinstance(raw_req, list) else str(raw_req),
                'est_mandatory_match': mandatory_match,
                'est_skill_match_ratio': round(float(match_ratio), 3),
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

    columns = [
        'est_id', 'est_university_id', 'est_carrera', 'est_ciclo', 'est_gpa', 
        'est_is_gpa_verified', 'est_evidence_url', 'est_hours_available', 'est_availability', 
        'pub_id', 'pub_title', 'pub_max_hours', 'pub_schedule', 'pub_req_json', 
        'est_mandatory_match', 'est_skill_match_ratio', 'es_apto', 
        'est_h_skills', 'est_s_skills', 'pub_req_h_skills', 'pub_req_s_skills', 
        'pub_title_full', 'pub_description', 'pub_complexity'
    ]
    df = pd.DataFrame(rows, columns=columns) if rows else pd.DataFrame(columns=columns)
    df.to_csv(output_path, index=False)
    print(f"[DB Extractor] [OK] Dataset real de {len(df)} registros ({len(students)} estudiantes x {len(projects)} proyectos) guardado en: {output_path}")
    return output_path

if __name__ == "__main__":
    extract_real_dataset_from_supabase()
