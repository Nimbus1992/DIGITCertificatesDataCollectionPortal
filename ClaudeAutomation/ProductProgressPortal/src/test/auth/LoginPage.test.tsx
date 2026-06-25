import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../../auth/LoginPage';
import { AuthProvider } from '../../auth/AuthContext';
import { supabase, resetSupabaseMocks } from '../../lib/__mocks__/supabase';

vi.mock('../../lib/supabase');

// Minimal mock for GoogleSignInButton to avoid OAuth issues
vi.mock('../../auth/GoogleSignInButton', () => ({
  GoogleSignInButton: () => <button>Google Sign In</button>,
}));

function renderLogin(initialPath = '/login') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home</div>} />
          <Route path="/lnp/admin" element={<div>LNP Admin</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    vi.clearAllMocks();
  });

  it('T-15.01: renders Login ID and Password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Enter your login ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('T-15.02: Sign In button is disabled when both fields are empty', () => {
    renderLogin();
    const btn = screen.getByRole('button', { name: 'Sign In' });
    expect(btn).toBeDisabled();
  });

  it('T-15.03: Sign In button is disabled when only loginId is filled', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled();
  });

  it('T-15.04: Sign In button is enabled when both fields have values', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    expect(screen.getByRole('button', { name: 'Sign In' })).not.toBeDisabled();
  });

  it('T-15.05: submitting valid credentials calls loginWithPassword', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({ email: 'alice@egovernments.org', password: 'pass123' });
    });
  });

  it('T-15.06: displays error message on failed login', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: {}, error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid login ID or password.')).toBeInTheDocument();
    });
  });

  it('T-15.07: button shows "Signing in…" while submitting', async () => {
    let resolve: (v: unknown) => void;
    const pending = new Promise(r => { resolve = r; });
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockReturnValue(pending);
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled());
    resolve!({ data: {}, error: null });
  });

  it('T-15.08: redirects to / after successful login (no redirect param)', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    renderLogin('/login');
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
  });

  it('T-15.09: redirects to ?redirect= URL after successful login', async () => {
    const signIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
    signIn.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    renderLogin('/login?redirect=%2Flnp%2Fadmin');
    await user.type(screen.getByPlaceholderText('Enter your login ID'), 'alice');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(screen.getByText('LNP Admin')).toBeInTheDocument());
  });

  it('T-15.10: Google sign-in button is absent when VITE_GOOGLE_CLIENT_ID is empty', () => {
    renderLogin();
    // setup.ts sets VITE_GOOGLE_CLIENT_ID to '' so Google button should not appear
    expect(screen.queryByText('Google Sign In')).not.toBeInTheDocument();
  });
});
