export type FieldType =
  | "text"
  | "number"
  | "tel"
  | "email"
  | "dropdown"
  | "radio"
  | "date"
  | "file"
  | "checkbox"
  | "textarea";

export type ValidationRule = {
  regex?: string;
  regexMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pastDateOnly?: boolean;
};

export type FormFieldOption = { label: string; value: string };

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: ValidationRule;
  /** Field id whose value determines the option set for this field. */
  dependsOn?: string;
  /** Map from depended-field value -> options for this field. */
  dependsValueMap?: Record<string, FormFieldOption[]>;
  /** Show this field only when the condition is satisfied. */
  showIf?: { fieldId: string; equals: string | string[] | boolean };
  /** File field: comma-separated mime types, max size MB */
  accept?: string;
  maxSizeMb?: number;
};

export type FormStep = {
  id: string;
  title: string;
  subtitle?: string;
  /** Step label shown in progress (e.g. "Operational Details"). */
  shortLabel: string;
  fields: FormField[];
  /** Skipable step (renders "Skip for now" link). */
  skippable?: boolean;
};

export type DocumentRequirement = {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
};

export type WorkflowState = {
  id: string;
  label: string;
  kind: "start" | "in_progress" | "end";
  /** "approved" | "rejected" | "issued" for end states */
  endStatus?: "approved" | "rejected" | "issued";
  /** Display chip variant override */
  chip?: "submitted" | "in_review" | "payment_required" | "approved" | "rejected" | "issued";
};

export type WorkflowTransition = {
  id: string;
  from: string;
  to: string;
  label: string;
  /** Notification event id fired on transition. */
  notify?: string;
};

export type FeeRule = {
  id: string;
  stageId: string; // workflow state id where the fee becomes due
  label: string;
  /** Either a flat amount, or a function-style reference computed at runtime. */
  baseAmount: number;
  taxPercent?: number;
};

export type NotificationTemplate = {
  event: string; // e.g. "submitted", "doc_verified", "payment_due", "issued"
  channel: "sms" | "inapp";
  title: string;
  body: string; // supports {{tokens}}
};

export type ServiceConfig = {
  id: string;
  arnPrefix: string;
  name: string;
  category: string;
  icon: string; // lucide icon name
  summary: string;
  /** When true, the service is shown in the directory but cannot be opened. */
  comingSoon?: boolean;
  eligibility: string[];
  documentsRequired: DocumentRequirement[];
  form: FormStep[];
  workflow: {
    states: WorkflowState[];
    transitions: WorkflowTransition[];
  };
  fees: FeeRule[];
  notifications: NotificationTemplate[];
};