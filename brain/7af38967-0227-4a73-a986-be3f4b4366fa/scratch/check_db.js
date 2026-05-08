
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUniversity() {
    const universityId = '59a91332-e18f-4e68-8061-fe83f4c7610f';
    console.log('Checking university ID:', universityId);
    
    const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId);
        
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', data);
    }

    const { data: singleData, error: singleError } = await supabase
        .from('universities')
        .select('email_domain, slug')
        .eq('id', universityId)
        .single();

    if (singleError) {
        console.error('Single Error:', singleError.message);
    } else {
        console.log('Single Data:', singleData);
    }
}

checkUniversity();
