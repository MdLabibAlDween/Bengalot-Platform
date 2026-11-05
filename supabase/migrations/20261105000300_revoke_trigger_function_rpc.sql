-- Trigger functions should not be callable as public RPCs.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_privileges() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.protect_profile_privileges() to service_role;
