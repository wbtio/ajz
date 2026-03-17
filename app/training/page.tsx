'use client'

import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowLeft, ArrowRight, Mail, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function TrainingPage() {
  const { t, locale } = useI18n()
  const isRTL = locale === 'ar'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <div className="pt-36 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <Container>
        {/* Empty State - Single Container */}
        <div className="rounded-[2rem] border border-gray-200 bg-[linear-gradient(135deg,#faf8f5,#ffffff)] p-8 shadow-sm lg:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8b0000]/10 text-[#8b0000]">
              <GraduationCap className="h-8 w-8" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900 lg:text-3xl">
              {t.trainingPage.emptyTitle}
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-gray-600 lg:text-lg">
              {t.trainingPage.emptyDescription}
            </p>

            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/sectors">
                <Button className="h-12 rounded-2xl bg-[#8b0000] px-6 hover:bg-[#a01010]">
                  <Users className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {isRTL ? 'استكشف القطاعات' : 'Explore Sectors'}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 rounded-2xl px-6">
                  <Mail className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {t.trainingPage.emptyButton}
                </Button>
              </Link>
            </div>

            {/* Features List */}
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-6 text-left">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                {isRTL ? 'ما يميز برامجنا التدريبية' : 'What makes our training programs special'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8f5]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b0000]/10 text-[#8b0000]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {t.trainingPage.features.experts.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8f5]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b0000]/10 text-[#8b0000]">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {t.trainingPage.features.certificates.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8f5]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b0000]/10 text-[#8b0000]">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {t.trainingPage.features.interactive.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
