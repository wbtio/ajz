-- ════════════════════════════════════════════════════════════════════
--  دمج «استقبال الطلبات» مع صفحة «الطلبات» الرئيسية
--  أي صلاحية تشير للمسار القديم /work/intake تُعاد تخريطها إلى المسار
--  الرئيسي /dashboard/participation-cases (مع تجنّب التكرار).
-- ════════════════════════════════════════════════════════════════════

update public.users u
set permissions = (
    select array_agg(distinct x)
    from unnest(
        array_replace(
            coalesce(u.permissions, ARRAY[]::text[]),
            '/dashboard/participation-cases/work/intake',
            '/dashboard/participation-cases'
        )
    ) as t(x)
)
where u.permissions @> ARRAY['/dashboard/participation-cases/work/intake'];
