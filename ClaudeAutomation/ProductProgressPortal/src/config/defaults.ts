import type { PortalConfig } from '../types';

export const DEFAULT_CONFIG: PortalConfig = {
  spreadsheetId: '',
  adminEmails: [],
  tabs: {
    executiveSummary: 'Executive Summary',
    productOverview: 'Product Overview',
    okrs: 'OKRs',
    budget: 'Budget',
    roadmap: 'Roadmap',
    metrics: 'Metrics',
    artifacts: 'Artifacts',
    conversations: 'Conversations',
    risks: 'Risks',
    decisions: 'Decisions',
    changelog: 'Changelog',
  },
};

export const CONFIG_KEY = 'ppp_config';
