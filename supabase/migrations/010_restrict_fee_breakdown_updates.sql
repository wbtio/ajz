-- Fee values are public to dashboard members but may only be changed by the
-- designated finance administrator. This trigger protects the rule even when
-- an update is sent outside the dashboard UI.
create or replace function public.restrict_registration_fee_breakdown_updates()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.additional_data -> 'fee_breakdown'
       is distinct from old.additional_data -> 'fee_breakdown'
     and lower(coalesce(auth.jwt() ->> 'email', '')) <> 'admin@ajz.local'
     and coalesce(auth.role(), '') <> 'service_role'
  then
    raise exception 'Only admin@ajz.local may change the fee breakdown.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists restrict_registration_fee_breakdown_updates on public.registrations;

create trigger restrict_registration_fee_breakdown_updates
before update of additional_data on public.registrations
for each row
execute function public.restrict_registration_fee_breakdown_updates();

