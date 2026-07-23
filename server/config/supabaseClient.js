/*

    @fileoverview Supabase Database Client Configuration
    Initializes the Connection using the Service Role Key to Grant the Backend.
    Administrative Privileges, Allowing it to Bypass the Row Level Security (RLS).

*/

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail Fast if Credentials are Missing

if(!supabaseUrl || !supabaseKey){

    console.error('[Critical Error]: Supabase URL or Service Role Key is missing in the .env file');
    process.exit(1);

}

// Initialize the Supabase Client 

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('[Database] Supabase Client Initialized Successfully.');

module.exports = supabase;