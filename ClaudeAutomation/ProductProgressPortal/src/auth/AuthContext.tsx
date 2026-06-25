import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AppUser } from '../types';
import { supabase } from '../lib/supabase';

export const SUPER_ADMIN_EMAIL = 'tahera.bharmal@egovernments.org';

export interface AdminRecord {
  productSlugs: string[];
  isSuperAdmin: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  adminRecord: AdminRecord | null;
  loginWithPassword: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  isAdminFor: (productSlug: string) => boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAdminRecord(email: string): Promise<AdminRecord> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('product_slugs, is_super_admin')
      .eq('email', email)
      .maybeSingle();
    if (data) {
      return {
        productSlugs: data.product_slugs ?? [],
        isSuperAdmin: data.is_super_admin ?? false,
      };
    }
  } catch {
    // table may not exist yet during setup
  }
  // Fallback: super admin email always gets super admin access
  return { productSlugs: [], isSuperAdmin: email === SUPER_ADMIN_EMAIL };
}

function makeAppUser(session: { user: { email?: string; user_metadata?: { username?: string }; }; access_token: string }): AppUser {
  const email = session.user.email ?? '';
  return {
    email,
    name: session.user.user_metadata?.username ?? email,
    picture: '',
    accessToken: session.access_token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = makeAppUser(session);
        setUser(u);
        setAdminRecord(await fetchAdminRecord(u.email));
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = makeAppUser(session);
        setUser(u);
        setAdminRecord(await fetchAdminRecord(u.email));
      } else {
        setUser(null);
        setAdminRecord(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithPassword = useCallback(async (loginId: string, password: string) => {
    const email = loginId.includes('@') ? loginId : `${loginId}@egovernments.org`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // user + adminRecord set by onAuthStateChange
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
    setAdminRecord(null);
  }, []);

  const isSuperAdmin =
    user?.email === SUPER_ADMIN_EMAIL ||
    (adminRecord?.isSuperAdmin ?? false);

  const isAdminFor = useCallback((productSlug: string): boolean => {
    if (!user) return false;
    if (user.email === SUPER_ADMIN_EMAIL || adminRecord?.isSuperAdmin) return true;
    return adminRecord?.productSlugs.includes(productSlug) ?? false;
  }, [user, adminRecord]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, adminRecord,
      loginWithPassword, logout,
      isAdminFor, isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
