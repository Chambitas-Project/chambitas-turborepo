
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile(userId: string) {
  console.log(`Checking profile for user: ${userId}`);
  
  const { data: student, error: studentError } = await supabase
    .from('student_profiles')
    .select('*, universities(*)')
    .eq('id', userId)
    .single();

  if (studentError) {
    console.error('Error fetching student profile:', studentError.message);
  } else {
    console.log('Student Profile Data:', JSON.stringify(student, null, 2));
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError.message);
  } else {
    console.log('User Table Data:', JSON.stringify(user, null, 2));
  }
}

// Reemplazar con tu ID de usuario si lo tienes a mano, o el script buscará el último
checkProfile('313498b5-3f3f-4e0e-9b2f-7634f1e4299b'); // ID de ejemplo sacado de contexto previo
