'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SectorRegistrationForm } from '@/app/sectors/components/sector-registration-form'
import { getSectorContent } from '@/app/sectors/sector-content'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/database.types'
import { GraduationCap, Mail, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type TrainingRegistrationSector = Pick<Tables<'sectors'>, 'id' | 'slug' | 'name' | 'name_ar' | 'registration_config'>

export default function TrainingPage() {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const [registrationSector, setRegistrationSector] = useState<TrainingRegistrationSector | null>(null)
  const [isLoadingSector, setIsLoadingSector] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadTrainingSector() {
      const supabase = createClient()
      const { data } = await supabase
        .from('sectors')
        .select('id, slug, name, name_ar, registration_config')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!isMounted) return

      const matchedSector = (data || []).find((sector) => getSectorContent(sector)?.key === 'academia') || null
      setRegistrationSector(matchedSector)
      setIsLoadingSector(false)
    }

    void loadTrainingSector()

    return () => {
      isMounted = false
    }
  }, [])

  const registrationIntro = isRTL
    ? 'إذا كنتم ترغبون بالتسجيل أو إبداء الاهتمام ببرامج التدريب والتطوير القادمة، يمكنكم تعبئة النموذج التالي وسيتواصل معكم فريقنا.'
    : 'If you would like to register your interest in upcoming training and development programs, please complete the form below and our team will get in touch.'

  return (
    <div className="bg-white pt-36 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <Container>
        {/* Empty State - Single Container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-500/5" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-700/8 text-slate-700">
              <GraduationCap className="h-8 w-8" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-slate-950 lg:text-3xl">
              {t.trainingPage.emptyTitle}
            </h2>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-slate-600 lg:text-lg">
              {t.trainingPage.emptyDescription}
            </p>

            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={isLoadingSector || !registrationSector}
                    className="min-h-12 rounded-full bg-white px-6 text-stone-950 hover:bg-white/90 focus:ring-white/40"
                  >
                    {isRTL ? 'فتح نموذج التسجيل' : 'Open Registration Form'}
                  </Button>
                </DialogTrigger>
                <DialogContent
                  dir={dir}
                  className="max-h-[90vh] w-[96vw] max-w-4xl overflow-y-auto rounded-[1.75rem] border border-[#8b0000]/10 bg-white p-6 sm:p-8"
                >
                  <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
                    <DialogTitle className="text-2xl text-stone-950">
                      {isRTL ? 'نموذج التسجيل' : 'Registration Form'}
                    </DialogTitle>
                    <DialogDescription className={isRTL ? 'text-right leading-7 text-stone-600' : 'text-left leading-7 text-stone-600'}>
                      {registrationIntro}
                    </DialogDescription>
                  </DialogHeader>
                  {registrationSector && (
                    <SectorRegistrationForm
                      sectorId={registrationSector.id}
                      sectorName={isRTL ? registrationSector.name_ar : registrationSector.name}
                      config={null}
                      intro={registrationIntro}
                      variant="plain"
                      className="pt-2"
                      showHeader={false}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <Button asChild className="h-12 rounded-2xl bg-slate-800 px-6 hover:bg-slate-700">
                <Link href="/sectors">
                  <Users className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {isRTL ? 'استكشف القطاعات' : 'Explore Sectors'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-2xl border-slate-300 bg-white/70 px-6 text-slate-800 hover:bg-white">
                <Link href="/contact">
                  <Mail className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {t.trainingPage.emptyButton}
                </Link>
              </Button>
            </div>

            {/* Features List */}
            <div className={`rounded-[1.5rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isRTL ? 'ما يميز برامجنا التدريبية' : 'What makes our training programs special'}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/8 text-slate-700">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {t.trainingPage.features.experts.title}
                  </span>
                </div>
                <div className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/8 text-slate-700">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {t.trainingPage.features.certificates.title}
                  </span>
                </div>
                <div className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/8 text-slate-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
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
