-- Run this in the Supabase SQL Editor to create the table for the data collection portal.
-- Dashboard: https://supabase.com/dashboard/project/icyliohsxqhvslvxrqtt/sql

create table if not exists implementation_configs (
  id              uuid primary key default gen_random_uuid(),
  org_name        text not null,
  department_name text,
  country         text,
  config_data     jsonb not null,
  status          text not null default 'draft',
  current_step    int  not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (org_name)
);

-- If you already ran the previous version, add the missing column:
-- alter table implementation_configs add column if not exists current_step int not null default 1;

-- Allow anonymous reads and writes (for the portal without auth)
alter table implementation_configs enable row level security;

create policy "anon_insert" on implementation_configs
  for insert with check (true);

create policy "anon_select" on implementation_configs
  for select using (true);

create policy "anon_update" on implementation_configs
  for update using (true);
