'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'

export function TrainingDevelopmentSection() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'

  return (
    <section className="relative overflow-hidden bg-[#f4f7fa] py-7 sm:py-9" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute -end-24 -top-24 h-56 w-56 rounded-full bg-[#b08d4b]/10 blur-3xl" />
      <Container>
        <div className="relative">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#101a33] sm:text-3xl">
              {isAr ? 'التدريب والتطوير' : 'Training and Development'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#53647d] sm:text-base">
              {isAr
                ? 'تعمل الجاز على تنظيم برامج تدريبية ومهنية مرتبطة بمتطلبات سوق العمل والقطاعات المتخصصة.'
                : 'This section focuses on organizing training and professional development programs aligned with labor market requirements and specialized sectors.'}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#53647d] sm:text-base">
              {isAr
                ? 'يركز هذا القسم على تطوير المهارات المهنية، وتعزيز المعرفة العملية، ودعم الأفراد والمؤسسات من خلال برامج تدريبية معتمدة.'
                : 'It aims to develop professional skills, enhance practical knowledge, and support individuals and institutions through accredited training programs.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/training"
                className="inline-flex items-center rounded-full bg-[#001a33] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0b3156]"
              >
                {isAr ? 'استعرض برامج التدريب' : 'Explore Training Programs'}
              </Link>
              <Link
                href="/partnership"
                className="inline-flex items-center rounded-full border border-[#001a33] px-5 py-2.5 text-xs font-bold text-[#001a33] transition-colors hover:bg-[#001a33] hover:text-white"
              >
                {isAr ? 'ابدأ مشاركتك معنا' : 'Start Your Participation with Us'}
              </Link>
            </div>
          </div>

        </div>

      </Container>
    </section>
  )
}
