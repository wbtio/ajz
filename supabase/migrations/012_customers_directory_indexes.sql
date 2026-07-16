-- Customers directory performance indexes.
-- The existing clients table remains the canonical customer record.
create index if not exists clients_name_lower_idx
  on public.clients (lower(full_name_as_passport));

create index if not exists clients_passport_number_idx
  on public.clients (passport_number)
  where passport_number is not null;

create index if not exists clients_phone_idx
  on public.clients (phone)
  where phone is not null;

create index if not exists clients_email_lower_idx
  on public.clients (lower(email))
  where email is not null;

create index if not exists registrations_client_updated_idx
  on public.registrations (client_id, updated_at desc);

create index if not exists visa_slots_registration_date_idx
  on public.visa_availability_slots (assigned_registration_id, slot_date, slot_time)
  where assigned_registration_id is not null;

create index if not exists registration_edits_registration_created_idx
  on public.registration_edits (registration_id, created_at desc);
