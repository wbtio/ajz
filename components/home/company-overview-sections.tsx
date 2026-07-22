'use client'

import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'

export function CompanyOverviewSections() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <section className="bg-[#f5f7fa] py-8 sm:py-10">
        <Container>
          <div className="max-w-4xl">
            <h2 className="text-2xl font-extrabold text-[#101a33] sm:text-3xl">
              {isAr ? 'من نحن' : 'About Our Company'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#53647d] sm:text-base">
              {isAr
                ? 'الجاز شركة متخصصة في تنظيم المعارض والمؤتمرات، وتنسيق المشاركات المهنية والمؤسسية في الفعاليات الدولية المتخصصة. تعمل الشركة على دعم حضور المؤسسات والشركات والمهنيين العراقيين في البيئات الدولية.'
                : 'Joint Annual Zone is a company specialized in organizing exhibitions and conferences and coordinating professional and institutional participation in specialized international events. The company supports the presence of Iraqi institutions, businesses, and professionals in international environments.'}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <Container>
          <div className="max-w-7xl">
            <h2 className="text-2xl font-extrabold text-[#101a33] sm:text-3xl">
              {isAr ? 'لماذا جاز' : 'Why Our Company'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#53647d] sm:text-base">
              {isAr
                ? 'نفدم نموذجاً تنظيمياً متكاملاً يربط بين إدارة المعارض والمؤتمرات، وتنسيق المشاركات الدولية، ودعم الجهات في الوصول إلى الفعاليات المتخصصة بطريقة مهنية ومنظمة.'
                : 'Our Company provides an integrated organizational model that connects exhibition and conference management, international participation coordination, and support for entities in accessing specialized events in a professional and structured manner.'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                isAr
                  ? ['تنظيم المعارض والمؤتمرات', 'نعمل على تنظيم وإدارة الفعاليات.']
                  : ['Exhibition and Conference Organization', 'We organize and manage events.'],
                isAr
                  ? ['تنسيق المشاركات الدولية', 'نساعد المؤسسات والشركات والمهنيين على المشاركة في المعارض والمؤتمرات الدولية.']
                  : ['International Participation Coordination', 'We support institutions, businesses, and professionals in participating in international exhibitions and conferences.'],
                isAr
                  ? ['دعم مؤسسي ومهني', 'ننسق الربط بين المهنيين العراقيين ونظائرهم العالميين.']
                  : ['Institutional and Professional Support', 'We coordinate the connection between Iraqi professionals and their international counterparts.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-extrabold text-[#101a33]">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#53647d]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
