-- ============================================================
-- License & Permits SaaS — Initial Schema
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/tohfuvzcktwksivrivhq/sql
--
-- After running, go to Authentication > Providers and enable Google.
-- Add http://localhost:8080/onboarding and your production URL
-- to Authentication > URL Configuration > Redirect URLs.
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

create table public.organizations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  -- NOT NULL prevents null; the CHECK prevents empty / whitespace-only strings
  name         text not null check (trim(name) <> ''),
  country      text,
  department   text,
  language     text default 'English',
  logo_url     text,
  theme_color  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.services (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  template_id      text not null,
  approval_level   text not null default 'single'
                     check (approval_level in ('single', 'two-level', 'multi-level')),
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'live')),
  auth_method      text not null default 'email'
                     check (auth_method in ('email', 'sso', 'otp')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table public.service_deployment (
  id                  uuid primary key default gen_random_uuid(),
  service_id          uuid not null references public.services(id) on delete cascade,
  availability_scope  text not null default 'entire_state',
  selected_items      text[] default '{}',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (service_id)
);

create table public.team_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  -- service_id is NULL for system-level roles (system_admin, service_designer)
  -- and set for service-specific roles (field_inspector, approver, etc.)
  service_id       uuid references public.services(id) on delete set null,
  name             text not null,
  email            text not null,
  role             text not null default 'service_designer'
                     check (role in (
                       'system_admin', 'service_designer',
                       'field_inspector', 'approver', 'counter_operator', 'viewer'
                     )),
  status           text not null default 'pending'
                     check (status in ('active', 'pending', 'inactive')),
  created_at       timestamptz default now()
);

-- Stores config for forms, roles, notifications, checklists, documents
create table public.service_configs (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.services(id) on delete cascade,
  module_name  text not null,
  config_type  text not null
                 check (config_type in ('forms', 'roles', 'notifications', 'checklists', 'documents')),
  config_data  jsonb not null default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (service_id, module_name, config_type)
);

-- ── updated_at trigger ──────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

create trigger set_service_deployment_updated_at
  before update on public.service_deployment
  for each row execute function public.handle_updated_at();

create trigger set_service_configs_updated_at
  before update on public.service_configs
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────

alter table public.organizations     enable row level security;
alter table public.services          enable row level security;
alter table public.service_deployment enable row level security;
alter table public.team_members      enable row level security;
alter table public.service_configs   enable row level security;

-- organizations: owner only
create policy "Users manage their own organization"
  on public.organizations for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- services: belong to user's org
create policy "Users manage services in their org"
  on public.services for all
  using (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  );

-- service_deployment: belong to user's services
create policy "Users manage deployment for their services"
  on public.service_deployment for all
  using (
    service_id in (
      select s.id from public.services s
      join public.organizations o on s.organization_id = o.id
      where o.user_id = auth.uid()
    )
  )
  with check (
    service_id in (
      select s.id from public.services s
      join public.organizations o on s.organization_id = o.id
      where o.user_id = auth.uid()
    )
  );

-- team_members: belong to user's org
create policy "Users manage team members in their org"
  on public.team_members for all
  using (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  );

-- service_configs: belong to user's services
create policy "Users manage configs for their services"
  on public.service_configs for all
  using (
    service_id in (
      select s.id from public.services s
      join public.organizations o on s.organization_id = o.id
      where o.user_id = auth.uid()
    )
  )
  with check (
    service_id in (
      select s.id from public.services s
      join public.organizations o on s.organization_id = o.id
      where o.user_id = auth.uid()
    )
  );

-- ── Migration: team_members — service_id, status, updated role values ────────
-- Run once on any database created before this change.
do $$
begin
  -- Add service_id column
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'service_id'
  ) then
    alter table public.team_members
      add column service_id uuid references public.services(id) on delete set null;
  end if;

  -- Add status column
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'team_members' and column_name = 'status'
  ) then
    alter table public.team_members
      add column status text not null default 'pending'
        check (status in ('active', 'pending', 'inactive'));
  end if;

  -- Drop the old role check constraint and replace with expanded set
  if exists (
    select 1 from pg_constraint
    where conname = 'team_members_role_check'
      and conrelid = 'public.team_members'::regclass
  ) then
    alter table public.team_members drop constraint team_members_role_check;
  end if;

  alter table public.team_members
    add constraint team_members_role_check
      check (role in (
        'system_admin', 'service_designer',
        'field_inspector', 'approver', 'counter_operator', 'viewer'
      ));
end $$;

-- ── Migration: enforce non-empty org name on existing databases ──────────────
-- Run this once against any database created before this constraint was added.
-- Safe to run multiple times (DO NOTHING if constraint already exists).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'organizations_name_not_empty'
      and conrelid = 'public.organizations'::regclass
  ) then
    alter table public.organizations
      add constraint organizations_name_not_empty
      check (trim(name) <> '');
  end if;
end $$;
