const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('API Key (first 20 chars):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not found');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test connection by checking tables
    const { data: tables, error } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to database:', error);
      return;
    }

    console.log('Connection successful!');
    console.log('Sample data:', tables);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();