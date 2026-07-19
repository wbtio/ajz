create table if not exists public.creative_prompt_studio (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('settings', 'prompt')),
  title text,
  payload jsonb not null default '{}'::jsonb,
  provider text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creative_prompt_studio_owner_kind_idx
  on public.creative_prompt_studio(owner_id, kind, updated_at desc);

alter table public.creative_prompt_studio enable row level security;

create policy "Staff can read creative prompt studio"
  on public.creative_prompt_studio for select to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role in ('admin', 'team')));

create policy "Staff can create creative prompt studio records"
  on public.creative_prompt_studio for insert to authenticated
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.role in ('admin', 'team')) and owner_id = auth.uid());

create policy "Staff can update creative prompt studio records"
  on public.creative_prompt_studio for update to authenticated
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role in ('admin', 'team')) and owner_id = auth.uid())
  with check (owner_id = auth.uid());
