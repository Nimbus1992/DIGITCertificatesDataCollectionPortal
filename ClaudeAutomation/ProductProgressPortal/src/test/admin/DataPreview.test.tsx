import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { DataPreview } from '../../admin/modules/DataPreview';

vi.mock('../../lib/supabase');

const mockFetchSheetRows = vi.fn();
vi.mock('../../sheets/sheetsApi', () => ({
  fetchSheetRows: (...args: unknown[]) => mockFetchSheetRows(...args),
}));

vi.mock('../../config/ConfigContext', () => ({
  useConfig: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useConfig } from '../../config/ConfigContext';
import { useAuth } from '../../auth/AuthContext';

const TABS = {
  okrs: 'OKRs', budget: 'Budget', roadmap: 'Roadmap', artifacts: 'Artifacts',
  conversations: 'Conversations', risks: 'Risks', decisions: 'Decisions',
  metrics: 'Metrics', executiveSummary: 'Executive Summary',
  productOverview: 'Product Overview', changelog: 'Changelog',
};

function makeConfigValue(overrides: { isConfigured?: boolean; spreadsheetId?: string } = {}) {
  return {
    config: { spreadsheetId: overrides.spreadsheetId ?? '', adminEmails: [], tabs: TABS },
    isConfigured: overrides.isConfigured ?? false,
    saveConfig: vi.fn(),
    resetConfig: vi.fn(),
  };
}

function makeAuthValue(authenticated = false) {
  return {
    user: authenticated ? { accessToken: 'tok', email: 'test@test.com', name: 'Test', picture: '' } : null,
    isLoading: false,
    adminRecord: null,
    login: vi.fn(),
    loginWithPassword: vi.fn(),
    logout: vi.fn(),
    isAdminFor: () => false,
    isSuperAdmin: false,
  };
}

describe('DataPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSheetRows.mockResolvedValue([]);
  });

  it('T-52.01: renders title and description', () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue());
    vi.mocked(useAuth).mockReturnValue(makeAuthValue());
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="Preview OKR data" icon="🎯" />);
    expect(screen.getByText('OKR Manager')).toBeInTheDocument();
    expect(screen.getByText('Preview OKR data')).toBeInTheDocument();
  });

  it('T-52.02: shows "Configure your Google Spreadsheet first" when not configured', () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: false }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue());
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    expect(screen.getByText(/Configure your Google Spreadsheet first/i)).toBeInTheDocument();
  });

  it('T-52.03: shows "Open in Google Sheets" link when spreadsheetId is set', () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    mockFetchSheetRows.mockResolvedValue([['Name', 'Status'], ['Row 1', 'Active']]);
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    expect(screen.getByText('Open in Google Sheets ↗')).toBeInTheDocument();
  });

  it('T-52.04: when configured with data rows, renders table with headers', async () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    mockFetchSheetRows.mockResolvedValue([['Name', 'Status'], ['Item A', 'Active'], ['Item B', 'Done']]);
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    await waitFor(() => expect(screen.getByText('Name')).toBeInTheDocument());
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });

  it('T-52.05: when configured with only header row (no data), shows empty message', async () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    mockFetchSheetRows.mockResolvedValue([['Name', 'Status']]);
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    await waitFor(() => expect(screen.getByText(/No data rows found in tab/i)).toBeInTheDocument());
  });

  it('T-52.06: when fetch fails, shows error message', async () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    mockFetchSheetRows.mockRejectedValue(new Error('Sheet not found'));
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    await waitFor(() => expect(screen.getByText('Failed to load data')).toBeInTheDocument());
    expect(screen.getByText('Sheet not found')).toBeInTheDocument();
  });

  it('T-52.07: shows row and column count when data loads', async () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    mockFetchSheetRows.mockResolvedValue([['Col1', 'Col2'], ['A', 'B'], ['C', 'D']]);
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    await waitFor(() => expect(screen.getByText(/2 rows · 2 columns/i)).toBeInTheDocument());
  });

  it('T-52.08: shows truncation notice when more than 50 rows', async () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(true));
    const headers = ['Col'];
    const rows: string[][] = [headers, ...Array.from({ length: 55 }, (_, i) => [`Row ${i + 1}`])];
    mockFetchSheetRows.mockResolvedValue(rows);
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    await waitFor(() => expect(screen.getByText(/Showing 50 of 55 rows/i)).toBeInTheDocument());
  });

  it('T-52.09: does not fetch when user is not authenticated', () => {
    vi.mocked(useConfig).mockReturnValue(makeConfigValue({ isConfigured: true, spreadsheetId: 'abc123' }));
    vi.mocked(useAuth).mockReturnValue(makeAuthValue(false));
    render(<DataPreview tabKey="okrs" title="OKR Manager" description="desc" icon="🎯" />);
    expect(mockFetchSheetRows).not.toHaveBeenCalled();
  });
});
