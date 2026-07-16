-- ════════════════════════════════════════════════════════════════════
--  توسيع قيد payment_status ليتطابق مع خيارات الواجهة
--  الواجهة تدعم: pending, paid, partially_paid, not_invoiced, failed
--  القيد القديم كان يسمح فقط بـ (pending, paid, failed) فيرفض الجزئي/بدون فاتورة.
-- ════════════════════════════════════════════════════════════════════

alter table public.registrations
    drop constraint if exists registrations_payment_status_check;

alter table public.registrations
    add constraint registrations_payment_status_check
    check (payment_status in ('pending', 'paid', 'partially_paid', 'not_invoiced', 'failed'));
