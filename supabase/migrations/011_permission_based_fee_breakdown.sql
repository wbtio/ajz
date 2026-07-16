-- Keep fee-breakdown protection aligned with the dashboard RBAC model.
-- Admins and team members explicitly granted Finance & Payments may edit it.
create or replace function public.restrict_registration_fee_breakdown_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  actor_permissions text[];
begin
  if new.additional_data -> 'fee_breakdown'
       is distinct from old.additional_data -> 'fee_breakdown'
  then
    select role, permissions
      into actor_role, actor_permissions
      from public.users
     where id = auth.uid();

    if coalesce(actor_role, '') <> 'admin'
       and not (
         coalesce(actor_role, '') = 'team'
         and '/dashboard/participation-cases/work/payment' = any(coalesce(actor_permissions, '{}'::text[]))
       )
       and coalesce(auth.role(), '') <> 'service_role'
    then
      raise exception 'Finance & Payments permission required to change the fee breakdown.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists restrict_registration_fee_breakdown_updates on public.registrations;

create trigger restrict_registration_fee_breakdown_updates
before update of additional_data on public.registrations
for each row
execute function public.restrict_registration_fee_breakdown_updates();
