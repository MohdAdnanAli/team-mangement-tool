-- DarkMatter Labs team management tool: initial shared-data schema.
-- Apply this file in the Supabase SQL Editor for the first setup. Future
-- changes should be added as new files in this directory, never edited here.

create extension if not exists pgcrypto;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.members (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  role text not null default '',
  capacity integer not null default 40 check (capacity >= 0),
  avatar text not null default '',
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table public.projects (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#4FD1C5',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table public.tasks (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  project_id text references public.projects(id) on delete set null,
  assignee_id text references public.members(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'progress', 'review', 'done')),
  priority text not null default 'med' check (priority in ('low', 'med', 'high')),
  due date,
  hours integer not null default 4 check (hours >= 0),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table public.bills (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id text references public.members(id) on delete set null,
  bill_number text not null,
  period_start date,
  period_end date,
  flags jsonb not null default '[]'::jsonb,
  tax_rate numeric(5,2) not null default 18 check (tax_rate >= 0),
  issue_date date,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  notes text not null default '',
  party text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  unique (workspace_id, bill_number)
);

create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  bill_id text not null references public.bills(id) on delete cascade,
  description text not null default '',
  hours numeric(10,2) not null default 0 check (hours >= 0),
  rate numeric(12,2) not null default 0 check (rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agreements (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  party text not null default '',
  amount text not null default '',
  status text not null default 'active' check (status in ('active', 'settled', 'expired')),
  date_agreed date,
  terms text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table public.checkins (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id text not null references public.members(id) on delete cascade,
  date date not null,
  behaviour_score integer not null default 3 check (behaviour_score between 1 and 5),
  behaviour_note text not null default '',
  nature_score integer not null default 3 check (nature_score between 1 and 5),
  nature_note text not null default '',
  deadline_score integer not null default 3 check (deadline_score between 1 and 5),
  deadline_note text not null default '',
  extra_score integer not null default 3 check (extra_score between 1 and 5),
  extra_note text not null default '',
  extra_tags jsonb not null default '[]'::jsonb,
  next_actions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create index tasks_workspace_id_idx on public.tasks(workspace_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_assignee_id_idx on public.tasks(assignee_id);
create index checkins_workspace_member_date_idx on public.checkins(workspace_id, member_id, date desc);
create index bills_workspace_id_idx on public.bills(workspace_id);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'manager')
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['workspaces','workspace_members','members','projects','tasks','bills','line_items','agreements','checkins']
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Members may read their workspace. Managers/admins own operational changes.
create policy "workspace members can read workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "workspace managers can update workspaces" on public.workspaces for update to authenticated using (public.can_manage_workspace(id)) with check (public.can_manage_workspace(id));
create policy "workspace members can read memberships" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "workspace admins can manage memberships" on public.workspace_members for all to authenticated using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

do $$
declare table_name text;
begin
  foreach table_name in array array['members','projects','tasks','bills','agreements','checkins']
  loop
    execute format('create policy "workspace members can read %1$s" on public.%1$I for select to authenticated using (public.is_workspace_member(workspace_id))', table_name);
    execute format('create policy "workspace managers can manage %1$s" on public.%1$I for all to authenticated using (public.can_manage_workspace(workspace_id)) with check (public.can_manage_workspace(workspace_id))', table_name);
  end loop;
end $$;

create policy "workspace members can read line items" on public.line_items for select to authenticated using (exists (select 1 from public.bills b where b.id = line_items.bill_id and public.is_workspace_member(b.workspace_id)));
create policy "workspace managers can manage line items" on public.line_items for all to authenticated using (exists (select 1 from public.bills b where b.id = line_items.bill_id and public.can_manage_workspace(b.workspace_id))) with check (exists (select 1 from public.bills b where b.id = line_items.bill_id and public.can_manage_workspace(b.workspace_id)));

do $$
declare table_name text;
begin
  foreach table_name in array array['workspaces','members','projects','tasks','bills','line_items','agreements','checkins']
  loop
    execute format('create trigger set_%1$s_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select on public.workspaces, public.workspace_members, public.members, public.projects, public.tasks, public.bills, public.line_items, public.agreements, public.checkins to authenticated;
grant insert, update, delete on public.workspace_members, public.members, public.projects, public.tasks, public.bills, public.line_items, public.agreements, public.checkins to authenticated;
grant update on public.workspaces to authenticated;
grant execute on function public.is_workspace_member(uuid), public.can_manage_workspace(uuid), public.is_workspace_admin(uuid) to authenticated;
