// Mock data + types for the Users & Access RBAC module.
// Frontend-only; persisted to localStorage by the page.

export type RoleType = "system" | "service";
export type AccessLevel = "none" | "view" | "limited" | "full";
export type UserStatus = "active" | "invited" | "disabled";

export type ActivityAction =
  | "Invited"
  | "Accepted invite"
  | "Role changed"
  | "Disabled"
  | "Re-enabled"
  | "Removed"
  | "Resent invite"
  | "Admin created"
  | "Admin deleted";

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  action: ActivityAction;
  affectedUser: string;
  affectedEmail: string;
  role: string;
  service: string | null;
}

export interface RoleDef {
  id: string;
  name: string;
  description: string;
  type: RoleType;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  avatarColor: string; // hsl token name
  roleId: string;
  services: string[]; // service names (free-form for mock)
  status: UserStatus;
  lastActiveISO: string | null;
}

export interface PermissionDef {
  key: string;
  label: string;
  helper: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: PermissionDef[];
}

export interface RolePermissions {
  // role.id -> permission.key -> AccessLevel
  [roleId: string]: Record<string, AccessLevel>;
}

export interface ServiceStageAccess {
  // role.id -> service name -> stage names selected
  [roleId: string]: Record<string, string[]>;
}

export const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
  { value: "none", label: "No Access" },
  { value: "view", label: "View" },
  { value: "limited", label: "Limited" },
  { value: "full", label: "Full" },
];

export const ROLES_SEED: RoleDef[] = [
  { id: "super_admin", name: "Super Admin", type: "system", description: "Org owner — only Super Admin can create or delete Admin accounts. All other permissions are identical to Admin." },
  { id: "system_admin", name: "Admin", type: "system", description: "Full platform access — manage organization, billing, and all services." },
  { id: "service_owner", name: "Service Owner", type: "service", description: "Configure and manage a specific service and its team. Can invite service-level users for their service." },
  { id: "service_designer", name: "Service Designer", type: "system", description: "Configure templates, forms, workflows, and branding for services." },
  { id: "document_verifier", name: "Document Verifier", type: "service", description: "Review and verify documents submitted by applicants." },
  { id: "field_inspector", name: "Field Inspector", type: "service", description: "Conduct field inspections and upload site reports." },
  { id: "approver", name: "Approver", type: "service", description: "Final approving authority for applications." },
  { id: "counter_operator", name: "Counter Operator", type: "service", description: "Accept applications and payments at the counter on behalf of citizens." },
  { id: "viewer", name: "Viewer", type: "service", description: "Read-only access to applications and reports." },
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissions: [
      { key: "dashboard.overview", label: "Overview metrics", helper: "KPIs, totals, and trend widgets." },
      { key: "dashboard.activity", label: "Recent activity", helper: "Live feed of user and system actions." },
    ],
  },
  {
    key: "applications",
    label: "Applications",
    permissions: [
      { key: "applications.list", label: "List applications", helper: "Search and browse application records." },
      { key: "applications.detail", label: "View application detail", helper: "Open full application data and history." },
      { key: "applications.edit", label: "Edit applications", helper: "Modify application data on behalf of citizens." },
      { key: "applications.assign", label: "Assign reviewers", helper: "Route applications to specific staff." },
    ],
  },
  {
    key: "workflow",
    label: "Workflow",
    permissions: [
      { key: "workflow.transition", label: "Move between stages", helper: "Advance, return, or reject applications." },
      { key: "workflow.override", label: "Override workflow", helper: "Skip stages or force a status change." },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    permissions: [
      { key: "documents.view", label: "View documents", helper: "Open citizen-uploaded files." },
      { key: "documents.verify", label: "Mark verified", helper: "Approve or reject individual documents." },
      { key: "documents.download", label: "Download documents", helper: "Export originals as PDF or image." },
    ],
  },
  {
    key: "inspections",
    label: "Inspections",
    permissions: [
      { key: "inspections.schedule", label: "Schedule inspection", helper: "Assign a date and inspector." },
      { key: "inspections.report", label: "Submit report", helper: "Upload findings and recommendation." },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    permissions: [
      { key: "reports.view", label: "View reports", helper: "Open canned operational reports." },
      { key: "reports.export", label: "Export reports", helper: "Download as CSV or PDF." },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    permissions: [
      { key: "settings.org", label: "Organization settings", helper: "Profile, departments, branding." },
      { key: "settings.users", label: "Manage users & roles", helper: "Invite, edit, disable users." },
      { key: "settings.billing", label: "Billing & licensing", helper: "Plan, invoices, license keys." },
    ],
  },
];

// Reasonable defaults per role.
function fill(level: AccessLevel): Record<string, AccessLevel> {
  const out: Record<string, AccessLevel> = {};
  for (const g of PERMISSION_GROUPS) for (const p of g.permissions) out[p.key] = level;
  return out;
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  super_admin: fill("full"),
  system_admin: fill("full"),
  service_owner: {
    ...fill("none"),
    "dashboard.overview": "view",
    "dashboard.activity": "view",
    "applications.list": "view",
    "applications.detail": "view",
    "documents.view": "view",
    "reports.view": "view",
    "reports.export": "view",
    "settings.users": "limited",
  },
  service_designer: { ...fill("view"), "settings.org": "full", "settings.users": "limited" },
  document_verifier: {
    ...fill("none"),
    "dashboard.overview": "view",
    "applications.list": "view",
    "applications.detail": "view",
    "documents.view": "full",
    "documents.verify": "full",
    "documents.download": "view",
    "workflow.transition": "limited",
  },
  field_inspector: {
    ...fill("none"),
    "dashboard.overview": "view",
    "applications.list": "view",
    "applications.detail": "view",
    "inspections.schedule": "view",
    "inspections.report": "full",
    "workflow.transition": "limited",
  },
  approver: {
    ...fill("none"),
    "dashboard.overview": "view",
    "applications.list": "view",
    "applications.detail": "full",
    "documents.view": "view",
    "workflow.transition": "full",
    "reports.view": "view",
  },
  counter_operator: {
    ...fill("none"),
    "applications.list": "view",
    "applications.detail": "view",
    "applications.edit": "limited",
    "documents.view": "view",
  },
  viewer: { ...fill("view"), "settings.org": "none", "settings.users": "none", "settings.billing": "none" },
};

export const USERS_SEED: UserRow[] = [
  { id: "u1", name: "Tahera Ahmed", email: "tahera@gov.in", avatarColor: "primary", roleId: "super_admin", services: ["Platform"], status: "active", lastActiveISO: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: "u2", name: "Joanna Lee", email: "joanna@gov.in", avatarColor: "accent", roleId: "service_owner", services: ["Building Permit"], status: "active", lastActiveISO: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: "u3", name: "Rahul Verma", email: "rahul@gov.in", avatarColor: "warning", roleId: "field_inspector", services: ["Building Permit"], status: "invited", lastActiveISO: null },
  { id: "u4", name: "Meera Iyer", email: "meera@gov.in", avatarColor: "success", roleId: "document_verifier", services: ["Trade License"], status: "active", lastActiveISO: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "u5", name: "Arjun Patel", email: "arjun@gov.in", avatarColor: "primary", roleId: "approver", services: ["Trade License"], status: "active", lastActiveISO: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
  { id: "u6", name: "Sonal Gupta", email: "sonal@gov.in", avatarColor: "accent", roleId: "counter_operator", services: ["Trade License", "Building Permit", "Fire NOC"], status: "active", lastActiveISO: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
  { id: "u7", name: "David Kim", email: "david@gov.in", avatarColor: "warning", roleId: "viewer", services: ["Trade License"], status: "disabled", lastActiveISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
  { id: "u8", name: "Priya Nair", email: "priya@gov.in", avatarColor: "success", roleId: "field_inspector", services: ["Fire NOC"], status: "invited", lastActiveISO: null },
];

export const DEFAULT_SERVICES = ["Trade License", "Building Permit", "Fire NOC"];

export const DEFAULT_STAGES_BY_SERVICE: Record<string, string[]> = {
  "Trade License": ["Intake", "Document Verification", "Inspection", "Approval", "Issuance"],
  "Building Permit": ["Intake", "Document Verification", "Inspection", "Approval", "Issuance"],
  "Fire NOC": ["Intake", "Inspection", "Approval", "Issuance"],
};

export const STORAGE_KEY = "users-access:v1";
export const ACTIVITY_LOG_STORAGE_KEY = "users-access:activity-log:v1";

export const ACTIVITY_LOG_SEED: ActivityLogEntry[] = [
  {
    id: "al1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60 * 32).toISOString(),
    actor: "Tahera Ahmed", actorEmail: "tahera@gov.in",
    action: "Invited", affectedUser: "Rahul Verma", affectedEmail: "rahul@gov.in",
    role: "Field Inspector", service: "Trade License",
  },
  {
    id: "al2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47 + 1000 * 60 * 10).toISOString(),
    actor: "Tahera Ahmed", actorEmail: "tahera@gov.in",
    action: "Role changed", affectedUser: "Meera Iyer", affectedEmail: "meera@gov.in",
    role: "Approver → Document Verifier", service: "Trade License",
  },
  {
    id: "al3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: "Joanna Lee", actorEmail: "joanna@gov.in",
    action: "Accepted invite", affectedUser: "Joanna Lee", affectedEmail: "joanna@gov.in",
    role: "Service Owner", service: "Building Permit",
  },
  {
    id: "al4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 45).toISOString(),
    actor: "Tahera Ahmed", actorEmail: "tahera@gov.in",
    action: "Disabled", affectedUser: "David Kim", affectedEmail: "david@gov.in",
    role: "Viewer", service: null,
  },
  {
    id: "al5",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actor: "Tahera Ahmed", actorEmail: "tahera@gov.in",
    action: "Admin created", affectedUser: "Joanna Lee", affectedEmail: "joanna@gov.in",
    role: "Admin", service: null,
  },
];

export function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
