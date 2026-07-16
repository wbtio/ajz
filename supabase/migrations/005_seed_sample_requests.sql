-- ════════════════════════════════════════════════════════════════════
--  بيانات أمثلة لصفحة «الطلبات» ولوحة التحكم
--  12 طلب مشاركة عبر مختلف مراحل السيرورة + عميل واحد كامل البيانات.
--  مُكرَّر بأمان: يعيد التشغيل دون تكرار بفضل WHERE NOT EXISTS على case_number.
-- ════════════════════════════════════════════════════════════════════

WITH seed AS (
    SELECT
        el->>'case_number'                       AS case_number,
        (el->>'event_id')::uuid                  AS event_id,
        el->>'full_name'                         AS full_name,
        el->>'email'                             AS email,
        el->>'case_status'                       AS case_status,
        el->>'case_source'                       AS case_source,
        el->>'campaign_name'                     AS campaign_name,
        el->>'service_package'                   AS service_package,
        el->>'payment_status'                    AS payment_status,
        (el->>'total_amount')::numeric           AS total_amount,
        el->>'currency'                          AS currency,
        (el->>'assigned_employee_id')::uuid      AS assigned_employee_id,
        (el->>'days_ago')::int                   AS days_ago,
        (el->'form_data')::jsonb                 AS form_data,
        (el->'additional_data')::jsonb           AS additional_data,
        CASE el->>'service_package'
            WHEN 'registration_only'
                THEN '[{"key":"passport","label":"نسخة الجواز","required":true},{"key":"photo","label":"صورة شخصية","required":true},{"key":"professional_evidence","label":"إثبات مهني","required":false}]'::jsonb
            WHEN 'registration_invitation'
                THEN '[{"key":"passport","label":"نسخة الجواز","required":true},{"key":"photo","label":"صورة شخصية","required":true},{"key":"professional_evidence","label":"إثبات مهني","required":false},{"key":"invitation","label":"الدعوة الرسمية","required":true}]'::jsonb
            WHEN 'registration_invitation_visa'
                THEN '[{"key":"passport","label":"نسخة الجواز","required":true},{"key":"photo","label":"صورة شخصية","required":true},{"key":"professional_evidence","label":"إثبات مهني","required":false},{"key":"invitation","label":"الدعوة الرسمية","required":true},{"key":"insurance","label":"وثيقة التأمين","required":true},{"key":"tls_appointment","label":"تأكيد موعد TLS","required":true}]'::jsonb
            WHEN 'full'
                THEN '[{"key":"passport","label":"نسخة الجواز","required":true},{"key":"photo","label":"صورة شخصية","required":true},{"key":"professional_evidence","label":"إثبات مهني","required":false},{"key":"invitation","label":"الدعوة الرسمية","required":true},{"key":"insurance","label":"وثيقة التأمين","required":true},{"key":"tls_appointment","label":"تأكيد موعد TLS","required":true}]'::jsonb
            ELSE '[]'::jsonb
        END AS requirements
    FROM jsonb_array_elements(
        '[
            {
                "case_number": "JAZ-PC-2026-00001",
                "event_id": "3134857f-05b1-483f-a644-bb4201e1bea5",
                "full_name": "أحمد كريم عبدالله",
                "email": "ahmed.karim@example.com",
                "case_status": "registration_in_progress",
                "case_source": "referral",
                "campaign_name": "حملة منتدى الطيران 2026",
                "service_package": "registration_invitation_visa",
                "payment_status": "paid",
                "total_amount": "1850",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 30,
                "form_data": {"phone":"+9647701234567","whatsapp":"+9647701234567","nationality":"العراق","place_of_birth":"بغداد","marital_status":"married","passport_number":"RZ2845913","passport_type":"عادي (P)","passport_issue_date":"2022-03-15","passport_place_of_issue":"بغداد","passport_expiry_date":"2032-03-14","date_of_birth":"1985-06-10","sex":"male","residence_country":"العراق","city":"بغداد","full_address":"بغداد - الكرادة - شارع ٦٢","job_title":"مدير تسويق","employer_name":"شركة النور للتجارة العامة","workplace_type":"شركة خاصة","work_address":"بغداد - المنصور - شارع الأميرات","work_city":"بغداد","work_governorate":"بغداد","department":"إدارة التسويق","professional_specialty":"التسويق الرقمي","company_website":"https://alnoor-trade.iq","work_phone":"+9647809876543","work_email":"ahmed.karim@alnoor-trade.iq"},
                "additional_data": {"payment_currency":"USD","payment_discount":{"amount":150,"reason":"عميل دائم","approved":true},"payment_receipt":{"number":"RC-2026-0042","date":"2026-06-28","method":"bank_transfer"}}
            },
            {
                "case_number": "JAZ-PC-2026-00002",
                "event_id": "4a4cb83a-baf3-4e87-b8e7-79f0efe3d9ae",
                "full_name": "زينب حسن جابر",
                "email": "zainab.hassan@example.com",
                "case_status": "new_request",
                "case_source": "whatsapp",
                "campaign_name": "",
                "service_package": "registration_only",
                "payment_status": "pending",
                "total_amount": "0",
                "currency": "USD",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 1,
                "form_data": {"phone":"+9647712345678"},
                "additional_data": {}
            },
            {
                "case_number": "JAZ-PC-2026-00003",
                "event_id": "03b5a3e1-3fc0-4aee-ad21-b203132c0c3a",
                "full_name": "محمد جاسم الساعدي",
                "email": "mohammed.jasim@example.com",
                "case_status": "data_incomplete",
                "case_source": "website",
                "campaign_name": "نموذج الموقع",
                "service_package": "registration_invitation",
                "payment_status": "pending",
                "total_amount": "0",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 2,
                "form_data": {"phone":"+9647811223344","nationality":"العراق","city":"البصرة"},
                "additional_data": {}
            },
            {
                "case_number": "JAZ-PC-2026-00004",
                "event_id": "aaebd543-88d2-4a4e-88da-1c617ae50932",
                "full_name": "فاطمة علي حسن",
                "email": "fatema.ali@example.com",
                "case_status": "payment_pending",
                "case_source": "facebook_ad",
                "campaign_name": "إعلان سولاربلازا",
                "service_package": "full",
                "payment_status": "pending",
                "total_amount": "3200",
                "currency": "EUR",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 5,
                "form_data": {"phone":"+9647905566778","nationality":"العراق","city":"أربيل","passport_number":"PA9988776","date_of_birth":"1990-02-20"},
                "additional_data": {"payment_currency":"EUR"}
            },
            {
                "case_number": "JAZ-PC-2026-00005",
                "event_id": "7544b5cb-b9b4-4750-8d0d-65676c0c4707",
                "full_name": "مصطفى صبري خليل",
                "email": "mostafa.sabri@example.com",
                "case_status": "payment_confirmed",
                "case_source": "referral",
                "campaign_name": "",
                "service_package": "registration_only",
                "payment_status": "paid",
                "total_amount": "450",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 7,
                "form_data": {"phone":"+9647723344556","nationality":"العراق","city":"الموصل"},
                "additional_data": {"payment_currency":"USD","payment_receipt":{"number":"RC-2026-0045","date":"2026-07-01","method":"cash"}}
            },
            {
                "case_number": "JAZ-PC-2026-00006",
                "event_id": "3134857f-05b1-483f-a644-bb4201e1bea5",
                "full_name": "نور الهدى ياسر",
                "email": "noor.yaser@example.com",
                "case_status": "invitation_requested",
                "case_source": "instagram",
                "campaign_name": "ريلز إنستغرام",
                "service_package": "registration_invitation_visa",
                "payment_status": "partially_paid",
                "total_amount": "2100",
                "currency": "USD",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 9,
                "form_data": {"phone":"+9647833445566","nationality":"العراق","city":"النجف","passport_number":"NG5522118"},
                "additional_data": {"payment_currency":"USD","payment_receipt":{"number":"RC-2026-0048","date":"2026-06-25","method":"online"}}
            },
            {
                "case_number": "JAZ-PC-2026-00007",
                "event_id": "d809188a-c232-46e1-9db8-d500b16985d5",
                "full_name": "حسين عبدالرزاق كاظم",
                "email": "hussein.abd@example.com",
                "case_status": "invitation_received",
                "case_source": "direct_visit",
                "campaign_name": "",
                "service_package": "full",
                "payment_status": "paid",
                "total_amount": "3400",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 12,
                "form_data": {"phone":"+9647709988776","nationality":"العراق","city":"بغداد","passport_number":"BG3344552","date_of_birth":"1978-11-05","employer_name":"وزارة الصحة"},
                "additional_data": {"payment_currency":"USD","payment_receipt":{"number":"RC-2026-0051","date":"2026-06-20","method":"bank_transfer"}}
            },
            {
                "case_number": "JAZ-PC-2026-00008",
                "event_id": "aaebd543-88d2-4a4e-88da-1c617ae50932",
                "full_name": "سارة إبراهيم محمود",
                "email": "sara.ibrahim@example.com",
                "case_status": "visa_in_progress",
                "case_source": "whatsapp",
                "campaign_name": "واتساب - قائمة العملاء",
                "service_package": "full",
                "payment_status": "paid",
                "total_amount": "3600",
                "currency": "EUR",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 15,
                "form_data": {"phone":"+9647814422553","nationality":"العراق","city":"كربلاء","passport_number":"KB7766550","date_of_birth":"1992-08-14","employer_name":"جامعة كربلاء"},
                "additional_data": {"payment_currency":"EUR","payment_receipt":{"number":"RC-2026-0053","date":"2026-06-15","method":"bank_transfer"}}
            },
            {
                "case_number": "JAZ-PC-2026-00009",
                "event_id": "462b9c5a-abe5-406c-907f-15830e15f8eb",
                "full_name": "عمر ياسين طه",
                "email": "omar.yasin@example.com",
                "case_status": "appointment_booked",
                "case_source": "website",
                "campaign_name": "نموذج الموقع",
                "service_package": "registration_invitation_visa",
                "payment_status": "paid",
                "total_amount": "2400",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 18,
                "form_data": {"phone":"+9647728877665","nationality":"العراق","city":"الديوانية","passport_number":"DQ2211998","employer_name":"شركة الفرات"},
                "additional_data": {"payment_currency":"USD","payment_receipt":{"number":"RC-2026-0055","date":"2026-06-10","method":"online"}}
            },
            {
                "case_number": "JAZ-PC-2026-00010",
                "event_id": "4a4cb83a-baf3-4e87-b8e7-79f0efe3d9ae",
                "full_name": "ليلى أحمد فاضل",
                "email": "laila.ahmed@example.com",
                "case_status": "completed",
                "case_source": "referral",
                "campaign_name": "",
                "service_package": "registration_only",
                "payment_status": "paid",
                "total_amount": "450",
                "currency": "USD",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 25,
                "form_data": {"phone":"+9647803322119","nationality":"العراق","city":"بغداد"},
                "additional_data": {"payment_currency":"USD","payment_receipt":{"number":"RC-2026-0058","date":"2026-05-28","method":"cash"}}
            },
            {
                "case_number": "JAZ-PC-2026-00011",
                "event_id": "3134857f-05b1-483f-a644-bb4201e1bea5",
                "full_name": "كرار محمد عبدالحسين",
                "email": "karar.mohammed@example.com",
                "case_status": "correction_required",
                "case_source": "facebook_ad",
                "campaign_name": "إعلان منتدى الطيران",
                "service_package": "full",
                "payment_status": "pending",
                "total_amount": "3300",
                "currency": "USD",
                "assigned_employee_id": "91c66427-c95a-4987-afe5-80fbe2c7eb63",
                "days_ago": 3,
                "form_data": {"phone":"+9647714455667","nationality":"العراق","city":"العمارة","passport_number":"AM9988112","date_of_birth":"1988-04-22","employer_name":"مجموعة شركات الجنوب"},
                "additional_data": {"payment_currency":"USD"}
            },
            {
                "case_number": "JAZ-PC-2026-00012",
                "event_id": "03b5a3e1-3fc0-4aee-ad21-b203132c0c3a",
                "full_name": "دعاء سعد حميد",
                "email": "duaa.saad@example.com",
                "case_status": "on_hold",
                "case_source": "whatsapp",
                "campaign_name": "واتساب",
                "service_package": "registration_invitation",
                "payment_status": "pending",
                "total_amount": "1200",
                "currency": "USD",
                "assigned_employee_id": "e92df156-82f2-49c8-8f21-3b2db4de784a",
                "days_ago": 20,
                "form_data": {"phone":"+9647906677889","nationality":"العراق","city":"الكوت"},
                "additional_data": {"payment_currency":"USD"}
            }
        ]'::jsonb
    ) AS el
)
INSERT INTO public.registrations (
    event_id, user_id, status, current_step,
    full_name, email, notes,
    form_data, additional_data, selected_services,
    total_amount, payment_status,
    case_number, case_status, case_source, campaign_name, assigned_employee_id,
    created_at, updated_at
)
SELECT
    s.event_id,
    NULL,
    'confirmed',
    5,
    s.full_name,
    s.email,
    NULL,
    s.form_data,
    COALESCE(NULLIF(s.additional_data::text, '{}')::jsonb, '{}'::jsonb),
    jsonb_build_object('service_package', s.service_package, 'requirements', s.requirements),
    s.total_amount,
    s.payment_status,
    s.case_number,
    s.case_status,
    NULLIF(s.case_source, ''),
    NULLIF(s.campaign_name, ''),
    s.assigned_employee_id,
    now() - (s.days_ago * interval '1 day'),
    now() - (s.days_ago * interval '1 day')
FROM seed s
WHERE NOT EXISTS (
    SELECT 1 FROM public.registrations r WHERE r.case_number = s.case_number
);

-- سجل نشاط للطلب النموذجي الكامل (العميل 00001)
INSERT INTO public.registration_events (registration_id, action, description, performed_by, performed_by_name, created_at)
SELECT r.id, e.action, e.description,
       '91c66427-c95a-4987-afe5-80fbe2c7eb63',
       'admin@ajz.local',
       r.created_at + (e.ago || ' hours')::interval
FROM public.registrations r
JOIN (
    VALUES
        ('JAZ-PC-2026-00001', 'case_created',          'تم إنشاء الطلب', 0),
        ('JAZ-PC-2026-00001', 'client_updated',        'تم استكمال بيانات العميل والجواز', 4),
        ('JAZ-PC-2026-00001', 'payment_updated',       'تم تسجيل الدفع وإيصال رقم RC-2026-0042', 30),
        ('JAZ-PC-2026-00001', 'status_changed',        'تم تأكيد الدفع تلقائياً', 31),
        ('JAZ-PC-2026-00001', 'document_uploaded',     'تم رفع وثيقة: نسخة الجواز', 40)
) AS e(cn, action, description, ago)
  ON e.cn = r.case_number
WHERE NOT EXISTS (
    SELECT 1 FROM public.registration_events re
    WHERE re.registration_id = r.id AND re.action = e.action
);
