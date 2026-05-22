-- Create custom auth function to get Clerk user ID from JWT claims inside public schema
create or replace function public.clerk_user_id()
returns text
as $$
  select nullif(auth.jwt()->>'sub', '')::text;
$$ language sql stable;

-- Create workflows table
create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Clerk user ID stored as text
  name text not null,
  description text,
  graph jsonb not null default '{"nodes": [], "edges": []}'::jsonb,
  is_active boolean not null default false,
  trigger_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create executions table
create table public.executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  status text not null, -- 'running' | 'success' | 'error'
  trigger_data jsonb not null default '{}'::jsonb,
  node_results jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Create credentials table
create table public.credentials (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Clerk user ID stored as text
  service text not null, -- 'notion'
  label text not null,
  encrypted_token text not null,
  created_at timestamptz not null default now()
);

-- Enable Row-Level Security (RLS)
alter table public.workflows enable row level security;
alter table public.executions enable row level security;
alter table public.credentials enable row level security;

-- RLS Policies for workflows
create policy "Users can perform all actions on their own workflows"
  on public.workflows
  for all
  using (user_id = public.clerk_user_id())
  with check (user_id = public.clerk_user_id());

create policy "Anyone can read active workflows by trigger slug"
  on public.workflows
  for select
  using (is_active = true);

-- RLS Policies for executions
create policy "Users can view executions of their own workflows"
  on public.executions
  for select
  using (
    exists (
      select 1 from public.workflows w
      where w.id = executions.workflow_id and w.user_id = public.clerk_user_id()
    )
  );

create policy "Users can create executions for their own workflows"
  on public.executions
  for insert
  with check (
    exists (
      select 1 from public.workflows w
      where w.id = executions.workflow_id and w.user_id = public.clerk_user_id()
    )
  );

-- RLS Policies for credentials
create policy "Users can perform all actions on their own credentials"
  on public.credentials
  for all
  using (user_id = public.clerk_user_id())
  with check (user_id = public.clerk_user_id());
