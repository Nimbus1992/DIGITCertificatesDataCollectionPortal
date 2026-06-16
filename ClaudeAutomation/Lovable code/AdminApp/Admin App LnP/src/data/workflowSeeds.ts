import {
  TRADE_WORKFLOW_STATES,
  TRADE_WORKFLOW_TRANSITIONS,
  TRADE_NOTIFICATIONS,
  TRADE_PAYMENT_STAGES,
  TRADE_CHECKLISTS,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_WORKFLOW_STATES,
  RENEWAL_WORKFLOW_TRANSITIONS,
  RENEWAL_NOTIFICATIONS,
  RENEWAL_PAYMENT_STAGES,
  RENEWAL_CHECKLISTS,
  RENEWAL_STATE_LAYOUT,
  isRenewalModule,
} from "@/data/renewalTemplate";

export type WorkflowStateType = "start" | "in_progress" | "end";
export type WorkflowRoleId = string;

export interface WorkflowStateRecord {
  id: string;
  name: string;
  description: string;
  type: WorkflowStateType;
  x: number;
  y: number;
  paymentStageId: string | null;
  notificationIds: string[];
  attachedDocumentIds?: string[];
}

export interface WorkflowTransitionRecord {
  id: string;
  name: string;
  fromStateId: string;
  toStateId: string;
  roleId: WorkflowRoleId;
  checklistIds: string[];
  conditionsEnabled: boolean;
}

export const ISSUANCE_STATE_LAYOUT: Record<string, { x: number; y: number }> = {
  s1:   { x: 60,   y: 100 },
  s_dv: { x: 320,  y: 100 },
  s_ip: { x: 580,  y: 100 },
  s3:   { x: 840,  y: 100 },
  s4:   { x: 1100, y: 100 },
  s5:   { x: 1360, y: 100 },
  s6:   { x: 1620, y: 100 },
  s7:   { x: 580,  y: 320 },
  s8:   { x: 840,  y: 320 },
};

// Auto-attached documents per state — IDs mirror DocumentDesigner template seeds.
const ISSUANCE_DOC_BY_STATE: Record<string, string[]> = {
  "Submitted":          ["doc-2", "doc-3"],
  "Inspection Pending": ["doc-4"],
  "Paid":               ["doc-5"],
  "License Issued":     ["doc-1"],
};
const RENEWAL_DOC_BY_STATE: Record<string, string[]> = {
  "Submitted":       ["rdoc-2", "rdoc-3"],
  "Paid":            ["rdoc-4"],
  "License Renewed": ["rdoc-1"],
};

// Map legacy camelCase role keys used in template seeds to canonical role IDs.
const SEED_ROLE_MAP: Record<string, WorkflowRoleId> = {
  citizen:          "citizen",
  documentVerifier: "document_verifier",
  fieldInspector:   "field_inspector",
  approver:         "approver",
};

export const buildSeedStates = (moduleName: string): WorkflowStateRecord[] => {
  const renewal = isRenewalModule(moduleName);
  const states = renewal ? RENEWAL_WORKFLOW_STATES : TRADE_WORKFLOW_STATES;
  const layout = renewal ? RENEWAL_STATE_LAYOUT : ISSUANCE_STATE_LAYOUT;
  const notifications = renewal ? RENEWAL_NOTIFICATIONS : TRADE_NOTIFICATIONS;
  const stages = renewal ? RENEWAL_PAYMENT_STAGES : TRADE_PAYMENT_STAGES;
  const docMap = renewal ? RENEWAL_DOC_BY_STATE : ISSUANCE_DOC_BY_STATE;

  return states.map((s) => {
    const pos = layout[s.id] ?? { x: 60, y: 100 };
    const notificationIds = notifications.filter(n => n.workflowState === s.name).map(n => n.id);
    const stage = stages.find(p => p.workflowState === s.name);
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type,
      x: pos.x,
      y: pos.y,
      paymentStageId: stage?.id ?? null,
      notificationIds,
      attachedDocumentIds: docMap[s.name] ?? [],
    };
  });
};

export const buildSeedTransitions = (moduleName: string): WorkflowTransitionRecord[] => {
  const renewal = isRenewalModule(moduleName);
  const states = renewal ? RENEWAL_WORKFLOW_STATES : TRADE_WORKFLOW_STATES;
  const src = renewal ? RENEWAL_WORKFLOW_TRANSITIONS : TRADE_WORKFLOW_TRANSITIONS;
  const checklists = renewal ? RENEWAL_CHECKLISTS : TRADE_CHECKLISTS;

  return src.map((t) => {
    const toState = states.find(s => s.id === t.toStateId);
    const matchedChecklists = toState
      ? checklists.filter(c => c.workflowState === toState.name).map(c => c.id)
      : [];
    return {
      id: t.id,
      name: t.name,
      fromStateId: t.fromStateId,
      toStateId: t.toStateId,
      roleId: SEED_ROLE_MAP[t.role as string] ?? "approver",
      checklistIds: matchedChecklists,
      conditionsEnabled: false,
    };
  });
};
