export interface Organization {
  id: string;
  user_id: string;
  name: string;
  country?: string;
  department?: string;
  language?: string;
  logo_url?: string;
  theme_color?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  organization_id: string;
  name: string;
  template_id: string;
  approval_level: 'single' | 'two-level' | 'multi-level';
  status: 'draft' | 'published' | 'live';
  auth_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  service_id: string;
  organization_id: string;
  applicant_id?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  reference_number: string;
  status: 'draft' | 'submitted' | 'in_review' | 'query_raised' | 'approved' | 'rejected' | 'cancelled';
  current_stage?: string;
  form_data: Record<string, any>;
  calculated_fee?: number;
  fee_breakdown?: Record<string, any>;
  priority: 'normal' | 'high' | 'urgent';
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  allowed_roles: string[];
  is_initial?: boolean;
  is_terminal?: boolean;
  sla_hours?: number;
  actions: WorkflowAction[];
  system_actions?: SystemAction[];
}

export interface WorkflowAction {
  id: string;
  label: string;
  to_stage: string;
  requires_comment: boolean;
  requires_checklist?: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number;
}

export interface SystemAction {
  type: 'notify' | 'generate_document' | 'calculate_fee';
  trigger: 'on_enter' | 'on_exit';
  config: Record<string, any>;
}

export interface FeeRule {
  id: string;
  service_id: string;
  name: string;
  condition_field?: string;
  condition_operator?: string;
  condition_value?: string;
  fee_amount: number;
  fee_type: 'fixed' | 'percentage' | 'per_unit';
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentTransaction {
  id: string;
  application_id: string;
  organization_id: string;
  amount: number;
  currency: string;
  payment_method: 'online_card' | 'online_upi' | 'offline_cash' | 'offline_check' | 'offline_bank';
  payment_gateway?: string;
  gateway_transaction_id?: string;
  gateway_payment_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_date?: string;
  receipt_number?: string;
  recorded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: 'document_verification' | 'payment' | 'integration' | 'analytics';
  provider: string;
  version: string;
  config_schema: Record<string, any>;
  is_active: boolean;
  pricing_model: 'free' | 'per_use' | 'monthly';
  price_per_use?: number;
  icon_url?: string;
}

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

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}
