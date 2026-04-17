import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
# Usamos el Service Role para ML si necesita permisos elevados, sino el Anon Key
SUPABASE_KEY: str = os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar configuradas")

# Exportamos el cliente de Supabase instanciado
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
