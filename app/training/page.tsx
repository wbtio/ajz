'use client'

import { Container } from '@/components/ui/container'
import { useI18n } from '@/lib/i18n'
import { BookOpen, BriefcaseBusiness, Layers3 } from 'lucide-react'

const areaIcons = [BriefcaseBusiness, Layers3, BookOpen]

export default function TrainingPage() {
  const { t, locale, dir } = useI18n()
  const training = t.trainingPage

  return (
    <main className="bg-white text-[#0b1426]" dir={dir} lang={locale}>
      <section className="bg-[#0b1426] pt-20 text-white lg:pt-24">
        <Container className="pb-12 lg:pb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{training.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{training.description}</p>
            <p className="mt-3 max-w-2xl rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold leading-6 text-white">{training.closedMessage}</p>
          </div>
        </Container>
      </section>

      <section className="py-10 lg:py-14">
        <Container>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{training.areasTitle}</h2>
          <div className="mt-6 grid gap-x-10 md:grid-cols-3">
            {training.areas.map((area, index) => {
              const Icon = areaIcons[index]
              return (
                <article key={area.title} className="border-t border-slate-200 py-4">
                  <Icon className="h-6 w-6 text-[#8b0000]" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-extrabold">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{area.description}</p>
                </article>
              )
            })}
          </div>
        </Container>
      </section>
    </main>
  )
}
