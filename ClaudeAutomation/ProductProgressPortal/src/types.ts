export type Status = 'Green' | 'Amber' | 'Red';

export interface VersionMeta {
  draftVersion: string;
  publishedVersion?: string;
  publishedAt?: string;
  hasUnpublishedChanges: boolean;
}
export type OKRStatus = 'On Track' | 'Delayed' | 'Completed' | 'At Risk';
export type RoadmapStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';
export type DecisionStatus = 'Open' | 'Closed' | 'Pending';
export type ConversationStage = 'Discover' | 'Sign Up' | 'Implement' | 'Use' | 'Expand';

export interface PortalConfig {
  spreadsheetId: string;
  adminEmails: string[];
  tabs: {
    executiveSummary: string;
    productOverview: string;
    okrs: string;
    budget: string;
    roadmap: string;
    metrics: string;
    artifacts: string;
    conversations: string;
    risks: string;
    decisions: string;
    changelog: string;
  };
}

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export interface ExecSummaryData {
  overallStatus: Status;
  deliveryConfidence: Status;
  budgetConfidence: Status;
  timelineConfidence: Status;
  okrsOnTrack: number;
  milestonesCompleted: number;
  budgetUtilized: number;
  roadmapProgress: number;
  successMetricProgress: number;
  launchDate?: string;
  biggestWin: string;
  biggestRisk: string;
  mostImportantUpdate: string;
  decisionsNeeded: string[];
  leadershipSupport: string[];
  escalations: string[];
}

export interface ProductOverviewData {
  problem: string;
  vision: string;
  objectives: string[];
  inScope: string[];
  outOfScope: string[];
  targetUsers: string[];
  strategicAlignment: string[];
}

export interface OKR {
  objective: string;
  keyResult: string;
  target: string;
  actual: string;
  progress: number;
  status: OKRStatus;
  targetDate: string;
  owner: string;
  delayed: boolean;
  reason: string;
  impact: string;
  mitigation: string;
  recoveryPlan: string;
}

export interface Milestone {
  milestone: string;
  owner: string;
  status: string;
  completionPct: number;
  date: string;
  okrRef: string;
}

export interface RoadmapItem {
  item: string;
  description: string;
  status: RoadmapStatus;
  confidence: Status;
  dependencies: string;
  deliveryWindow: string;
  quarter: string;
  phase: string;
}

export interface BudgetRow {
  category: string;
  workstream: string;
  month: string;
  budgeted: number;
  consumed: number;
  remaining: number;
  forecast: number;
  variance: number;
}

export interface Metric {
  name: string;
  category: 'Delivery' | 'Outcome';
  theme?: string;
  target: string;
  actual: string;
  trend: 'Up' | 'Down' | 'Stable';
  period: string;
}

export type ArtifactSection = 'DPI Adoption' | 'PLG Lifecycle' | 'Ecosystem Building';
export type DPIStage = 'Discovery' | 'Design' | 'Build' | 'Adoption';

export interface ArtifactCategory {
  id: string;
  name: string;
  subcategories: string[];
  visible: boolean;
}

export interface SectionVisibility {
  dpiAdoption: boolean;
  plgLifecycle: boolean;
  ecosystemBuilding: boolean;
  // Exec nav sections
  execSummary: boolean;
  productOverview: boolean;
  okrs: boolean;
  roadmap: boolean;
  budget: boolean;
  deliverables: boolean;
  conversations: boolean;
  risks: boolean;
  decisions: boolean;
  changelog: boolean;
  governance: boolean;
  appendix: boolean;
}

export type GovernanceLevel = 'daily' | 'fortnightly' | 'exco' | 'quarterly';

export interface GovernanceSession {
  id: string;
  level: GovernanceLevel;
  date: string;
  presentationLink?: string;
  keyPoints: string[];
  attendees?: string;
}

export interface Artifact {
  title: string;
  type: string;
  owner: string;
  date: string;
  status: string;
  link: string;
  version?: string;
  reviewedBy?: string;
  section?: string;
  stage?: string;
  thumbnailUrl?: string;
  heading?: string;
  description?: string;
}

export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Delayed' | 'At Risk';

export interface OKRTask {
  id: string;
  title: string;
  owner: string;
  committedDate: string;
  revisedDate: string;
  status: MilestoneStatus;
  comments: string;
  subtasks?: OKRTask[];
}

export interface OKRMilestone {
  id: string;
  title: string;
  keyResult: string;
  owner: string;
  committedDate: string;
  revisedDate: string;
  status: MilestoneStatus;
  comments: string;
  tasks: OKRTask[];
  quarter?: string;
  rowType?: 'milestone' | 'launch';
}

export interface StageHistoryEntry {
  stage: ConversationStage;
  date: string;
  comment: string;
}

export interface Conversation {
  organization: string;
  owner: string;
  objective: string;
  stage: ConversationStage;
  latestUpdate: string;
  nextStep: string;
  partner?: string;
  lastUpdateDate?: string;
  stageHistory?: StageHistoryEntry[];
}

export type RiskCategory = 'Adoption' | 'Timeline' | 'Technical' | 'Security & Compliance' | 'Financial' | 'Other';

export interface Risk {
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category?: RiskCategory;
  probability: number;
  impact: number;
  owner: string;
  mitigation: string;
  eta: string;
  status: string;
}

export interface Dependency {
  dependency: string;
  owner: string;
  status: string;
  impact: string;
}

export interface Decision {
  decision: string;
  date: string;
  owner: string;
  context: string;
  tradeoff: string;
  outcome: string;
  status: DecisionStatus;
}

export interface ChangelogEntry {
  date: string;
  changeType: string;
  description: string;
  section: string;
  author: string;
}

export type TeamRole = 'Product Manager' | 'Architect' | 'Project Manager' | 'Engineers' | 'DevOps';
export type TeamEngagement = 'Internal' | 'External';

export interface TeamMember {
  name: string;
  role: TeamRole;
  engagement: TeamEngagement;
  photoUrl: string;
  utilization: number;
}

// ── Complaints (CMS) Roadmap ───────────────────────────────────────────────

export type CmsItemColor = 'teal' | 'sky' | 'green' | 'purple' | 'orange' | 'navy' | 'maroon';

export interface CmsRelease {
  id: string;
  name: string;
  timeframe: string;
  isCurrent?: boolean;
  hasStar?: boolean;
}

export interface CmsGoalItem {
  id: string;
  text: string;
  releaseId: string;
  color: CmsItemColor;
}

export interface CmsFeatureItem {
  id: string;
  text: string;
  releaseId: string;
  color: CmsItemColor;
}

export interface CmsModuleGroup {
  id: string;
  modules: string[];
  actors: string[];
  items: CmsFeatureItem[];
}

export interface CmsUpdateLogEntry {
  id: string;
  date: string;
  changes: string[];
}

export interface CmsTheme {
  color: CmsItemColor;
  label: string;
}

export interface CmsRoadmapData {
  releases: CmsRelease[];
  goals: CmsGoalItem[];
  valueBundles: { releaseId: string; items: string[] }[];
  successMetrics: { releaseId: string; items: string[] }[];
  moduleGroups: CmsModuleGroup[];
  updateLog: CmsUpdateLogEntry[];
  themes: CmsTheme[];
  masterModules: string[];
  masterActors: string[];
}
