// Mock dataset for the Audit Logs & Activity Center.
// Realistic, operational data spanning governance, configuration, deployment,
// and runtime activity for the Licenses & Permits Studio.

export type Environment = "production" | "staging" | "sandbox";
export type Severity = "info" | "warning" | "critical";
export type Result = "success" | "failed" | "warning";

export const SERVICES = [
  "Business License",
  "Building Permit",
  "Trade Permit",
  "Fire NOC",
  "Occupancy Certificate",
] as const;
export type ServiceName = (typeof SERVICES)[number];

export const USERS = [
  "Aarav Mehta",
  "Priya Sharma",
  "Ravi Kumar",
  "Sneha Iyer",
  "Marcus Lee",
  "Fatima Khan",
  "David Chen",
  "Anita Rao",
] as const;

export type GovernanceEvent = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  scope: string;
  result: Result;
  environment: Environment;
  ip: string;
  affectedServices: string[];
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  related: string[];
  category: "governance" | "security";
};

export type ConfigActivityEvent = {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: ServiceName;
  module: "Forms" | "Workflow" | "Roles" | "Notifications" | "Payments" | "Checklists" | "Documents";
  actor: string;
  summary: string;
  version: string;
  environment: Environment;
  affected: string[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  notes: string;
  publishedBy: string;
};

export type DeploymentStatus = "draft" | "published" | "failed" | "rolled_back";
export type Deployment = {
  id: string;
  version: string;
  timestamp: string;
  publishedBy: string;
  environment: Environment;
  status: DeploymentStatus;
  serviceId: string;
  serviceName: ServiceName;
  impactedServices: ServiceName[];
  changedModules: string[];
  durationSec: number;
  notes: string[];
  warnings: string[];
  runtimeHealth: "healthy" | "degraded" | "down";
};

export type RuntimeEventType =
  | "submitted"
  | "payment_completed"
  | "document_verified"
  | "inspection_assigned"
  | "inspection_completed"
  | "sent_back"
  | "approved"
  | "rejected"
  | "certificate_generated"
  | "notification_sent";

export type RuntimeStatus = "approved" | "sent_back" | "rejected" | "pending" | "in_progress";

export type RuntimeEvent = {
  id: string;
  timestamp: string;
  applicationId: string;
  applicant: string;
  serviceId: string;
  serviceName: ServiceName;
  stage: string;
  actor: string;
  eventType: RuntimeEventType;
  status: RuntimeStatus;
  documents: string[];
  payments: string[];
  notifications: string[];
};

// ---------- helpers ----------
const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => minutesAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);

const svcId = (name: ServiceName) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- governance ----------
export const governanceEvents: GovernanceEvent[] = [
  {
    id: "AUD-G-10421",
    timestamp: minutesAgo(12),
    user: "Aarav Mehta",
    action: "Role updated",
    entity: "Document Verifier",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.7",
    affectedServices: ["Business License", "Trade Permit"],
    before: { permissions: ["view_application", "verify_document"] },
    after: { permissions: ["view_application", "verify_document", "request_clarification"] },
    related: ["AUD-G-10401", "AUD-G-10398"],
    category: "governance",
  },
  {
    id: "AUD-G-10418",
    timestamp: hoursAgo(2),
    user: "Priya Sharma",
    action: "User invited",
    entity: "marcus.lee@gov.in",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.21",
    affectedServices: [],
    before: null,
    after: { role: "Approver", services: ["Building Permit"] },
    related: [],
    category: "governance",
  },
  {
    id: "AUD-G-10410",
    timestamp: hoursAgo(5),
    user: "System",
    action: "API key regenerated",
    entity: "service-key-prod-04",
    scope: "Workspace",
    result: "warning",
    environment: "production",
    ip: "—",
    affectedServices: ["Building Permit", "Fire NOC"],
    before: { fingerprint: "ak_8f12…a201" },
    after: { fingerprint: "ak_3c91…77fe" },
    related: ["AUD-G-10391"],
    category: "security",
  },
  {
    id: "AUD-G-10405",
    timestamp: hoursAgo(9),
    user: "Sneha Iyer",
    action: "Authentication changed",
    entity: "SSO Provider",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.4",
    affectedServices: [],
    before: { provider: "password" },
    after: { provider: "saml", idp: "Okta" },
    related: [],
    category: "security",
  },
  {
    id: "AUD-G-10399",
    timestamp: daysAgo(1),
    user: "Aarav Mehta",
    action: "Permission matrix modified",
    entity: "Approver",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.7",
    affectedServices: ["Business License"],
    before: { can_reject: false },
    after: { can_reject: true, can_send_back: true },
    related: ["AUD-G-10421"],
    category: "governance",
  },
  {
    id: "AUD-G-10391",
    timestamp: daysAgo(1),
    user: "Ravi Kumar",
    action: "Session revoked",
    entity: "marcus.lee@gov.in",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.11",
    affectedServices: [],
    before: { activeSessions: 2 },
    after: { activeSessions: 0 },
    related: [],
    category: "security",
  },
  {
    id: "AUD-G-10384",
    timestamp: daysAgo(2),
    user: "Anita Rao",
    action: "Branding updated",
    entity: "Workspace theme",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.55",
    affectedServices: SERVICES as unknown as string[],
    before: { primary: "#1a4a6e" },
    after: { primary: "#1f5e6e" },
    related: [],
    category: "governance",
  },
  {
    id: "AUD-G-10379",
    timestamp: daysAgo(2),
    user: "David Chen",
    action: "Integration connected",
    entity: "Razorpay",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.30",
    affectedServices: ["Business License", "Trade Permit", "Building Permit"],
    before: null,
    after: { provider: "razorpay", mode: "live" },
    related: [],
    category: "governance",
  },
  {
    id: "AUD-G-10362",
    timestamp: daysAgo(3),
    user: "Fatima Khan",
    action: "Language added",
    entity: "Hindi (hi-IN)",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.19",
    affectedServices: SERVICES as unknown as string[],
    before: { languages: ["en-IN"] },
    after: { languages: ["en-IN", "hi-IN"] },
    related: [],
    category: "governance",
  },
  {
    id: "AUD-G-10350",
    timestamp: daysAgo(4),
    user: "System",
    action: "Failed sign-in",
    entity: "ravi.kumar@gov.in",
    scope: "Workspace",
    result: "failed",
    environment: "production",
    ip: "203.0.113.18",
    affectedServices: [],
    before: null,
    after: { attempts: 5, blocked: true },
    related: ["AUD-G-10391"],
    category: "security",
  },
  {
    id: "AUD-G-10341",
    timestamp: daysAgo(5),
    user: "Aarav Mehta",
    action: "User removed",
    entity: "old.intern@gov.in",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.7",
    affectedServices: [],
    before: { role: "Viewer" },
    after: null,
    related: [],
    category: "governance",
  },
  {
    id: "AUD-G-10333",
    timestamp: daysAgo(6),
    user: "Priya Sharma",
    action: "Workspace setting updated",
    entity: "Session timeout",
    scope: "Workspace",
    result: "success",
    environment: "production",
    ip: "10.42.18.21",
    affectedServices: [],
    before: { sessionTimeoutMin: 60 },
    after: { sessionTimeoutMin: 30 },
    related: [],
    category: "governance",
  },
];

// ---------- configuration activity ----------
export const configActivityEvents: ConfigActivityEvent[] = [
  {
    id: "AUD-C-22014",
    timestamp: minutesAgo(35),
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    module: "Workflow",
    actor: "Priya Sharma",
    summary: "Workflow stage added — Document Verification",
    version: "v14.2",
    environment: "production",
    affected: ["Workflow", "Roles", "Notifications"],
    before: { stages: ["Submitted", "Approved", "Issued"] },
    after: { stages: ["Submitted", "Document Verification", "Approved", "Issued"] },
    notes: "Adds explicit document verifier step before approval.",
    publishedBy: "Priya Sharma",
  },
  {
    id: "AUD-C-22009",
    timestamp: hoursAgo(3),
    serviceId: svcId("Trade Permit"),
    serviceName: "Trade Permit",
    module: "Payments",
    actor: "Ravi Kumar",
    summary: "Fee calculation modified — base fee +5%",
    version: "v8.4",
    environment: "production",
    affected: ["Payments", "Notifications"],
    before: { baseFee: 1000, tax: 18 },
    after: { baseFee: 1050, tax: 18 },
    notes: "Aligned with FY26 fee revision circular.",
    publishedBy: "Ravi Kumar",
  },
  {
    id: "AUD-C-22001",
    timestamp: hoursAgo(7),
    serviceId: svcId("Building Permit"),
    serviceName: "Building Permit",
    module: "Forms",
    actor: "Sneha Iyer",
    summary: "Form field deleted — 'Plot subdivision number'",
    version: "v11.0",
    environment: "staging",
    affected: ["Forms"],
    before: { fields: ["plot_no", "plot_subdivision", "area_sqft"] },
    after: { fields: ["plot_no", "area_sqft"] },
    notes: "Field deprecated by survey department.",
    publishedBy: "—",
  },
  {
    id: "AUD-C-21988",
    timestamp: daysAgo(1),
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    module: "Notifications",
    actor: "Anita Rao",
    summary: "Notification template updated — Approval SMS",
    version: "v6.7",
    environment: "production",
    affected: ["Notifications"],
    before: { sms: "Your Fire NOC is approved." },
    after: { sms: "Your Fire NOC #{{appId}} is approved. Download: {{link}}" },
    notes: "Added application ID and download link.",
    publishedBy: "Anita Rao",
  },
  {
    id: "AUD-C-21974",
    timestamp: daysAgo(1),
    serviceId: svcId("Occupancy Certificate"),
    serviceName: "Occupancy Certificate",
    module: "Roles",
    actor: "Aarav Mehta",
    summary: "Role permissions changed — Inspector",
    version: "v4.3",
    environment: "production",
    affected: ["Roles", "Workflow"],
    before: { canReassignInspection: false },
    after: { canReassignInspection: true },
    notes: "",
    publishedBy: "Aarav Mehta",
  },
  {
    id: "AUD-C-21960",
    timestamp: daysAgo(2),
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    module: "Checklists",
    actor: "Fatima Khan",
    summary: "Checklist updated — Compliance documents",
    version: "v14.1",
    environment: "production",
    affected: ["Checklists", "Documents"],
    before: { items: 6 },
    after: { items: 8 },
    notes: "Added GST certificate + shop & establishment proof.",
    publishedBy: "Fatima Khan",
  },
  {
    id: "AUD-C-21942",
    timestamp: daysAgo(3),
    serviceId: svcId("Trade Permit"),
    serviceName: "Trade Permit",
    module: "Workflow",
    actor: "Sneha Iyer",
    summary: "Renewal enabled",
    version: "v8.3",
    environment: "production",
    affected: ["Workflow", "Notifications", "Payments"],
    before: { renewalEnabled: false },
    after: { renewalEnabled: true, renewalCycleMonths: 12 },
    notes: "Yearly renewal cycle with 30-day reminder.",
    publishedBy: "Sneha Iyer",
  },
  {
    id: "AUD-C-21920",
    timestamp: daysAgo(4),
    serviceId: svcId("Building Permit"),
    serviceName: "Building Permit",
    module: "Documents",
    actor: "David Chen",
    summary: "Categories uploaded — 12 new doc types",
    version: "v10.9",
    environment: "production",
    affected: ["Documents", "Forms"],
    before: { docTypes: 18 },
    after: { docTypes: 30 },
    notes: "",
    publishedBy: "David Chen",
  },
  {
    id: "AUD-C-21901",
    timestamp: daysAgo(5),
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    module: "Payments",
    actor: "Ravi Kumar",
    summary: "Renewal duration updated — 24 → 36 months",
    version: "v6.6",
    environment: "production",
    affected: ["Payments", "Workflow"],
    before: { renewalCycleMonths: 24 },
    after: { renewalCycleMonths: 36 },
    notes: "",
    publishedBy: "Ravi Kumar",
  },
];

// ---------- deployments ----------
export const deployments: Deployment[] = [
  {
    id: "DEP-1142",
    version: "v14.2",
    timestamp: minutesAgo(35),
    publishedBy: "Priya Sharma",
    environment: "production",
    status: "published",
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    impactedServices: ["Business License"],
    changedModules: ["Workflow", "Roles", "Notifications"],
    durationSec: 42,
    notes: ["Workflow updated", "Renewal rules changed", "Notification templates modified"],
    warnings: [],
    runtimeHealth: "healthy",
  },
  {
    id: "DEP-1141",
    version: "v8.4",
    timestamp: hoursAgo(3),
    publishedBy: "Ravi Kumar",
    environment: "production",
    status: "published",
    serviceId: svcId("Trade Permit"),
    serviceName: "Trade Permit",
    impactedServices: ["Trade Permit"],
    changedModules: ["Payments", "Notifications"],
    durationSec: 28,
    notes: ["Fee +5% per FY26 revision"],
    warnings: [],
    runtimeHealth: "healthy",
  },
  {
    id: "DEP-1140",
    version: "v11.0",
    timestamp: hoursAgo(7),
    publishedBy: "Sneha Iyer",
    environment: "staging",
    status: "draft",
    serviceId: svcId("Building Permit"),
    serviceName: "Building Permit",
    impactedServices: ["Building Permit"],
    changedModules: ["Forms"],
    durationSec: 0,
    notes: ["Deprecated plot_subdivision field"],
    warnings: ["1 form field removed — verify downstream reports"],
    runtimeHealth: "healthy",
  },
  {
    id: "DEP-1139",
    version: "v6.6",
    timestamp: daysAgo(1),
    publishedBy: "System",
    environment: "production",
    status: "rolled_back",
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    impactedServices: ["Fire NOC"],
    changedModules: ["Workflow"],
    durationSec: 64,
    notes: ["Rolled back due to validation errors in inspection stage"],
    warnings: ["Auto-rollback triggered after 3 runtime failures"],
    runtimeHealth: "degraded",
  },
  {
    id: "DEP-1138",
    version: "v6.7",
    timestamp: daysAgo(1),
    publishedBy: "Anita Rao",
    environment: "production",
    status: "published",
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    impactedServices: ["Fire NOC"],
    changedModules: ["Notifications"],
    durationSec: 19,
    notes: ["SMS template updated"],
    warnings: [],
    runtimeHealth: "healthy",
  },
  {
    id: "DEP-1137",
    version: "v4.3",
    timestamp: daysAgo(2),
    publishedBy: "Aarav Mehta",
    environment: "production",
    status: "published",
    serviceId: svcId("Occupancy Certificate"),
    serviceName: "Occupancy Certificate",
    impactedServices: ["Occupancy Certificate"],
    changedModules: ["Roles"],
    durationSec: 22,
    notes: ["Inspector reassignment enabled"],
    warnings: [],
    runtimeHealth: "healthy",
  },
  {
    id: "DEP-1136",
    version: "v14.0",
    timestamp: daysAgo(4),
    publishedBy: "Priya Sharma",
    environment: "production",
    status: "failed",
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    impactedServices: ["Business License"],
    changedModules: ["Workflow", "Payments"],
    durationSec: 12,
    notes: [],
    warnings: ["Validation failed: missing transition target 'Issued'"],
    runtimeHealth: "healthy",
  },
];

// ---------- runtime ----------
export const runtimeEvents: RuntimeEvent[] = [
  {
    id: "AUD-R-50921",
    timestamp: minutesAgo(4),
    applicationId: "BL-2026-018472",
    applicant: "Vikas Traders Pvt Ltd",
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    stage: "Document Verification",
    actor: "Sneha Iyer",
    eventType: "document_verified",
    status: "in_progress",
    documents: ["GST certificate", "PAN card", "Lease deed"],
    payments: [],
    notifications: ["SMS to applicant"],
  },
  {
    id: "AUD-R-50918",
    timestamp: minutesAgo(11),
    applicationId: "BP-2026-007211",
    applicant: "Ananya Constructions",
    serviceId: svcId("Building Permit"),
    serviceName: "Building Permit",
    stage: "Payment",
    actor: "Applicant",
    eventType: "payment_completed",
    status: "in_progress",
    documents: [],
    payments: ["INR 12,400 via Razorpay"],
    notifications: ["Email receipt"],
  },
  {
    id: "AUD-R-50910",
    timestamp: minutesAgo(26),
    applicationId: "TP-2026-004119",
    applicant: "Mehta Spices",
    serviceId: svcId("Trade Permit"),
    serviceName: "Trade Permit",
    stage: "Approval",
    actor: "Aarav Mehta",
    eventType: "approved",
    status: "approved",
    documents: ["Trade declaration"],
    payments: ["INR 1,050"],
    notifications: ["SMS + Email"],
  },
  {
    id: "AUD-R-50902",
    timestamp: hoursAgo(1),
    applicationId: "BL-2026-018461",
    applicant: "Sunrise Cafe",
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    stage: "Document Verification",
    actor: "Sneha Iyer",
    eventType: "sent_back",
    status: "sent_back",
    documents: ["Lease deed (unclear)"],
    payments: [],
    notifications: ["SMS to applicant"],
  },
  {
    id: "AUD-R-50894",
    timestamp: hoursAgo(2),
    applicationId: "FN-2026-001022",
    applicant: "Greenleaf Apartments",
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    stage: "Inspection",
    actor: "David Chen",
    eventType: "inspection_assigned",
    status: "pending",
    documents: [],
    payments: [],
    notifications: ["Inspector notified"],
  },
  {
    id: "AUD-R-50880",
    timestamp: hoursAgo(4),
    applicationId: "OC-2026-000318",
    applicant: "Skyline Residency",
    serviceId: svcId("Occupancy Certificate"),
    serviceName: "Occupancy Certificate",
    stage: "Issued",
    actor: "System",
    eventType: "certificate_generated",
    status: "approved",
    documents: ["Occupancy Certificate PDF"],
    payments: ["INR 8,200"],
    notifications: ["Email with attachment"],
  },
  {
    id: "AUD-R-50871",
    timestamp: hoursAgo(6),
    applicationId: "BP-2026-007180",
    applicant: "Sigma Builders",
    serviceId: svcId("Building Permit"),
    serviceName: "Building Permit",
    stage: "Approval",
    actor: "Priya Sharma",
    eventType: "rejected",
    status: "rejected",
    documents: ["Site plan"],
    payments: ["INR 12,400 refunded"],
    notifications: ["SMS + Email"],
  },
  {
    id: "AUD-R-50865",
    timestamp: hoursAgo(8),
    applicationId: "FN-2026-001019",
    applicant: "Crescent Mall",
    serviceId: svcId("Fire NOC"),
    serviceName: "Fire NOC",
    stage: "Inspection",
    actor: "David Chen",
    eventType: "inspection_completed",
    status: "in_progress",
    documents: ["Inspection report"],
    payments: [],
    notifications: [],
  },
  {
    id: "AUD-R-50851",
    timestamp: hoursAgo(11),
    applicationId: "BL-2026-018440",
    applicant: "Urban Eats LLP",
    serviceId: svcId("Business License"),
    serviceName: "Business License",
    stage: "Submitted",
    actor: "Applicant",
    eventType: "submitted",
    status: "pending",
    documents: ["GST", "PAN", "Lease"],
    payments: [],
    notifications: ["Confirmation email"],
  },
  {
    id: "AUD-R-50839",
    timestamp: daysAgo(1),
    applicationId: "TP-2026-004100",
    applicant: "Hari Traders",
    serviceId: svcId("Trade Permit"),
    serviceName: "Trade Permit",
    stage: "Notification",
    actor: "System",
    eventType: "notification_sent",
    status: "in_progress",
    documents: [],
    payments: [],
    notifications: ["Renewal reminder SMS"],
  },
];
