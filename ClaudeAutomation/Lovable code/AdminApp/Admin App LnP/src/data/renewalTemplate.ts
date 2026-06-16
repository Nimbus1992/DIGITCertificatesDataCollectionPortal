/**
 * Renewal seeds — a simplified, renewal-flavored variant of the trade-license
 * template. Used by every configurator when the active module's name contains
 * "renew". Each export mirrors the shape of its trade-license counterpart so
 * configurators can swap seeds with a single ternary.
 */

import type {
  TradeWorkflowState,
  TradeWorkflowTransition,
  TradeRole,
  TradeChecklist,
  TradeNotification,
  TradeDocumentSeed,
  TradeFeeSeed,
  TradePaymentStageSeed,
} from "./tradeLicenseTemplate";

// ── Module detection ────────────────────────────────────────────────────────

export const isRenewalModule = (moduleName: string): boolean =>
  moduleName.toLowerCase().includes("renew");

export const pickSeed = <T,>(moduleName: string, issuance: T, renewal: T): T =>
  isRenewalModule(moduleName) ? renewal : issuance;

// ── Workflow ────────────────────────────────────────────────────────────────

export const RENEWAL_WORKFLOW_STATES: TradeWorkflowState[] = [
  { id: "r1", name: "Submitted",                   description: "Renewal application submitted by citizen", type: "start" },
  { id: "r_dv", name: "Under Document Verification", description: "Verifier reviews renewal documents",     type: "in_progress" },
  { id: "r3", name: "Under Approval",              description: "Approver reviews the renewal request",    type: "in_progress" },
  { id: "r4", name: "Payment Pending",             description: "Citizen pays the renewal fee",            type: "in_progress" },
  { id: "r5", name: "Paid",                        description: "Payment received, awaiting renewal",      type: "in_progress" },
  { id: "r6", name: "License Renewed",             description: "Licence has been renewed",                type: "end" },
  { id: "r7", name: "Sent Back",                   description: "Returned to citizen for corrections",     type: "in_progress" },
  { id: "r8", name: "Rejected",                    description: "Renewal application rejected",            type: "end" },
];

export const RENEWAL_WORKFLOW_TRANSITIONS: TradeWorkflowTransition[] = [
  { id: "rt_claim_dv",   name: "Start Document Verification", fromStateId: "r1",   toStateId: "r_dv", role: "documentVerifier", checklist: [] },
  { id: "rt_verify_app", name: "Verify Renewal",              fromStateId: "r_dv", toStateId: "r3",   role: "documentVerifier", checklist: [
    { id: "rcdv1", text: "Existing licence valid" },
    { id: "rcdv2", text: "Renewal documents verified" },
    { id: "rcdv3", text: "No outstanding dues" },
  ]},
  { id: "rt_send_back_dv", name: "Send Back",                 fromStateId: "r_dv", toStateId: "r7",   role: "documentVerifier", checklist: [
    { id: "rcsb1", text: "Reason for sending back recorded" },
  ]},
  { id: "rt_approve",    name: "Approve Renewal",             fromStateId: "r3",   toStateId: "r4",   role: "approver",         checklist: [
    { id: "rcap1", text: "All previous steps completed" },
    { id: "rcap2", text: "Renewal fee structure confirmed" },
  ]},
  { id: "rt_reject",     name: "Reject Renewal",              fromStateId: "r3",   toStateId: "r8",   role: "approver",         checklist: [
    { id: "rcrj1", text: "Rejection reason documented" },
  ]},
  { id: "rt_pay",        name: "Mark Paid",                   fromStateId: "r4",   toStateId: "r5",   role: "citizen",          checklist: [] },
  { id: "rt_renew",      name: "Issue Renewal",               fromStateId: "r5",   toStateId: "r6",   role: "approver",         checklist: [] },
  { id: "rt_resubmit",   name: "Resubmit",                    fromStateId: "r7",   toStateId: "r1",   role: "citizen",          checklist: [] },
];

// Layout for renewal states (linear, no inspection branch)
export const RENEWAL_STATE_LAYOUT: Record<string, { x: number; y: number }> = {
  r1:   { x: 60,   y: 100 },
  r_dv: { x: 320,  y: 100 },
  r3:   { x: 580,  y: 100 },
  r4:   { x: 840,  y: 100 },
  r5:   { x: 1100, y: 100 },
  r6:   { x: 1360, y: 100 },
  r7:   { x: 320,  y: 320 },
  r8:   { x: 580,  y: 320 },
};

// ── Roles (no field inspector) ──────────────────────────────────────────────

export const RENEWAL_ROLES: TradeRole[] = [
  {
    id: "citizen", name: "Citizen",
    description: "Applicant renewing a Business License",
    isDefault: true,
    permissions: ["create_application", "edit_application", "view_application"],
  },
  {
    id: "document_verifier", name: "Document Verifier",
    description: "Reviews submitted renewal applications and verifies documents",
    permissions: ["view_application", "fill_checklist", "edit_checklist", "view_checklist"],
  },
  {
    id: "approver", name: "Approver",
    description: "Final approving authority for renewal issuance",
    permissions: ["view_application", "edit_application", "view_checklist"],
  },
];

// ── Checklists ──────────────────────────────────────────────────────────────

export const RENEWAL_CHECKLISTS: TradeChecklist[] = [
  {
    id: "renewal_doc_verification",
    name: "Renewal Verification Checklist",
    workflowState: "Under Document Verification",
    questions: [
      { id: "rcdv1", text: "Existing licence valid",       fieldType: "checkbox", required: true },
      { id: "rcdv2", text: "Renewal documents verified",   fieldType: "checkbox", required: true },
      { id: "rcdv3", text: "No outstanding dues",          fieldType: "checkbox", required: true },
      { id: "rcdv4", text: "Verification remarks",         fieldType: "text",     required: false },
    ],
  },
  {
    id: "renewal_approval",
    name: "Renewal Approval Checklist",
    workflowState: "Under Approval",
    questions: [
      { id: "rcap1", text: "All previous steps completed",       fieldType: "checkbox", required: true },
      { id: "rcap2", text: "Renewal fee structure confirmed",    fieldType: "checkbox", required: true },
      { id: "rcap3", text: "Decision",                            fieldType: "radio",    required: true, options: ["Approve", "Reject"] },
    ],
  },
  {
    id: "renewal_send_back",
    name: "Send Back Checklist",
    workflowState: "Sent Back",
    questions: [
      { id: "rcsb1", text: "Reason for sending back recorded", fieldType: "text", required: true },
    ],
  },
];

// ── Notifications ───────────────────────────────────────────────────────────

const rmk = (
  id: string, ws: string, channel: "email" | "sms" | "push", recipientRole: string,
  subject: string, message: string,
): TradeNotification => ({ id, workflowState: ws, channel, recipientRole, subject, message, tag: ws });

export const RENEWAL_NOTIFICATIONS: TradeNotification[] = [
  rmk("rn1e", "Submitted", "email", "citizen", "Renewal Application Submitted",
    "Hi {applicantName}, your renewal application {applicationNumber} for {businessName} has been submitted successfully."),
  rmk("rn1s", "Submitted", "sms", "citizen", "Renewal Submitted",
    "Renewal {applicationNumber} submitted."),
  rmk("rn1p", "Submitted", "push", "document_verifier", "Renewal to verify",
    "Renewal {applicationNumber} from {applicantName} awaits verification."),

  rmk("rn2e", "Under Document Verification", "email", "citizen", "Renewal Documents Under Verification",
    "Your renewal application {applicationNumber} is being reviewed by our verification team."),

  rmk("rn3e", "Under Approval", "email", "citizen", "Renewal Under Approval",
    "Your renewal application {applicationNumber} is under final approval."),
  rmk("rn3p", "Under Approval", "push", "approver", "Renewal pending approval",
    "Renewal {applicationNumber} is ready for your approval."),

  rmk("rn4e", "Payment Pending", "email", "citizen", "Renewal Fee Payment Required",
    "Hi {applicantName}, please pay the renewal fee for application {applicationNumber} to proceed."),
  rmk("rn4s", "Payment Pending", "sms", "citizen", "Renewal Fee Due",
    "Pay renewal fee for {applicationNumber} to proceed."),

  rmk("rn5e", "Paid", "email", "citizen", "Renewal Payment Received",
    "We have received your payment for renewal {applicationNumber}. Your renewed licence will be issued shortly."),
  rmk("rn5s", "Paid", "sms", "citizen", "Payment Received",
    "Renewal payment received for {applicationNumber}."),

  rmk("rn6e", "License Renewed", "email", "citizen", "Business License Renewed",
    "Congratulations {applicantName}, your Business Licence for {businessName} has been renewed. You can download it now."),
  rmk("rn6s", "License Renewed", "sms", "citizen", "License Renewed",
    "Your licence for {businessName} has been renewed."),
  rmk("rn6p", "License Renewed", "push", "citizen", "Renewal complete",
    "License for {businessName} has been renewed."),

  rmk("rn7e", "Sent Back", "email", "citizen", "Action Required on Your Renewal",
    "Your renewal application {applicationNumber} has been sent back. Please review remarks and resubmit."),
  rmk("rn7s", "Sent Back", "sms", "citizen", "Action Required",
    "Renewal {applicationNumber} sent back. Please resubmit."),

  rmk("rn8e", "Rejected", "email", "citizen", "Renewal Application Rejected",
    "We regret to inform you that your renewal application {applicationNumber} has been rejected."),
];

// ── Documents ───────────────────────────────────────────────────────────────

export const RENEWAL_DOCUMENTS: TradeDocumentSeed[] = [
  { id: "rdoc-app-form", name: "Renewal Application Form",      type: "application_pdf", generateWhen: "Submitted",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "rdoc-ack",      name: "Renewal Acknowledgement",       type: "acknowledgement", generateWhen: "Submitted",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "rdoc-demand",   name: "Renewal Demand Notice",         type: "custom",          generateWhen: "Payment Pending",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "rdoc-license",  name: "Renewed License Certificate",   type: "certificate",     generateWhen: "License Renewed",
    vc: { enabled: true, credentialType: "TradeCredential", idMapping: "License Number", includeQR: true } },
  { id: "rdoc-receipt",  name: "Renewal Payment Receipt",       type: "custom",          generateWhen: "Paid",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
];

// ── Fees ────────────────────────────────────────────────────────────────────

export const RENEWAL_FEES: TradeFeeSeed[] = [
  {
    id: "fee_renewal", name: "Renewal Fee", code: "RENEWAL_FEE",
    type: "fixed", amount: 750, currency: "INR",
    applicableStage: "Payment Pending", mandatory: true, status: "active",
  },
];

// ── Payment stages ──────────────────────────────────────────────────────────

export const RENEWAL_PAYMENT_STAGES: TradePaymentStageSeed[] = [
  {
    id: "pay_renewal", name: "Renewal Payment",
    workflowState: "Payment Pending",
    fees: ["Renewal Fee"],
    methods: { online: true, counter: false },
    gateway: "razorpay",
    generateReceipt: true,
    receiptTemplate: "Renewal Payment Receipt",
  },

];

// ── Convenience exports ─────────────────────────────────────────────────────

export const RENEWAL_STATE_NAMES: string[] = RENEWAL_WORKFLOW_STATES.map((s) => s.name);
export const RENEWAL_FEE_NAMES: string[] = RENEWAL_FEES.map((f) => f.name);

export const RENEWAL_STATE_TAG_COLORS: Record<string, string> = {
  "Submitted":                     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Under Document Verification":   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Under Approval":                "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Payment Pending":               "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Paid":                          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "License Renewed":               "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "Sent Back":                     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Rejected":                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
