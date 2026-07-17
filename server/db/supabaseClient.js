/**
 * 
 * Database Client Configuration
 * 
 * Initializes and exports the Supabase client using environment variables.
 * Utilizes the Service Role Key to ensure the backend can perform necessary 
 * database operations while bypassing client-side Row Level Security (RLS).
 * 
 */

// Load the environment variables

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Pulling the environment variables

const supabaseUrl = process.env.SUPABASE;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables to prevent runtime connection failures

if(!supabaseUrl || !supabaseServiceKey){

    console.error("CRITICAL ERROR: Missing Supabase Environment Variable");
    process.exit(1);
    
}

// Initialize the secure Supabase instance

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Exporting the Connection for Controllers to use

module.exports = supabase;