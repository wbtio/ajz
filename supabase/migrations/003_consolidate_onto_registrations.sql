-- ════════════════════════════════════════════════════════════════════
--  دمج نظام ملفات المشاركة فوق جدول registrations الموجود
--  بدلاً من جداول موازية، نضيف أعمدة إدارية إلى registrations نفسها.
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1) إضافة أعمدة إدارية إلى registrations
--    status الأصلي (pending/confirmed/...) يبقى كما هو للنموذج العام.
--    case_status الجديد = المسار التفصيلي للموظفين (new_request → ... → completed).
-- ────────────────────────────────────────────────────────────────────
alter table public.registrations
    add column if not exists case_number text,
    add column if not exists case_status text default 'new_request',
    add column if not exists assigned_employee_id uuid references public.users(id) on delete set null,
    add column if not exists case_source text,
    add column if not exists campaign_name text;

-- قيد التفرد على case_number فقط للصفوف التي لها قيمة (تسجيلات المشاركة المُدارة)
-- نستخدم partial unique index حتى لا يتعارض مع التسجيلات العادية (NULL)
create unique index if not exists registrations_case_number_uniq
    on public.registrations (case_number)
    where case_number is not null;

create index if not exists registrations_case_status_idx
    on public.registrations (case_status);

create index if not exists registrations_assigned_employee_idx
    on public.registrations (assigned_employee_id);

-- ────────────────────────────────────────────────────────────────────
-- 2) جدول سجل النشاط العام (يحل محل case_events)
--    registration_edits الأصلي يُبقى (للتعديلات التي يقوم بها العميل عبر النموذج).
--    هذا الجدول للأحداث الإدارية العامة (تغيير حالة، تحديث فيزا، رفع وثيقة...).
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.registration_events (
    id uuid primary key default gen_random_uuid(),
    registration_id uuid not null references public.registrations(id) on delete cascade,
    action text not null,                    -- case_created / status_changed / visa_updated / payment_updated / document_uploaded / ...
    description text,
    performed_by uuid references public.users(id) on delete set null,
    performed_by_name text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists registration_events_reg_idx
    on public.registration_events (registration_id, created_at desc);

-- RLS: موظفو لوحة التحكم فقط
alter table public.registration_events enable row level security;

create policy "registration_events_staff_select" on public.registration_events
    for select using (public.is_staff() or public.is_admin());

create policy "registration_events_staff_insert" on public.registration_events
    for insert with check (public.is_staff() or public.is_admin());
