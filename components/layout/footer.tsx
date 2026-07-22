'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, Instagram, Linkedin, Facebook } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://x.com',
    icon: X,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/ZointAnnualZone/',
    icon: Facebook,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/joint.annual.zone?igsh=bmk2eWxzejhlNzBw&utm_source=qr',
    icon: Instagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/jazcompany/',
    icon: Linkedin,
  },
]

const navLinks = [
  { href: '/', en: 'Home', ar: 'الرئيسية' },
  { href: '/about', en: 'About Us', ar: 'من نحن' },
  { href: '/departments', en: 'Our Departments', ar: 'أقسامنا' },
  { href: '/events', en: 'Events', ar: 'الفعاليات' },
  { href: '/training', en: 'Training & Development', ar: 'التدريب والتطوير' },
  { href: '/blog', en: 'News & Insights', ar: 'الأخبار والرؤى' },
  { href: '/contact', en: 'Contact Us', ar: 'تواصل معنا' },
]

const navLinkClass =
  'text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium'

export function Footer() {
  const { locale, dir } = useI18n()
  const isAr = locale === 'ar'
  const headingClass = isAr
    ? 'text-xs font-bold text-white tracking-normal'
    : 'text-xs font-bold text-white uppercase tracking-wider'
  const pathname = usePathname()
  
  const [emailInput, setEmailInput] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    setIsSubscribing(true)
    setTimeout(() => {
      setIsSubscribing(false)
      setSubscribeSuccess(true)
      setEmailInput('')
    }, 1200)
  }

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)
  const isDepartmentsPage = normalizedPathname === '/departments'
  const isChromeHidden = typeof document !== 'undefined' && document.body.classList.contains('admin-login-surface')

  if (normalizedPathname.startsWith('/dashboard') || normalizedPathname.startsWith('/admin-login') || isEventDetailsPage || isChromeHidden) {
    return null
  }

  return (
    <footer
      dir={dir}
      lang={locale}
      className={`bg-[#001a33] text-[#6f85a3] py-8 sm:py-10${isDepartmentsPage ? '' : ' border-t border-[#c4c6ce]/10'}`}
    >
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 text-start">
          {/* Brand & Description */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="group block shrink-0">
              <Image
                src="/Joint Annual Zone logo.png"
                alt="Joint Annual Zone Logo"
                width={120}
                height={40}
                className="h-auto w-28 object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-[1.01]"
                unoptimized
              />
            </Link>
            <div className="space-y-2.5">
              <p className="text-xs leading-relaxed text-[#9fb0c7]">
                {locale === 'ar'
                  ? 'بوابة العراق إلى المعارض والمؤتمرات الدولية.'
                  : "Iraq's Gateway to International Exhibitions & Institutional Partnerships."}
              </p>
              <p className="text-xs leading-relaxed text-[#9fb0c7]">
                {locale === 'ar'
                  ? 'نربط ونمثّل مؤسسات العراق ومهنييه على الساحة العالمية.'
                  : "We connect and represent Iraq's institutions and professionals on the global stage."}
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-3 items-center pt-1">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    aria-label={social.name}
                    className="w-10 h-10 rounded-full border border-[#6f85a3]/30 flex items-center justify-center text-[#6f85a3] hover:text-[#f7e382] hover:border-[#f7e382] transition-all duration-300 transform active:scale-95"
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Explore */}
          <nav className="lg:col-span-2 space-y-4" aria-label={locale === 'ar' ? 'روابط الموقع' : 'Footer'}>
            <h3 className={headingClass}>
              {isAr ? 'استكشف' : 'Explore'}
            </h3>
            <ul className="space-y-2.5 text-xs">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link className={navLinkClass} href={link.href}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]" aria-hidden="true"></span>
                    {locale === 'ar' ? link.ar : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Us */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className={headingClass}>
              {isAr ? 'اتصل بنا' : 'Contact Us'}
            </h3>
            <div className="space-y-3.5 text-xs text-[#6f85a3]">
              {/* Local offices */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6f85a3]/60">
                  {isAr ? 'محلي' : 'Local'}
                </p>
                <p className="font-semibold text-white/90">{isAr ? 'مكتب البصرة' : 'Basra Office'}</p>
                <p className="font-semibold text-white/90">{isAr ? 'مكتب بغداد' : 'Baghdad Office'}</p>
                <p className="font-semibold text-white/90">{isAr ? 'مكتب أربيل' : 'Erbil Office'}</p>
              </div>
              {/* International offices */}
              <div className="space-y-1.5 pt-1.5 border-t border-[#6f85a3]/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6f85a3]/60">
                  {isAr ? 'دولي' : 'International'}
                </p>
                <p className="font-semibold text-white/90">{isAr ? 'مكتب فرنسا' : 'France Office'}</p>
                <p className="font-semibold text-white/90">{isAr ? 'مكتب ألمانيا' : 'Germany Office'}</p>
              </div>
              <div className="pt-1.5 space-y-0.5 border-t border-[#6f85a3]/10">
                <a href="tel:+9647719000600" className="block text-white/90 hover:text-[#f7e382] transition-colors font-medium" dir="ltr">
                  +964 771 900 0600
                </a>
                <a href="mailto:info@jaz.iq" className="block hover:text-[#f7e382] transition-colors font-medium">
                  info@jaz.iq
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter & Office Hours */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <h3 className={headingClass}>
                {isAr ? 'النشرة البريدية' : 'Newsletter'}
              </h3>
              <p className="text-xs text-[#9fb0c7] leading-relaxed">
                {locale === 'ar'
                  ? 'اشترك لتصلك مستجدات الفعاليات وأخبار الجاز.'
                  : 'Subscribe to receive updates on events and partnership news.'}
              </p>

              {subscribeSuccess ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded text-center"
                >
                  <p className="text-[11px] font-bold text-emerald-400">
                    {locale === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex w-full group overflow-hidden rounded border border-[#6f85a3]/20 animate-in fade-in duration-300">
                  <label className="sr-only" htmlFor="footer-newsletter-email">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                  </label>
                  <input
                    id="footer-newsletter-email"
                    className="flex-grow px-3 py-2.5 bg-white text-[#000000] outline-none text-xs border-none focus:ring-0 transition-all min-w-0"
                    placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Your email'}
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={isSubscribing}
                  />
                  <button
                    className="bg-[#f7e382] text-[#000000] font-bold px-4 py-2.5 text-xs hover:bg-[#f7e382]/90 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                    type="submit"
                    disabled={isSubscribing}
                    aria-busy={isSubscribing}
                  >
                    {isSubscribing
                      ? locale === 'ar' ? 'جارٍ…' : 'Saving…'
                      : locale === 'ar' ? 'اشترك' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
            
            <div className="space-y-2 pt-3.5 border-t border-[#6f85a3]/10">
              <h3 className={headingClass}>
                {isAr ? 'أوقات العمل' : 'Office Hours'}
              </h3>
              <div className="text-xs text-[#6f85a3]">
                <p>{isAr ? 'السبت – الخميس' : 'Saturday – Thursday'}</p>
                <p className="font-semibold text-white/90" dir={isAr ? 'ltr' : undefined}>
                  {isAr ? '8:30 ص – 4:30 م' : '8:30 AM – 4:30 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 pt-4 border-t border-[#6f85a3]/10 flex flex-col md:flex-row justify-between items-center gap-3.5 text-xs text-[#6f85a3]/70 text-center md:text-start">
          <p>
            {locale === 'ar'
              ? '© 2026 الجاز. جميع الحقوق محفوظة.'
              : '© 2026 Joint Annual Zone (JAZ). All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <Link className="hover:text-[#f7e382] transition-colors" href="/privacy">
              {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <span className="text-[#6f85a3]/30">|</span>
            <Link className="hover:text-[#f7e382] transition-colors" href="/terms">
              {locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
