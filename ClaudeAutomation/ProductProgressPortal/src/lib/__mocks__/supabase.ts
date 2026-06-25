import { vi } from 'vitest';

// Chainable query builder that can be overridden per-test
const makeQueryBuilder = () => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  };
  return builder;
};

let _queryBuilder = makeQueryBuilder();

export const supabase = {
  from: vi.fn(() => _queryBuilder),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

// Helper to reset all mocks between tests
export function resetSupabaseMocks() {
  _queryBuilder = makeQueryBuilder();
  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => _queryBuilder);
  supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
  supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
  supabase.auth.signOut = vi.fn().mockResolvedValue({ error: null });
}

export function getQueryBuilder() {
  return _queryBuilder;
}
