export interface AccountProfile {
  organizationName: string;
  departmentName: string;
  country: string;
  stateProvince: string;
  logoDataUrl: string;
  mobilePrefix: string;
  currency: string;
  currencySymbol: string;
  language: string;
  dateFormat: string;
  financialYearStart: string;
  adminEmail: string;
  adminPhone: string;
  domainSlug: string;
}

export interface BrandingConfig {
  portalName: string;
  portalTagline: string;
  primaryColor: string;
  logoUrl: string;
  copyrightText: string;
}

export interface DeploymentArea {
  city: string;
  zones: string[];
}

export interface BoundaryLevel {
  id: string;
  name: string;
}

export interface DeploymentConfig {
  availabilityScope: "entire_state" | "select_cities" | "select_districts";
  areas: DeploymentArea[];
  // Boundary hierarchy
  hierarchyName: string;
  hierarchyLevels: BoundaryLevel[];
  boundaryRows: Record<string, string>[];
  uploadMethod: "shapefile" | "excel" | "";
  shapefileName: string;
  operatingLevel: number; // index into hierarchyLevels — level used in the application form
}

export interface TradeCategory {
  type: string;
  subcategories: string[];
}

// ── Form Config ──────────────────────────────────────────────────────────────

export type FieldType =
  | "text" | "number" | "date" | "year" | "dropdown" | "phone"
  | "email" | "textarea" | "checkbox" | "file";

export interface FormDocument {
  id: string;
  name: string;
  formats: string[];          // e.g. ["PDF", "JPG", "PNG"]
  required: boolean;
  hasDocTypeDropdown: boolean; // if true, applicant picks a sub-type
  docTypes: string[];         // e.g. ["Aadhaar Card", "Passport", ...]
  isRecommended: boolean;
}

export interface CustomFormField {
  id: string;
  sectionId: string;          // "applicant" | "business" | "operations"
  subsectionName: string;     // "" for top-level, or subsection name
  name: string;
  fieldType: FieldType;
  mandatory: boolean;
  validation: string;
  dropdownOptions?: string[];  // only used when fieldType === "dropdown"
}

export interface FormConfig {
  idTypes: string[];
  tradeCategories: TradeCategory[];
  documents: FormDocument[];
  customSubsections: string[];  // custom subsection names added to Business Details
  customFields: CustomFormField[];
  deletedRecommendedFields: string[];
  editedRecommendedFields: Record<string, { name?: string; fieldType?: string; mandatory?: boolean; validation?: string }>;
  declarationMobileOtpEnabled: boolean;
}

// ── Roles ────────────────────────────────────────────────────────────────────

export interface StaffRole {
  id: string;
  name: string;
  description: string;
  staffEmails: string[];
}

// ── Fees ─────────────────────────────────────────────────────────────────────

export type FeeMode = "flat" | "slab";

export interface FeeSlabRow {
  label: string;
  amount: number;
}

// New types for custom logic fee mode
export type FeesTopLevelMode = "flat" | "custom";

export interface CustomFeeSlabEntry {
  label: string;       // auto-generated or custom, e.g. "0–100"
  lowerBound: number;  // lower bound value of this slab range
  upperBound: number;  // upper bound value of this slab range
  amount?: number;     // kept optional for backward compat; fee is set in the fee table (Step C), not here
}

export interface FeesConfig {
  currency: string;
  currencySymbol: string;
  // Application fee — always flat
  applicationFee: number;
  // Inspection fee
  inspectionFeeMode: FeeMode;
  inspectionFeeFlat: number;
  inspectionFeeSlabs: FeeSlabRow[];
  inspectionSlabDimension: string;
  // Hazard surcharge — always flat
  hazardSurcharge: number;
  // License fee
  licenseFeeMode: FeeMode;
  licenseFeeFlat: number;
  licenseFeeRatePerSqFt: number;  // kept for display in slab mode as rate
  licenseFeeSlabs: FeeSlabRow[];
  licenseSlabDimension: string;

  // ── New: top-level fee mode (Issue #5) ──────────────────────────────────────
  feeMode: FeesTopLevelMode;
  // Flat fee mode
  flatFeeAmount: number;
  // Custom logic mode
  customFeeFields: string[];   // field IDs (or names for recommended fields) selected by the user
  customFeeSlabs: Record<string, CustomFeeSlabEntry[]>;  // keyed by field id/name
  customFeeTable: Array<Record<string, number | string>>; // generated fee matrix rows
}

// ── Payments & Notifications ─────────────────────────────────────────────────

export interface NotificationTemplate {
  id: string;
  event: string;
  channel: "email" | "sms" | "ussd";
  recipient: "applicant" | "staff" | "admin";
  subject: string;
}

export interface PaymentsNotificationsConfig {
  paymentGateway: "razorpay" | "paygov" | "custom" | "unknown";
  customGatewayName: string;
  counterPaymentsEnabled: boolean;
  adminEmail: string;
  smsSenderId: string;
  notificationChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    ussd: boolean;
  };
  notificationTemplates: NotificationTemplate[];
}

// ── Overall Config ────────────────────────────────────────────────────────────

export interface CategoryEntry {
  id: string;
  level1: string;
  level2: string;
  level3: string;
}

export interface OverallConfig {
  renewalEnabled: boolean;
  renewalReuseIssuanceForm: true;
  renewalApprovalMode: "auto_if_unchanged" | "always_workflow";
  renewalTriggerDays: number;
  renewalGracePeriodDays: number;
  categoryLevels: number;
  categoryLevelLabels: string[];
  categories: CategoryEntry[];
  licenseValidityMode: "fixed" | "financial_year";
  licenseValidityMonths: number;
  allowPastYears: boolean;
  pastYearsAllowed: number;
  issuanceIdFormat: string;
  renewalIdFormat: string;
  licenseIdSameAsApplication: boolean;
  licenseIdFormat: string;
}

export interface IntegrationsConfig {
  eSignEnabled: boolean;
  eSignProvider: "nsdl" | "emudhra" | "other" | "";
  digiLockerEnabled: boolean;
  gstinVerificationEnabled: boolean;
  aadhaarOtpEnabled: boolean;
  customIntegrations: Array<{ name: string; endpoint: string }>;
  onlinePaymentEnabled: boolean;
  paymentGatewayPreference: "specify" | "egov_choice" | "";
  paymentGatewayDetails: string;
}

// ── Workflow ─────────────────────────────────────────────────────────────────

export interface WorkflowAction {
  id: string;
  label: string;
  nextStateId: string;
  color: "default" | "success" | "danger";
}

export interface WorkflowNotification {
  channel: "email" | "sms" | "push";
  recipient: "applicant" | "staff" | "both";
  subject: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  actor: string;
  actions: WorkflowAction[];
  slaHours: number;
  notifications: WorkflowNotification[];
  checklistEnabled: boolean;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface WorkflowChecklistItem {
  id: string;
  stageId: string;
  label: string;
  fieldType: "checkbox" | "radio" | "text" | "file";
  required: boolean;
}

export interface WorkflowConfig {
  approvalLevels: number;
  processingSlaDays: number;
  autoEscalate: boolean;
  escalationAfterDays: number;
  renewalReminderDays: number;
  allowCitizenWithdrawal: boolean;
  stages: WorkflowStage[];
  checklistItems: WorkflowChecklistItem[];
}

// ── Top-level ─────────────────────────────────────────────────────────────────

export interface ImplementationConfig {
  account: AccountProfile;
  branding: BrandingConfig;
  deployment: DeploymentConfig;
  integrations: IntegrationsConfig;
  overall: OverallConfig;
  formConfig: FormConfig;
  roles: StaffRole[];
  fees: FeesConfig;
  workflow: WorkflowConfig;
  paymentsNotifications: PaymentsNotificationsConfig;
  notes: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    status: "draft" | "submitted";
    lastStep: number;
  };
}
