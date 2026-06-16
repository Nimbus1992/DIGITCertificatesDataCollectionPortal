import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type {
  ExecSummaryData, ProductOverviewData, OKR, BudgetRow,
  RoadmapItem, Metric, Artifact, Conversation, Risk, Decision, ChangelogEntry, TeamMember,
  SectionVisibility,
} from '../types';
import { supabase } from '../lib/supabase';

export interface PortalData {
  execSummary: ExecSummaryData;
  productOverview: ProductOverviewData;
  okrs: OKR[];
  budget: BudgetRow[];
  budgetHighlights: string[];
  roadmap: RoadmapItem[];
  metrics: Metric[];
  artifacts: Artifact[];
  conversations: Conversation[];
  risks: Risk[];
  decisions: Decision[];
  changelog: ChangelogEntry[];
  team: TeamMember[];
  sectionVisibility: SectionVisibility;
}

const DEFAULTS: PortalData = {
  execSummary: {
    overallStatus: 'Green',
    deliveryConfidence: 'Green',
    budgetConfidence: 'Green',
    timelineConfidence: 'Green',
    okrsOnTrack: 0,
    milestonesCompleted: 0,
    budgetUtilized: 0,
    roadmapProgress: 0,
    successMetricProgress: 0,
    biggestWin: '',
    biggestRisk: '',
    mostImportantUpdate: '',
    decisionsNeeded: [],
    leadershipSupport: [],
    escalations: [],
  },
  productOverview: {
    problem: '',
    vision: '',
    objectives: [],
    inScope: [],
    outOfScope: [],
    targetUsers: [],
    strategicAlignment: [],
  },
  okrs: [],
  budget: [],
  budgetHighlights: [],
  roadmap: [],
  metrics: [
    { name: 'Time to go live with a use case (Template Creation + Configuration + Calculation)', theme: 'Adoption', category: 'Delivery', target: '4 weeks (MVP)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'Avg. # of license/permit types configured per account', theme: 'Adoption', category: 'Outcome', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '# of partner-led implementations (without eGov involvement)', theme: 'Adoption', category: 'Outcome', target: 'All (long-term)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'No. of queries from partner / Avg. time spent by core team per customer onboarded', theme: 'Adoption', category: 'Delivery', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '# of distinct license/permit archetypes supported', theme: 'Feature Completeness', category: 'Delivery', target: '2 — Trade License + 1 TBD (MVP)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '% of requirements for a country reached via configuration', theme: 'Feature Completeness', category: 'Outcome', target: '60% across 5 countries (MVP)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '% of applications that meet SLA defined', theme: 'Product Impact & Experience', category: 'Outcome', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'User Satisfaction Score', theme: 'Product Impact & Experience', category: 'Outcome', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '# of L1 Support Tickets raised', theme: 'Product Impact & Experience', category: 'Delivery', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'Accessibility compliance as per WCAG', theme: 'Product Impact & Experience', category: 'Outcome', target: 'AA (MVP)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: '% Uptime', theme: 'Performance, Security & Cost', category: 'Delivery', target: '95% (MVP)', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'Infra cost per account', theme: 'Performance, Security & Cost', category: 'Outcome', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'Support tickets per customer / per month', theme: 'Performance, Security & Cost', category: 'Delivery', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
    { name: 'Audit success rate', theme: 'Performance, Security & Cost', category: 'Outcome', target: 'TBD', actual: '', trend: 'Stable', period: 'MVP' },
  ],
  artifacts: [],
  conversations: [],
  risks: [],
  decisions: [],
  changelog: [],
  team: [],
  sectionVisibility: { dpiAdoption: true, plgLifecycle: true, ecosystemBuilding: true },
};

function storeKey(productId: string) {
  return `ppp_data_${productId}`;
}

function loadLocal(productId: string): PortalData {
  try {
    const raw = localStorage.getItem(storeKey(productId));
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function saveLocal(productId: string, data: PortalData) {
  localStorage.setItem(storeKey(productId), JSON.stringify(data));
}

async function loadRemote(productId: string): Promise<PortalData | null> {
  try {
    const { data: row } = await supabase
      .from('portal_state')
      .select('data')
      .eq('id', productId)
      .maybeSingle();
    if (!row?.data || Object.keys(row.data).length === 0) return null;
    return { ...DEFAULTS, ...row.data } as PortalData;
  } catch {
    return null;
  }
}

async function saveRemote(productId: string, data: PortalData) {
  try {
    await supabase
      .from('portal_state')
      .upsert({ id: productId, data, updated_at: new Date().toISOString() });
  } catch {
    // silently fail — localStorage still holds the data
  }
}

interface StoreCtx {
  data: PortalData;
  set: <K extends keyof PortalData>(key: K, value: PortalData[K]) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function DataStoreProvider({ children, productId }: { children: ReactNode; productId: string }) {
  const [data, setData] = useState<PortalData>(() => loadLocal(productId));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount or productId change: load from Supabase as authoritative source
  useEffect(() => {
    setData(loadLocal(productId));
    loadRemote(productId).then(remote => {
      if (remote) {
        setData(remote);
        saveLocal(productId, remote);
      }
    });
  }, [productId]);

  const set = useCallback(<K extends keyof PortalData>(key: K, value: PortalData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: value };
      saveLocal(productId, next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveRemote(productId, next), 800);
      return next;
    });
  }, [productId]);

  const reset = useCallback(() => {
    localStorage.removeItem(storeKey(productId));
    setData(DEFAULTS);
    saveRemote(productId, DEFAULTS);
  }, [productId]);

  return <Ctx.Provider value={{ data, set, reset }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within DataStoreProvider');
  return ctx;
}
