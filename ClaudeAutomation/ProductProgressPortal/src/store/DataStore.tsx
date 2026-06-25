import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type {
  ExecSummaryData, ProductOverviewData, OKR, BudgetRow,
  RoadmapItem, Metric, Artifact, Conversation, Risk, Decision, ChangelogEntry, TeamMember,
  SectionVisibility, OKRMilestone, OKRTask, CmsRoadmapData, ArtifactCategory, VersionMeta,
  GovernanceSession,
} from '../types';
import { supabase } from '../lib/supabase';

function bumpMinorVersion(v: string): string {
  const parts = v.split('.');
  return `${parts[0]}.${(parseInt(parts[1] ?? '0', 10) + 1)}`;
}

// Maps each PortalData key to the section timestamp key it belongs to
const KEY_TO_SECTION: Partial<Record<string, string>> = {
  execSummary: 'execSummary',
  productOverview: 'productOverview',
  okrs: 'okrs',
  milestones: 'okrs',
  budget: 'budget',
  budgetHighlights: 'budget',
  budgetCurrency: 'budget',
  roadmap: 'roadmap',
  cmsRoadmap: 'roadmap',
  studioRoadmap: 'roadmap',
  roadmapComment: 'roadmap',
  metrics: 'productOverview',
  artifacts: 'deliverables',
  artifactCategories: 'deliverables',
  conversations: 'conversations',
  risks: 'risks',
  decisions: 'decisions',
  changelog: 'changelog',
  governanceSessions: 'governance',
  team: 'team',
};

// Empty CmsRoadmapData — used as default so non-CMS products start clean
const EMPTY_CMS_ROADMAP: CmsRoadmapData = {
  releases: [], goals: [], valueBundles: [], successMetrics: [],
  moduleGroups: [], updateLog: [], themes: [], masterModules: [], masterActors: [],
};


export interface PortalData {
  execSummary: ExecSummaryData;
  productOverview: ProductOverviewData;
  okrs: OKR[];
  budget: BudgetRow[];
  budgetHighlights: string[];
  budgetCurrency: 'INR' | 'USD';
  roadmap: RoadmapItem[];
  metrics: Metric[];
  artifacts: Artifact[];
  conversations: Conversation[];
  risks: Risk[];
  decisions: Decision[];
  changelog: ChangelogEntry[];
  team: TeamMember[];
  sectionVisibility: SectionVisibility;
  milestones: OKRMilestone[];
  artifactCategories: ArtifactCategory[];
  cmsRoadmap: CmsRoadmapData;
  studioRoadmap: CmsRoadmapData;
  roadmapComment: string;
  governanceSessions: GovernanceSession[];
  // Version & audit tracking
  _versionMeta?: VersionMeta;
  _sectionUpdatedAt?: Record<string, string>;
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
  budgetCurrency: 'INR',
  roadmap: [],
  metrics: [],
  artifacts: [],
  conversations: [],
  risks: [],
  decisions: [],
  changelog: [],
  team: [],
  sectionVisibility: {
    dpiAdoption: true, plgLifecycle: true, ecosystemBuilding: true,
    execSummary: true, productOverview: true, okrs: true, roadmap: true,
    budget: true, deliverables: true, conversations: true, risks: true,
    decisions: true, changelog: true, governance: true, appendix: true,
  },
  roadmapComment: '',
  governanceSessions: [],
  milestones: [],
  _versionMeta: { draftVersion: '1.0', hasUnpublishedChanges: false },
  _sectionUpdatedAt: {},
  artifactCategories: [
    { id: 'thread-1', name: 'Shared Narrative & Coalitions',   subcategories: ['Advocacy', 'Policy', 'Stakeholder Decks', 'Communications'],              visible: true },
    { id: 'thread-2', name: 'Design & Build DPGs',             subcategories: ['Research', 'Product Design', 'Architecture', 'Prototypes'],               visible: true },
    { id: 'thread-3', name: 'Catalysing an Exemplar at Speed', subcategories: ['Pilots', 'Case Studies', 'Implementation', 'Evaluation'],                 visible: true },
    { id: 'thread-4', name: 'Create Exponential Impact',       subcategories: ['Adoption Strategy', 'Training', 'Partnerships', 'Ecosystem'],             visible: true },
    { id: 'thread-5', name: 'Institutionalize the Impact',     subcategories: ['Governance', 'Sustainability', 'Knowledge Transfer', 'Capacity Building'], visible: true },
  ],
  cmsRoadmap: EMPTY_CMS_ROADMAP,
  studioRoadmap: EMPTY_CMS_ROADMAP,
};

function storeKey(productId: string) {
  return `ppp_data_${productId}`;
}

// ── Data migration ──────────────────────────────────────────────────────────
// Handles schema changes across versions so old localStorage/Supabase data
// is automatically upgraded on load.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateMilestones(raw: any[]): OKRMilestone[] {
  return raw.map(m => {
    // stream → keyResult
    if (m.stream !== undefined && m.keyResult === undefined) {
      m = { ...m, keyResult: m.stream };
      delete m.stream;
    }

    const allTasks: OKRTask[] = m.tasks ?? [];
    if (allTasks.length === 0) return m as OKRMilestone;

    // Detect flat structure: if any task ID like "X.YZ" (2+ trailing digits)
    // exists at the same level as its parent "X.Y", restructure.
    const topIds = new Set(allTasks.map((t: OKRTask) => t.id));
    const needsNesting = allTasks.some((t: OKRTask) => {
      const match = t.id.match(/^(\d+)\.(\d)(\d+)$/);
      return match && topIds.has(`${match[1]}.${match[2]}`);
    });

    if (!needsNesting) return m as OKRMilestone;

    const taskMap = new Map<string, OKRTask>(
      allTasks.map((t: OKRTask) => [t.id, { ...t, subtasks: [] }])
    );
    const assigned = new Set<string>();

    for (const t of allTasks) {
      const match = t.id.match(/^(\d+)\.(\d)(\d+)$/);
      if (match) {
        const parentId = `${match[1]}.${match[2]}`;
        if (taskMap.has(parentId)) {
          const parent = taskMap.get(parentId)!;
          parent.subtasks = [...(parent.subtasks ?? []), { ...t, subtasks: undefined }];
          assigned.add(t.id);
        }
      }
    }

    return {
      ...m,
      tasks: allTasks
        .filter((t: OKRTask) => !assigned.has(t.id))
        .map((t: OKRTask) => taskMap.get(t.id)!),
    } as OKRMilestone;
  });
}

const STAGE_MAP: Record<string, string> = {
  Discovery: 'Discover', Evaluation: 'Sign Up', Proposal: 'Sign Up',
  Pilot: 'Implement', Blocked: 'Implement', Closed: 'Expand',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateData(raw: any): PortalData {
  const merged = { ...DEFAULTS, ...raw };
  // Deep-merge execSummary so new optional fields get defaults from new code versions
  if (raw?.execSummary) {
    merged.execSummary = { ...DEFAULTS.execSummary, ...raw.execSummary };
  }
  if (Array.isArray(merged.milestones)) {
    merged.milestones = migrateMilestones(merged.milestones);
  }
  // Deep-merge cmsRoadmap so new fields (themes, masterModules, masterActors) get defaults
  if (raw?.cmsRoadmap) {
    merged.cmsRoadmap = { ...DEFAULTS.cmsRoadmap, ...raw.cmsRoadmap };
  }
  // Deep-merge studioRoadmap so new fields get defaults
  if (raw?.studioRoadmap) {
    merged.studioRoadmap = { ...DEFAULTS.studioRoadmap, ...raw.studioRoadmap };
  }
  // Deep-merge sectionVisibility so new exec-section keys get defaults
  if (raw?.sectionVisibility) {
    merged.sectionVisibility = { ...DEFAULTS.sectionVisibility, ...raw.sectionVisibility };
  }
  // Recalculate variance as forecast − budgeted (negative = saving) for all budget rows
  if (Array.isArray(merged.budget)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    merged.budget = merged.budget.map((row: any) => ({
      ...row,
      variance: (row.forecast ?? 0) - (row.budgeted ?? 0),
    }));
  }
  // ── Artifact category migrations ──────────────────────────────────────────
  const OLD_DPI_IDS = new Set(['dpi-adoption', 'plg-lifecycle', 'ecosystem-building']);

  if (Array.isArray(merged.artifactCategories)) {
    const hasOldDpiIds = merged.artifactCategories.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat: any) => OLD_DPI_IDS.has(cat.id)
    );

    if (hasOldDpiIds) {
      // Full replacement: old DPI categories → new 5-thread system
      merged.artifactCategories = DEFAULTS.artifactCategories;
      // Old section tags (DPI Adoption, PLG Lifecycle, etc.) no longer match;
      // clear them so artifacts appear under "Other Assets" until re-tagged.
      if (Array.isArray(merged.artifacts)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merged.artifacts = merged.artifacts.map((art: any) => {
          const OLD_DPI_SECTIONS = new Set(['DPI Adoption', 'PLG Lifecycle', 'Ecosystem Building']);
          return OLD_DPI_SECTIONS.has(art.section)
            ? { ...art, section: undefined, stage: undefined }
            : art;
        });
      }
    } else {
      // Rename only: old short 5-thread names → website-accurate names
      const LEGACY_CAT_NAMES: Record<string, string> = {
        'Narrative & Coalitions':  'Shared Narrative & Coalitions',
        'Catalyse Exemplar':       'Catalysing an Exemplar at Speed',
        'Scale & Adoption':        'Create Exponential Impact',
        'Institutionalise Impact': 'Institutionalize the Impact',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merged.artifactCategories = merged.artifactCategories.map((cat: any) => ({
        ...cat,
        name: LEGACY_CAT_NAMES[cat.name] ?? cat.name,
      }));
      if (Array.isArray(merged.artifacts)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merged.artifacts = merged.artifacts.map((art: any) => ({
          ...art,
          section: LEGACY_CAT_NAMES[art.section] ?? art.section,
        }));
      }
    }
  }
  // Preserve version metadata and section timestamps
  if (raw?._versionMeta) merged._versionMeta = { ...DEFAULTS._versionMeta, ...raw._versionMeta };
  if (raw?._sectionUpdatedAt) merged._sectionUpdatedAt = raw._sectionUpdatedAt;

  // Migrate old conversation stages to new funnel stages
  if (Array.isArray(merged.conversations)) {
    merged.conversations = merged.conversations.map((c: any) => ({
      ...c,
      stage: STAGE_MAP[c.stage] ?? c.stage,
    }));
  }
  return merged as PortalData;
}

// ── Persistence helpers ────────────────────────────────────────────────────

function loadLocal(productId: string): PortalData {
  try {
    const raw = localStorage.getItem(storeKey(productId));
    if (!raw) return DEFAULTS;
    return migrateData(JSON.parse(raw));
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
    return migrateData(row.data);
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
  publish: () => Promise<{ version: string }>;
  hasRemoteData: boolean | null; // null = loading, false = no published data, true = has data
}

const Ctx = createContext<StoreCtx | null>(null);

export function DataStoreProvider({ children, productId }: { children: ReactNode; productId: string }) {
  const [data, setData] = useState<PortalData>(() => loadLocal(productId));
  const [hasRemoteData, setHasRemoteData] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setData(loadLocal(productId));
    setHasRemoteData(null);
    loadRemote(productId).then(remote => {
      if (remote) {
        setData(remote);
        saveLocal(productId, remote);
        saveRemote(productId, remote);
        setHasRemoteData(true);
      } else {
        setHasRemoteData(false);
      }
    });
  }, [productId]);

  const set = useCallback(<K extends keyof PortalData>(key: K, value: PortalData[K]) => {
    const isMetaKey = (key as string) === '_versionMeta' || (key as string) === '_sectionUpdatedAt';
    setData(prev => {
      const updates: Partial<PortalData> = { [key]: value };

      if (!isMetaKey) {
        // Track per-section timestamp
        const sectionKey = KEY_TO_SECTION[key as string];
        if (sectionKey) {
          updates._sectionUpdatedAt = { ...prev._sectionUpdatedAt, [sectionKey]: new Date().toISOString() };
        }
        // Track version / unpublished-changes flag
        const meta = prev._versionMeta ?? { draftVersion: '1.0', hasUnpublishedChanges: false };
        if (!meta.hasUnpublishedChanges) {
          updates._versionMeta = meta.publishedVersion
            ? { ...meta, draftVersion: bumpMinorVersion(meta.draftVersion), hasUnpublishedChanges: true }
            : { ...meta, hasUnpublishedChanges: true };
        }
      }

      const next = { ...prev, ...updates };
      saveLocal(productId, next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveRemote(productId, next);
        // Keep exec view in sync — auto-push every admin save to the published slot
        if (!productId.endsWith('_pub')) saveRemote(`${productId}_pub`, next);
      }, 800);
      return next;
    });
  }, [productId]);

  const publish = useCallback(async (): Promise<{ version: string }> => {
    // Guard: don't publish from the published-view slot
    if (productId.endsWith('_pub')) return { version: '' };

    const current = data;
    const meta = current._versionMeta ?? { draftVersion: '1.0', hasUnpublishedChanges: true };
    const publishedVersion = meta.draftVersion;
    const publishedAt = new Date().toISOString();
    const updatedMeta: VersionMeta = { ...meta, publishedVersion, publishedAt, hasUnpublishedChanges: false };

    // Write snapshot to published slot
    const pubData = { ...current, _versionMeta: updatedMeta };
    await saveRemote(`${productId}_pub`, pubData);

    // Update draft row metadata
    const draftData = { ...current, _versionMeta: updatedMeta };
    setData(draftData);
    saveLocal(productId, draftData);
    await saveRemote(productId, draftData);

    return { version: publishedVersion };
  }, [data, productId]);

  const reset = useCallback(() => {
    localStorage.removeItem(storeKey(productId));
    setData(DEFAULTS);
    saveRemote(productId, DEFAULTS);
    if (!productId.endsWith('_pub')) saveRemote(`${productId}_pub`, DEFAULTS);
  }, [productId]);

  return <Ctx.Provider value={{ data, set, reset, publish, hasRemoteData }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within DataStoreProvider');
  return ctx;
}
