import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

root_env = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env)
load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar configuradas")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
