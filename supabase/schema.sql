-- IA SDR MD Marketing - Supabase schema
-- Run this script in the Supabase SQL Editor for a fresh project.

create extension if not exists "pgcrypto";

do $$ begin
  create type campaign_status as enum ('draft', 'pending', 'processing', 'completed', 'partial', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_status as enum ('new', 'qualified', 'contacted', 'replied', 'meeting_scheduled', 'proposal_sent', 'won', 'lost', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_temperature as enum ('cold', 'warm', 'hot');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type task_status as enum ('pending', 'in_progress', 'completed', 'canceled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type priority_level as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type message_status as enum ('draft', 'copied', 'sent', 'failed', 'replied');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type message_direction as enum ('inbound', 'outbound');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type integration_status as enum ('disconnected', 'connected', 'expired', 'error');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type meeting_status as enum ('scheduled', 'completed', 'canceled', 'no_show');
exception when duplicate_object then null;
end $$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  website text,
  segment text,
  city text,
  state text,
  country text not null default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'member',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists organization_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  legal_name text,
  segment text,
  description text,
  website_url text,
  instagram_url text,
  linkedin_url text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  country text not null default 'BR',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  source text,
  data_confidence integer not null default 0 check (data_confidence between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  name text,
  role text,
  email text,
  phone text,
  whatsapp text,
  instagram_url text,
  linkedin_url text,
  is_primary boolean not null default false,
  source text,
  data_confidence integer not null default 0 check (data_confidence between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pipelines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  probability integer not null default 0 check (probability between 0 and 100),
  color text not null default '#0F766E',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pipeline_id, position)
);

create table if not exists prospecting_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  name text not null,
  segment text not null,
  city text not null,
  state text,
  requested_quantity integer not null check (requested_quantity > 0),
  found_quantity integer not null default 0 check (found_quantity >= 0),
  status campaign_status not null default 'draft',
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  primary_contact_id uuid references contacts(id) on delete set null,
  owner_id uuid references profiles(id) on delete set null,
  pipeline_stage_id uuid references pipeline_stages(id) on delete set null,
  status lead_status not null default 'new',
  temperature lead_temperature not null default 'cold',
  origin text,
  source_campaign_id uuid references prospecting_campaigns(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, company_id)
);

create table if not exists prospecting_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  campaign_id uuid not null references prospecting_campaigns(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  raw_data jsonb not null default '{}'::jsonb,
  source text,
  status text not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists data_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text not null,
  provider text,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enrichment_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  status text not null default 'pending',
  provider text,
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  temperature lead_temperature not null default 'cold',
  fit_score integer not null default 0 check (fit_score between 0 and 100),
  urgency_score integer not null default 0 check (urgency_score between 0 and 100),
  digital_presence_score integer not null default 0 check (digital_presence_score between 0 and 100),
  contactability_score integer not null default 0 check (contactability_score between 0 and 100),
  opportunity_score integer not null default 0 check (opportunity_score between 0 and 100),
  reasoning text,
  generated_by text not null default 'system',
  created_at timestamptz not null default now()
);

create table if not exists lead_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  possible_pains jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  recommended_offer text,
  objections jsonb not null default '[]'::jsonb,
  buying_signals jsonb not null default '[]'::jsonb,
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists score_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  weight numeric(6, 2) not null default 1,
  condition jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  channel text not null,
  objective text not null,
  tone text,
  template text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generated_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  template_id uuid references message_templates(id) on delete set null,
  channel text not null,
  objective text not null,
  tone text,
  message text not null,
  status message_status not null default 'draft',
  generated_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  generated_message_id uuid references generated_messages(id) on delete set null,
  channel text not null,
  direction message_direction not null,
  content text,
  status message_status not null default 'draft',
  sent_at timestamptz,
  received_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  owner_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  type text not null default 'follow_up',
  status task_status not null default 'pending',
  priority priority_level not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists follow_up_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists follow_up_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sequence_id uuid not null references follow_up_sequences(id) on delete cascade,
  position integer not null,
  delay_amount integer not null default 1,
  delay_unit text not null default 'day',
  channel text,
  message_template_id uuid references message_templates(id) on delete set null,
  task_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sequence_id, position)
);

create table if not exists lead_follow_up_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  sequence_id uuid not null references follow_up_sequences(id) on delete cascade,
  current_step_id uuid references follow_up_steps(id) on delete set null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  provider text not null,
  status integration_status not null default 'disconnected',
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id, provider)
);

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  owner_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status meeting_status not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Sao_Paulo',
  location text,
  meeting_url text,
  google_calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists meeting_participants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  meeting_id uuid not null references meetings(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  name text,
  email text,
  role text,
  created_at timestamptz not null default now()
);

create table if not exists meeting_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  meeting_id uuid not null references meetings(id) on delete cascade,
  notes text,
  ai_summary text,
  next_steps jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  lead_id uuid references leads(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  meeting_id uuid references meetings(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  date date not null,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, date)
);

create table if not exists ai_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  brand_name text not null default 'MD Marketing',
  business_description text,
  target_audience text,
  main_offers jsonb not null default '[]'::jsonb,
  tone_of_voice text not null default 'consultivo',
  qualification_criteria jsonb not null default '[]'::jsonb,
  disqualification_criteria jsonb not null default '[]'::jsonb,
  default_language text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create table if not exists ai_prompts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text not null,
  prompt text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, type, version)
);

create index if not exists idx_profiles_organization_id on profiles(organization_id);
create index if not exists idx_companies_org_city_segment on companies(organization_id, city, segment);
create index if not exists idx_contacts_company_id on contacts(company_id);
create index if not exists idx_leads_org_status on leads(organization_id, status);
create index if not exists idx_leads_pipeline_stage_id on leads(pipeline_stage_id);
create index if not exists idx_campaigns_org_status on prospecting_campaigns(organization_id, status);
create index if not exists idx_prospecting_results_campaign_id on prospecting_results(campaign_id);
create index if not exists idx_lead_scores_lead_created_at on lead_scores(lead_id, created_at desc);
create index if not exists idx_generated_messages_lead_id on generated_messages(lead_id);
create index if not exists idx_tasks_owner_due_at on tasks(owner_id, due_at);
create index if not exists idx_meetings_owner_starts_at on meetings(owner_id, starts_at);
create index if not exists idx_activities_org_occurred_at on activities(organization_id, occurred_at desc);

do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'profiles', 'organization_settings', 'companies', 'contacts',
    'pipelines', 'pipeline_stages', 'prospecting_campaigns', 'leads',
    'prospecting_results', 'data_sources', 'enrichment_jobs', 'lead_insights',
    'score_rules', 'message_templates', 'generated_messages', 'tasks',
    'follow_up_sequences', 'follow_up_steps', 'lead_follow_up_sequences',
    'integrations', 'meetings', 'meeting_notes', 'ai_settings', 'ai_prompts'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where profiles.organization_id = target_organization_id
      and profiles.user_id = auth.uid()
  );
$$;

do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'profiles', 'organization_settings', 'companies', 'contacts',
    'pipelines', 'pipeline_stages', 'prospecting_campaigns', 'leads',
    'prospecting_results', 'data_sources', 'enrichment_jobs', 'lead_scores',
    'lead_insights', 'score_rules', 'message_templates', 'generated_messages',
    'message_events', 'tasks', 'follow_up_sequences', 'follow_up_steps',
    'lead_follow_up_sequences', 'integrations', 'meetings', 'meeting_participants',
    'meeting_notes', 'activities', 'dashboard_snapshots', 'ai_settings', 'ai_prompts'
  ] loop
    execute format('alter table %I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "Organization members can read organizations" on organizations;
drop policy if exists "Organization members can manage organizations" on organizations;

create policy "Organization members can read organizations"
  on organizations for select
  using (is_org_member(id));

create policy "Organization members can manage organizations"
  on organizations for update
  using (is_org_member(id))
  with check (is_org_member(id));

do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'organization_settings', 'companies', 'contacts', 'pipelines',
    'pipeline_stages', 'prospecting_campaigns', 'leads', 'prospecting_results',
    'data_sources', 'enrichment_jobs', 'lead_scores', 'lead_insights',
    'score_rules', 'message_templates', 'generated_messages', 'message_events',
    'tasks', 'follow_up_sequences', 'follow_up_steps', 'lead_follow_up_sequences',
    'integrations', 'meetings', 'meeting_participants', 'meeting_notes',
    'activities', 'dashboard_snapshots', 'ai_settings', 'ai_prompts'
  ] loop
    execute format('drop policy if exists "Organization members can read %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Organization members can insert %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Organization members can update %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Organization members can delete %s" on %I', table_name, table_name);
    execute format('create policy "Organization members can read %s" on %I for select using (is_org_member(organization_id))', table_name, table_name);
    execute format('create policy "Organization members can insert %s" on %I for insert with check (is_org_member(organization_id))', table_name, table_name);
    execute format('create policy "Organization members can update %s" on %I for update using (is_org_member(organization_id)) with check (is_org_member(organization_id))', table_name, table_name);
    execute format('create policy "Organization members can delete %s" on %I for delete using (is_org_member(organization_id))', table_name, table_name);
  end loop;
end $$;
