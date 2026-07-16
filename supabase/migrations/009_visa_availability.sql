-- ════════════════════════════════════════════════════════════════════
--  نظام مراقبة توفر مواعيد مراكز الفيزا — Visa Availability Monitor
-- ════════════════════════════════════════════════════════════════════

-- 1) جدول مراكز التأشيرات (visa_centers)
CREATE TABLE IF NOT EXISTS public.visa_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    visa_type TEXT NOT NULL,
    visa_category TEXT NOT NULL,
    service TEXT NOT NULL DEFAULT 'Standard',
    website_url TEXT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) جدول فتحات المواعيد وتوفرها (visa_availability_slots)
CREATE TABLE IF NOT EXISTS public.visa_availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.visa_centers(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'limited', 'booked', 'unavailable', 'assigned', 'booking_attempted', 'expired')),
    assigned_registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT visa_availability_slots_uniq UNIQUE (center_id, slot_date, slot_time)
);

CREATE INDEX IF NOT EXISTS vas_center_date_idx ON public.visa_availability_slots (center_id, slot_date);

-- 3) سجل التدقيق والتحديثات (visa_availability_logs)
CREATE TABLE IF NOT EXISTS public.visa_availability_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES public.visa_centers(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    performed_by_name TEXT NOT NULL,
    action TEXT NOT NULL,
    screenshot_url TEXT,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS val_center_idx ON public.visa_availability_logs (center_id, created_at DESC);

-- 4) ملاحظات الموظفين (visa_staff_notes)
CREATE TABLE IF NOT EXISTS public.visa_staff_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) تفعيل RLS
ALTER TABLE public.visa_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_availability_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_staff_notes ENABLE ROW LEVEL SECURITY;

-- 6) سياسات الوصول (للموظفين والمدراء فقط)
DROP POLICY IF EXISTS visa_centers_staff ON public.visa_centers;
CREATE POLICY visa_centers_staff ON public.visa_centers
    FOR ALL USING (public.is_staff() or public.is_admin()) WITH CHECK (public.is_staff() or public.is_admin());

DROP POLICY IF EXISTS visa_availability_slots_staff ON public.visa_availability_slots;
CREATE POLICY visa_availability_slots_staff ON public.visa_availability_slots
    FOR ALL USING (public.is_staff() or public.is_admin()) WITH CHECK (public.is_staff() or public.is_admin());

DROP POLICY IF EXISTS visa_availability_logs_staff ON public.visa_availability_logs;
CREATE POLICY visa_availability_logs_staff ON public.visa_availability_logs
    FOR ALL USING (public.is_staff() or public.is_admin()) WITH CHECK (public.is_staff() or public.is_admin());

DROP POLICY IF EXISTS visa_staff_notes_staff ON public.visa_staff_notes;
CREATE POLICY visa_staff_notes_staff ON public.visa_staff_notes
    FOR ALL USING (public.is_staff() or public.is_admin()) WITH CHECK (public.is_staff() or public.is_admin());

-- 7) إدخال البيانات الأولية التجريبية (Seeding)
INSERT INTO public.visa_centers (id, name, country, city, visa_type, visa_category, service, website_url, updated_by_name)
VALUES
  ('c0011111-1111-1111-1111-111111111111', 'TLScontact - France', 'France', 'Baghdad, Iraq', 'Short Stay (Schengen)', 'Business', 'Standard', 'https://visas-fr.tlscontact.com/visa/iq/iqBGW2fr/home', 'Noor Al-Shakri'),
  ('c0022222-2222-2222-2222-222222222222', 'VFS Global - Italy', 'Italy', 'Baghdad, Iraq', 'Short Stay (Schengen)', 'Business', 'Standard', 'https://visa.vfsglobal.com/irq/en/ita', 'Ahmed Hassan'),
  ('c0033333-3333-3333-3333-333333333333', 'BLS International - Spain', 'Spain', 'Baghdad, Iraq', 'Short Stay (Schengen)', 'Business', 'Standard', 'https://iraq.blsspainvisa.com/', 'Noor Al-Shakri')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  visa_type = EXCLUDED.visa_type,
  visa_category = EXCLUDED.visa_category,
  service = EXCLUDED.service,
  website_url = EXCLUDED.website_url,
  updated_by_name = EXCLUDED.updated_by_name;

INSERT INTO public.visa_staff_notes (id, note)
VALUES ('d0000000-0000-0000-0000-000000000000', 'Please log any manual checks or changes using Log Update so the team stays informed.')
ON CONFLICT (id) DO UPDATE SET note = EXCLUDED.note;

-- إدخال السجلات التجريبية
INSERT INTO public.visa_availability_logs (center_id, performed_by_name, action, created_at)
VALUES
  ('c0011111-1111-1111-1111-111111111111', 'Noor Al-Shakri', 'Manual check completed.', now() - interval '10 minutes'),
  ('c0022222-2222-2222-2222-222222222222', 'Ahmed Hassan', 'Updated morning availability.', now() - interval '20 minutes'),
  ('c0033333-3333-3333-3333-333333333333', 'Noor Al-Shakri', 'Manual check completed.', now() - interval '35 minutes')
ON CONFLICT DO NOTHING;
