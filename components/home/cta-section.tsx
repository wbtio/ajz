'use client'

import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Phone, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function CTASection() {
  const { t } = useI18n()

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t.cta.title}
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Phone className="w-5 h-5 ml-2" />
                {t.hero.contactUs}
              </Button>
            </Link>
            <a href="mailto:info@jaz.iq">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Mail className="w-5 h-5 ml-2" />
                info@jaz.iq
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
