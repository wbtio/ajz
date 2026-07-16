-- Add client profile fields expected by participation-case actions
alter table public.clients
    add column if not exists national_id text,
    add column if not exists title_salutation text,
    add column if not exists passport_history jsonb not null default '[]'::jsonb;

create index if not exists clients_national_id_idx on public.clients (national_id);
