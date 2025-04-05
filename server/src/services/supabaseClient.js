import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Supabase URL or Service Role Key is missing in .env");
    process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey, {
     auth: {
         persistSession: false
     }
});

console.log("Supabase client initialized.");

export default supabase;