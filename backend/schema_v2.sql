-- ============================================================
-- LNP SaaS Platform — Full Schema v2
-- Run this after schema.sql (base tables already exist)
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── SERVICE TEMPLATE DEFINITIONS (SaaS Admin) ──────────────
create table if not exists service_template_definitions (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  category        text not null,
  icon            text,
  base_form       jsonb default '{}',
  base_workflow   jsonb default '{}',
  base_roles      jsonb default '[]',
  base_notifications jsonb default '{}',
  base_checklist  jsonb default '[]',
  base_fee_rules  jsonb default '[]',
  features        text[] default '{}',
  estimated_setup_time text,
  is_active       boolean default true,
  sort_order      int default 0,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── APPLICATIONS ────────────────────────────────────────────
create table if not exists applications (
  id                  uuid primary key default uuid_generate_v4(),
  service_id          uuid not null references services(id) on delete cascade,
  organization_id     uuid not null references organizations(id) on delete cascade,
  applicant_id        uuid references auth.users(id),
  applicant_name      text not null,
  applicant_email     text not null,
  applicant_phone     text,
  reference_number    text unique not null,
  status              text not null default 'draft'
                        check (status in ('draft','submitted','in_review','query_raised','approved','rejected','cancelled')),
  current_stage       text,
  form_data           jsonb default '{}',
  calculated_fee      numeric(12,2) default 0,
  fee_breakdown       jsonb default '[]',
  priority            text default 'normal' check (priority in ('normal','high','urgent')),
  submitted_at        timestamptz,
  assigned_to         uuid references auth.users(id),
  remarks             text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_applications_service_id     on applications(service_id);
create index if not exists idx_applications_org_id         on applications(organization_id);
create index if not exists idx_applications_status         on applications(status);
create index if not exists idx_applications_reference      on applications(reference_number);

-- ─── APPLICATION TIMELINE ────────────────────────────────────
create table if not exists application_timeline (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  action          text not null,
  from_stage      text,
  to_stage        text,
  performed_by    uuid references auth.users(id),
  performer_name  text,
  performer_email text,
  performer_role  text,
  comments        text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

create index if not exists idx_timeline_application_id on application_timeline(application_id);

-- ─── APPLICATION DOCUMENTS ───────────────────────────────────
create table if not exists application_documents (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  field_name      text,
  file_name       text not null,
  file_url        text not null,
  file_size       int,
  mime_type       text,
  uploaded_by     uuid references auth.users(id),
  verified        boolean default false,
  verified_by     uuid references auth.users(id),
  verified_at     timestamptz,
  ocr_result      jsonb,
  created_at      timestamptz default now()
);

-- ─── APPLICATION QUERIES ─────────────────────────────────────
create table if not exists application_queries (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  query_text      text not null,
  raised_by       uuid references auth.users(id),
  raised_by_name  text,
  response_text   text,
  responded_by    uuid references auth.users(id),
  responded_at    timestamptz,
  status          text default 'open' check (status in ('open','answered','closed')),
  created_at      timestamptz default now()
);

-- ─── SERVICE FEE RULES ───────────────────────────────────────
create table if not exists service_fee_rules (
  id                  uuid primary key default uuid_generate_v4(),
  service_id          uuid not null references services(id) on delete cascade,
  name                text not null,
  description         text,
  condition_field     text,
  condition_operator  text check (condition_operator in ('eq','neq','gt','lt','gte','lte','contains')),
  condition_value     text,
  fee_amount          numeric(12,2) not null default 0,
  fee_type            text default 'fixed' check (fee_type in ('fixed','percentage','per_unit')),
  is_active           boolean default true,
  sort_order          int default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_fee_rules_service_id on service_fee_rules(service_id);

-- ─── PAYMENT TRANSACTIONS ────────────────────────────────────
create table if not exists payment_transactions (
  id                      uuid primary key default uuid_generate_v4(),
  application_id          uuid not null references applications(id) on delete cascade,
  organization_id         uuid not null references organizations(id),
  amount                  numeric(12,2) not null,
  currency                text default 'USD',
  payment_method          text not null
                            check (payment_method in ('online_card','online_upi','offline_cash','offline_check','offline_bank','offline_other')),
  payment_gateway         text,
  gateway_transaction_id  text,
  gateway_payment_url     text,
  stripe_payment_intent   text,
  status                  text default 'pending'
                            check (status in ('pending','processing','completed','failed','refunded')),
  payment_date            timestamptz,
  receipt_number          text unique,
  recorded_by             uuid references auth.users(id),
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists idx_payments_application_id on payment_transactions(application_id);

-- ─── GENERATED DOCUMENTS ─────────────────────────────────────
create table if not exists generated_documents (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  document_type   text not null check (document_type in ('certificate','receipt','acknowledgement','rejection_letter','query_letter')),
  file_name       text not null,
  file_url        text not null,
  file_size       int,
  generated_by    uuid references auth.users(id),
  created_at      timestamptz default now()
);

-- ─── PLUGINS (Marketplace) ───────────────────────────────────
create table if not exists plugins (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  category        text check (category in ('document_verification','payment','integration','analytics','communication')),
  provider        text,
  version         text default '1.0.0',
  config_schema   jsonb default '{}',
  is_active       boolean default true,
  pricing_model   text default 'free' check (pricing_model in ('free','per_use','monthly')),
  price_per_use   numeric(8,4),
  monthly_price   numeric(8,2),
  icon_url        text,
  documentation_url text,
  created_at      timestamptz default now()
);

-- ─── SERVICE PLUGINS (Installed per service) ─────────────────
create table if not exists service_plugins (
  id              uuid primary key default uuid_generate_v4(),
  service_id      uuid not null references services(id) on delete cascade,
  plugin_id       uuid not null references plugins(id),
  config          jsonb default '{}',
  is_enabled      boolean default true,
  installed_by    uuid references auth.users(id),
  installed_at    timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(service_id, plugin_id)
);

-- ─── NOTIFICATION LOGS ───────────────────────────────────────
create table if not exists notification_logs (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid references applications(id) on delete cascade,
  organization_id uuid references organizations(id),
  type            text check (type in ('email','sms','in_app')),
  template_type   text,
  recipient_email text,
  recipient_phone text,
  subject         text,
  body            text,
  status          text default 'sent' check (status in ('sent','failed','pending')),
  error_message   text,
  sent_at         timestamptz default now()
);

-- ─── AUDIT LOGS ──────────────────────────────────────────────
create table if not exists audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id),
  user_id         uuid references auth.users(id),
  user_email      text,
  action          text not null,
  resource_type   text not null,
  resource_id     text,
  old_values      jsonb,
  new_values      jsonb,
  ip_address      text,
  user_agent      text,
  created_at      timestamptz default now()
);

create index if not exists idx_audit_org_id      on audit_logs(organization_id);
create index if not exists idx_audit_user_id     on audit_logs(user_id);
create index if not exists idx_audit_action      on audit_logs(action);
create index if not exists idx_audit_created_at  on audit_logs(created_at);

-- ─── updated_at TRIGGERS ─────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_applications_updated_at') then
    create trigger set_applications_updated_at before update on applications for each row execute function update_updated_at_column();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_fee_rules_updated_at') then
    create trigger set_fee_rules_updated_at before update on service_fee_rules for each row execute function update_updated_at_column();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_payments_updated_at') then
    create trigger set_payments_updated_at before update on payment_transactions for each row execute function update_updated_at_column();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_template_defs_updated_at') then
    create trigger set_template_defs_updated_at before update on service_template_definitions for each row execute function update_updated_at_column();
  end if;
end $$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table applications                enable row level security;
alter table application_timeline        enable row level security;
alter table application_documents       enable row level security;
alter table application_queries         enable row level security;
alter table service_fee_rules           enable row level security;
alter table payment_transactions        enable row level security;
alter table generated_documents         enable row level security;
alter table plugins                     enable row level security;
alter table service_plugins             enable row level security;
alter table notification_logs           enable row level security;
alter table audit_logs                  enable row level security;
alter table service_template_definitions enable row level security;

-- Drop policies first so re-runs are idempotent
drop policy if exists "Org members access applications"          on applications;
drop policy if exists "Org members access timeline"              on application_timeline;
drop policy if exists "Org members access documents"             on application_documents;
drop policy if exists "Org members access queries"               on application_queries;
drop policy if exists "Org members access fee rules"             on service_fee_rules;
drop policy if exists "Org members access payments"              on payment_transactions;
drop policy if exists "Anyone can read plugins"                  on plugins;
drop policy if exists "Org members access service plugins"       on service_plugins;
drop policy if exists "Org members access audit logs"            on audit_logs;
drop policy if exists "Org members access notification logs"     on notification_logs;
drop policy if exists "Org members access generated documents"   on generated_documents;
drop policy if exists "Anyone can read template definitions"     on service_template_definitions;

-- RLS: applications — org members see their org's applications
create policy "Org members access applications"
  on applications for all
  using (organization_id in (
    select id from organizations where user_id = auth.uid()
  ));

-- RLS: application_timeline — via application
create policy "Org members access timeline"
  on application_timeline for all
  using (application_id in (
    select id from applications where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: application_documents — via application
create policy "Org members access documents"
  on application_documents for all
  using (application_id in (
    select id from applications where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: application_queries — via application
create policy "Org members access queries"
  on application_queries for all
  using (application_id in (
    select id from applications where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: fee rules — org service owners
create policy "Org members access fee rules"
  on service_fee_rules for all
  using (service_id in (
    select id from services where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: payment transactions — via application org
create policy "Org members access payments"
  on payment_transactions for all
  using (organization_id in (
    select id from organizations where user_id = auth.uid()
  ));

-- RLS: plugins — everyone can read, nobody can write from frontend
create policy "Anyone can read plugins"
  on plugins for select using (true);

-- RLS: service_plugins — org members
create policy "Org members access service plugins"
  on service_plugins for all
  using (service_id in (
    select id from services where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: audit_logs — org members see their own
create policy "Org members access audit logs"
  on audit_logs for select
  using (organization_id in (
    select id from organizations where user_id = auth.uid()
  ));

-- RLS: notification_logs — org members
create policy "Org members access notification logs"
  on notification_logs for select
  using (organization_id in (
    select id from organizations where user_id = auth.uid()
  ));

-- RLS: generated_documents — via application
create policy "Org members access generated documents"
  on generated_documents for all
  using (application_id in (
    select id from applications where organization_id in (
      select id from organizations where user_id = auth.uid()
    )
  ));

-- RLS: template definitions — everyone reads, only service_role writes
create policy "Anyone can read template definitions"
  on service_template_definitions for select using (true);

-- ─── SEED: Plugin Marketplace ────────────────────────────────
insert into plugins (name, description, category, provider, version, pricing_model, price_per_use, config_schema) values
  ('OCR Document Verification',
   'Automatically verify uploaded ID cards, licenses, and permits using optical character recognition.',
   'document_verification', 'LNP Built-in', '1.0.0', 'per_use', 0.05,
   '{"fields": [{"key": "confidence_threshold", "label": "Confidence Threshold", "type": "number", "default": 0.85}]}'),
  ('Stripe Payment Gateway',
   'Accept online card payments for permit fees. Supports Visa, Mastercard, Amex.',
   'payment', 'Stripe', '1.0.0', 'free', null,
   '{"fields": [{"key": "publishable_key", "label": "Stripe Publishable Key", "type": "text"}, {"key": "webhook_secret", "label": "Webhook Secret", "type": "password"}]}'),
  ('Twilio SMS Notifications',
   'Send SMS notifications to applicants at each workflow stage.',
   'communication', 'Twilio', '1.0.0', 'per_use', 0.01,
   '{"fields": [{"key": "account_sid", "label": "Account SID", "type": "text"}, {"key": "auth_token", "label": "Auth Token", "type": "password"}, {"key": "from_number", "label": "From Number", "type": "text"}]}'),
  ('Google Maps Address Validator',
   'Validate and auto-complete address fields using Google Maps API.',
   'integration', 'Google', '1.0.0', 'per_use', 0.002,
   '{"fields": [{"key": "api_key", "label": "Google Maps API Key", "type": "password"}]}'),
  ('DocuSign E-Signature',
   'Request legally binding digital signatures on issued certificates and approvals.',
   'integration', 'DocuSign', '1.0.0', 'monthly', null,
   '{"fields": [{"key": "integration_key", "label": "Integration Key", "type": "text"}, {"key": "account_id", "label": "Account ID", "type": "text"}]}'),
  ('SLA Tracker',
   'Track application processing times against SLA targets. Get alerts when SLAs are breached.',
   'analytics', 'LNP Built-in', '1.0.0', 'free', null,
   '{"fields": [{"key": "warning_threshold", "label": "Warning at % of SLA", "type": "number", "default": 80}, {"key": "alert_email", "label": "Alert Email", "type": "text"}]}')
on conflict do nothing;

-- ─── SEED: Service Template Definitions ──────────────────────
insert into service_template_definitions (name, description, category, icon, features, estimated_setup_time) values
  ('Business License', 'Standard business operating license for commercial entities.', 'Business & Commerce', 'building-2', array['Application Form','Document Upload','Fee Calculation','Certificate Generation'], '2-3 hours'),
  ('Trade License', 'License for trade and commerce activities in the jurisdiction.', 'Business & Commerce', 'store', array['Application Form','Background Check','Fee Schedule','Annual Renewal'], '2-4 hours'),
  ('Building Permit', 'Permit for new construction and major renovation projects.', 'Construction & Building', 'hard-hat', array['Site Plans Upload','Multi-stage Review','Inspection Checklist','Permit Certificate'], '4-6 hours'),
  ('Demolition Permit', 'Permit required for demolition of existing structures.', 'Construction & Building', 'hammer', array['Safety Assessment','Environmental Review','Approval Workflow','Completion Certificate'], '3-5 hours'),
  ('Food License', 'Health and safety license for food service establishments.', 'Public Safety & Health', 'utensils', array['Health Inspection','Document Verification','Expiry Tracking','Renewal Workflow'], '2-3 hours'),
  ('Fire Safety Certificate', 'Fire safety compliance certificate for buildings.', 'Public Safety & Health', 'flame', array['Inspection Checklist','Equipment Verification','Certificate Generation','Annual Renewal'], '3-4 hours'),
  ('Water Connection', 'Application for new water supply connection.', 'Utilities & Infrastructure', 'droplets', array['Site Assessment','Technical Review','Fee Calculation','Connection Certificate'], '4-8 hours'),
  ('Electricity Connection', 'Application for new electrical connection to premises.', 'Utilities & Infrastructure', 'zap', array['Load Assessment','Safety Inspection','Fee Calculation','Connection Approval'], '4-8 hours')
on conflict do nothing;
