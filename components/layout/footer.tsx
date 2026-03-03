'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// Social media links - to be added when official accounts are verified
const socialLinks: { name: string; icon: typeof Facebook; href: string }[] = []

export function Footer() {
  const { t } = useI18n()
  const pathname = usePathname()

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)

  if (normalizedPathname.startsWith('/dashboard') || isEventDetailsPage) {
    return null
  }

  const footerLinks = {
    services: [
      { name: t.nav.events, href: '/events' },
      { name: t.footer.exhibitions, href: '/exhibitions' },
      { name: t.nav.training, href: '/training' },
    ],
    support: [
      { name: t.nav.contact, href: '/contact' },
      { name: t.footer.faq, href: '/faq' },
      { name: t.footer.privacy, href: '/privacy' },
      { name: t.footer.terms, href: '/terms' },
    ],
  }
  return (
    <footer className="bg-gray-900 text-gray-300">
      <Container className="py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8b0000] to-[#6b0000] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-xl font-bold text-white">JAZ</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-sm">
              {t.footer.description}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#8b0000]" />
                <span>بغداد، المنصور، شارع 14 رمضان</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#8b0000]" />
                <span dir="ltr">+964 771 900 0600</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#8b0000]" />
                <span>info@jaz.iq</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.services}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#cc4444] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.support}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#cc4444] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JAZ. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="p-2 text-gray-400 hover:text-[#cc4444] transition-colors"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
