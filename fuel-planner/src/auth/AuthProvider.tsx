import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, supabaseUrlDiagnosis } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

function friendlyAuthError(msg: string): string {
  if (msg.toLowerCase().includes('invalid path') || msg.toLowerCase().includes('invalid url')) {
    const diag = supabaseUrlDiagnosis();
    return diag
      ? `Supabase config error — ${diag}`
      : 'Supabase URL is misconfigured. VITE_SUPABASE_URL must be your project URL with no trailing slash or path (e.g. https://xxxx.supabase.co).';
  }
  return msg;
}

// Guard against a request that never resolves (e.g. blocked network, a stalled
// auth lock) so the UI can show an error instead of spinning forever.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out — check your connection and Supabase settings.')), ms),
    ),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Read the session from local storage (no network call) so startup can't
    // hang or hold an auth lock. getUser() would make a network request.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        20000,
      );
      return { error: error ? friendlyAuthError(error.message) : null };
    } catch (e) {
      return { error: friendlyAuthError(e instanceof Error ? e.message : String(e)) };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        20000,
      );
      return { error: error ? friendlyAuthError(error.message) : null };
    } catch (e) {
      return { error: friendlyAuthError(e instanceof Error ? e.message : String(e)) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
