import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Smartphone, Mail, X } from "lucide-react";
import { NOTIFICATION_MATRIX, type RecipientRole } from "./notifications/notificationMatrix";
import { resolveTemplate, type SimulatedMessage } from "./notifications/templateEngine";
import { useParams } from "react-router-dom";
import type { WizardStep, WizardField } from "@/data/wizardForm";
import { loadFormSteps, FORM_UPDATED_EVENT } from "@/lib/formStorage";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useServiceNotifications, type SharedNotification } from "@/lib/useServiceNotifications";
import { useServiceWorkflow } from "@/lib/useServiceWorkflow";
import { canonicalRoleId } from "@/lib/useServiceRoles";
import { usePreviewConfig, computeDemandForStage, findPaymentStageForState } from "@/lib/usePreviewConfig";

// ─── Types ───────────────────────────────────────────────
export type PreviewRole = "citizen" | "documentVerifier" | "fieldInspector" | "approver";
export type DeviceMode = "mobile" | "tablet" | "desktop";
export type ApplicationType = "NEW" | "RENEWAL";
export type DocumentStatus = "Pending" | "Verified" | "Rejected";

export interface FieldValidation {
  pattern?: string;          // regex source
  patternMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pastDateOnly?: boolean;
}

export interface FormFieldConfig {
  id: string;
  type: string;              // text | number | tel | email | dropdown | radio | date | file | checkbox
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  helpText?: string;
  validation?: FieldValidation;
  dependsOn?: string;                          // parent field id
  dependsValueMap?: Record<string, string[]>;  // parent value -> options
  showIf?: { field: string; equals: string };  // conditional visibility
}

// Dependent dropdown maps & ID validation maps (exported for form usage)
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

export const ID_VALIDATION: Record<string, { pattern: RegExp; message: string }> = {
  Aadhaar: { pattern: /^\d{12}$/, message: "Aadhaar must be 12 digits" },
  Passport: { pattern: /^[A-Z0-9]{6,12}$/i, message: "Passport must be 6–12 alphanumeric characters" },
  "Driving License": { pattern: /^[A-Z0-9-]{6,16}$/i, message: "Driving License must be 6–16 alphanumeric characters" },
};

export interface FormSectionConfig {
  id: string;
  name: string;
  description: string;
  fields: FormFieldConfig[];
}

export interface WorkflowStateConfig {
  id: string;
  name: string;
  type: "start" | "in_progress" | "end";
}

export interface WorkflowTransitionConfig {
  id: string;
  name: string;
  fromStateId: string;
  toStateId: string;
  /** Legacy persona bucket — kept for any callers still keyed off it. */
  role: PreviewRole | "any";
  /** Canonical service-role id (e.g. "document_verifier", "approver", or a custom id). */
  roleId: string;
  checklist: { id: string; text: string }[];
}

export interface ChecklistItemState {
  id: string;
  text: string;
  checked: boolean;
}

export interface PreviewNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  applicationId?: string;
  recipientRole?: RecipientRole;
}

export interface PreviewDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: number;
  status: DocumentStatus;
  reused?: boolean;
}

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: number;
}

export interface DemandLine {
  feeId: string;
  name: string;
  amount: number;
}

export interface DemandInfo {
  fee: number;
  tax: number;
  total: number;
  generatedAt: number;
  lines?: DemandLine[];
  /**
   * Which payment stage produced this demand.
   * Only "license" demands are surfaced as a formal Demand Notice document —
   * the upfront application fee at submission does not have one.
   */
  stage?: "application" | "license";
}

export interface PaymentDetails {
  paidAt: number;
  txnId: string;
  amount: number;
  invoiceNumber: string;
}

export interface LicenseInfo {
  number: string;
  issuedAt: number;
  validTill: number;
  qrSeed: string;
}

export interface TimelineEntry {
  state: string;
  actor: string;
  note?: string;
  at: number;
}

export interface PreviewApplication {
  id: string;
  applicationNumber: string;
  type: ApplicationType;
  parentLicenseId?: string;
  status: string;
  currentStateId: string;
  formData: Record<string, string>;
  documents: PreviewDocument[];
  checklists: Record<string, ChecklistItemState[]>;
  demand: DemandInfo | null;
  paymentStatus: "pending" | "paid" | null;
  paymentDetails: PaymentDetails | null;
  timeline: TimelineEntry[];
  license: LicenseInfo | null;
  createdAt: number;
  assignee?: string;
}

export interface PreviewScreen {
  type:
    | "catalogue"
    | "home"
    | "apply_intro"
    | "apply"
    | "renew"
    | "success"
    | "my_applications"
    | "my_documents"
    | "application_detail"
    | "payment"
    | "license"
    | "demand_notice"
    | "invoice"
    | "employee_home"
    | "inbox"
    | "search"
    | "application_review";
  applicationId?: string;
  parentLicenseId?: string;
  filterStates?: string[];
  filterLabel?: string;
}

interface PreviewContextValue {
  role: PreviewRole;
  /** Canonical service-role id of the currently-selected role (e.g. "document_verifier", "approver", "issuer"). */
  activeRoleId: string;
  /** Activate a role. Pass roleId for any non-citizen role so queues filter correctly. */
  setRole: (r: PreviewRole, roleId?: string) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (d: DeviceMode) => void;
  screen: PreviewScreen;
  setScreen: (s: PreviewScreen) => void;
  applications: PreviewApplication[];
  notifications: PreviewNotification[];
  unreadCount: number;
  markNotificationsRead: () => void;
  // Simulated SMS / EMAIL — citizen channel only
  messages: SimulatedMessage[];
  unreadMessagesCount: number;
  markMessagesRead: () => void;
  messagesDrawerOpen: boolean;
  setMessagesDrawerOpen: (o: boolean) => void;
  formSections: FormSectionConfig[];
  /** Canonical wizard steps for the active application type. */
  getFormSteps: (type: ApplicationType) => WizardStep[];
  workflowStates: WorkflowStateConfig[];
  workflowTransitions: WorkflowTransitionConfig[];
  serviceName: string;
  userDocuments: UserDocument[];
  addUserDocument: (name: string, type: string) => string;
  removeUserDocument: (id: string) => void;
  submitApplication: (formData: Record<string, string>, documents: PreviewDocument[]) => { id: string; paymentPending: boolean };
  submitRenewal: (parentAppId: string, formData: Record<string, string>, documents: PreviewDocument[]) => { id: string; paymentPending: boolean };
  transitionApplication: (appId: string, transitionId: string) => void;
  payApplication: (appId: string) => void;
  issueLicense: (appId: string) => void;
  completeRenewal: (appId: string) => void;
  assignApplication: (appId: string, assignee: string) => void;
  toggleChecklist: (appId: string, stateId: string, itemId: string) => void;
  setDocumentStatus: (appId: string, docId: string, status: DocumentStatus) => void;
  /**
   * True when an application owes money at its current state (the state has a
   * configured payment stage) but the citizen hasn't paid yet. Role-owned
   * transitions out of such states are gated until payment is received.
   */
  isAwaitingPayment: (app: PreviewApplication) => boolean;
  resetDemo: () => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

export const usePreview = () => {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error("usePreview must be used within PreviewProvider");
  return ctx;
};

export type CitizenDocumentKind = "demand" | "invoice" | "license";

export interface CitizenDocumentEntry {
  kind: CitizenDocumentKind;
  label: string;
  generatedAt: number;
}

export const getCitizenDocuments = (app: PreviewApplication): CitizenDocumentEntry[] => {
  const docs: CitizenDocumentEntry[] = [];
  // Only the license-fee demand is a formal Demand Notice document.
  if (app.demand && app.demand.stage === "license") {
    docs.push({ kind: "demand", label: "Demand Notice", generatedAt: app.demand.generatedAt });
  }
  if (app.paymentDetails) docs.push({ kind: "invoice", label: "Payment Invoice", generatedAt: app.paymentDetails.paidAt });
  if (app.license) docs.push({ kind: "license", label: "Business License Certificate", generatedAt: app.license.issuedAt });
  return docs;
};

// ─── Default Config ───
const DEFAULT_SECTIONS: FormSectionConfig[] = [
  {
    id: "sec-1", name: "Applicant Details", description: "Identify the applicant",
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
        helpText: "Format depends on the selected ID type" },
    ],
  },
  {
    id: "sec-2", name: "Business Details", description: "Information about the business",
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
    id: "sec-3", name: "Business Address", description: "Where the business operates",
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
    id: "sec-4", name: "Operational Details", description: "How your business operates",
    fields: [
      { id: "startDate", type: "date", label: "Business Start Date", placeholder: "", required: true,
        validation: { pastDateOnly: true } },
      { id: "shopArea", type: "number", label: "Shop Area (sq ft)", placeholder: "e.g. 250", required: true,
        validation: { min: 1 }, helpText: "Used to calculate licence fees" },
      { id: "isHazardous", type: "radio", label: "Is Hazardous Activity?", placeholder: "", required: true,
        options: ["No", "Yes"] },
      { id: "hazardType", type: "dropdown", label: "Hazard Type", placeholder: "Select hazard type", required: true,
        options: ["Chemical", "Electrical", "Fire Risk"], showIf: { field: "isHazardous", equals: "Yes" } },
    ],
  },
  {
    id: "sec-5", name: "Documents", description: "Upload required documents (PDF / JPG / PNG, max 5 MB)",
    fields: [
      { id: "docId", type: "file", label: "ID Proof", placeholder: "", required: true },
      { id: "docAddr", type: "file", label: "Address Proof", placeholder: "", required: true },
      { id: "docBusiness", type: "file", label: "Business Proof", placeholder: "", required: true },
    ],
  },
  {
    id: "sec-6", name: "Declaration", description: "Confirm and submit",
    fields: [
      { id: "declaration", type: "checkbox", label: "I confirm that all the details provided are true and correct to the best of my knowledge.", placeholder: "", required: true },
    ],
  },
];

// Workflow states and transitions come from the configured workflow store
// (`useServiceWorkflow`). The legacy DEFAULT_WORKFLOW_STATES / DEFAULT_TRANSITIONS
// constants previously defined here have been removed — there is now a single
// source of truth: the configured workflow seeded from the template.

const ROLE_LABEL: Record<PreviewRole, string> = {
  citizen: "Citizen",
  documentVerifier: "Document Verifier",
  fieldInspector: "Field Inspector",
  approver: "Approver",
};

// ─── Provider ───
interface PreviewProviderProps {
  children: React.ReactNode;
  serviceName: string;
}

export const PreviewProvider: React.FC<PreviewProviderProps> = ({ children, serviceName }) => {
  const { id: routeServiceId = "service" } = useParams();
  const { state: onboardingState } = useOnboarding();
  const currentService = onboardingState.services.find((s) => s.id === routeServiceId);
  const seedSetup = useMemo(
    () => ({
      categoriesList: currentService?.templateSetup?.categoriesList,
      subcategoriesList: currentService?.templateSetup?.subcategoriesList,
    }),
    [currentService?.templateSetup?.categoriesList, currentService?.templateSetup?.subcategoriesList],
  );
  const [role, setRole] = useState<PreviewRole>("citizen");
  const [activeRoleId, setActiveRoleId] = useState<string>("citizen");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  const [screen, setScreen] = useState<PreviewScreen>({ type: "catalogue" });
  const [applications, setApplications] = useState<PreviewApplication[]>([]);
  const [notifications, setNotifications] = useState<PreviewNotification[]>([]);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  // Simulated SMS / EMAIL — surfaced via floating alert + Messages drawer (citizen only).
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [messagesReadAt, setMessagesReadAt] = useState<number>(0);
  const [messagesDrawerOpen, setMessagesDrawerOpen] = useState(false);

  // ── Form schema (per service, per module) ────────────────────────
  const [issuanceSteps, setIssuanceSteps] = useState<WizardStep[]>(
    () => loadFormSteps(routeServiceId, "Issuance", seedSetup),
  );
  const [renewalSteps, setRenewalSteps] = useState<WizardStep[]>(
    () => loadFormSteps(routeServiceId, "Renewal", seedSetup),
  );

  useEffect(() => {
    setIssuanceSteps(loadFormSteps(routeServiceId, "Issuance", seedSetup));
    setRenewalSteps(loadFormSteps(routeServiceId, "Renewal", seedSetup));
  }, [routeServiceId, seedSetup]);

  useEffect(() => {
    const reload = () => {
      setIssuanceSteps(loadFormSteps(routeServiceId, "Issuance", seedSetup));
      setRenewalSteps(loadFormSteps(routeServiceId, "Renewal", seedSetup));
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { serviceId?: string } | undefined;
      if (!detail || !detail.serviceId || detail.serviceId === routeServiceId) reload();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith(`formbuilder:${routeServiceId}:`)) reload();
    };
    window.addEventListener(FORM_UPDATED_EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(FORM_UPDATED_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [routeServiceId, seedSetup]);

  const getFormSteps = useCallback(
    (type: ApplicationType) => (type === "RENEWAL" ? renewalSteps : issuanceSteps),
    [issuanceSteps, renewalSteps],
  );

  // Derive a flat list of FormSectionConfig (one section per step) so
  // existing consumers (review screens, PDF export, etc.) keep working.
  const formSections = useMemo<FormSectionConfig[]>(() => {
    return issuanceSteps.map((step, i) => {
      const fields: FormFieldConfig[] = [];
      step.subScreens.forEach((sub) => {
        sub.fields.forEach((f: WizardField) => {
          fields.push({
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder ?? "",
            required: !!f.required,
            options: f.options,
            helpText: f.helpText,
            validation: f.validation,
            dependsOn: f.dependsOn,
            dependsValueMap: f.dependsValueMap,
            showIf: f.showIf,
          });
        });
      });
      return {
        id: `sec-${i + 1}`,
        name: step.name,
        description: "",
        fields,
      };
    });
  }, [issuanceSteps]);

  const roleRef = useRef<PreviewRole>(role);
  roleRef.current = role;
  const applicationsRef = useRef<PreviewApplication[]>(applications);
  applicationsRef.current = applications;

  // PUSH = silent in-app only. Adds to bell list; never raises a toast.
  const pushNotification = useCallback(
    (title: string, message: string, applicationId?: string, recipientRole?: RecipientRole) => {
      setNotifications(prev => [
        { id: crypto.randomUUID(), title, message, timestamp: Date.now(), read: false, applicationId, recipientRole },
        ...prev,
      ]);
    },
    []
  );

  // Floating alert renderer used by sonner's toast.custom for SMS / Email.
  const renderSimulatedAlert = useCallback(
    (kind: "SMS" | "EMAIL", subject: string, body: string, t: string | number) => {
      const isSms = kind === "SMS";
      const Icon = isSms ? Smartphone : Mail;
      const accent = isSms
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-indigo-200 bg-indigo-50 text-indigo-900";
      const iconBg = isSms ? "bg-emerald-500" : "bg-indigo-500";
      const senderLabel = isSms ? "SMS · Gov Applications" : "Email · noreply@govservices.in";
      return (
        <div
          onClick={() => { setMessagesDrawerOpen(true); toast.dismiss(t); }}
          className={`pointer-events-auto cursor-pointer w-[340px] rounded-xl border ${accent} shadow-lg overflow-hidden`}
          role="button"
        >
          <div className="flex items-start gap-3 p-3">
            <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4 text-white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">{senderLabel}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); toast.dismiss(t); }}
                  className="opacity-50 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {!isSms && <p className="font-semibold text-sm mt-0.5 line-clamp-1">{subject}</p>}
              <p className={`text-xs mt-0.5 ${isSms ? "line-clamp-2" : "line-clamp-2 opacity-90"}`}>{body}</p>
              <p className="text-[10px] mt-1.5 opacity-60">Tap to open Messages</p>
            </div>
          </div>
        </div>
      );
    },
    []
  );

  // ── User-defined notification dispatcher (shared with NotificationsManager / WorkflowDesigner) ──
  const userNotifs = useServiceNotifications(routeServiceId);

  // ── Workflow store (shared with WorkflowDesigner) ──
  const wfStore = useServiceWorkflow(routeServiceId);
  const wfFor = useCallback((type: ApplicationType) => wfStore.forType(type), [wfStore]);

  // ── Unified configurator subscription (roles/checklists/documents/fees/payments) ──
  const cfg = usePreviewConfig(routeServiceId);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;


  // (Legacy `resolveStateId` helper removed — workflow advancement now goes
  //  exclusively through configured transitions, not by-name state lookups.)


  /** Initial state id for a new application (the workflow's start state). */
  const startStateId = useCallback((type: ApplicationType): string => {
    const wf = wfFor(type);
    return wf.states.find(s => s.type === "start")?.id ?? wf.states[0]?.id ?? "s1";
  }, [wfFor]);

  /** Combined workflow exposed on the context (union of issuance + renewal). */
  const combinedWorkflow = useMemo(() => {
    const states = [...wfStore.issuance.states];
    wfStore.renewal.states.forEach(s => {
      if (!states.some(x => x.id === s.id)) states.push(s);
    });
    const transitions = [...wfStore.issuance.transitions];
    wfStore.renewal.transitions.forEach(t => {
      if (!transitions.some(x => x.id === t.id)) transitions.push(t);
    });
    return { states, transitions };
  }, [wfStore]);

  const exposedWorkflowStates: WorkflowStateConfig[] = useMemo(
    () => combinedWorkflow.states.map(s => ({ id: s.id, name: s.name, type: s.type })),
    [combinedWorkflow]
  );

  const ROLE_ID_TO_PREVIEW_MAP: Record<string, PreviewRole> = {
    citizen: "citizen",
    document_verifier: "documentVerifier",
    documentVerifier: "documentVerifier",
    field_inspector: "fieldInspector",
    fieldInspector: "fieldInspector",
    approver: "approver",
  };

  const exposedWorkflowTransitions: WorkflowTransitionConfig[] = useMemo(
    () => combinedWorkflow.transitions.map(t => {
      const wfTx = (wfStore.issuance.transitions.find(x => x.id === t.id)
        ?? wfStore.renewal.transitions.find(x => x.id === t.id))!;
      const canonical = canonicalRoleId(wfTx.roleId);
      const role: PreviewRole | "any" = ROLE_ID_TO_PREVIEW_MAP[canonical] ?? "any";

      // Resolve transition.checklistIds → flat list of {id,text} items from
      // the configured checklists store (so edits in ChecklistBuilder appear).
      const isRenewal = wfStore.renewal.transitions.some(x => x.id === t.id);
      const modCfg = isRenewal ? cfg.renewal : cfg.issuance;
      const items: { id: string; text: string }[] = [];
      (wfTx.checklistIds ?? []).forEach((cid) => {
        const cl = modCfg.checklists.find((c) => c.id === cid);
        if (!cl) return;
        cl.questions.forEach((q) => items.push({ id: `${cid}:${q.id}`, text: q.text }));
      });

      return {
        id: t.id,
        name: t.name,
        fromStateId: t.fromStateId,
        toStateId: t.toStateId,
        role,
        roleId: canonical,
        checklist: items,
      };
    }),
    [combinedWorkflow, wfStore, cfg]
  );


  const PREVIEW_ROLE_IDS = new Set<PreviewRole>(["citizen", "documentVerifier", "fieldInspector", "approver"]);
  const ROLE_ID_TO_PREVIEW = ROLE_ID_TO_PREVIEW_MAP;


  const fmtDateLocal = (ms: number) =>
    new Date(ms).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const buildTokens = (app: PreviewApplication, meta: Record<string, string>) => ({
    applicantName:     app.formData?.fullName || "Applicant",
    applicationNumber: app.applicationNumber || "",
    applicationId:     app.applicationNumber || "",
    businessName:      app.formData?.businessName || "your business",
    applicationStatus: app.status || "",
    amount:            app.demand?.total != null ? app.demand.total.toLocaleString("en-IN") : "",
    licenseNumber:     app.license?.number || "",
    validTill:         app.license?.validTill ? fmtDateLocal(app.license.validTill) : "",
    actionBy:          meta.actionBy || "",
    documentName:      meta.documentName || "",
    remarks:           meta.remarks || "",
    status:            meta.status || app.status || "",
    ...meta,
  });

  const inject = (s: string, tokens: Record<string, string>) =>
    (s || "").replace(/\{\{?(\w+)\}?\}/g, (_, k) => (tokens[k] != null ? String(tokens[k]) : ""));

  const dispatchNotification = useCallback(
    (n: SharedNotification, app: PreviewApplication, meta: Record<string, string> = {}) => {
      const tokens = buildTokens(app, meta);
      const subject = inject(n.subject, tokens);
      const message = inject(n.message, tokens);
      const roleKey = canonicalRoleId(n.recipientRole);
      const previewRole: RecipientRole | undefined =
        ROLE_ID_TO_PREVIEW[roleKey] ?? (PREVIEW_ROLE_IDS.has(roleKey as PreviewRole) ? (roleKey as PreviewRole) : undefined);

      if (n.channel === "push") {
        pushNotification(subject || message, message, app.id, previewRole);
        return;
      }
      // email / sms — only simulate when targeted at citizen (officers don't have an inbox in preview)
      if (previewRole !== "citizen") return;
      const channel = (n.channel === "sms" ? "SMS" : "EMAIL") as "SMS" | "EMAIL";
      const simulated: SimulatedMessage = {
        id: crypto.randomUUID(),
        channel,
        recipientRole: previewRole,
        title: subject || message.slice(0, 60),
        message,
        applicationId: app.id,
        timestamp: Date.now(),
      };
      setMessages(prev => [simulated, ...prev]);
      if (roleRef.current === "citizen") {
        toast.custom(
          (t) => renderSimulatedAlert(channel, simulated.title, message, t),
          { duration: channel === "SMS" ? 4000 : 5000, position: "bottom-right" }
        );
      }
    },
    [userNotifs, pushNotification, renderSimulatedAlert]
  );

  // Dispatch every user-defined notification configured for the application's current state.
  const dispatchByState = useCallback(
    (app: PreviewApplication, stateName: string, meta: Record<string, string> = {}) => {
      const list = userNotifs.forStateName(stateName, app.type);
      list.forEach(n => dispatchNotification(n, app, meta));
    },
    [userNotifs, dispatchNotification]
  );

  // Legacy emitEvent — kept only for sub-state events that don't change workflow state
  // (document verification / rejection). Reads from NOTIFICATION_MATRIX directly.
  const emitEvent = useCallback(
    (
      triggerId: string,
      app: PreviewApplication,
      meta: Record<string, string> = {}
    ) => {
      const templates = NOTIFICATION_MATRIX.filter(t => t.id === triggerId);
      templates.forEach(tpl => {
        const { title, message } = resolveTemplate(tpl, app, meta);
        tpl.channels.forEach(channel => {
          if (channel === "PUSH") {
            pushNotification(title, message, app.id, tpl.recipientRole);
            return;
          }
          if (tpl.recipientRole !== "citizen") return;
          const simulated: SimulatedMessage = {
            id: crypto.randomUUID(),
            channel,
            recipientRole: tpl.recipientRole,
            title,
            message,
            applicationId: app.id,
            timestamp: Date.now(),
          };
          setMessages(prev => [simulated, ...prev]);
          if (roleRef.current === "citizen") {
            toast.custom(
              (t) => renderSimulatedAlert(channel as "SMS" | "EMAIL", title, message, t),
              { duration: channel === "SMS" ? 4000 : 5000, position: "bottom-right" }
            );
          }
        });
      });
    },
    [pushNotification, renderSimulatedAlert]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => (!n.recipientRole || n.recipientRole === roleRef.current ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read && (!n.recipientRole || n.recipientRole === role)).length,
    [notifications, role]
  );

  const markMessagesRead = useCallback(() => {
    setMessagesReadAt(Date.now());
  }, []);

  const unreadMessagesCount = useMemo(
    () => messages.filter(m => m.timestamp > messagesReadAt).length,
    [messages, messagesReadAt]
  );

  const buildAppNumber = (prefix: string) => {
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const slug = serviceName.toLowerCase().replace(/\s+/g, "-");
    return `${prefix}-${slug}-${ts}-${Math.floor(Math.random() * 900 + 100)}`;
  };

  const addUserDocument = useCallback((name: string, type: string) => {
    const id = crypto.randomUUID();
    setUserDocuments(prev => [{ id, name, type, uploadedAt: Date.now() }, ...prev]);
    toast.success("Document uploaded", { description: `${type} added to My Documents.` });
    return id;
  }, []);

  const removeUserDocument = useCallback((id: string) => {
    setUserDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const computeInitialDemand = useCallback((type: ApplicationType, stateName: string, formData: Record<string, string>): DemandInfo | null => {
    const modCfg = cfgRef.current.forType(type);
    const stage = findPaymentStageForState(stateName, modCfg.paymentStages);
    if (!stage) return null;
    const computed = computeDemandForStage(stage, modCfg.fees, formData);
    if (!computed || computed.total <= 0) return null;
    const demandStage: DemandInfo["stage"] = stateName === "Payment Pending" ? "license" : "application";
    return { ...computed, generatedAt: Date.now(), stage: demandStage };
  }, []);

  const submitApplication = useCallback((formData: Record<string, string>, documents: PreviewDocument[]) => {
    const appNumber = buildAppNumber("TL");
    const demand = computeInitialDemand("NEW", "Submitted", formData);
    const app: PreviewApplication = {
      id: crypto.randomUUID(),
      applicationNumber: appNumber,
      type: "NEW",
      status: "Submitted",
      currentStateId: startStateId("NEW"),
      formData,
      documents,
      checklists: {},
      demand,
      paymentStatus: demand ? "pending" : null,
      paymentDetails: null,
      timeline: [{ state: "Submitted", actor: "Citizen", note: "Application created", at: Date.now() }],
      license: null,
      createdAt: Date.now(),
    };
    setApplications(prev => [app, ...prev]);
    dispatchByState(app, "Submitted");
    return { id: app.id, paymentPending: !!demand };
  }, [serviceName, dispatchByState, startStateId, computeInitialDemand]);

  const submitRenewal = useCallback((parentAppId: string, formData: Record<string, string>, documents: PreviewDocument[]) => {
    const appNumber = buildAppNumber("TL-RNW");
    const demand = computeInitialDemand("RENEWAL", "Submitted", formData);
    const app: PreviewApplication = {
      id: crypto.randomUUID(),
      applicationNumber: appNumber,
      type: "RENEWAL",
      parentLicenseId: parentAppId,
      status: "Submitted",
      currentStateId: startStateId("RENEWAL"),
      formData,
      documents,
      checklists: {},
      demand,
      paymentStatus: demand ? "pending" : null,
      paymentDetails: null,
      timeline: [{ state: "Submitted", actor: "Citizen", note: "Renewal request created", at: Date.now() }],
      license: null,
      createdAt: Date.now(),
    };
    setApplications(prev => [app, ...prev]);
    dispatchByState(app, "Submitted");
    return { id: app.id, paymentPending: !!demand };
  }, [serviceName, dispatchByState, startStateId, computeInitialDemand]);

  const transitionApplication = useCallback((appId: string, transitionId: string) => {
    const app = applicationsRef.current.find(a => a.id === appId);
    if (!app) return;
    const wf = wfFor(app.type);
    const transition = wf.transitions.find(t => t.id === transitionId);
    if (!transition) return;
    const targetState = wf.states.find(s => s.id === transition.toStateId);
    if (!targetState) return;

    let updatedApp: PreviewApplication | null = null;
    setApplications(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const actor = ROLE_LABEL[role];
      const updated: PreviewApplication = {
        ...a,
        currentStateId: transition.toStateId,
        status: targetState.name,
        timeline: [
          ...a.timeline,
          { state: targetState.name, actor, note: transition.name, at: Date.now() },
        ],
      };
      // Auto-generate demand from the configured payment stage that maps to
      // the entered state, computing line items from configured fees. Falls
      // back to the legacy hard-coded amount only if Payment Pending is hit
      // without any configured stage (so demos never break silently).
      const modCfg = cfgRef.current.forType(a.type);
      const stage = findPaymentStageForState(targetState.name, modCfg.paymentStages);
      if (stage) {
        const computed = computeDemandForStage(stage, modCfg.fees, a.formData);
        if (computed && computed.total > 0) {
          const demandStage: DemandInfo["stage"] = targetState.name === "Payment Pending" ? "license" : "application";
          updated.demand = { ...computed, generatedAt: Date.now(), stage: demandStage };
          updated.paymentStatus = "pending";
        }
      } else if (targetState.name === "Payment Pending") {
        updated.demand = { fee: 1000, tax: 100, total: 1100, generatedAt: Date.now(), stage: "license" };
        updated.paymentStatus = "pending";
      }
      updatedApp = updated;
      return updated;
    }));


    if (!updatedApp) return;
    const meta = { actionBy: ROLE_LABEL[role] };
    dispatchByState(updatedApp, targetState.name, meta);
  }, [role, dispatchByState, wfFor]);

  const setDocumentStatus = useCallback((appId: string, docId: string, status: DocumentStatus) => {
    let updatedApp: PreviewApplication | null = null;
    let docName = "";
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const doc = app.documents.find(d => d.id === docId);
      if (!doc) return app;
      docName = doc.type;
      const docs = app.documents.map(d => d.id === docId ? { ...d, status } : d);
      const updated: PreviewApplication = {
        ...app,
        documents: docs,
        timeline: [
          ...app.timeline,
          { state: app.status, actor: ROLE_LABEL[role], note: `Document "${doc.type}" ${status.toLowerCase()}`, at: Date.now() },
        ],
      };
      updatedApp = updated;
      return updated;
    }));
    if (updatedApp) {
      if (status === "Verified") emitEvent("document_verified", updatedApp, { documentName: docName });
      else if (status === "Rejected") emitEvent("document_rejected", updatedApp, { documentName: docName });
    }
  }, [role, emitEvent]);

  /**
   * Payment is a side-effect on the demand, not a hardcoded state jump.
   * - Always: record paymentDetails + flip paymentStatus to "paid".
   * - If the configured workflow has a citizen transition out of the current
   *   state (e.g. `t_pay`: Payment Pending → Paid), execute it inline so the
   *   workflow advances exactly as configured (no name-based jumps).
   * - If no citizen transition exists (e.g. application fee paid at Submitted —
   *   the workflow has no citizen transition out of Submitted), the application
   *   stays in its current state and the next role-owned transition (e.g.
   *   Document Verifier picking up Submitted) becomes the legitimate next step.
   */
  const payApplication = useCallback((appId: string) => {
    const current = applicationsRef.current.find(a => a.id === appId);
    if (!current || !current.demand) return;
    const wf = wfFor(current.type);
    const citizenTx = wf.transitions.find(
      t => t.fromStateId === current.currentStateId && t.roleId === "citizen"
    );
    const targetState = citizenTx
      ? wf.states.find(s => s.id === citizenTx.toStateId)
      : undefined;

    let updatedApp: PreviewApplication | null = null;
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      if (!app.demand) return app;
      const paidAt = Date.now();
      const paymentDetails: PaymentDetails = {
        paidAt,
        txnId: `TXN${paidAt.toString().slice(-8)}`,
        amount: app.demand.total,
        invoiceNumber: `INV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 90000 + 10000))}`,
      };
      const baseTimeline = [
        ...app.timeline,
        { state: app.status, actor: "Citizen", note: `Paid ₹${app.demand.total}`, at: paidAt },
      ];
      const updated: PreviewApplication = {
        ...app,
        paymentStatus: "paid",
        paymentDetails,
        timeline: citizenTx && targetState
          ? [...baseTimeline, { state: targetState.name, actor: "Citizen", note: citizenTx.name, at: paidAt }]
          : baseTimeline,
        ...(citizenTx && targetState
          ? { currentStateId: targetState.id, status: targetState.name }
          : {}),
      };
      updatedApp = updated;
      return updated;
    }));
    if (updatedApp) dispatchByState(updatedApp, updatedApp.status);
  }, [dispatchByState, wfFor]);

  /**
   * Issue License = run the configured approver transition out of the current
   * state. License artifact generation is a side-effect of entering the target
   * end state, not a hardcoded "License Issued" jump.
   */
  const issueLicense = useCallback((appId: string) => {
    const current = applicationsRef.current.find(a => a.id === appId);
    if (!current) return;
    const wf = wfFor(current.type);
    const tx = wf.transitions.find(
      t => t.fromStateId === current.currentStateId && t.roleId === "approver"
    );
    const targetState = tx ? wf.states.find(s => s.id === tx.toStateId) : undefined;
    if (!tx || !targetState) return;

    let updatedApp: PreviewApplication | null = null;
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const issuedAt = Date.now();
      const validTill = issuedAt + 365 * 24 * 60 * 60 * 1000;
      const license: LicenseInfo = {
        number: `TL/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}`,
        issuedAt,
        validTill,
        qrSeed: app.applicationNumber,
      };
      const updated: PreviewApplication = {
        ...app,
        currentStateId: targetState.id,
        status: targetState.name,
        license,
        timeline: [
          ...app.timeline,
          { state: targetState.name, actor: ROLE_LABEL[role], note: `License ${license.number}`, at: issuedAt },
        ],
      };
      updatedApp = updated;
      return updated;
    }));
    if (updatedApp) dispatchByState(updatedApp, targetState.name);
  }, [role, dispatchByState, wfFor]);

  /**
   * Complete Renewal = run the configured approver transition out of the
   * renewal application's current state, mint a new license, and extend the
   * parent license validity. No hardcoded "License Renewed" jump.
   */
  const completeRenewal = useCallback((appId: string) => {
    const current = applicationsRef.current.find(a => a.id === appId);
    if (!current) return;
    const wf = wfFor(current.type);
    const tx = wf.transitions.find(
      t => t.fromStateId === current.currentStateId && t.roleId === "approver"
    );
    const targetState = tx ? wf.states.find(s => s.id === tx.toStateId) : undefined;
    if (!tx || !targetState) return;

    let parentId: string | undefined;
    let newLicenseNumber = "";
    let issuedAtFinal = Date.now();
    let validTillFinal = issuedAtFinal + 365 * 24 * 60 * 60 * 1000;
    setApplications(prev => {
      const renewalApp = prev.find(a => a.id === appId);
      if (!renewalApp) return prev;
      parentId = renewalApp.parentLicenseId;
      const issuedAt = Date.now();
      const parentApp = parentId ? prev.find(a => a.id === parentId) : null;
      const baseTime = parentApp?.license ? Math.max(issuedAt, parentApp.license.validTill) : issuedAt;
      const validTill = baseTime + 365 * 24 * 60 * 60 * 1000;
      newLicenseNumber = `TL/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}-R`;
      issuedAtFinal = issuedAt;
      validTillFinal = validTill;
      const newLicense: LicenseInfo = {
        number: newLicenseNumber,
        issuedAt,
        validTill,
        qrSeed: renewalApp.applicationNumber,
      };

      return prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            currentStateId: targetState.id,
            status: targetState.name,
            license: newLicense,
            timeline: [
              ...app.timeline,
              { state: targetState.name, actor: ROLE_LABEL[role], note: `Renewed license ${newLicense.number}`, at: issuedAt },
            ],
          };
        }
        if (parentId && app.id === parentId && app.license) {
          return {
            ...app,
            license: { ...app.license, number: newLicense.number, issuedAt, validTill },
            timeline: [
              ...app.timeline,
              { state: targetState.name, actor: ROLE_LABEL[role], note: `Validity extended to ${new Date(validTill).toLocaleDateString()}`, at: issuedAt },
            ],
          };
        }
        return app;
      });
    });
    // Synthetic snapshot for variable injection (license freshly minted above).
    const renewedSnapshot: PreviewApplication = {
      id: appId,
      applicationNumber: appId,
      type: "RENEWAL",
      status: targetState.name,
      currentStateId: targetState.id,
      formData: {},
      documents: [],
      checklists: {},
      demand: null,
      paymentStatus: null,
      paymentDetails: null,
      timeline: [],
      license: { number: newLicenseNumber, issuedAt: issuedAtFinal, validTill: validTillFinal, qrSeed: "" },
      createdAt: issuedAtFinal,
    };
    dispatchByState(renewedSnapshot, targetState.name);
  }, [role, dispatchByState, wfFor]);

  const assignApplication = useCallback((appId: string, assignee: string) => {
    setApplications(prev => prev.map(app =>
      app.id === appId ? { ...app, assignee } : app
    ));
    pushNotification("Application Assigned", `Assigned to ${assignee}`, appId);
  }, [pushNotification]);

  const toggleChecklist = useCallback((appId: string, stateId: string, itemId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const wf = wfFor(app.type);
      const transition = wf.transitions.find(t => t.fromStateId === stateId && t.checklistIds.length > 0);
      // Checklist items themselves live on the inline edit dialog; for preview we
      // just toggle whatever items the app already has, no seed required.
      const existing = app.checklists[stateId] || [];
      const list = existing;
      void transition;
      return {
        ...app,
        checklists: {
          ...app.checklists,
          [stateId]: list.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i),
        },
      };
    }));
  }, [wfFor]);

  const resetDemo = useCallback(() => {
    setApplications([]);
    setNotifications([]);
    setUserDocuments([]);
    setMessages([]);
    setMessagesReadAt(Date.now());
    setMessagesDrawerOpen(false);
    setScreen(role === "citizen" ? { type: "catalogue" } : { type: "employee_home" });
    toast.success("Demo reset", { description: "All applications, documents and notifications cleared." });
  }, [role]);

  const handleSetRole = useCallback((r: PreviewRole, roleId?: string) => {
    setRole(r);
    // Default the canonical role id from the persona when the caller doesn't pass one.
    setActiveRoleId(
      roleId
        ?? (r === "citizen" ? "citizen"
          : r === "documentVerifier" ? "document_verifier"
          : r === "fieldInspector" ? "field_inspector"
          : "approver")
    );
    if (r === "citizen") {
      setScreen({ type: "catalogue" });
      setDeviceMode("mobile");
    } else {
      setScreen({ type: "employee_home" });
      setDeviceMode("desktop");
    }
  }, []);

  /**
   * Payment-gating: the current state has a configured payment stage in the
   * module's payment setup and the application hasn't paid yet.
   * Used by employee UIs to disable transitions until the citizen pays.
   */
  const isAwaitingPayment = useCallback((app: PreviewApplication): boolean => {
    if (app.paymentStatus === "paid") return false;
    const modCfg = app.type === "RENEWAL" ? cfg.renewal : cfg.issuance;
    const stages = modCfg.paymentStages;
    const hasStageForCurrent = stages.some(s => s.workflowState === app.status);
    return hasStageForCurrent;
  }, [cfg]);

  return (
    <PreviewContext.Provider value={{
      role, activeRoleId, setRole: handleSetRole, deviceMode, setDeviceMode,
      screen, setScreen,
      applications, notifications, unreadCount, markNotificationsRead,
      messages, unreadMessagesCount, markMessagesRead,
      messagesDrawerOpen, setMessagesDrawerOpen,
      formSections,
      getFormSteps,
      workflowStates: exposedWorkflowStates,
      workflowTransitions: exposedWorkflowTransitions,
      serviceName,
      userDocuments, addUserDocument, removeUserDocument,
      submitApplication, submitRenewal,
      transitionApplication, payApplication, issueLicense, completeRenewal,
      assignApplication, toggleChecklist, setDocumentStatus, isAwaitingPayment, resetDemo,
    }}>
      {children}
    </PreviewContext.Provider>
  );
};
