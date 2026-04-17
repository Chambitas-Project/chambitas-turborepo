import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno (busca el archivo .env en el directorio actual)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidas.');
}

// Exportamos el cliente instanciado para su uso directo
export const supabase = createClient(supabaseUrl, supabaseKey);

// También exportamos la función por si algún servicio necesita instanciarlo con otra key
export { createClient };
