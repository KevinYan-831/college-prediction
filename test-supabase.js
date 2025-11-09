// Simple test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n=== Testing Supabase Connection ===\n');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env file');
  process.exit(1);
}

console.log('✓ Environment variables found:');
console.log(`  VITE_SUPABASE_URL: ${supabaseUrl}`);
console.log(`  VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing Supabase connection...\n');

    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('unlock_codes')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      if (healthError.message.includes('relation "public.unlock_codes" does not exist')) {
        console.log('⚠️  Database tables not created yet');
        console.log('   Please run the SQL setup script from SUPABASE_SETUP_GUIDE.md');
        console.log('   Go to Supabase Dashboard -> SQL Editor -> Run the setup SQL\n');
        return;
      }
      throw healthError;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Database tables exist\n');

    // Test 2: Check authentication
    console.log('🔄 Testing authentication setup...\n');

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    console.log('✅ Authentication is configured correctly');
    console.log(`   Current session: ${session ? 'Active' : 'No active session'}\n`);

    console.log('🎉 All tests passed! Supabase is ready to use.\n');
    console.log('Next steps:');
    console.log('1. Run the SQL setup from SUPABASE_SETUP_GUIDE.md (if not done)');
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Test signup/login on the landing page\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('Invalid API key')) {
      console.log('💡 Tip: Check that VITE_SUPABASE_ANON_KEY is correct');
      console.log('   Get it from: Supabase Dashboard -> Settings -> API -> anon public key\n');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('💡 Tip: Check that VITE_SUPABASE_URL is correct');
      console.log('   Get it from: Supabase Dashboard -> Settings -> API -> Project URL\n');
    }

    process.exit(1);
  }
}

testConnection();
