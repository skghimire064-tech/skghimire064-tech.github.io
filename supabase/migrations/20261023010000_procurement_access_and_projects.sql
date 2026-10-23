create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.procurement_projects (
  id text primary key,
  owner_id uuid references auth.users (id) on delete set null,
  title text not null,
  office_name text not null,
  procurement_type text not null check (procurement_type in ('works', 'goods', 'consulting', 'services')),
  method_id text not null,
  estimated_amount numeric not null check (estimated_amount >= 0),
  current_stage_id text not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  budget_source text not null default '',
  start_date text not null default '',
  target_completion_date text not null default '',
  contractor_name text,
  contract_amount numeric,
  checklist_status jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists procurement_projects_owner_id_idx
  on public.procurement_projects (owner_id);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.user_profiles as profile
  where profile.id = (select auth.uid())
$$;

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_username text;
begin
  profile_username := lower(coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  ));

  insert into public.user_profiles (id, username)
  values (new.id, profile_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_user_profile();

alter table public.user_profiles enable row level security;
alter table public.procurement_projects enable row level security;

drop policy if exists "Users can read their profile and admins can read all profiles"
  on public.user_profiles;
create policy "Users can read their profile and admins can read all profiles"
  on public.user_profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or (select public.current_app_role()) = 'admin');

drop policy if exists "Users can read their own projects and admins can read all projects"
  on public.procurement_projects;
create policy "Users can read their own projects and admins can read all projects"
  on public.procurement_projects
  for select
  to authenticated
  using (owner_id = (select auth.uid()) or (select public.current_app_role()) = 'admin');

drop policy if exists "Users can create their own projects"
  on public.procurement_projects;
create policy "Users can create their own projects"
  on public.procurement_projects
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Users and admins can update permitted projects"
  on public.procurement_projects;
create policy "Users and admins can update permitted projects"
  on public.procurement_projects
  for update
  to authenticated
  using (owner_id = (select auth.uid()) or (select public.current_app_role()) = 'admin')
  with check (owner_id = (select auth.uid()) or (select public.current_app_role()) = 'admin');

drop policy if exists "Users and admins can delete permitted projects"
  on public.procurement_projects;
create policy "Users and admins can delete permitted projects"
  on public.procurement_projects
  for delete
  to authenticated
  using (owner_id = (select auth.uid()) or (select public.current_app_role()) = 'admin');

revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;
revoke all on public.procurement_projects from anon, authenticated;
grant select, insert, update, delete on public.procurement_projects to authenticated;
