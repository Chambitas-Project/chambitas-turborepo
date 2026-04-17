import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Cargar el .env de la raíz del monorepo explícitamente
root_env = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env)
# Cargar el .env local de la app (para PORT=8000)
load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
# Usamos el Service Role para ML si necesita permisos elevados, sino el Anon Key
SUPABASE_KEY: str = os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar configuradas")

# Exportamos el cliente de Supabase instanciado
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
