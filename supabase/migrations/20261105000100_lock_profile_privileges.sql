-- Bengalot — lock privileged profile columns and trust only Auth app_metadata.
--
-- Apply this migration in the Supabase SQL editor or with the CLI.

begin;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.id := old.id;
    new.email := old.email;
    new.role := old.role;
    new.is_blacklisted := old.is_blacklisted;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

revoke all on function public.protect_profile_privileges() from public, anon, authenticated;

-- Staff RLS checks use Auth app_metadata, not the editable profiles.role column.
create or replace function public.bengalot_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role') in
        ('super_admin','admin','manager','order_staff','content_editor','support'),
      false
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_blacklisted = false
    );
$$;

grant execute on function public.bengalot_is_staff() to anon, authenticated;

-- Trigger functions are not public RPC endpoints.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

commit;
