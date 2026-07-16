-- ════════════════════════════════════════════════════════════════════
--  استخراج كيان العميل (Client) ورسم العلاقات (Client -> Registration)
-- ════════════════════════════════════════════════════════════════════

-- 1) إضافة عمود client_id لجدول registrations
alter table public.registrations 
    add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists registrations_client_id_idx on public.registrations(client_id);

-- 2) وظيفة لاستخراج وترحيل البيانات الحالية من registrations إلى clients
do $$
declare
    r record;
    c_id uuid;
    phone_val text;
    email_val text;
    passport_val text;
begin
    for r in 
        select id, full_name, email, notes, user_id, created_at, updated_at, form_data
        from public.registrations
    loop
        phone_val := r.form_data->>'phone';
        email_val := r.email;
        passport_val := r.form_data->>'passport_number';

        -- تنظيف القيم لتفادي NULLs الفارغة
        if phone_val = '' then phone_val := null; end if;
        if email_val = '' then email_val := null; end if;
        if passport_val = '' then passport_val := null; end if;

        -- البحث عن عميل موجود بنفس الهاتف أو الإيميل أو الجواز
        c_id := null;
        if phone_val is not null then
            select id into c_id from public.clients where phone = phone_val limit 1;
        end if;

        if c_id is null and email_val is not null then
            select id into c_id from public.clients where email = email_val limit 1;
        end if;

        if c_id is null and passport_val is not null then
            select id into c_id from public.clients where passport_number = passport_val limit 1;
        end if;

        -- إذا لم نجد عميلاً، نقوم بإنشائه
        if c_id is null then
            insert into public.clients (
                id,
                full_name_as_passport,
                first_name,
                last_name,
                date_of_birth,
                place_of_birth,
                sex,
                nationality,
                marital_status,
                residence_country,
                city,
                full_address,
                passport_number,
                passport_type,
                passport_issue_date,
                passport_expiry_date,
                passport_place_of_issue,
                passport_copy_url,
                email,
                phone,
                whatsapp_number,
                alt_phone,
                employer_name,
                workplace_type,
                work_address,
                work_city,
                work_governorate,
                job_title,
                department,
                professional_specialty,
                work_phone,
                work_email,
                company_website,
                previous_schengen_visa,
                schengen_visas_last_5y,
                other_residence_permit,
                linked_user_id,
                notes,
                created_by,
                created_at,
                updated_at
            ) values (
                gen_random_uuid(),
                coalesce(r.full_name, 'عميل غير معروف'),
                r.form_data->>'first_name',
                r.form_data->>'last_name',
                case when (r.form_data->>'date_of_birth') is not null and (r.form_data->>'date_of_birth') <> '' then (r.form_data->>'date_of_birth')::date else null end,
                r.form_data->>'place_of_birth',
                r.form_data->>'sex',
                r.form_data->>'nationality',
                r.form_data->>'marital_status',
                r.form_data->>'residence_country',
                r.form_data->>'city',
                r.form_data->>'full_address',
                passport_val,
                r.form_data->>'passport_type',
                case when (r.form_data->>'passport_issue_date') is not null and (r.form_data->>'passport_issue_date') <> '' then (r.form_data->>'passport_issue_date')::date else null end,
                case when (r.form_data->>'passport_expiry_date') is not null and (r.form_data->>'passport_expiry_date') <> '' then (r.form_data->>'passport_expiry_date')::date else null end,
                r.form_data->>'passport_place_of_issue',
                r.form_data->>'passport_copy', -- يحتفظ بمسار المرفق إن وجد
                email_val,
                phone_val,
                coalesce(r.form_data->>'whatsapp', r.form_data->>'whatsapp_number'),
                r.form_data->>'alt_phone',
                coalesce(r.form_data->>'employer_name', r.form_data->>'company'),
                r.form_data->>'workplace_type',
                r.form_data->>'work_address',
                r.form_data->>'work_city',
                r.form_data->>'work_governorate',
                coalesce(r.form_data->>'job_title', r.form_data->>'position'),
                r.form_data->>'department',
                r.form_data->>'professional_specialty',
                r.form_data->>'work_phone',
                r.form_data->>'work_email',
                r.form_data->>'company_website',
                coalesce((r.form_data->>'previous_schengen_visa')::boolean, false),
                case when (r.form_data->>'schengen_visas_last_5y') is not null then (r.form_data->>'schengen_visas_last_5y')::jsonb else null end,
                case when (r.form_data->>'other_residence_permit') is not null then (r.form_data->>'other_residence_permit')::jsonb else null end,
                r.user_id,
                r.notes,
                null, -- لا نعرف الموظف المنشئ للعميل مباشرة في registrations القديمة
                r.created_at,
                r.updated_at
            ) returning id into c_id;
        end if;

        -- ربط التسجيل بالعميل
        update public.registrations
        set client_id = c_id
        where id = r.id;
    end loop;
end $$;
