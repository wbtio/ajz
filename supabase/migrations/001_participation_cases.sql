-- ════════════════════════════════════════════════════════════════════
--  نظام إدارة ملفات المشاركة — Participation Case Management
--  الهيكل: Client → Participation Case → Event
--  قلب النظام هو "ملف المشاركة" بدلاً من ربط العميل بالحدث مباشرة.
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1) جدول العملاء (clients) — كيان مستقل قابل لإعادة الاستخدام
--    نفس العميل قد يشارك في أكثر من فعالية.
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),

    -- المعلومات الأساسية
    full_name_as_passport text not null,
    first_name text,
    last_name text,
    date_of_birth date,
    place_of_birth text,
    sex text,                          -- male / female
    nationality text,
    marital_status text,
    residence_country text,
    city text,
    full_address text,

    -- معلومات الجواز (AS PER PASSPORT)
    passport_number text,
    passport_type text,
    passport_issue_date date,
    passport_expiry_date date,
    passport_place_of_issue text,
    passport_copy_url text,

    -- معلومات الاتصال
    email text,
    phone text,
    whatsapp_number text,
    alt_phone text,

    -- المعلومات المهنية
    employer_name text,
    workplace_type text,
    work_address text,
    work_city text,
    work_governorate text,
    job_title text,
    department text,
    professional_specialty text,
    work_phone text,
    work_email text,
    company_website text,

    -- معلومات الفيزا/الإقامة
    previous_schengen_visa boolean default false,
    schengen_visas_last_5y jsonb,      -- مصفوفة نسخ/مراجع
    other_residence_permit jsonb,      -- { country, expiry_date, ... }

    -- الترابط
    linked_user_id uuid references public.users(id) on delete set null,  -- إن كان للعميل حساب على الموقع
    notes text,
    created_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists clients_phone_idx        on public.clients (phone);
create index if not exists clients_email_idx        on public.clients (email);
create index if not exists clients_passport_idx     on public.clients (passport_number);
create index if not exists clients_linked_user_idx  on public.clients (linked_user_id);
create index if not exists clients_name_idx         on public.clients (full_name_as_passport);

-- ────────────────────────────────────────────────────────────────────
-- 2) جدول ملفات المشاركة (participation_cases) — قلب النظام
--    يربط العميل بفعالية مع تتبّع كامل للحالة والخدمة والدفع.
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.participation_cases (
    id uuid primary key default gen_random_uuid(),
    case_number text unique not null,                  -- JAZ-PC-2026-00451

    client_id uuid not null references public.clients(id) on delete cascade,
    event_id  uuid not null references public.events(id)  on delete cascade,

    -- الإسناد والمصدر
    assigned_employee_id uuid references public.users(id) on delete set null,
    branch text,
    source text,                                       -- facebook_ad / instagram / whatsapp / website / referral / existing_client / direct_visit / chamber / union / association / company_referral / jaz_database / other
    campaign_name text,

    -- الخدمة
    service_package text,                              -- registration_only / registration_invitation / registration_invitation_visa / full

    -- السعر والدفع
    service_price numeric default 0,
    discount_amount numeric default 0,
    discount_reason text,
    discount_approved_by uuid references public.users(id) on delete set null,
    final_price numeric default 0,
    currency text default 'USD',                       -- USD / IQD / EUR
    payment_method text,
    payment_status text default 'not_invoiced',        -- not_invoiced / invoice_issued / payment_pending / partially_paid / paid / refunded / cancelled

    -- الحالة العامة (28 حالة من المستند)
    status text default 'new_request',

    -- معلومات الإغلاق
    closure_reason text,                               -- registration_completed / participation_completed / visa_completed / client_cancelled / event_cancelled / no_response / rejected / other
    closed_at timestamptz,

    -- إدارية
    created_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists pc_client_idx     on public.participation_cases (client_id);
create index if not exists pc_event_idx      on public.participation_cases (event_id);
create index if not exists pc_status_idx     on public.participation_cases (status);
create index if not exists pc_case_number    on public.participation_cases (case_number);
create index if not exists pc_employee_idx   on public.participation_cases (assigned_employee_id);
create index if not exists pc_created_at     on public.participation_cases (created_at desc);

-- ────────────────────────────────────────────────────────────────────
-- 3) جدول سجل النشاط (case_events) — Activity Log لكل ملف
--    "من سوّى؟ شنو سوّى؟ متى سوّى؟ ومن وافق؟"
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_events (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    action text not null,                  -- case_created / client_created / passport_uploaded / payment_confirmed / status_changed / returned_for_correction / qc_approved / ...
    description text,
    performed_by uuid references public.users(id) on delete set null,
    performed_by_name text,                -- اسم الموظف المخزّن لحظة الحدث (للعرض حتى لو حُذف الحساب)
    metadata jsonb,                        -- تفاصيل إضافية: { old_value, new_value, reason, ... }

    created_at timestamptz not null default now()
);

create index if not exists ce_case_idx       on public.case_events (case_id, created_at desc);
create index if not exists ce_performed_idx  on public.case_events (performed_by);

-- ────────────────────────────────────────────────────────────────────
-- 4) تحديث updated_at تلقائياً
-- ────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists clients_touch_updated_at on public.clients;
create trigger clients_touch_updated_at
    before update on public.clients
    for each row execute function public.touch_updated_at();

drop trigger if exists participation_cases_touch_updated_at on public.participation_cases;
create trigger participation_cases_touch_updated_at
    before update on public.participation_cases
    for each row execute function public.touch_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- 5) سياسات RLS — الوصول للموظفين (admin/team) فقط في المرحلة الأولى
-- ────────────────────────────────────────────────────────────────────
alter table public.clients             enable row level security;
alter table public.participation_cases enable row level security;
alter table public.case_events         enable row level security;

-- العملاء: موظفو لوحة التحكم يرون/يعدّلون كل شيء
create policy "clients_staff_select" on public.clients
    for select using (public.is_staff() or public.is_admin());
create policy "clients_staff_modify" on public.clients
    for all using (public.is_staff() or public.is_admin())
    with check (public.is_staff() or public.is_admin());

-- ملفات المشاركة
create policy "participation_cases_staff_select" on public.participation_cases
    for select using (public.is_staff() or public.is_admin());
create policy "participation_cases_staff_modify" on public.participation_cases
    for all using (public.is_staff() or public.is_admin())
    with check (public.is_staff() or public.is_admin());

-- سجل النشاط
create policy "case_events_staff_select" on public.case_events
    for select using (public.is_staff() or public.is_admin());
create policy "case_events_staff_insert" on public.case_events
    for insert with check (public.is_staff() or public.is_admin());
