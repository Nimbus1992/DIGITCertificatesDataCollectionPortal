export type RoleId = "document_verifier" | "field_inspector" | "approver";

export type StageId =
  | "submitted"
  | "under_doc_verification"
  | "inspection_pending"
  | "inspection_scheduled"
  | "payment_pending"
  | "paid"
  | "issued"
  | "rejected";

export type DocStatus = "Pending" | "Verified" | "Rejected";

export type AppDocument = {
  fieldId: string;
  name: string;
  fileName: string;
  status: DocStatus;
  rejectionReason?: string;
};

export type HistoryEntry = {
  stageId: StageId;
  at: number;
  by: string;
  byRole?: RoleId | "system" | "citizen";
  note?: string;
};

export type FeeRecord = {
  label: string;
  fee: number;
  tax: number;
  status: "Awaiting" | "Paid";
  txnId?: string;
  paidAt?: number;
  dueLabel?: string;
};

export type Application = {
  id: string; // ARN
  serviceId: "business_license" | "building_permit" | "event_permit";
  serviceLabel: string;
  applicantName: string;
  phone: string;
  email?: string;
  idType: string;
  idNumber: string;
  business?: {
    name: string;
    type: string;
    address: string;
    gstin?: string;
    category?: string;
    subCategory?: string;
    ownership?: string;
    employees?: number;
    annualTurnover?: number;
  };
  location?: {
    line1: string;
    line2?: string;
    city: string;
    zone: string;
    postalCode: string;
  };
  operations?: {
    startDate: string; // ISO yyyy-mm-dd
    shopAreaSqft: number;
    hazardous: boolean;
  };
  documents: AppDocument[];
  currentStageId: StageId;
  fees: {
    verification: FeeRecord;
    issuance: FeeRecord;
  };
  inspection?: {
    scheduledAt?: number;
    inspectorName?: string;
    slot?: string;
    report?: {
      findings: string;
      recommendation: "pass" | "fail" | "conditional";
      signedAt: number;
    };
  };
  licenseNumber?: string;
  licenseIssuedAt?: number;
  history: HistoryEntry[];
  createdAt: number;
  updatedAt: number;
};


export type Notification = {
  id: string;
  appId: string;
  channel: "in_app" | "sms";
  audience: RoleId | "citizen";
  title: string;
  body: string;
  at: number;
  read?: boolean;
};

export type Session = {
  email: string;
  name: string;
  roleId: RoleId;
  loggedInAt: number;
};
