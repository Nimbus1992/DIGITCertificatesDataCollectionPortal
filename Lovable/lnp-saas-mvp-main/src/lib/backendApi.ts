/**
 * Backend API client — connects the React frontend to the Node.js microservices backend.
 * Base URL: http://localhost:3001/api/v1
 *
 * All requests include the Supabase session token for authentication.
 */

import { supabase } from "@/integrations/supabase/client";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api/v1";

// ─── Core fetch helper ────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Types ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FeeRule {
  id?: string;
  name: string;
  description?: string;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  feeAmount: number;
  feeType: "fixed" | "percentage" | "per_unit";
  isActive: boolean;
  sortOrder?: number;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  allowedRoles: string[];
  isInitial?: boolean;
  isTerminal?: boolean;
  slaHours?: number;
  transitions: WorkflowTransition[];
  systemActions?: SystemAction[];
}

export interface WorkflowTransition {
  id: string;
  label: string;
  toStage: string;
  requiresComment: boolean;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

export interface SystemAction {
  type: "notify" | "generate_document" | "calculate_fee";
  trigger: "on_enter" | "on_exit";
  label: string;
}

export interface Application {
  id: string;
  referenceNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  serviceId: string;
  organizationId: string;
  status: string;
  currentStage?: string;
  formData: Record<string, any>;
  calculatedFee?: number;
  feeBreakdown?: { ruleName: string; amount: number }[];
  priority: "normal" | "high" | "urgent";
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paymentDate?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  version: string;
  pricingModel: "free" | "per_use" | "monthly";
  pricePerUse?: number;
  monthlyPrice?: number;
  configSchema: { key: string; label: string; type: string; required?: boolean }[];
  isInstalled?: boolean;
  installedConfig?: Record<string, string>;
}

// ─── User / Invite API ────────────────────────────────────────
export const userApi = {
  /**
   * Invite a user — calls auth.admin.inviteUserByEmail on the backend
   * (requires SUPABASE_SERVICE_ROLE_KEY in backend/.env and backend running on :3001).
   */
  invite: (data: {
    email: string;
    name: string;
    role: string;
    organizationId: string;
    serviceId?: string;
  }) =>
    apiFetch<ApiResponse<{ member: any; authUserId: string | null; invited: boolean }>>(
      `/users/invite`,
      { method: "POST", body: JSON.stringify(data) }
    ),

  updateStatus: (memberId: string, status: "active" | "inactive" | "pending") =>
    apiFetch<ApiResponse<any>>(`/users/${memberId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  remove: (memberId: string) =>
    apiFetch<ApiResponse<void>>(`/users/${memberId}`, { method: "DELETE" }),
};

// ─── Organization API ─────────────────────────────────────────
export const orgApi = {
  getStats: (orgId: string) =>
    apiFetch<ApiResponse<{ totalServices: number; totalApplications: number; liveServices: number }>>(`/organizations/${orgId}/stats`),

  getTeam: (orgId: string) =>
    apiFetch<ApiResponse<{ id: string; name: string; email: string; role: string }[]>>(`/organizations/${orgId}/team`),

  addTeamMember: (orgId: string, data: { name: string; email: string; role: string }) =>
    apiFetch<ApiResponse<{ id: string }>>(`/organizations/${orgId}/team`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeTeamMember: (orgId: string, memberId: string) =>
    apiFetch<ApiResponse<void>>(`/organizations/${orgId}/team/${memberId}`, { method: "DELETE" }),
};

// ─── Form API ─────────────────────────────────────────────────
export const formApi = {
  get: (serviceId: string) =>
    apiFetch<ApiResponse<{ sections: any[]; version: number }>>(`/forms/${serviceId}`),

  save: (serviceId: string, form: { sections: any[]; version?: number }) =>
    apiFetch<ApiResponse<void>>(`/forms/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify(form),
    }),

  validate: (serviceId: string, formData: Record<string, any>) =>
    apiFetch<ApiResponse<{ valid: boolean; errors: Record<string, string> }>>(`/forms/validate`, {
      method: "POST",
      body: JSON.stringify({ serviceId, formData }),
    }),
};

// ─── Workflow API ─────────────────────────────────────────────
export const workflowApi = {
  get: (serviceId: string) =>
    apiFetch<ApiResponse<{ stages: WorkflowStage[] }>>(`/workflows/${serviceId}`),

  save: (serviceId: string, workflow: { stages: WorkflowStage[] }) =>
    apiFetch<ApiResponse<void>>(`/workflows/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify(workflow),
    }),

  getAvailableActions: (applicationId: string) =>
    apiFetch<ApiResponse<{ actions: { id: string; label: string; requiresComment: boolean }[] }>>(
      `/workflows/instance/${applicationId}/available-actions`,
      { method: "POST" }
    ),

  advance: (applicationId: string, data: { actionId: string; comments?: string; checklistResponse?: any }) =>
    apiFetch<ApiResponse<void>>(`/workflows/instance/${applicationId}/advance`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTimeline: (applicationId: string) =>
    apiFetch<ApiResponse<any[]>>(`/workflows/instance/${applicationId}/timeline`),
};

// ─── Application API ──────────────────────────────────────────
export const applicationApi = {
  list: (params?: { serviceId?: string; status?: string; page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.serviceId) query.set("serviceId", params.serviceId);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    return apiFetch<PaginatedResponse<Application>>(`/applications?${query}`);
  },

  get: (id: string) =>
    apiFetch<ApiResponse<Application>>(`/applications/${id}`),

  create: (data: {
    serviceId: string;
    organizationId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    formData: Record<string, any>;
    priority?: "normal" | "high" | "urgent";
  }) =>
    apiFetch<ApiResponse<Application>>(`/applications`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStats: () =>
    apiFetch<ApiResponse<{
      byStatus: Record<string, number>;
      byService: { name: string; count: number }[];
      todayTotal: number;
    }>>(`/applications/stats`),
};

// ─── Payment API ──────────────────────────────────────────────
export const paymentApi = {
  calculateFees: (serviceId: string, formData: Record<string, any>) =>
    apiFetch<ApiResponse<{ total: number; breakdown: { ruleName: string; amount: number; type: string }[] }>>(`/payments/calculate`, {
      method: "POST",
      body: JSON.stringify({ serviceId, formData }),
    }),

  initiateOnline: (applicationId: string, amount: number, currency: string = "USD") =>
    apiFetch<ApiResponse<{ clientSecret: string; transactionId: string }>>(`/payments/initiate-online`, {
      method: "POST",
      body: JSON.stringify({ applicationId, amount, currency }),
    }),

  recordOffline: (data: {
    applicationId: string;
    amount: number;
    method: "offline_cash" | "offline_check" | "offline_bank" | "offline_other";
    paymentDate?: string;
    receiptNumber?: string;
    notes?: string;
  }) =>
    apiFetch<ApiResponse<PaymentTransaction>>(`/payments/record-offline`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getForApplication: (applicationId: string) =>
    apiFetch<ApiResponse<PaymentTransaction>>(`/payments/${applicationId}`),

  // Fee Rules CRUD
  getFeeRules: (serviceId: string) =>
    apiFetch<ApiResponse<FeeRule[]>>(`/payments/rules/${serviceId}`),

  createFeeRule: (serviceId: string, rule: FeeRule) =>
    apiFetch<ApiResponse<FeeRule>>(`/payments/rules/${serviceId}`, {
      method: "POST",
      body: JSON.stringify(rule),
    }),

  updateFeeRule: (serviceId: string, ruleId: string, rule: Partial<FeeRule>) =>
    apiFetch<ApiResponse<FeeRule>>(`/payments/rules/${serviceId}/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify(rule),
    }),

  deleteFeeRule: (serviceId: string, ruleId: string) =>
    apiFetch<ApiResponse<void>>(`/payments/rules/${serviceId}/${ruleId}`, { method: "DELETE" }),
};

// ─── Document API ─────────────────────────────────────────────
export const documentApi = {
  generate: (applicationId: string, documentType: "certificate" | "receipt" | "acknowledgement" | "rejection_letter") =>
    apiFetch<ApiResponse<{ documentId: string; downloadUrl: string }>>(`/documents/generate`, {
      method: "POST",
      body: JSON.stringify({ applicationId, documentType }),
    }),

  listForApplication: (applicationId: string) =>
    apiFetch<ApiResponse<{ id: string; documentType: string; fileUrl: string; createdAt: string }[]>>(
      `/documents/application/${applicationId}`
    ),
};

// ─── Notification API ─────────────────────────────────────────
export const notificationApi = {
  getTemplates: (serviceId: string) =>
    apiFetch<ApiResponse<Record<string, { email: { subject: string; body: string }; sms: { body: string } }>>>(
      `/notifications/templates/${serviceId}`
    ),

  saveTemplates: (serviceId: string, templates: any) =>
    apiFetch<ApiResponse<void>>(`/notifications/templates/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify(templates),
    }),

  getHistory: (applicationId: string) =>
    apiFetch<ApiResponse<any[]>>(`/notifications/${applicationId}`),
};

// ─── Plugin API ───────────────────────────────────────────────
export const pluginApi = {
  getMarketplace: () =>
    apiFetch<ApiResponse<Plugin[]>>(`/plugins/marketplace`),

  getInstalled: (serviceId: string) =>
    apiFetch<ApiResponse<Plugin[]>>(`/plugins/service/${serviceId}`),

  install: (serviceId: string, pluginId: string, config: Record<string, string>) =>
    apiFetch<ApiResponse<void>>(`/plugins/service/${serviceId}/install/${pluginId}`, {
      method: "POST",
      body: JSON.stringify({ config }),
    }),

  uninstall: (serviceId: string, pluginId: string) =>
    apiFetch<ApiResponse<void>>(`/plugins/service/${serviceId}/uninstall/${pluginId}`, {
      method: "DELETE",
    }),

  updateConfig: (serviceId: string, pluginId: string, config: Record<string, string>) =>
    apiFetch<ApiResponse<void>>(`/plugins/service/${serviceId}/plugin/${pluginId}/config`, {
      method: "PUT",
      body: JSON.stringify({ config }),
    }),
};

// ─── Audit API ────────────────────────────────────────────────
export const auditApi = {
  list: (params?: { organizationId?: string; resourceType?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.organizationId) query.set("organizationId", params.organizationId);
    if (params?.resourceType) query.set("resourceType", params.resourceType);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiFetch<PaginatedResponse<any>>(`/audit?${query}`);
  },

  exportCsv: () =>
    fetch(`${BASE_URL}/audit/export`, {
      headers: { Authorization: `Bearer ${supabase.auth.getSession()}` },
    }).then((r) => r.blob()),
};

// ─── Admin API ────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () =>
    apiFetch<ApiResponse<{
      totalOrganizations: number;
      totalServices: number;
      totalApplicationsToday: number;
      totalApplicationsThisMonth: number;
      liveServices: number;
      applicationsByStatus: Record<string, number>;
      topServices: { name: string; count: number; org: string }[];
      applicationsPerHour: { hour: string; count: number }[];
    }>>(`/admin/dashboard`),

  getOrganizations: () =>
    apiFetch<ApiResponse<any[]>>(`/admin/organizations`),

  getPerformance: () =>
    apiFetch<ApiResponse<any>>(`/admin/performance`),
};
