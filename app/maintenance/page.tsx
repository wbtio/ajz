import type { Metadata } from 'next'
import Image from 'next/image'
import { fetchPublicSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Under Maintenance — JAZ',
  robots: { index: false, follow: false },
}

export default async function MaintenancePage() {
  const { maintenance, company } = await fetchPublicSettings()

  return (
    <div className="min-h-screen bg-[#001a33] flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        <Image
          src="/Joint Annual Zone logo.png"
          alt={company.name_en}
          width={160}
          height={54}
          className="mx-auto h-auto w-36 object-contain brightness-0 invert"
          unoptimized
        />

        <div className="space-y-5">
          <p dir="rtl" lang="ar" className="text-lg leading-relaxed text-white">
            {maintenance.message_ar}
          </p>
          <div className="mx-auto h-px w-16 bg-[#f7e382]/40" />
          <p dir="ltr" lang="en" className="text-base leading-relaxed text-[#9fb0c7]">
            {maintenance.message_en}
          </p>
        </div>

        {company.email && (
          <p className="text-sm text-[#6f85a3]">
            <a
              href={`mailto:${company.email}`}
              className="font-medium text-white/90 transition-colors hover:text-[#f7e382]"
              dir="ltr"
            >
              {company.email}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
