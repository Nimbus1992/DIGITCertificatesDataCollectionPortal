import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  OKRManager, BudgetManager, RoadmapManager, ArtifactManager,
  ConversationManager, RiskManager, DecisionManager, MetricsManager,
} from '../../admin/modules/managers';

vi.mock('../../lib/supabase');
vi.mock('../../sheets/sheetsApi', () => ({ fetchSheetRows: vi.fn().mockResolvedValue([]) }));
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useConfig).mockReturnValue({
    config: { spreadsheetId: '', adminEmails: [], tabs: TABS },
    isConfigured: false,
    saveConfig: vi.fn(),
    resetConfig: vi.fn(),
  });
  vi.mocked(useAuth).mockReturnValue({
    user: null, isLoading: false, adminRecord: null,
    login: vi.fn(), loginWithPassword: vi.fn(), logout: vi.fn(),
    isAdminFor: () => false, isSuperAdmin: false,
  });
});

describe('Admin Manager components', () => {
  it('T-53.01: OKRManager renders its title', () => {
    render(<OKRManager />);
    expect(screen.getByText('OKR Manager')).toBeInTheDocument();
  });

  it('T-53.02: BudgetManager renders its title', () => {
    render(<BudgetManager />);
    expect(screen.getByText('Budget Manager')).toBeInTheDocument();
  });

  it('T-53.03: RoadmapManager renders its title', () => {
    render(<RoadmapManager />);
    expect(screen.getByText('Roadmap Manager')).toBeInTheDocument();
  });

  it('T-53.04: ArtifactManager renders its title', () => {
    render(<ArtifactManager />);
    expect(screen.getByText('Artifact Repository')).toBeInTheDocument();
  });

  it('T-53.05: ConversationManager renders its title', () => {
    render(<ConversationManager />);
    expect(screen.getByText('Conversation Manager')).toBeInTheDocument();
  });

  it('T-53.06: RiskManager renders its title', () => {
    render(<RiskManager />);
    expect(screen.getByText('Risk Registry')).toBeInTheDocument();
  });

  it('T-53.07: DecisionManager renders its title', () => {
    render(<DecisionManager />);
    expect(screen.getByText('Decision Log')).toBeInTheDocument();
  });

  it('T-53.08: MetricsManager renders its title', () => {
    render(<MetricsManager />);
    expect(screen.getByText('Metrics Editor')).toBeInTheDocument();
  });
});
