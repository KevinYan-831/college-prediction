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
    if (!user || !session) return false;

    try {
      const token = (session as any).access_token as string | undefined;
      if (!token) return false;

      const resp = await fetch(`/api/unlocked/${encodeURIComponent(sessionId)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        // treat non-OK as locked
        return false;
      }

      const body = await resp.json().catch(() => ({ unlocked: false }));
      return !!body.unlocked;
    } catch (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }
  };

  const unlockPrediction = async (
    sessionId: string,
    unlockCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Call server-side unlock endpoint which uses the service-role key
      const token = (session as any).access_token as string | undefined;
      if (!token) {
        return { success: false, error: 'User not authenticated' };
      }

      const resp = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, unlockCode }),
      });

      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        return { success: false, error: body?.error || '解锁失败' };
      }

      if (body && body.success) {
        return { success: true };
      }

      return { success: false, error: body?.error || '解锁失败' };
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
