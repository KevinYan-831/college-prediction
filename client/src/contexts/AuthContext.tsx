import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkIfPredictionUnlocked: (sessionId: string) => Promise<boolean>;
  unlockPrediction: (sessionId: string, unlockCode: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const checkIfPredictionUnlocked = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_unlocked_predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }

    return !!data;
  };

  const unlockPrediction = async (
    sessionId: string,
    unlockCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // First, verify the unlock code exists and belongs to this user
      const { data: codeData, error: codeError } = await supabase
        .from('unlock_codes')
        .select('*')
        .eq('code', unlockCode.toUpperCase().trim())
        .eq('user_id', user.id)
        .single();

      if (codeError || !codeData) {
        return { success: false, error: '无效的解锁码或解锁码不属于您的账户' };
      }

      // Check if code is already used
      if (codeData.is_used) {
        return { success: false, error: '此解锁码已被使用' };
      }

      // Check if code is expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        return { success: false, error: '此解锁码已过期' };
      }

      // Check if this prediction is already unlocked
      const alreadyUnlocked = await checkIfPredictionUnlocked(sessionId);
      if (alreadyUnlocked) {
        return { success: false, error: '此预测已解锁' };
      }

      // Create unlock record
      const { error: unlockError } = await supabase
        .from('user_unlocked_predictions')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          unlock_code_id: codeData.id,
        });

      if (unlockError) {
        console.error('Error creating unlock record:', unlockError);
        return { success: false, error: '解锁失败，请重试' };
      }

      // Mark code as used
      const { error: updateError } = await supabase
        .from('unlock_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Error updating code status:', updateError);
        // Don't fail the unlock if just the status update fails
      }

      return { success: true };
    } catch (error) {
      console.error('Unlock error:', error);
      return { success: false, error: '解锁过程中发生错误' };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    checkIfPredictionUnlocked,
    unlockPrediction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
