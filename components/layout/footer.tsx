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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/jazcompany/',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1AjQDmrwgW/?mibextid=wwXIfr',
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
  const accent = {
    logo: 'from-slate-600 to-slate-900',
    icon: 'text-slate-700',
    dot: 'bg-slate-700',
    link: 'hover:text-slate-950',
  }

  if (normalizedPathname.startsWith('/dashboard') || isEventDetailsPage) {
    return null
  }

  const footerLinks = {
    services: [
      { name: t.nav.events, href: '/events' },
      { name: t.trainingPage.title, href: '/training' },
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
      className="relative overflow-hidden bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_48%,#e5e7eb_100%)] text-slate-800"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
      <div className="pointer-events-none absolute -start-[8rem] top-[-6rem] h-72 w-72 rounded-full bg-white/70 blur-[100px]" />
      <div className="pointer-events-none absolute -end-[10rem] bottom-[-8rem] h-80 w-80 rounded-full bg-slate-300/35 blur-[120px]" />
      <Container className="relative z-10 py-5 sm:py-6 lg:py-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {/* Brand */}
          <div className="flex flex-col items-start text-start lg:col-span-2">
            <Link href="/" className="group mb-3 block w-fit max-w-full">
              <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/Joint Annual Zone logo.png"
                  alt="Joint Annual Zone Logo"
                  width={384}
                  height={128}
                  sizes="(min-width: 1024px) 10rem, 9rem"
                  className="h-auto w-36 object-contain object-start sm:w-40"
                  unoptimized
                />
              </div>
            </Link>
            <div className="w-full space-y-2 text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className={`mt-0.5 h-5 w-5 shrink-0 ${accent.icon}`} />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                  {/* Iraq group */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold text-slate-800">{iraqLabel}</span>
                    <div className="flex flex-col items-start gap-1 ps-2">
                      {iraqOffices.map((city) => (
                        <div key={city} className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                          <span className="text-sm">{city}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* France */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold text-slate-800">{franceLabel}</span>
                    <div className="flex items-center gap-2 ps-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                      <a href="https://jazexpo.fr/" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        {locale === 'ar' ? 'باريس' : 'Paris'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className={`h-5 w-5 shrink-0 ${accent.icon}`} />
                <span dir="ltr">+964 771 900 0600</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className={`h-5 w-5 shrink-0 ${accent.icon}`} />
                <span dir="ltr">contact@jaz.iq</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="text-start">
            <h3 className="mb-3 font-semibold text-slate-950">{t.footer.services}</h3>
            <ul className="space-y-1.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={`text-slate-700 transition-colors ${accent.link}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-start">
            <h3 className="mb-3 font-semibold text-slate-950">{t.footer.support}</h3>
            <ul className="space-y-1.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={`text-slate-700 transition-colors ${accent.link}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-300/80 pt-4 md:flex-row">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} JAZ. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 text-slate-600 transition-colors ${accent.link}`}
                aria-label={social.name}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
