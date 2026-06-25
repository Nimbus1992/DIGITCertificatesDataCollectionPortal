import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SheetConnector } from '../../admin/modules/SheetConnector';

vi.mock('../../lib/supabase');

const mockTestConnection = vi.fn();
vi.mock('../../sheets/sheetsApi', () => ({
  testConnection: (...args: unknown[]) => mockTestConnection(...args),
}));

vi.mock('../../config/ConfigContext', () => ({ useConfig: vi.fn() }));
vi.mock('../../auth/AuthContext', () => ({ useAuth: vi.fn() }));

import { useConfig } from '../../config/ConfigContext';
import { useAuth } from '../../auth/AuthContext';

const TABS = {
  okrs: 'OKRs', budget: 'Budget', roadmap: 'Roadmap', artifacts: 'Artifacts',
  conversations: 'Conversations', risks: 'Risks', decisions: 'Decisions',
  metrics: 'Metrics', executiveSummary: 'Executive Summary',
  productOverview: 'Product Overview', changelog: 'Changelog',
};

const mockSaveConfig = vi.fn();

function setupMocks(overrides: { spreadsheetId?: string; authenticated?: boolean } = {}) {
  vi.mocked(useConfig).mockReturnValue({
    config: { spreadsheetId: overrides.spreadsheetId ?? '', adminEmails: [], tabs: TABS },
    isConfigured: false,
    saveConfig: mockSaveConfig,
    resetConfig: vi.fn(),
  });
  vi.mocked(useAuth).mockReturnValue({
    user: overrides.authenticated !== false
      ? { accessToken: 'tok', email: 'test@test.com', name: 'Test', picture: '' }
      : null,
    isLoading: false, adminRecord: null,
    login: vi.fn(), loginWithPassword: vi.fn(), logout: vi.fn(),
    isAdminFor: () => false, isSuperAdmin: false,
  });
}

describe('SheetConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTestConnection.mockResolvedValue([]);
  });

  it('T-54.01: renders Sheet Connector heading', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByText('Sheet Connector')).toBeInTheDocument();
  });

  it('T-54.02: renders Spreadsheet ID input and Test button', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByPlaceholderText(/e\.g\. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('T-54.03: renders Tab Mappings section', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByText('Tab Mappings')).toBeInTheDocument();
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  it('T-54.04: renders Admin Emails textarea', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByText('Admin Emails')).toBeInTheDocument();
  });

  it('T-54.05: Save Configuration button exists', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByRole('button', { name: 'Save Configuration' })).toBeInTheDocument();
  });

  it('T-54.06: clicking Save Configuration calls saveConfig and shows saved state', async () => {
    const user = userEvent.setup();
    setupMocks();
    render(<SheetConnector />);
    await user.click(screen.getByRole('button', { name: 'Save Configuration' }));
    expect(mockSaveConfig).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole('button', { name: /✓ Saved/ })).toBeInTheDocument());
  });

  it('T-54.07: successful Test Connection shows tabs found', async () => {
    const user = userEvent.setup();
    setupMocks({ authenticated: true });
    mockTestConnection.mockResolvedValue(['OKRs', 'Budget', 'Roadmap']);
    render(<SheetConnector />);
    const idInput = screen.getByPlaceholderText(/e\.g\. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/);
    await user.type(idInput, 'abc123');
    await user.click(screen.getByRole('button', { name: 'Test' }));
    await waitFor(() => expect(screen.getByText(/Connected — 3 tabs found/)).toBeInTheDocument());
    expect(screen.getAllByText('OKRs').length).toBeGreaterThan(0);
  });

  it('T-54.08: failed Test Connection shows error message', async () => {
    const user = userEvent.setup();
    setupMocks({ authenticated: true });
    mockTestConnection.mockRejectedValue(new Error('Access denied'));
    render(<SheetConnector />);
    const idInput = screen.getByPlaceholderText(/e\.g\. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/);
    await user.type(idInput, 'abc123');
    await user.click(screen.getByRole('button', { name: 'Test' }));
    await waitFor(() => expect(screen.getByText('Access denied')).toBeInTheDocument());
  });

  it('T-54.09: typing in admin emails textarea updates the value', async () => {
    const user = userEvent.setup();
    setupMocks();
    render(<SheetConnector />);
    const textarea = screen.getByPlaceholderText(/admin@egovernments\.org/);
    await user.type(textarea, 'new@admin.com');
    expect(textarea).toHaveValue('new@admin.com');
  });

  it('T-54.10: Test button is disabled when spreadsheet ID is empty', () => {
    setupMocks();
    render(<SheetConnector />);
    expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled();
  });

  it('T-54.11: pre-filled spreadsheet ID renders in input', () => {
    setupMocks({ spreadsheetId: 'existing-id-123' });
    render(<SheetConnector />);
    expect(screen.getByDisplayValue('existing-id-123')).toBeInTheDocument();
  });
});
