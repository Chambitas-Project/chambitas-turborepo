import os
import sys
import random
import uuid

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Configurar path de ml-engine
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'proto'))

from database import supabase
from features.matching.engine import engine

EMPLOYER_ID = "21889cca-620d-40a3-b051-89d78feb2f62"

PROJECTS_DATA = [
    # 💻 Software y Tecnología
    {
        "title": "Desarrollo de API Rest en Node.js y TypeScript",
        "description": "Buscamos estudiante avanzado para desarrollar endpoints optimizados en Node.js/TypeScript y conectar la base de datos PostgreSQL en Supabase.",
        "category": "Software y Tecnología",
        "budget": 450,
        "hours": 12,
        "skills": [("Node.js", 4, True), ("TypeScript", 3, True), ("SQL", 3, False), ("Trabajo en Equipo", 2, False)]
    },
    {
        "title": "Maquetación Frontend React y TailwindCSS",
        "description": "Se requiere maquetar componentes de interfaz de usuario responsivos e interactivos basados en diseños creados en Figma.",
        "category": "Software y Tecnología",
        "budget": 380,
        "hours": 10,
        "skills": [("React", 4, True), ("TypeScript", 3, True), ("Figma", 2, False), ("Autogestión", 3, False)]
    },
    {
        "title": "Configuración de Contenedores Docker e Integración CI/CD",
        "description": "Apoyo técnico en la creación de Dockerfiles y scripts de despliegue automático utilizando GitHub Actions para servicios web.",
        "category": "Software y Tecnología",
        "budget": 500,
        "hours": 15,
        "skills": [("Docker", 4, True), ("CI/CD", 3, True), ("Git/GitHub", 4, True), ("Resolución de Problemas", 3, False)]
    },
    {
        "title": "Migración y Optimización de Consultas SQL",
        "description": "Revisión e indexación de tablas en base de datos relacional para mejorar el rendimiento de consultas complejas.",
        "category": "Software y Tecnología",
        "budget": 300,
        "hours": 8,
        "skills": [("SQL", 4, True), ("Python", 2, False), ("Capacidad Analítica", 3, False)]
    },
    {
        "title": "Desarrollo de Microservicio gRPC en Python",
        "description": "Implementación de comunicación eficiente mediante gRPC e hilos concurrentes para procesamiento de tareas pesadas en segundo plano.",
        "category": "Software y Tecnología",
        "budget": 550,
        "hours": 14,
        "skills": [("Python", 4, True), ("gRPC", 3, True), ("Microservicios", 3, True), ("Pensamiento Crítico", 3, False)]
    },

    # 📊 IA y Análisis de Datos
    {
        "title": "Análisis Exploratorio de Datos de Ventas con Pandas",
        "description": "Procesar y limpiar conjuntos de datos comerciales usando Pandas para generar reportes analíticos visuales.",
        "category": "IA y Análisis de Datos",
        "budget": 320,
        "hours": 8,
        "skills": [("Python", 3, True), ("Pandas", 4, True), ("Power BI/Tableau", 3, False), ("Orientación a Resultados", 3, False)]
    },
    {
        "title": "Construcción de Dashboard interactivo en Power BI",
        "description": "Diseñar tableros de control de KPIs empresariales conectando fuentes de datos externas y automatizando la actualización periódica.",
        "category": "IA y Análisis de Datos",
        "budget": 400,
        "hours": 10,
        "skills": [("Power BI/Tableau", 4, True), ("Análisis de KPIs", 4, True), ("SQL", 2, False), ("Atención al Detalle", 4, False)]
    },
    {
        "title": "Modelo Predictivo Clasificador con Scikit-Learn",
        "description": "Implementación de modelos Random Forest y KNN para predecir la conversión de prospectos comerciales.",
        "category": "IA y Análisis de Datos",
        "budget": 600,
        "hours": 15,
        "skills": [("Python", 4, True), ("Scikit-learn", 4, True), ("Random Forest", 3, False), ("Vectores de Embedding", 2, False)]
    },
    {
        "title": "Procesamiento de Lenguaje Natural (NLP) e Integración de APIs de IA",
        "description": "Desarrollo de pipeline para clasificación automática de comentarios de clientes integrando la API de OpenAI/HuggingFace.",
        "category": "IA y Análisis de Datos",
        "budget": 520,
        "hours": 12,
        "skills": [("Natural Language Processing (NLP)", 4, True), ("Integración de APIs de IA", 4, True), ("Python", 3, True)]
    },

    # 🎨 Diseño y Creatividad
    {
        "title": "Diseño de Identidad Visual y Manual de Marca",
        "description": "Creación completa de logotipo, paleta cromática, tipografías y guía de estilo de marca para un emprendimiento juvenil.",
        "category": "Diseño y Creatividad",
        "budget": 450,
        "hours": 12,
        "skills": [("Identidad Visual", 4, True), ("Adobe Illustrator", 4, True), ("Branding", 3, True), ("Pensamiento Creativo e Innovación", 4, False)]
    },
    {
        "title": "Diseño de Prototipo UI/UX en Figma para App Móvil",
        "description": "Elaboración de wireframes y prototipos navegables en alta fidelidad aplicando heurísticas de usabilidad para una plataforma educativa.",
        "category": "Diseño y Creatividad",
        "budget": 480,
        "hours": 14,
        "skills": [("Figma", 4, True), ("Experiencia de Usuario (UX)", 4, True), ("Diseño de Interfaces (UI)", 4, True)]
    },
    {
        "title": "Diseño de Embalaje y Packaging para Producto Gourmet",
        "description": "Desarrollo de troqueles y diseño gráfico exterior para empaque de alimentos artesanales de exportación.",
        "category": "Diseño y Creatividad",
        "budget": 350,
        "hours": 9,
        "skills": [("Packaging", 4, True), ("Adobe Illustrator", 3, True), ("Adobe Photoshop", 3, False), ("Atención al Detalle", 4, False)]
    },
    {
        "title": "Ilustración Digital para Confección de Moda",
        "description": "Elaboración de fichas técnicas de ropa urbana y figurines digitales ilustrados en Photoshop e Illustrator.",
        "category": "Diseño y Creatividad",
        "budget": 300,
        "hours": 8,
        "skills": [("Ilustración Digital de Moda", 4, True), ("Fichas Técnicas de Confección", 3, True), ("Patronaje de Moda", 2, False)]
    },
    {
        "title": "Modelado 3D de Producto Industrial para Prototipado",
        "description": "Generación de modelos tridimensionales detallados para impresión 3D de dispositivos electrónicos de consumo.",
        "category": "Diseño y Creatividad",
        "budget": 420,
        "hours": 10,
        "skills": [("Diseño de Producto Industrial", 4, True), ("Adobe Photoshop", 3, False), ("Resolución de Problemas", 3, False)]
    },

    # 🏛️ Arquitectura y Espacios
    {
        "title": "Elaboración de Planos Arquitectónicos 2D en AutoCAD",
        "description": "Digitalización y corrección de planos de distribución, cortes y elevaciones para vivienda unifamiliar.",
        "category": "Arquitectura y Espacios",
        "budget": 380,
        "hours": 10,
        "skills": [("AutoCAD", 4, True), ("Planimetría y Dibujo 2D", 4, True), ("Atención al Detalle", 4, False)]
    },
    {
        "title": "Modelado BIM y Coordinación en Revit",
        "description": "Desarrollo del modelo arquitectónico tridimensional e integración de especialidades en Revit.",
        "category": "Arquitectura y Espacios",
        "budget": 550,
        "hours": 15,
        "skills": [("Revit", 4, True), ("BIM (Building Information Modeling)", 4, True), ("Diseño Estructural", 3, False)]
    },
    {
        "title": "Renderizado fotorrealista de Interiores en SketchUp y V-Ray",
        "description": "Modelado tridimensional e iluminación V-Ray para renders comerciales de oficinas y espacios retail.",
        "category": "Arquitectura y Espacios",
        "budget": 400,
        "hours": 10,
        "skills": [("SketchUp", 4, True), ("V-Ray", 4, True), ("Renderizado en Lumion", 3, False), ("Materiales y Acabados", 3, False)]
    },
    {
        "title": "Propuesta de Diseño de Iluminación Arquitectónica",
        "description": "Cálculo de luminancia y selección de artefactos de iluminación para restaurante conceptual.",
        "category": "Arquitectura y Espacios",
        "budget": 320,
        "hours": 8,
        "skills": [("Iluminación Arquitectónica", 4, True), ("Materiales y Acabados", 3, False), ("Pensamiento Creativo e Innovación", 3, False)]
    },
    {
        "title": "Presupuestos y Valorización de Obras de Edificación",
        "description": "Cálculo de metrados y armado de hojas de presupuesto detalladas para remodelación de local comercial.",
        "category": "Arquitectura y Espacios",
        "budget": 450,
        "hours": 12,
        "skills": [("Gestión de Obras", 4, True), ("Elaboración de Valorizaciones", 4, True), ("Topografía", 2, False)]
    },

    # 🎬 Producción Audiovisual
    {
        "title": "Edición y Montaje de Video Promocional en Premiere",
        "description": "Edición de video corporativo de 2 minutos incluyendo corrección de color y mezcla de audio.",
        "category": "Producción Audiovisual",
        "budget": 350,
        "hours": 8,
        "skills": [("Adobe Premiere", 4, True), ("Post-producción de Video", 4, True), ("Dirección de Fotografía", 3, False)]
    },
    {
        "title": "Diseño de Sonido y Edición de Podcast Institucional",
        "description": "Limpieza de ruidos, ecualización, ecualización vocal e inserción de cortinillas musicales para 4 episodios de podcast.",
        "category": "Producción Audiovisual",
        "budget": 280,
        "hours": 7,
        "skills": [("Diseño de Sonido", 4, True), ("Pro Tools/Ableton", 4, True), ("Edición de Podcasts y Audio", 4, True)]
    },
    {
        "title": "Composición Musical para Spot Publicitario",
        "description": "Creación y mezcla de tema musical original corto de 30 segundos para marca de moda joven.",
        "category": "Producción Audiovisual",
        "budget": 380,
        "hours": 10,
        "skills": [("Composición Musical", 4, True), ("Pro Tools/Ableton", 3, False), ("Pensamiento Creativo e Innovación", 4, False)]
    },
    {
        "title": "Redacción de Guion para Serie Corta Web",
        "description": "Escritura de guion literario y técnico estructurado en 3 actos para video corporativo educativo.",
        "category": "Producción Audiovisual",
        "budget": 300,
        "hours": 8,
        "skills": [("Guionismo", 4, True), ("Gestión Cultural", 3, False), ("Comunicación Efectiva", 4, False)]
    },

    # 📈 Marketing y Medios
    {
        "title": "Estrategia y Gestión de Campañas en Social Media Ads",
        "description": "Configuración y optimización de pautas publicitarias en Meta Ads (Facebook e Instagram) para generación de leads.",
        "category": "Marketing y Medios",
        "budget": 400,
        "hours": 10,
        "skills": [("Social Media Ads", 4, True), ("SEO/SEM", 3, False), ("Google Analytics", 3, False), ("Orientación a Resultados", 4, False)]
    },
    {
        "title": "Redacción de Copywriting Persuasivo para Email Marketing",
        "description": "Creación de secuencia automatizada de 5 correos de ventas con técnicas de Copywriting persuasivo.",
        "category": "Marketing y Medios",
        "budget": 250,
        "hours": 6,
        "skills": [("Copywriting", 4, True), ("Email Marketing", 4, True), ("Reputación Online", 2, False)]
    },
    {
        "title": "Auditoría SEO y Posicionamiento Web Orgánico",
        "description": "Análisis de palabras clave y optimización On-Page y técnica para blog de contenidos corporativo.",
        "category": "Marketing y Medios",
        "budget": 350,
        "hours": 9,
        "skills": [("SEO/SEM", 4, True), ("Google Analytics", 4, True), ("Investigación de Mercado", 3, False)]
    },
    {
        "title": "Redacción de Notas de Prensa y Gestión de Medios",
        "description": "Elaboración de notas periodísticas y relacionamiento con prensa local para difusión de evento empresarial.",
        "category": "Marketing y Medios",
        "budget": 300,
        "hours": 8,
        "skills": [("Relaciones Públicas", 4, True), ("Redacción de Notas de Prensa", 4, True), ("Gestión de Crisis de Reputación", 2, False)]
    },

    # 💼 Gestión y Negocios
    {
        "title": "Implementación de Marco Ágil Scrum en Equipo de Proyecto",
        "description": "Facilitación de ceremonias ágiles (Daily, Planning, Retro) y organización del Product Backlog en Jira.",
        "category": "Gestión y Negocios",
        "budget": 420,
        "hours": 10,
        "skills": [("Metodologías Ágiles (Scrum)", 4, True), ("Jira", 4, True), ("Liderazgo", 3, False), ("Trabajo en Equipo", 4, False)]
    },
    {
        "title": "Elaboración de Plan de Negocios y Estudio de Factibilidad",
        "description": "Formulación integral de plan estratégico de negocios, análisis FODA y proyección financiera inicial.",
        "category": "Gestión y Negocios",
        "budget": 500,
        "hours": 14,
        "skills": [("Planes de Negocio", 4, True), ("Análisis de KPIs", 3, True), ("Negociación Comercial", 3, False)]
    },
    {
        "title": "Optimización de la Cadena de Suministros e Inventarios",
        "description": "Reorganización del control de almacén e inventarios usando SAP/ERP y seguimiento de KPIs de rotación.",
        "category": "Gestión y Negocios",
        "budget": 450,
        "hours": 12,
        "skills": [("Gestión de Suministros", 4, True), ("SAP/ERP", 3, True), ("Control de Inventarios y Almacén", 4, True)]
    },
    {
        "title": "Reclutamiento y Selección de Talento Universitario",
        "description": "Publicación de vacantes, filtro curricular y entrevistas iniciales para programa de practicantes.",
        "category": "Gestión y Negocios",
        "budget": 320,
        "hours": 8,
        "skills": [("Selección de Talento", 4, True), ("Screening y Filtro de Hojas de Vida", 4, True), ("Cultura Organizacional", 3, False)]
    },

    # 💰 Finanzas y Contabilidad
    {
        "title": "Elaboración de Estados Financieros y Notas Contables",
        "description": "Armado de Estado de Situación Financiera y Estado de Resultados con sus respectivas notas contables.",
        "category": "Finanzas y Contabilidad",
        "budget": 400,
        "hours": 10,
        "skills": [("Estados Financieros", 4, True), ("Excel Financiero", 4, True), ("Auditoría Contable", 3, False)]
    },
    {
        "title": "Modelado Financiero y Proyección de Flujo de Caja en Excel",
        "description": "Construcción de modelo dinámico de flujo de caja operativo y cálculo de valor presente neto (VPN).",
        "category": "Finanzas y Contabilidad",
        "budget": 450,
        "hours": 11,
        "skills": [("Excel Financiero", 4, True), ("Presupuestos", 4, True), ("Evaluación Financiera de Proyectos", 4, True)]
    },
    {
        "title": "Cálculo de Costos de Producción y Margen de Contribución",
        "description": "Análisis y clasificación de costos fijos y variables para determinar punto de equilibrio operativo.",
        "category": "Finanzas y Contabilidad",
        "budget": 330,
        "hours": 8,
        "skills": [("Contabilidad de Costos", 4, True), ("Presupuestos", 3, True), ("Análisis de Riesgos", 2, False)]
    },
    {
        "title": "Liquidación e Declaración de Impuestos SUNAT (IGV / Renta)",
        "description": "Apoyo en el cálculo mensual de tributos e ingreso de datos a la plataforma SIRE / SUNAT.",
        "category": "Finanzas y Contabilidad",
        "budget": 300,
        "hours": 7,
        "skills": [("Gestión de Impuestos (SUNAT)", 4, True), ("Facturación Electrónica y Comprobantes", 3, True), ("Tesorería", 2, False)]
    },

    # 🍳 Gastronomía y Turismo
    {
        "title": "Costeo de Recetas y Diseño de Menú para Restaurante",
        "description": "Estandarización de fichas técnicas de recetas, cálculo de Food Cost y diseño de carta comercial.",
        "category": "Gastronomía y Turismo",
        "budget": 350,
        "hours": 9,
        "skills": [("Costos de Recetas Estándar", 4, True), ("Diseño de Cartas", 4, True), ("Seguridad Alimentaria (HACCP)", 3, False)]
    },
    {
        "title": "Auditoría de Protocolos de Seguridad Alimentaria (HACCP)",
        "description": "Revisión de puntos críticos de control en cocina e implementación de manual de buenas prácticas de manipulación.",
        "category": "Gastronomía y Turismo",
        "budget": 380,
        "hours": 10,
        "skills": [("Seguridad Alimentaria (HACCP)", 4, True), ("Gestión de Costos de Alimentos", 3, False), ("Protocolo y Servicio", 3, False)]
    },
    {
        "title": "Diseño e Implementación de Rutas Turísticas Culturales",
        "description": "Formulación de itinerario guiado y mapa interpretativo para circuito de turismo sustentable.",
        "category": "Gastronomía y Turismo",
        "budget": 300,
        "hours": 8,
        "skills": [("Rutas Turísticas", 4, True), ("Gestión de Patrimonio", 4, True), ("Gestión Cultural", 3, False)]
    },

    # ⚖️ Leyes y Política
    {
        "title": "Redacción de Contratos Comerciales y Acuerdos de Confidencialidad",
        "description": "Elaboración de borradores de contratos de prestación de servicios y convenios de confidencialidad (NDA).",
        "category": "Leyes y Política",
        "budget": 400,
        "hours": 10,
        "skills": [("Redacción de Contratos", 4, True), ("Redacción de Contratos de Confidencialidad (NDA)", 4, True), ("Derecho Corporativo", 3, False)]
    },
    {
        "title": "Revisión de Expedientes y Búsqueda de Jurisprudencia",
        "description": "Sistematización de resoluciones judiciales pertinentes para sustento de informe legal procesal.",
        "category": "Leyes y Política",
        "budget": 320,
        "hours": 8,
        "skills": [("Búsqueda de Jurisprudencia", 4, True), ("Investigación Jurídica", 4, True), ("Derecho Laboral", 3, False)]
    },
    {
        "title": "Búsqueda y Registro de Marcas ante INDECOPI",
        "description": "Verificación de antecedentes fonéticos y preparación del expediente de registro de marca de producto.",
        "category": "Leyes y Política",
        "budget": 350,
        "hours": 9,
        "skills": [("Propiedad Intelectual", 4, True), ("Búsqueda de Marcas e INDECOPI", 4, True), ("Ética y Responsabilidad Civil", 3, False)]
    },

    # 📚 Humanidades y Educación
    {
        "title": "Tutoría Académica Personalizada en Asignaturas Universitarias",
        "description": "Brindar asesorías y reforzamiento académico individual a estudiantes de primeros ciclos.",
        "category": "Humanidades y Educación",
        "budget": 280,
        "hours": 7,
        "skills": [("Tutoría", 4, True), ("Redacción Académica", 3, False), ("Empatía y Escucha Activa", 4, False)]
    },
    {
        "title": "Traducción Técnica de Documentación del Inglés al Español",
        "description": "Traducción y adaptación terminológica precisa de manuales operativos y artículos de especialidad.",
        "category": "Humanidades y Educación",
        "budget": 350,
        "hours": 9,
        "skills": [("Traducción Técnica", 4, True), ("Corrección de Estilo", 3, True), ("Atención al Detalle", 4, False)]
    },
    {
        "title": "Desarrollo de Contenidos para Cursos en Plataforma E-learning",
        "description": "Estructuración de módulos, guías y actividades evaluativas para entorno virtual de aprendizaje.",
        "category": "Humanidades y Educación",
        "budget": 420,
        "hours": 11,
        "skills": [("Diseño Instruccional", 4, True), ("Gestión de E-learning", 4, True), ("Elaboración de Material Didáctico", 3, False)]
    },
    {
        "title": "Revisión y Corrección de Estilo para Artículos de Investigación",
        "description": "Revisión ortotipográfica, sintáctica y adecuación de normas de citación APA para publicación académica.",
        "category": "Humanidades y Educación",
        "budget": 300,
        "hours": 8,
        "skills": [("Redacción Científica y Formato APA", 4, True), ("Corrección de Estilo", 4, True), ("Revisión Ortotipográfica de Ensayos", 4, True)]
    },

    # 🔬 Ciencias de la Salud (No Clínicas)
    {
        "title": "Análisis Bioestadístico de Datos Sanitarios con SPSS",
        "description": "Procesamiento y análisis de pruebas de hipótesis bioestadísticas para proyecto de investigación epidemiológica.",
        "category": "IA y Análisis de Datos",
        "budget": 450,
        "hours": 10,
        "skills": [("Bioestadística con SPSS/R", 4, True), ("Curaduría de Literatura Médica", 3, False), ("Capacidad Analítica", 4, False)]
    },
    {
        "title": "Diseño de Infografías y Piezas de Divulgación en Salud",
        "description": "Creación gráfica de contenido educativo visual sobre prevención de salud comunitaria e higiene.",
        "category": "Diseño y Creatividad",
        "budget": 320,
        "hours": 8,
        "skills": [("Diseño de Infografías de Salud", 4, True), ("Adobe Illustrator", 3, False), ("Comunicación Efectiva", 3, False)]
    },
    {
        "title": "Sistematización de Literatura Científica y Formato Vancouver",
        "description": "Búsqueda bibliográfica en bases de datos (PubMed/Scopus) y ordenamiento de referencias en formato Vancouver.",
        "category": "Humanidades y Educación",
        "budget": 300,
        "hours": 7,
        "skills": [("Formato Vancouver y Citación", 4, True), ("Curaduría de Literatura Médica", 4, True), ("Autogestión", 3, False)]
    },
    {
        "title": "Elaboración de Manual de Capacitación en Seguridad e Higiene",
        "description": "Redacción de guía clara sobre protocolos preventivos de seguridad ocupacional para personal operativo.",
        "category": "Humanidades y Educación",
        "budget": 380,
        "hours": 9,
        "skills": [("Redacción Académica", 3, True), ("Facilitación de Talleres", 3, False), ("Toma de Decisiones Éticas", 3, False)]
    }
]

def seed_projects():
    print("🔍 Obteniendo catálogo de habilidades desde Supabase...")
    skills_resp = supabase.table("skills").select("id, name").execute()
    skills_db = skills_resp.data or []
    
    skill_map = {s["name"].strip().lower(): s["id"] for s in skills_db}
    
    print(f"🚀 Iniciando inserción y vectorización de {len(PROJECTS_DATA)} proyectos...")
    
    created_count = 0
    
    for idx, p in enumerate(PROJECTS_DATA, 1):
        project_id = str(uuid.uuid4())
        title = p["title"]
        description = p["description"]
        category = p["category"]
        budget = p["budget"]
        hours = p["hours"]
        req_skills_spec = p["skills"]
        
        # 1. Resolver los skill_ids del catálogo
        resolved_skill_names = []
        required_skills_insert = []
        
        for sk_name, min_prof, is_mandatory in req_skills_spec:
            sk_id = skill_map.get(sk_name.strip().lower())
            if sk_id:
                resolved_skill_names.append(sk_name)
                required_skills_insert.append({
                    "project_id": project_id,
                    "skill_id": sk_id,
                    "min_proficiency": min_prof,
                    "mandatory": is_mandatory
                })
        
        # 2. Insertar en tabla projects
        project_row = {
            "id": project_id,
            "employer_id": EMPLOYER_ID,
            "title": title,
            "description": description,
            "service_category": category,
            "status": "open",
            "budget": budget,
            "max_hours_week": hours,
            "requirements": resolved_skill_names,
            "schedule_constraints": {
                "MON": "00000000111100000000000000000000",
                "TUE": "00000000111100000000000000000000",
                "WED": "00000000111100000000000000000000",
                "THU": "00000000000000000000000000000000",
                "FRI": "00000000000000000000000000000000",
                "SAT": "00000000000000000000000000000000",
                "SUN": "00000000000000000000000000000000"
            }
        }
        
        try:
            supabase.table("projects").insert(project_row).execute()
            
            if required_skills_insert:
                supabase.table("project_required_skills").insert(required_skills_insert).execute()
                
            # 3. Construir corpus y calcular Vector Embedding con IA
            corpus = f"{title} {description} {', '.join(resolved_skill_names)}".strip()
            vector_256 = engine.get_text_embedding(corpus)
            
            supabase.table("projects").update({"embedding": vector_256}).eq("id", project_id).execute()
            
            created_count += 1
            print(f"[{idx}/{len(PROJECTS_DATA)}] OK Proyecto Creado & Vectorizado: {title}")
            
        except Exception as e:
            print(f"[{idx}/{len(PROJECTS_DATA)}] ERROR en proyecto {title}: {e}")

    print("\n----------------------------------------")
    print(f"Poblado de Proyectos finalizado con exito:")
    print(f"   - Proyectos insertados y vectorizados: {created_count}")
    print("----------------------------------------")

if __name__ == "__main__":
    seed_projects()
