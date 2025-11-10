import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check(code) {
  const { data, error } = await supabase
    .from('unlock_codes')
    .select('*')
    .eq('code', code)
    .limit(10);

  console.log('Querying for code:', code);
  console.log('Result data:', data);
  console.log('Result error:', error);
}

check('EXTT-C59Y').catch((e) => console.error(e));
