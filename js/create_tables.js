// Script to create tables in Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tqwagbbppfklqgmyyrwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd2FnYmJwcGZrbHFnbXl5cndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjk2MjAsImV4cCI6MjA3MTEwNTYyMH0.C4d6-aNDisajHcg7lurnRHdbk-pe3AvE4AIaW_e53eE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTables() {
    try {
        // Note: Supabase JS doesn't support direct DDL, so this is for reference
        // You need to run the SQL in Supabase dashboard or use their API
        console.log('Tables creation SQL is in create_tables.sql');
        console.log('Please execute it in Supabase SQL Editor');
    } catch (error) {
        console.error('Error:', error);
    }
}

createTables();