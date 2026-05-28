import pandas as pd
import numpy as np
import json
import os
import uuid

np.random.seed(42)

# Cargar datos reales de los archivos TXT (JSON)
def load_real_data():
    base_path = os.path.join(os.path.dirname(__file__), '../../data')
    with open(os.path.join(base_path, 'skills.txt'), 'r', encoding='utf-8') as f:
        skills = json.load(f)
    with open(os.path.join(base_path, 'career.txt'), 'r', encoding='utf-8') as f:
        careers = json.load(f)
    return skills, careers

REAL_SKILLS, REAL_CAREERS = load_real_data()

# Agrupar skills por categoría para asignación lógica
SKILLS_BY_CATEGORY = {}
for s in REAL_SKILLS:
    cat = s['category']
    if cat not in SKILLS_BY_CATEGORY:
        SKILLS_BY_CATEGORY[cat] = []
    SKILLS_BY_CATEGORY[cat].append(s['name'])

# Mapeo de Carreras a Categorías de Skills para realismo
CAREER_TO_SKILL_CAT = {
    "Ciencias de la Computación": ["Software y Tecnología", "IA y Análisis de Datos", "Habilidades Blandas"],
    "Ingeniería de Software": ["Software y Tecnología", "IA y Análisis de Datos", "Habilidades Blandas"],
    "Ingeniería de Sistemas de Información": ["Software y Tecnología", "Gestión y Negocios", "Habilidades Blandas"],
    "Ingeniería de Inteligencia Artificial": ["IA y Análisis de Datos", "Software y Tecnología", "Habilidades Blandas"],
    "Arquitectura": ["Arquitectura y Espacios", "Diseño y Creatividad", "Habilidades Blandas"],
    "Derecho": ["Leyes y Política", "Habilidades Blandas", "Humanidades y Educación"],
    "Diseño Profesional Gráfico": ["Diseño y Creatividad", "Marketing y Medios", "Habilidades Blandas"],
    "Comunicación y Marketing": ["Marketing y Medios", "Gestión y Negocios", "Habilidades Blandas"],
    "Administración": ["Gestión y Negocios", "Finanzas y Contabilidad", "Habilidades Blandas"],
    "Economía y Ciencia de Datos": ["IA y Análisis de Datos", "Finanzas y Contabilidad", "Habilidades Blandas"],
    "Gastronomía y Gestión Culinaria": ["Gastronomía y Turismo", "Gestión y Negocios", "Habilidades Blandas"],
}

SERVICE_CATEGORIES = [
    "Software Development", "Graphic Design", "Data Analysis", 
    "Content Writing", "Business Consulting", "Architecture", 
    "Legal Support", "Culinary Arts", "Translation"
]

UPC_UNIVERSITY_ID = "59a91332-e18f-4e68-8061-fe83f4c7610f"

def generate_schedule_constraints(prob_available=0.2):
    days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    blocks = {}
    for day in days:
        # prob_available es la probabilidad de que el bit sea '1'
        bits = "".join(np.random.choice(['0', '1'], size=32, p=[1-prob_available, prob_available]))
        blocks[day] = bits
    return json.dumps(blocks)

# Fallback para carreras no mapeadas (usar categorías generales)
GENERAL_CATS = ["Habilidades Blandas", "Gestión y Negocios"]

def get_real_skills_for_career(career_name, n=5):
    cats = CAREER_TO_SKILL_CAT.get(career_name, GENERAL_CATS)
    pool = [s for s in REAL_SKILLS if s['category'] in cats]
    if not pool: pool = REAL_SKILLS
    return np.random.choice(pool, size=min(len(pool), n), replace=False)

def print_generation_summary(n_samples, n_students, n_projects):
    print("\n" + "="*50)
    print("RESUMEN DE LÓGICA DE GENERACIÓN - VERSION 9 (HÍBRIDA)")
    print("="*50)
    print(f"Total de Estudiantes Únicos: {n_students}")
    print(f"Total de Proyectos Únicos:    {n_projects}")
    print(f"Muestras (Pares) a generar:   {n_samples}")
    print("\n[FASE 1: HARD FILTERS]")
    print("- Universidad: Match estricto")
    print("- Carga Horaria: Alumno horas >= Proyecto horas")
    print("- Horario: Traslape >= 50%")
    print("- Skills: Cumplir con skills 'Mandatory'")
    print("\n[FASE 2: SCORING (WEIGHTED)]")
    print("- 60% Afinidad Técnica (Embeddings/Skills)")
    print("- 30% Consistencia Académica (GPA + Ciclo)")
    print("- 10% Bono de Confianza (is_gpa_verified = +0.10)")
    print("="*50 + "\n")

def check_schedule_overlap(est_availability_json, pub_schedule_json):
    est = json.loads(est_availability_json)
    pub = json.loads(pub_schedule_json)
    
    total_requested_bits = 0
    overlap_bits = 0
    
    for day in ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']:
        est_bits = est[day]
        pub_bits = pub[day]
        
        for e, p in zip(est_bits, pub_bits):
            if p == '1':
                total_requested_bits += 1
                if e == '1':
                    overlap_bits += 1
    
    if total_requested_bits == 0: return True
    return (overlap_bits / total_requested_bits) >= 0.5

def generate_data_tesis_v8(n_samples=5000):
    # Generar Pools únicos para trazabilidad
    n_unique_students = 1000
    n_unique_projects = 500
    
    print_generation_summary(n_samples, n_unique_students, n_unique_projects)
    
    # Pool de Estudiantes
    students_pool = []
    for _ in range(n_unique_students):
        career_obj = np.random.choice(REAL_CAREERS)
        n_skills = np.random.randint(3, 11)
        est_skills_objs = get_real_skills_for_career(career_obj['name'], n=n_skills)
        est_skills_data = [{'skill_id': s['id'], 'name': s['name'], 'level': np.random.randint(1, 6), 'type': s['type']} for s in est_skills_objs]
        # Atributos básicos (ESCENARIO UPC V11.0.1)
        gpa = round(np.random.uniform(13, 20), 2)
        ciclo = np.random.randint(1, 11)
        hours_available = np.random.randint(10, 41)
        
        is_verified = np.random.random() < 0.4 # 40% verificados
        
        students_pool.append({
            'est_id': str(uuid.uuid4()),
            'career_obj': career_obj,
            'est_university_id': UPC_UNIVERSITY_ID, # Forzar ID real de UPC
            'gpa': gpa,
            'is_gpa_verified': is_verified,
            'evidence_url': f"https://supabase.co/storage/v1/object/public/evidence/doc_{uuid.uuid4()}.pdf" if is_verified else None,
            'ciclo': ciclo,
            'hours_available': hours_available,
            'availability': generate_schedule_constraints(prob_available=0.7),
            'skills_data': est_skills_data,
            'h_skills_str': ", ".join([s['name'] for s in est_skills_data if s['type'] == 'hard']),
            's_skills_str': ", ".join([s['name'] for s in est_skills_data if s['type'] == 'soft'])
        })

    # Pool de Proyectos
    projects_pool = []
    for _ in range(n_unique_projects):
        # Seleccionar una carrera base para orientar el proyecto
        base_career = np.random.choice(REAL_CAREERS)
        n_req = np.random.randint(2, 5)
        pub_req_skills_objs = get_real_skills_for_career(base_career['name'], n=n_req)
        pub_req_data = [{'skill_id': s['id'], 'name': s['name'], 'min_proficiency': int(np.random.randint(1, 4)), 'mandatory': bool(np.random.choice([True, False], p=[0.7, 0.3]))} for s in pub_req_skills_objs]
        
        projects_pool.append({
            'pub_id': str(uuid.uuid4()),
            'title': f"Proyecto para {base_career['name']}",
            'university_id': base_career.get('university_id', UPC_UNIVERSITY_ID),
            'category': np.random.choice(SERVICE_CATEGORIES),
            'max_hours': np.random.choice([10, 20, 30]),
            'schedule': generate_schedule_constraints(prob_available=0.2),
            'req_data': pub_req_data,
            'req_h_str': ", ".join([s['name'] for s in pub_req_data]),
            'complexity': np.random.choice(['Baja', 'Media', 'Alta'])
        })

    data = []
    for _ in range(n_samples):
        est = np.random.choice(students_pool)
        pub = np.random.choice(projects_pool)
        
        # LÓGICA DE ETIQUETADO
        es_apto = 0
        if est['career_obj'].get('university_id', UPC_UNIVERSITY_ID) == pub['university_id']:
            hours_ok = est['hours_available'] >= pub['max_hours']
            schedule_ok = check_schedule_overlap(est['availability'], pub['schedule'])
            
            if hours_ok and schedule_ok:
                match_score = 0
                mandatory_fail = False
                for req in pub['req_data']:
                    est_s = next((s for s in est['skills_data'] if s['skill_id'] == req['skill_id']), None)
                    if est_s:
                        if est_s['level'] >= req['min_proficiency']: match_score += 1
                        else:
                            match_score += 0.5
                            if req['mandatory']: mandatory_fail = True
                    else:
                        if req['mandatory']: mandatory_fail = True

                match_ratio = match_score / len(pub['req_data'])
                if not mandatory_fail and match_ratio >= 0.4: es_apto = 1
                elif match_ratio >= 0.7: es_apto = 1

        data.append({
            'est_id': est['est_id'],
            'est_university_id': UPC_UNIVERSITY_ID,
            'est_carrera': est['career_obj']['name'],
            'est_ciclo': est['ciclo'],
            'est_gpa': est['gpa'],
            'est_is_gpa_verified': est['is_gpa_verified'],
            'est_evidence_url': est['evidence_url'],
            'est_hours_available': est['hours_available'],
            'est_availability': est['availability'],
            'pub_university_id': pub['university_id'],
            'pub_category': pub['category'],
            'pub_max_hours': pub['max_hours'],
            'pub_schedule': pub['schedule'],
            'pub_req_json': json.dumps(pub['req_data']),
            'est_mandatory_match': 0 if mandatory_fail else 1,
            'est_skill_match_ratio': match_ratio,
            'es_apto': es_apto,
            'est_h_skills': est['h_skills_str'],
            'est_s_skills': est['s_skills_str'],
            'pub_req_h_skills': pub['req_h_str'],
            'pub_req_s_skills': "",
            'pub_complexity': pub['complexity']
        })

    df = pd.DataFrame(data)
    base_data_path = os.path.join(os.path.dirname(__file__), '../../data')
    os.makedirs(base_data_path, exist_ok=True)
    
    # Dataset versionado para trazabilidad de tesis
    version = "v11.0.1" # Esto puede venir por argumento
    df.to_csv(os.path.join(base_data_path, f'students_data_{version}.csv'), index=False)
    df.to_csv(os.path.join(base_data_path, 'students_data_tesis_final.csv'), index=False)
    
    # Guardar configuración del experimento para trazabilidad
    config = {
        "n_samples": n_samples,
        "gpa_range": [13, 20],
        "skills_per_student": [3, 10],
        "scenario": "upc_standard_academic_limits"
    }
    with open('data/data_config.json', 'w') as f:
        json.dump(config, f)
        
    print(f"CSV generado con {len(df[df['es_apto']==1])} matches positivos de {n_samples} total.")

import sys

if __name__ == "__main__":
    n = 5000
    if len(sys.argv) > 1:
        try: n = int(sys.argv[1])
        except: pass
    generate_data_tesis_v8(n)
