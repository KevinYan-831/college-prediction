import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types for our database tables
export interface UnlockCode {
  id: string;
  code: string;
  user_id: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
  notes: string | null;
}

export interface UserUnlockedPrediction {
  id: string;
  user_id: string;
  session_id: string;
  unlocked_at: string;
  unlock_code_id: string | null;
}
