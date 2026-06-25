import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth, SUPER_ADMIN_EMAIL } from '../../auth/AuthContext';
import { supabase, resetSupabaseMocks } from '../../lib/__mocks__/supabase';

vi.mock('../../lib/supabase');

function AuthHarness({ onAuth }: { onAuth: (auth: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  useEffect(() => { onAuth(auth); }, [auth, onAuth]);
  return null;
}

function wrapAuth() {
  let captured: ReturnType<typeof useAuth> | null = null;
  const Wrapper = () => (
    <AuthProvider>
      <AuthHarness onAuth={a => { captured = a; }} />
    </AuthProvider>
  );
  const utils = render(<Wrapper />);
  const get = () => captured!;
  return { ...utils, get };
}

function makeSession(email: string, isSuperAdmin = false) {
  return {
    data: {
      session: {
        user: { email, user_metadata: { username: email } },
        access_token: 'token-123',
      },
    },
    error: null,
  };
}

describe('AuthContext', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('T-14.01: isSuperAdmin is true for SUPER_ADMIN_EMAIL user', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession(SUPER_ADMIN_EMAIL));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isSuperAdmin).toBe(true);
  });

  it('T-14.02: isSuperAdmin is true when adminRecord.isSuperAdmin is true', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession('other@example.com'));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { product_slugs: [], is_super_admin: true }, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isSuperAdmin).toBe(true);
  });

  it('T-14.03: isSuperAdmin is false for regular user with no adminRecord', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession('nobody@example.com'));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isSuperAdmin).toBe(false);
  });

  it('T-14.04: isAdminFor returns true for user with matching productSlug', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession('admin@example.com'));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { product_slugs: ['lnp'], is_super_admin: false }, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isAdminFor('lnp')).toBe(true);
    expect(get().isAdminFor('hcm')).toBe(false);
  });

  it('T-14.05: isAdminFor returns false for unknown slug', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession('admin@example.com'));
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { product_slugs: ['lnp'], is_super_admin: false }, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isAdminFor('unknown')).toBe(false);
  });

  it('T-14.06: isAdminFor returns false when user is null', async () => {
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    expect(get().isAdminFor('lnp')).toBe(false);
  });

  it('T-14.07: loginWithPassword appends @egovernments.org when no @ present', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: {}, error: null });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    await act(async () => {
      await get().loginWithPassword('alice', 'pass123');
    });
    expect(signIn).toHaveBeenCalledWith({ email: 'alice@egovernments.org', password: 'pass123' });
  });

  it('T-14.08: loginWithPassword passes full email through unchanged', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: {}, error: null });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    await act(async () => {
      await get().loginWithPassword('alice@other.com', 'pass123');
    });
    expect(signIn).toHaveBeenCalledWith({ email: 'alice@other.com', password: 'pass123' });
  });

  it('T-14.09: loginWithPassword throws when supabase returns an error', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: {}, error: { message: 'Invalid credentials' } });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    await expect(get().loginWithPassword('alice', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('T-14.10: logout clears user state', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession(SUPER_ADMIN_EMAIL));
    const { get } = wrapAuth();
    await waitFor(() => expect(get().user).not.toBeNull());
    act(() => { get().logout(); });
    await waitFor(() => expect(get().user).toBeNull());
  });

  it('T-14.11: fallback grants super-admin when DB row missing and email matches SUPER_ADMIN_EMAIL', async () => {
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(makeSession(SUPER_ADMIN_EMAIL));
    // DB returns null (table doesn't exist or user not found)
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const { get } = wrapAuth();
    await waitFor(() => expect(get().isLoading).toBe(false));
    // Fallback: email === SUPER_ADMIN_EMAIL → isSuperAdmin
    expect(get().isSuperAdmin).toBe(true);
  });

  it('T-14.12: useAuth throws when called outside AuthProvider', () => {
    const Bad = () => { useAuth(); return null; };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });
});
