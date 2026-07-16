create table if not exists public.ai_application_reviews (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  score integer not null default 0 check (score between 0 and 100),
  review jsonb not null,
  file_names jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_application_reviews_registration_idx on public.ai_application_reviews(registration_id, created_at desc);
alter table public.ai_application_reviews enable row level security;
create policy "Staff can read AI application reviews" on public.ai_application_reviews for select to authenticated using (exists (select 1 from public.users where users.id = auth.uid() and users.role in ('admin', 'team')));
create policy "Staff can create AI application reviews" on public.ai_application_reviews for insert to authenticated with check (exists (select 1 from public.users where users.id = auth.uid() and users.role in ('admin', 'team')) and created_by = auth.uid());
