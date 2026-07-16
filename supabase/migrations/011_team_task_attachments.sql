alter table public.team_tasks
    add column if not exists attachments jsonb not null default '[]'::jsonb;
