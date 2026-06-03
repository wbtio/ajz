'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/joint.annual.zone?igsh=bmk2eWxzejhlNzBw&utm_source=qr',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/jazcompany/',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1AjQDmrwgW/?mibextid=wwXIfr',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    ),
  },
]

export function Footer() {
  const { t, locale, dir } = useI18n()
  const pathname = usePathname()
  const iraqOffices = locale === 'ar' ? ['البصرة', 'بغداد', 'أربيل'] : ['Basra', 'Baghdad', 'Erbil']
  const iraqLabel = locale === 'ar' ? 'العراق' : 'Iraq'
  const franceLabel = locale === 'ar' ? 'فرنسا' : 'France'

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)

  if (normalizedPathname.startsWith('/dashboard') || isEventDetailsPage) {
    return null
  }

  const footerLinks = {
    services: [
      { name: t.nav.events, href: '/events' },
      { name: t.trainingPage.title, href: '/training' },
      { name: t.nav.sectors, href: '/#sectors' },
    ],
    support: [
      { name: t.nav.contact, href: '/contact' },
      { name: t.footer.faq, href: '/faq' },
      { name: t.footer.privacy, href: '/privacy' },
      { name: t.footer.terms, href: '/terms' },
    ],
  }

  return (
    <footer
      dir={dir}
      lang={locale}
      className="relative border-t border-[#0b1426]/10 bg-[#f5f7fa] text-[#0b1426] py-4 sm:py-5"
    >
      <Container>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8 text-start">
          {/* Column 1: Logo & Brand Pitch & Contact Info */}
          <div className="flex flex-col items-start gap-3 md:col-span-6 lg:col-span-5">
            <Link href="/" className="group block shrink-0">
              <Image
                src="/Joint Annual Zone logo.png"
                alt="Joint Annual Zone Logo"
                width={384}
                height={128}
                sizes="10rem"
                className="h-auto w-24 object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                unoptimized
              />
            </Link>
            <p className="text-xs leading-relaxed text-[#0b1426]/60 font-medium max-w-[35ch]">
              {t.footer.description}
            </p>
            
            {/* Direct Contact links */}
            <div className="flex flex-col gap-1.5 mt-0.5">
              <a
                href="tel:+9647719000600"
                className="flex items-center gap-2 text-xs font-semibold text-[#0b1426]/60 hover:text-[#8B0000] transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-[#0b1426]/40 shrink-0" />
                <span dir="ltr">+964 771 900 0600</span>
              </a>
              <a
                href="mailto:contact@jaz.iq"
                className="flex items-center gap-2 text-xs font-semibold text-[#0b1426]/60 hover:text-[#8B0000] transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#0b1426]/40 shrink-0" />
                <span>contact@jaz.iq</span>
              </a>
            </div>

            {/* Social Links inline */}
            <div className="flex items-center gap-2 mt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#0b1426]/5 text-[#0b1426]/60 transition-all hover:bg-[#8B0000]/5 hover:text-[#8B0000] hover:border-[#8B0000]/20 border border-transparent shadow-sm"
                  aria-label={social.name}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation Links (Services) */}
          <div className="flex flex-col items-start gap-2 md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-bold text-[#0b1426] uppercase tracking-wider">
              {locale === 'ar' ? 'الخدمات' : 'Services'}
            </h4>
            <ul className="flex flex-col gap-1.5 text-start w-full">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold text-[#0b1426]/60 hover:text-[#8B0000] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Navigation Links (Support) */}
          <div className="flex flex-col items-start gap-2 md:col-span-3 lg:col-span-4">
            <h4 className="text-xs font-bold text-[#0b1426] uppercase tracking-wider">
              {t.footer.support}
            </h4>
            <ul className="flex flex-col gap-1.5 text-start w-full">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold text-[#0b1426]/60 hover:text-[#8B0000] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & locations bar */}
        <div className="mt-4 pt-3 border-t border-[#0b1426]/10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs font-semibold text-[#0b1426]/50 text-start">
            <span>
              © {new Date().getFullYear()} JAZ. {t.footer.rights}
            </span>
            <span className="hidden sm:inline text-[#0b1426]/20">•</span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-[#8B0000] transition-colors">
                {t.footer.privacy}
              </Link>
              <span className="text-[#0b1426]/20">•</span>
              <Link href="/terms" className="hover:text-[#8B0000] transition-colors">
                {t.footer.terms}
              </Link>
            </div>
          </div>

          {/* Office locations */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#0b1426]/50 text-start">
            <span className="uppercase text-[#0b1426]/40">{iraqLabel}:</span>
            <span className="text-[#0b1426]/80">{iraqOffices.join(' • ')}</span>
            <span className="mx-1.5 text-[#0b1426]/20 font-normal">|</span>
            <span className="uppercase text-[#0b1426]/40">{franceLabel}:</span>
            <span className="text-[#0b1426]/80">Paris</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
