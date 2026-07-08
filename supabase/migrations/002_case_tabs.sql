-- ════════════════════════════════════════════════════════════════════
--  نظام إدارة ملفات المشاركة — المرحلة 2: جداول التبويبات
--  كل تبويب في ملف المشاركة له جدول مستقل (1:1 مع الملف، عدا الوثائق 1:N)
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- 1) case_payments — تبويب الخدمة والدفع (1:1 مع الملف)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_payments (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    service_price numeric default 0,
    discount_amount numeric default 0,
    discount_reason text,
    discount_approved_by uuid references public.users(id) on delete set null,
    final_price numeric default 0,
    currency text default 'USD',                 -- USD / IQD / EUR
    payment_method text,                          -- cash / bank_transfer / card / online
    payment_status text default 'not_invoiced',   -- not_invoiced / invoice_issued / payment_pending / partially_paid / paid / refunded / cancelled

    amount_paid numeric default 0,
    payment_date timestamptz,
    receipt_number text,
    receipt_url text,
    received_by uuid references public.users(id) on delete set null,
    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (case_id)
);

-- ────────────────────────────────────────────────────────────────────
-- 2) case_registrations — تبويب التسجيل والـBadge (1:1 مع الملف)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_registrations (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    registration_website text,
    account_email text,
    registration_date date,
    registration_reference text,
    registration_type text,                       -- visitor / exhibitor / press
    visitor_category text,
    company_name_used text,
    job_title_used text,
    status text default 'not_started',            -- not_started / in_progress / draft / submitted / confirmed

    confirmation_number text,
    confirmation_email text,
    badge_name text,
    badge_number text,
    badge_pdf_url text,
    screenshot_url text,
    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (case_id)
);

-- ────────────────────────────────────────────────────────────────────
-- 3) case_invitations — تبويب الدعوة (1:1 مع الملف)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_invitations (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    invitation_required boolean default true,
    invitation_type text,                         -- individual / company
    request_date date,
    requested_from text,
    organizer_contact text,
    status text default 'required',               -- not_required / required / pending_data / ready / requested / processing / received / correction_required

    invitation_number text,
    issue_date date,
    travel_start_date date,
    travel_end_date date,
    pdf_url text,
    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (case_id)
);

-- ────────────────────────────────────────────────────────────────────
-- 4) case_visas — تبويب الفيزا France/TLS (1:1 مع الملف)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_visas (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    destination_country text default 'France',

    -- حسابات العميل
    france_visas_account_status text default 'not_created',  -- not_created / pending_activation / activated / access_problem
    tls_account_status text default 'not_created',
    account_setup_complete boolean default false,

    -- France-Visas Application
    france_visas_number text,                      -- FRA1BG2026XXXXXXX
    application_start_date date,
    application_status text default 'not_started',  -- not_started / draft / under_review / reference_obtained / pending_appointment / finalized

    -- TLS
    tls_appointment_date timestamptz,
    tls_center text,
    appointment_reference text,
    appointment_pdf_url text,
    appointment_booked boolean default false,

    -- النتيجة
    visa_approved boolean default false,
    visa_decision_date date,

    -- التأمين
    insurance_company text,
    insurance_policy_number text,
    insurance_coverage_start date,
    insurance_coverage_end date,
    insurance_amount numeric default 0,
    insurance_pdf_url text,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (case_id)
);

-- ────────────────────────────────────────────────────────────────────
-- 5) case_documents — تبويب الوثائق والمراقبة (1:N مع الملف)
-- ────────────────────────────────────────────────────────────────────
create table if not exists public.case_documents (
    id uuid primary key default gen_random_uuid(),
    case_id uuid not null references public.participation_cases(id) on delete cascade,

    doc_type text not null,                        -- passport / national_id / photo / invitation / employment_letter / company_docs / professional_evidence / insurance / visa_copy / other
    label text,
    file_url text not null,
    uploaded_by uuid references public.users(id) on delete set null,
    notes text,

    created_at timestamptz not null default now()
);

create index if not exists case_documents_case_idx on public.case_documents (case_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────
-- فهارس + تريغر updated_at + RLS لكل جدول
-- ────────────────────────────────────────────────────────────────────
create index if not exists cp_case_idx on public.case_payments (case_id);
create index if not exists cr_case_idx on public.case_registrations (case_id);
create index if not exists ci_case_idx on public.case_invitations (case_id);
create index if not exists cv_case_idx on public.case_visas (case_id);

drop trigger if exists case_payments_touch on public.case_payments;
create trigger case_payments_touch
    before update on public.case_payments
    for each row execute function public.touch_updated_at();

drop trigger if exists case_registrations_touch on public.case_registrations;
create trigger case_registrations_touch
    before update on public.case_registrations
    for each row execute function public.touch_updated_at();

drop trigger if exists case_invitations_touch on public.case_invitations;
create trigger case_invitations_touch
    before update on public.case_invitations
    for each row execute function public.touch_updated_at();

drop trigger if exists case_visas_touch on public.case_visas;
create trigger case_visas_touch
    before update on public.case_visas
    for each row execute function public.touch_updated_at();

-- تفعيل RLS + سياسات (موظفو لوحة التحكم)
alter table public.case_payments     enable row level security;
alter table public.case_registrations enable row level security;
alter table public.case_invitations  enable row level security;
alter table public.case_visas        enable row level security;
alter table public.case_documents    enable row level security;

create policy "case_payments_staff"     on public.case_payments     for all using (public.is_staff() or public.is_admin()) with check (public.is_staff() or public.is_admin());
create policy "case_registrations_staff" on public.case_registrations for all using (public.is_staff() or public.is_admin()) with check (public.is_staff() or public.is_admin());
create policy "case_invitations_staff"  on public.case_invitations  for all using (public.is_staff() or public.is_admin()) with check (public.is_staff() or public.is_admin());
create policy "case_visas_staff"        on public.case_visas        for all using (public.is_staff() or public.is_admin()) with check (public.is_staff() or public.is_admin());
create policy "case_documents_staff"    on public.case_documents    for all using (public.is_staff() or public.is_admin()) with check (public.is_staff() or public.is_admin());
