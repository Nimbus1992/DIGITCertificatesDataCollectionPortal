import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { GoogleUser } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: GoogleUser | null;
  isLoading: boolean;
  login: (user: GoogleUser) => void;
  loginWithPassword: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: (adminEmails: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? '',
          name: session.user.user_metadata?.username ?? session.user.email ?? '',
          picture: '',
          accessToken: session.access_token,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? '',
          name: session.user.user_metadata?.username ?? session.user.email ?? '',
          picture: '',
          accessToken: session.access_token,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback((u: GoogleUser) => setUser(u), []);

  const loginWithPassword = useCallback(async (loginId: string, password: string) => {
    const email = loginId.includes('@') ? loginId : `${loginId}@egovernments.org`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // user state is set by onAuthStateChange listener above
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
  }, []);

  const isAdmin = useCallback(
    (adminEmails: string[]) => {
      if (!user) return false;
      if (adminEmails.length === 0) return true;
      return adminEmails.includes(user.email);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithPassword, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
