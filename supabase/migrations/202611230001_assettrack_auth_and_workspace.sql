-- AssetTrack shared authentication and workspace storage.
-- The app stores its existing typed state as JSONB so adding authentication
-- does not discard or reshape its established asset and workflow fields.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'Staff Member'
    check (role in (
      'Platform Administrator',
      'Organisation Administrator',
      'Asset Manager',
      'Department Manager',
      'Staff Member',
      'Auditor'
    )),
  title text,
  department_id text,
  avatar text,
  created_at timestamptz not null default now()
);

create or replace function public.is_assettrack_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('Platform Administrator', 'Organisation Administrator')
  );
$$;

create or replace function public.is_assettrack_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
  );
$$;

create or replace function public.create_assettrack_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, title, department_id, avatar)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'Staff Member',
    new.raw_user_meta_data ->> 'title',
    new.raw_user_meta_data ->> 'department_id',
    new.raw_user_meta_data ->> 'avatar'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_assettrack_auth_user_created on auth.users;
create trigger on_assettrack_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_assettrack_profile();

create table if not exists public.asset_records (
  asset_id text primary key,
  environment text not null check (environment in ('organisation', 'household')),
  data jsonb not null,
  created_by uuid not null references public.profiles (id),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_id_counters (
  environment text primary key check (environment in ('organisation', 'household')),
  last_value integer not null check (last_value >= 0)
);

create or replace function public.next_asset_id(p_environment text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_value integer;
begin
  if p_environment not in ('organisation', 'household') then
    raise exception 'Invalid asset environment';
  end if;
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
  ) then
    raise exception 'A valid AssetTrack account is required';
  end if;

  insert into public.asset_id_counters (environment, last_value)
  values (p_environment, 1)
  on conflict (environment) do update
    set last_value = asset_id_counters.last_value + 1
  returning last_value into next_value;

  if p_environment = 'organisation' then
    return 'AST-' || lpad(next_value::text, 5, '0');
  end if;
  return 'AST-H' || lpad(next_value::text, 3, '0');
end;
$$;

revoke all on function public.next_asset_id(text) from public, anon;
grant execute on function public.next_asset_id(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.asset_records enable row level security;
alter table public.asset_id_counters enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Signed-in members can read profiles" on public.profiles;
drop policy if exists "Users can read own profile or admins can read all" on public.profiles;
create policy "Signed-in members can read profiles"
  on public.profiles for select to authenticated
  using ((select public.is_assettrack_member()));

drop policy if exists "Users can update their own display name" on public.profiles;
create policy "Users can update their own display name"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.asset_records from anon, authenticated;
grant select, insert, update on public.asset_records to authenticated;

drop policy if exists "Signed-in members can read assets" on public.asset_records;
create policy "Signed-in members can read assets"
  on public.asset_records for select to authenticated
  using ((select public.is_assettrack_member()));

drop policy if exists "Signed-in members can add assets" on public.asset_records;
create policy "Signed-in members can add assets"
  on public.asset_records for insert to authenticated
  with check (created_by = (select auth.uid()) and (select public.is_assettrack_member()));

drop policy if exists "Signed-in members can update assets" on public.asset_records;
create policy "Signed-in members can update assets"
  on public.asset_records for update to authenticated
  using ((select public.is_assettrack_member()))
  with check ((select public.is_assettrack_member()));

revoke all on public.asset_id_counters from anon, authenticated;
