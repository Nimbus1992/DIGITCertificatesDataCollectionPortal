/**
 * Business License — canonical template configuration.
 *
 * This file is the single source of truth used by every Business License
 * configurator (Forms, Workflow, Roles, Checklists, Notifications, Documents,
 * Fees, Payments) and mirrors the data the citizen + employee preview runs on
 * (see `src/components/preview/PreviewContext.tsx` DEFAULT_SECTIONS,
 * DEFAULT_WORKFLOW_STATES, DEFAULT_TRANSITIONS).
 *
 * Configurator UIs each have their own local types/shapes. We export plain
 * data here and let each configurator map it into its local shape on seed.
 */

// ─── Form sections (mirrors PreviewContext DEFAULT_SECTIONS) ────────────────

// Dependent dropdown maps shared with PreviewContext.
export const TRADE_CATEGORY_MAP: Record<string, string[]> = {
  "Retail Shop": ["Grocery", "Clothing", "Electronics"],
  "Restaurant": ["Dine-in", "Takeaway", "Cloud Kitchen"],
  "Manufacturing": ["Small Scale", "Medium Scale"],
  "Application Business": ["Consultancy", "Repair", "IT Applications"],
};

export const CITY_ZONE_MAP: Record<string, string[]> = {
  "City A": ["Ward 1", "Ward 2", "Ward 3"],
  "City B": ["Zone A", "Zone B"],
};

export interface TradeFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  pastDateOnly?: boolean;
}

export interface TradeFormField {
  id: string;
  type: "text" | "tel" | "email" | "number" | "dropdown" | "radio" | "date" | "file" | "checkbox";
  label: string;
  placeholder: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  validation?: TradeFieldValidation;
  showIf?: { field: string; equals: string };
  dependsOn?: string;
  dependsValueMap?: Record<string, string[]>;
}

export interface TradeFormSection {
  id: string;
  name: string;
  description: string;
  fields: TradeFormField[];
}

export const TRADE_FORM_SECTIONS: TradeFormSection[] = [
  {
    id: "sec-1",
    name: "Applicant Details",
    description: "Identify the applicant",
    fields: [
      { id: "fullName", type: "text", label: "Full Name", placeholder: "e.g. Anita Sharma", required: true,
        validation: { minLength: 3, pattern: "^[A-Za-z ]+$", patternMessage: "Alphabets only" } },
      { id: "mobile", type: "tel", label: "Mobile Number", placeholder: "10-digit mobile", required: true,
        validation: { pattern: "^\\d{10}$", patternMessage: "Enter a valid 10-digit mobile" } },
      { id: "email", type: "email", label: "Email", placeholder: "name@example.com", required: false,
        validation: { pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", patternMessage: "Enter a valid email" } },
      { id: "idType", type: "dropdown", label: "ID Type", placeholder: "Select ID type", required: true,
        options: ["Aadhaar", "Passport", "Driving License"] },
      { id: "idNumber", type: "text", label: "ID Number", placeholder: "Enter ID number", required: true,
        helpText: "Format depends on the selected ID type (Aadhaar 12 digits, Passport 6–12 alphanumeric, Driving License 6–16 alphanumeric)" },
    ],
  },
  {
    id: "sec-2",
    name: "Business Details",
    description: "Information about the business",
    fields: [
      { id: "businessName", type: "text", label: "Business Name", placeholder: "Registered business name", required: true,
        validation: { minLength: 3 } },
      { id: "tradeType", type: "dropdown", label: "Trade Type", placeholder: "Select trade type", required: true,
        options: ["Retail Shop", "Restaurant", "Manufacturing", "Application Business"] },
      { id: "businessCategory", type: "dropdown", label: "Business Category", placeholder: "Select a trade type first", required: true,
        dependsOn: "tradeType", dependsValueMap: TRADE_CATEGORY_MAP },
      { id: "ownershipType", type: "dropdown", label: "Ownership Type", placeholder: "Select ownership", required: true,
        options: ["Individual", "Partnership", "Company"] },
      { id: "employees", type: "number", label: "Number of Employees", placeholder: "0", required: false,
        validation: { min: 0 } },
      { id: "turnover", type: "number", label: "Annual Turnover (₹)", placeholder: "0", required: false,
        validation: { min: 0 } },
    ],
  },
  {
    id: "sec-3",
    name: "Business Address",
    description: "Where the business operates",
    fields: [
      { id: "addr1", type: "text", label: "Address Line 1", placeholder: "Street, building", required: true },
      { id: "addr2", type: "text", label: "Address Line 2", placeholder: "Locality (optional)", required: false },
      { id: "city", type: "dropdown", label: "City", placeholder: "Select city", required: true,
        options: ["City A", "City B"] },
      { id: "zone", type: "dropdown", label: "Zone / Ward", placeholder: "Select a city first", required: true,
        dependsOn: "city", dependsValueMap: CITY_ZONE_MAP },
      { id: "pincode", type: "number", label: "Pincode", placeholder: "6-digit pincode", required: true,
        validation: { pattern: "^\\d{6}$", patternMessage: "Enter a valid 6-digit pincode" } },
    ],
  },
  {
    id: "sec-4",
    name: "Operational Details",
    description: "How your business operates",
    fields: [
      { id: "startDate", type: "date", label: "Business Start Date", placeholder: "", required: true,
        validation: { pastDateOnly: true } },
      { id: "shopArea", type: "number", label: "Shop Area (sq ft)", placeholder: "e.g. 250", required: true,
        validation: { min: 1 }, helpText: "Used to calculate licence fees" },
      { id: "isHazardous", type: "radio", label: "Is Hazardous Activity?", placeholder: "", required: true,
        options: ["No", "Yes"] },
      { id: "hazardType", type: "dropdown", label: "Hazard Type", placeholder: "Select hazard type", required: true,
        options: ["Chemical", "Electrical", "Fire Risk"],
        showIf: { field: "isHazardous", equals: "Yes" } },
    ],
  },
  {
    id: "sec-5",
    name: "Documents",
    description: "Upload required documents (PDF / JPG / PNG, max 5 MB)",
    fields: [
      { id: "docId", type: "file", label: "ID Proof", placeholder: "", required: true },
      { id: "docAddr", type: "file", label: "Address Proof", placeholder: "", required: true },
      { id: "docBusiness", type: "file", label: "Business Proof", placeholder: "", required: true },
    ],
  },
  {
    id: "sec-6",
    name: "Declaration",
    description: "Confirm and submit",
    fields: [
      { id: "declaration", type: "checkbox",
        label: "I confirm that all the details provided are true and correct to the best of my knowledge.",
        placeholder: "", required: true },
    ],
  },
];

// ─── Workflow (mirrors PreviewContext DEFAULT_WORKFLOW_STATES / TRANSITIONS) ──

export interface TradeWorkflowState {
  id: string;
  name: string;
  description: string;
  type: "start" | "in_progress" | "end";
}

export interface TradeWorkflowTransition {
  id: string;
  name: string;
  fromStateId: string;
  toStateId: string;
  role: "citizen" | "documentVerifier" | "fieldInspector" | "approver";
  checklist: { id: string; text: string }[];
}

export const TRADE_WORKFLOW_STATES: TradeWorkflowState[] = [
  { id: "s1",   name: "Submitted",                     description: "Application submitted by citizen",      type: "start" },
  { id: "s_dv", name: "Under Document Verification",   description: "Document Verifier checks application",  type: "in_progress" },
  { id: "s_ip", name: "Inspection Pending",            description: "Field Inspector visits the site",       type: "in_progress" },
  { id: "s3",   name: "Under Approval",                description: "Approver reviews the application",      type: "in_progress" },
  { id: "s4",   name: "Payment Pending",               description: "Citizen pays the licence fee",          type: "in_progress" },
  { id: "s5",   name: "Paid",                          description: "Payment received, awaiting issuance",   type: "in_progress" },
  { id: "s6",   name: "License Issued",                description: "Licence certificate issued",            type: "end" },
  { id: "s7",   name: "Sent Back",                     description: "Returned to citizen for corrections",   type: "in_progress" },
  { id: "s8",   name: "Rejected",                      description: "Application rejected",                  type: "end" },
];

export const TRADE_WORKFLOW_TRANSITIONS: TradeWorkflowTransition[] = [
  { id: "t_claim_dv",     name: "Start Document Verification", fromStateId: "s1",   toStateId: "s_dv", role: "documentVerifier", checklist: [] },
  { id: "t_verify_app",   name: "Verify Application",          fromStateId: "s_dv", toStateId: "s_ip", role: "documentVerifier", checklist: [
    { id: "cdv1", text: "Applicant details verified" },
    { id: "cdv2", text: "All documents verified" },
    { id: "cdv3", text: "Business details valid" },
  ]},
  { id: "t_send_back_dv", name: "Send Back",                   fromStateId: "s_dv", toStateId: "s7",   role: "documentVerifier", checklist: [
    { id: "csb1", text: "Reason for sending back recorded" },
  ]},
  { id: "t_complete_insp", name: "Complete Inspection",        fromStateId: "s_ip", toStateId: "s3",   role: "fieldInspector",  checklist: [
    { id: "cfi1", text: "Site visited" },
    { id: "cfi2", text: "Business exists" },
    { id: "cfi3", text: "Compliance verified" },
  ]},
  { id: "t_send_back_ip", name: "Send Back",                   fromStateId: "s_ip", toStateId: "s7",   role: "fieldInspector",  checklist: [
    { id: "csb2", text: "Inspection issues recorded" },
  ]},
  { id: "t_approve",      name: "Approve",                     fromStateId: "s3",   toStateId: "s4",   role: "approver",        checklist: [
    { id: "cap1", text: "All previous steps completed" },
    { id: "cap2", text: "Inspection passed" },
    { id: "cap3", text: "Fee structure confirmed" },
  ]},
  { id: "t_reject",       name: "Reject",                      fromStateId: "s3",   toStateId: "s8",   role: "approver",        checklist: [
    { id: "crj1", text: "Rejection reason documented" },
  ]},
  { id: "t_resubmit",     name: "Resubmit",                    fromStateId: "s7",   toStateId: "s1",   role: "citizen",         checklist: [] },
  { id: "t_pay",          name: "Mark Paid",                   fromStateId: "s4",   toStateId: "s5",   role: "citizen",         checklist: [] },
  { id: "t_issue",        name: "Issue License",               fromStateId: "s5",   toStateId: "s6",   role: "approver",        checklist: [
    { id: "cis1", text: "Certificate generated" },
    { id: "cis2", text: "Citizen notified" },
  ]},
];

// State name → tag color used by NotificationsManager / Checklists
export const TRADE_STATE_TAG_COLORS: Record<string, string> = {
  "Submitted":                     "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Under Document Verification":   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Inspection Pending":            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Under Approval":                "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Payment Pending":               "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Paid":                          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "License Issued":                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Sent Back":                     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Rejected":                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// ─── Roles (matches PreviewRole) ─────────────────────────────────────────────

export interface TradeRole {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[]; // ids from RolesDesigner ALL_PERMISSIONS
}

export const TRADE_ROLES: TradeRole[] = [
  {
    id: "citizen",
    name: "Citizen",
    description: "Applicant applying for a Business License",
    isDefault: true,
    permissions: ["create_application", "edit_application", "view_application"],
  },
  {
    id: "document_verifier",
    name: "Document Verifier",
    description: "Reviews submitted applications and verifies documents",
    permissions: ["view_application", "fill_checklist", "edit_checklist", "view_checklist"],
  },
  {
    id: "field_inspector",
    name: "Field Inspector",
    description: "Visits the business site and confirms compliance",
    permissions: ["view_application", "fill_checklist", "view_checklist"],
  },
  {
    id: "approver",
    name: "Approver",
    description: "Final approving authority for licence issuance",
    permissions: ["view_application", "edit_application", "view_checklist"],
  },
];

// ─── Checklists (grouped from transition checklists) ─────────────────────────

export interface TradeChecklist {
  id: string;
  name: string;
  workflowState: string;
  questions: {
    id: string;
    text: string;
    fieldType: "text" | "radio" | "checkbox" | "dropdown" | "file_upload";
    required: boolean;
    options?: string[];
  }[];
}

export const TRADE_CHECKLISTS: TradeChecklist[] = [
  {
    id: "doc_verification",
    name: "Document Verification Checklist",
    workflowState: "Under Document Verification",
    questions: [
      { id: "cdv1", text: "Applicant details verified",  fieldType: "checkbox", required: true },
      { id: "cdv2", text: "All documents verified",      fieldType: "checkbox", required: true },
      { id: "cdv3", text: "Business details valid",      fieldType: "checkbox", required: true },
      { id: "cdv4", text: "Verification remarks",        fieldType: "text",     required: false },
    ],
  },
  {
    id: "inspection",
    name: "Inspection Checklist",
    workflowState: "Inspection Pending",
    questions: [
      { id: "cfi1", text: "Site visited",                 fieldType: "checkbox",    required: true },
      { id: "cfi2", text: "Business exists at location",  fieldType: "radio",       required: true, options: ["Yes", "No"] },
      { id: "cfi3", text: "Compliance verified",          fieldType: "radio",       required: true, options: ["Yes", "No", "Partial"] },
      { id: "cfi4", text: "Site photos",                  fieldType: "file_upload", required: true },
      { id: "cfi5", text: "Inspection remarks",           fieldType: "text",        required: false },
    ],
  },
  {
    id: "approval",
    name: "Approval Checklist",
    workflowState: "Under Approval",
    questions: [
      { id: "cap1", text: "All previous steps completed", fieldType: "checkbox", required: true },
      { id: "cap2", text: "Inspection passed",            fieldType: "checkbox", required: true },
      { id: "cap3", text: "Fee structure confirmed",      fieldType: "checkbox", required: true },
      { id: "cap4", text: "Decision",                     fieldType: "radio",    required: true, options: ["Approve", "Reject"] },
    ],
  },
  {
    id: "send_back",
    name: "Send Back Checklist",
    workflowState: "Sent Back",
    questions: [
      { id: "csb1", text: "Reason for sending back recorded", fieldType: "text", required: true },
    ],
  },
];

// ─── Notifications (one per relevant state) ──────────────────────────────────

export type NotificationChannel = "email" | "sms" | "push";

export interface TradeNotification {
  id: string;
  workflowState: string;
  subject: string;
  message: string;
  channel: NotificationChannel;
  recipientRole: string;
  tag: string;
}

const mk = (
  id: string, ws: string, channel: NotificationChannel, recipientRole: string,
  subject: string, message: string,
): TradeNotification => ({ id, workflowState: ws, channel, recipientRole, subject, message, tag: ws });

export const TRADE_NOTIFICATIONS: TradeNotification[] = [
  mk("n1e", "Submitted", "email", "citizen", "Application Submitted Successfully",
    "Hi {applicantName}, your Business License application {applicationNumber} for {businessName} has been submitted successfully."),
  mk("n1s", "Submitted", "sms", "citizen", "Application Submitted",
    "Application {applicationNumber} for {businessName} submitted."),
  mk("n1p", "Submitted", "push", "document_verifier", "New application to verify",
    "Application {applicationNumber} from {applicantName} is awaiting verification."),

  mk("n2e", "Under Document Verification", "email", "citizen", "Documents Under Verification",
    "Your application {applicationNumber} is being reviewed by our document verification team."),

  mk("n3e", "Inspection Pending", "email", "citizen", "Inspection Scheduled",
    "An inspection has been scheduled for {businessName}. Application: {applicationNumber}."),
  mk("n3s", "Inspection Pending", "sms", "citizen", "Inspection Scheduled",
    "Inspection scheduled for application {applicationNumber}."),
  mk("n3pc", "Inspection Pending", "push", "citizen", "Verification complete",
    "Your application {applicationNumber} has been verified. Next step: site inspection."),
  mk("n3p", "Inspection Pending", "push", "field_inspector", "Inspection assigned",
    "Application {applicationNumber} ({businessName}) is ready for site visit."),

  mk("n4e", "Under Approval", "email", "citizen", "Application Under Approval",
    "Your application {applicationNumber} is under final approval."),
  mk("n4s", "Under Approval", "sms", "citizen", "Inspection complete",
    "Inspection completed for {applicationNumber}. Awaiting approver decision."),
  mk("n4pc", "Under Approval", "push", "citizen", "Inspection complete",
    "Inspection completed for {applicationNumber}. Awaiting approver decision."),
  mk("n4p", "Under Approval", "push", "approver", "Approval pending",
    "Application {applicationNumber} ({businessName}) is ready for your approval."),

  mk("n5e", "Payment Pending", "email", "citizen", "Payment Required",
    "Hi {applicantName}, please pay the licence fee for application {applicationNumber} to proceed."),
  mk("n5s", "Payment Pending", "sms", "citizen", "Payment Required",
    "Pay licence fee for {applicationNumber} to proceed."),
  mk("n5p", "Payment Pending", "push", "citizen", "Approved — payment due",
    "Application {applicationNumber} approved. Pay the licence fee to receive your business license."),

  mk("n6e", "Paid", "email", "citizen", "Payment Received",
    "We have received your payment for application {applicationNumber}. Your licence will be issued shortly."),
  mk("n6s", "Paid", "sms", "citizen", "Payment Received",
    "Payment received for {applicationNumber}."),
  mk("n6pc", "Paid", "push", "citizen", "Payment received",
    "Payment received for {applicationNumber}. Your license will be issued shortly."),
  mk("n6pa", "Paid", "push", "approver", "Payment received",
    "Application {applicationNumber} has been paid — ready to issue license."),

  mk("n7e", "License Issued", "email", "citizen", "Business License Issued",
    "Congratulations {applicantName}, the Trade Licence for {businessName} has been issued. You can download it now."),
  mk("n7s", "License Issued", "sms", "citizen", "License Issued",
    "Trade Licence for {businessName} issued."),
  mk("n7p", "License Issued", "push", "citizen", "License issued",
    "Business license has been issued for {businessName}. You can download it now."),

  mk("n8e", "Sent Back", "email", "citizen", "Action Required on Your Application",
    "Your application {applicationNumber} has been sent back. Please review remarks and resubmit."),
  mk("n8s", "Sent Back", "sms", "citizen", "Action Required",
    "Application {applicationNumber} sent back. Please resubmit."),
  mk("n8p", "Sent Back", "push", "citizen", "Action required",
    "Application {applicationNumber} was sent back. Please review remarks and resubmit."),

  mk("n9e", "Rejected", "email", "citizen", "Application Rejected",
    "We regret to inform you that your Business License application {applicationNumber} has been rejected."),
  mk("n9s", "Rejected", "sms", "citizen", "Application Rejected",
    "Application {applicationNumber} has been rejected."),
  mk("n9p", "Rejected", "push", "citizen", "Application rejected",
    "Application {applicationNumber} has been rejected."),
];

// ─── Documents (reflects what /lib/*Pdf.ts actually generates) ───────────────

export interface TradeDocumentSeed {
  id: string;
  name: string;
  type: "certificate" | "application_pdf" | "acknowledgement" | "inspection_report" | "custom";
  generateWhen: string;
  vc: { enabled: boolean; credentialType: string; idMapping: string; includeQR: boolean };
}

export const TRADE_DOCUMENTS: TradeDocumentSeed[] = [
  { id: "doc-app-form",    name: "Application Form",          type: "application_pdf",   generateWhen: "Submitted",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "doc-ack",         name: "Acknowledgement",           type: "acknowledgement",   generateWhen: "Submitted",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "doc-insp-report", name: "Inspection Report",         type: "inspection_report", generateWhen: "Inspection Pending",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "doc-demand",      name: "Demand Notice",             type: "custom",            generateWhen: "Payment Pending",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
  { id: "doc-license",     name: "Business License Certificate", type: "certificate",       generateWhen: "License Issued",
    vc: { enabled: true, credentialType: "TradeCredential", idMapping: "License Number", includeQR: true } },
  { id: "doc-receipt",     name: "Payment Receipt",           type: "custom",            generateWhen: "Paid",
    vc: { enabled: false, credentialType: "", idMapping: "", includeQR: false } },
];

// ─── Fees ────────────────────────────────────────────────────────────────────

export interface TradeFeeSeed {
  id: string;
  name: string;
  code: string;
  type: "fixed" | "slab" | "conditional" | "formula";
  amount?: number;
  currency?: string;
  slabs?: { id: string; conditionLabel: string; amount: number }[];
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  conditionAmount?: number;
  formula?: string;
  applicableStage: string;
  mandatory: boolean;
  status: "active" | "draft";
}

export const TRADE_FEES: TradeFeeSeed[] = [
  {
    id: "fee_app", name: "Application Fee", code: "APPLICATION_FEE",
    type: "fixed", amount: 500, currency: "INR",
    applicableStage: "Submitted", mandatory: true, status: "active",
  },
  {
    id: "fee_insp", name: "Inspection Fee", code: "INSPECTION_FEE",
    type: "slab",
    slabs: [
      { id: "sl1", conditionLabel: "0–100 sq ft",   amount: 500 },
      { id: "sl2", conditionLabel: "100–500 sq ft", amount: 1000 },
      { id: "sl3", conditionLabel: "500+ sq ft",    amount: 2000 },
    ],
    applicableStage: "Inspection Pending", mandatory: true, status: "active",
  },
  {
    id: "fee_haz", name: "Hazard Surcharge", code: "HAZARD_SURCHARGE",
    type: "conditional",
    conditionField: "Is Hazardous", conditionOperator: "=", conditionValue: "Yes",
    conditionAmount: 1500,
    applicableStage: "Under Approval", mandatory: false, status: "active",
  },
  {
    id: "fee_lic", name: "License Fee", code: "LICENSE_FEE",
    type: "formula",
    formula: "Area * Rate",
    applicableStage: "Payment Pending", mandatory: true, status: "active",
  },
];

// ─── Payment stages ──────────────────────────────────────────────────────────

export interface TradePaymentStageSeed {
  id: string;
  name: string;
  workflowState: string;
  fees: string[];
  methods: { online: boolean; counter: boolean };
  gateway: "razorpay" | "paygov" | "custom";
  generateReceipt: boolean;
  receiptTemplate?: string;
}

export const TRADE_PAYMENT_STAGES: TradePaymentStageSeed[] = [
  {
    id: "pay_app", name: "Application Payment",
    workflowState: "Submitted",
    fees: ["Application Fee"],
    methods: { online: true, counter: false },
    gateway: "razorpay",
    generateReceipt: true,
    receiptTemplate: "Payment Receipt",
  },
  {
    id: "pay_lic", name: "License Payment",
    workflowState: "Payment Pending",
    fees: ["Inspection Fee", "Hazard Surcharge", "License Fee"],
    methods: { online: true, counter: true },
    gateway: "paygov",
    generateReceipt: true,
    receiptTemplate: "Payment Receipt",
  },
];


// Convenience exports for configurator constant lists
export const TRADE_STATE_NAMES: string[] = TRADE_WORKFLOW_STATES.map((s) => s.name);
export const TRADE_FEE_NAMES: string[] = TRADE_FEES.map((f) => f.name);
