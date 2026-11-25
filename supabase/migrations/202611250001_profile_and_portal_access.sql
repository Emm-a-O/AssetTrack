-- Add self-service profile details and enforce one portal per account.
-- Apply this migration in Supabase before deploying the matching app release.

alter table public.profiles
  add column if not exists phone text,
  add column if not exists portal text;

update public.profiles
set portal = 'organisation'
where portal is null;

update public.profiles p
set portal = case
  when u.raw_user_meta_data ->> 'portal' = 'household' then 'household'
  else 'organisation'
end
from auth.users u
where u.id = p.id
  and u.raw_user_meta_data ->> 'portal' in ('organisation', 'household');

alter table public.profiles
  alter column portal set default 'organisation',
  alter column portal set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_portal_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_portal_check check (portal in ('organisation', 'household'));
  end if;
end;
$$;

create or replace function public.can_access_assettrack_portal(p_environment text)
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
      and p.portal = p_environment
  );
$$;

create or replace function public.create_assettrack_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, title, department_id, avatar, phone, portal)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'Staff Member',
    new.raw_user_meta_data ->> 'title',
    new.raw_user_meta_data ->> 'department_id',
    new.raw_user_meta_data ->> 'avatar',
    new.raw_user_meta_data ->> 'phone',
    case when new.raw_user_meta_data ->> 'portal' = 'household' then 'household' else 'organisation' end
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name, phone, title, avatar) on public.profiles to authenticated;

drop policy if exists "Signed-in members can read profiles" on public.profiles;
drop policy if exists "Users can read own profile or admins can read all" on public.profiles;
drop policy if exists "Members can read profiles in their portal" on public.profiles;
create policy "Members can read profiles in their portal"
  on public.profiles for select to authenticated
  using (
    (select public.is_assettrack_admin())
    or (select public.can_access_assettrack_portal(portal))
  );

drop policy if exists "Users can update their own display name" on public.profiles;
drop policy if exists "Users can update their own profile details" on public.profiles;
create policy "Users can update their own profile details"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

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
  if auth.uid() is null or not public.can_access_assettrack_portal(p_environment) then
    raise exception 'This account is not assigned to the requested portal';
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

drop policy if exists "Signed-in members can read assets" on public.asset_records;
create policy "Members can read assets in their portal"
  on public.asset_records for select to authenticated
  using ((select public.can_access_assettrack_portal(environment)));

drop policy if exists "Signed-in members can add assets" on public.asset_records;
create policy "Members can add assets in their portal"
  on public.asset_records for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select public.can_access_assettrack_portal(environment))
  );

drop policy if exists "Signed-in members can update assets" on public.asset_records;
create policy "Members can update assets in their portal"
  on public.asset_records for update to authenticated
  using ((select public.can_access_assettrack_portal(environment)))
  with check ((select public.can_access_assettrack_portal(environment)));

revoke all on function public.can_access_assettrack_portal(text) from public, anon;
grant execute on function public.can_access_assettrack_portal(text) to authenticated;
