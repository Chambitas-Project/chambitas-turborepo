import os
import sys
import argparse

# Configurar paths para módulos del ml-engine
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'proto'))

from database import supabase
from features.matching.engine import engine

def sync_skills(force_all=False):
    print("🔍 Obteniendo habilidades de Supabase...")
    
    query = supabase.table("skills").select("id, name, category, embedding")
    if not force_all:
        query = query.is_("embedding", "null")
        
    response = query.execute()
    skills = response.data or []
    
    total = len(skills)
    if total == 0:
        print("✨ ¡Todas las habilidades ya cuentan con vector de embedding!")
        return
        
    print(f"🚀 Procesando {total} habilidades...")
    
    success_count = 0
    error_count = 0

    for idx, s in enumerate(skills, 1):
        skill_id = s["id"]
        name = s.get("name", "")
        category = s.get("category", "") or ""
        
        corpus = f"{name} {category}".strip()
        if not corpus:
            corpus = "habilidad sin detalles"
            
        try:
            # Generar el vector embedding de 256 dimensiones
            vector_256 = engine.get_text_embedding(corpus)
            
            # Actualizar en Supabase
            supabase.table("skills").update({"embedding": vector_256}).eq("id", skill_id).execute()
            
            success_count += 1
            print(f"[{idx}/{total}] ✅ Vectorizado con éxito: {name} ({category})")
        except Exception as e:
            error_count += 1
            print(f"[{idx}/{total}] ❌ Error en skill {name} ({skill_id}): {e}")

    print("\n----------------------------------------")
    print(f"🎉 Proceso finalizado:")
    print(f"   - Éxito: {success_count}")
    print(f"   - Errores: {error_count}")
    print("----------------------------------------")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Genera y sincroniza embeddings para las habilidades en Supabase.")
    parser.add_argument("--all", action="store_true", help="Re-generar embeddings para TODAS las skills, incluso las que ya tienen vector.")
    args = parser.parse_args()
    
    sync_skills(force_all=args.all)
