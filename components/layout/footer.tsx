'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Globe, X, Instagram, Linkedin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Container } from '@/components/ui/container'

const socialLinks = [
  {
    name: 'Website',
    href: '/',
    icon: Globe,
  },
  {
    name: 'Twitter',
    href: 'https://x.com',
    icon: X,
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

export function Footer() {
  const { locale, dir } = useI18n()
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

  if (normalizedPathname.startsWith('/dashboard') || isEventDetailsPage) {
    return null
  }

  return (
    <footer
      dir={dir}
      lang={locale}
      className="bg-[#021c36] text-[#6f85a3] border-t border-[#c4c6ce]/10 py-8 sm:py-10"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 text-start">
          {/* Brand & Description */}
          <div className="lg:col-span-3 space-y-4">
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
              <p className="text-xs leading-relaxed text-[#6f85a3]/80">
                {locale === 'ar'
                  ? 'بوابة العراق للمعارض الدولية والشراكات المؤسسية.'
                  : "Iraq's Gateway to International Exhibitions & Institutional Partnerships."}
              </p>
              <p className="text-xs leading-relaxed text-[#6f85a3]/60">
                {locale === 'ar'
                  ? 'نحن نربط ونمثل ونمكن المؤسسات والمهنيين في العراق على الساحة العالمية.'
                  : "We connect, represent, and empower Iraq's institutions and professionals on the stage."}
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-3 items-center pt-1">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    className="w-7 h-7 rounded-full border border-[#6f85a3]/30 flex items-center justify-center text-[#6f85a3] hover:text-[#f7e382] hover:border-[#f7e382] transition-all duration-300 transform active:scale-95"
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


          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/about">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'عن JAZ' : 'About JAZ'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/departments">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'الأقسام' : 'Departments'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'خدماتنا' : 'Our Services'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/events">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'تقويم الفعاليات' : 'Events Calendar'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/invitation-support">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'دعم الدعوة' : 'Invitation Support'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/partners">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'الشراكات' : 'Partnerships'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/blog">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'الأخبار والأفكار' : 'News & Insights'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/contact">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {locale === 'ar' ? 'الأقسام' : 'Departments'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/departments">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'التعاون الدولي' : 'International Cooperation'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/events">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'المعارض والفعاليات' : 'Exhibitions & Events'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/partners">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'الشراكات المؤسسية' : 'Institutional Partnerships'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/services">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'تطوير الأعمال' : 'Business Development'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/invitation-support">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'مكتب دعم الدعوة' : 'Invitation Support Office'}
                </Link>
              </li>
              <li>
                <Link className="text-[#6f85a3] hover:text-[#f7e382] transition-colors flex items-center gap-2 font-medium" href="/blog">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f7e382]"></span>{' '}
                  {locale === 'ar' ? 'البحوث والأفكار' : 'Research & Insights'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </h3>
            <div className="space-y-3.5 text-xs text-[#6f85a3]">
              <div>
                <p className="font-semibold text-white/90">{locale === 'ar' ? 'مكتب البصرة' : 'Basra Office'}</p>
                <p className="text-[11px] opacity-80">{locale === 'ar' ? 'شارع الكورنيش، البصرة' : 'Al Corniche St., Basra'}</p>
              </div>
              <div>
                <p className="font-semibold text-white/90">{locale === 'ar' ? 'مكتب بغداد' : 'Baghdad Office'}</p>
                <p className="text-[11px] opacity-80">{locale === 'ar' ? 'المنصور، بغداد' : 'Al Mansour, Baghdad'}</p>
              </div>
              <div>
                <p className="font-semibold text-white/90">{locale === 'ar' ? 'مكتب أربيل' : 'Erbil Office'}</p>
                <p className="text-[11px] opacity-80">{locale === 'ar' ? 'شارع الـ 60م، أربيل' : '60m St., Erbil'}</p>
              </div>
              <div className="pt-1.5 space-y-0.5 border-t border-[#6f85a3]/10">
                <a href="tel:+9647719000600" className="block text-white/90 hover:text-[#f7e382] transition-colors font-medium" dir="ltr">
                  +964 771 900 0600
                </a>
                <a href="mailto:info@jaz-iq.com" className="block hover:text-[#f7e382] transition-colors font-medium">
                  info@jaz-iq.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter & Office Hours */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {locale === 'ar' ? 'النشرة البريدية' : 'Newsletter'}
              </h3>
              <p className="text-xs text-[#6f85a3]/85 leading-relaxed">
                {locale === 'ar'
                  ? 'اشترك لتصلك مستجدات الفعاليات وأخبار الشراكات.'
                  : 'Subscribe to receive updates on events and partnership news.'}
              </p>
              
              {subscribeSuccess ? (
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded text-center">
                  <p className="text-[11px] font-bold text-emerald-400">
                    {locale === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex w-full group overflow-hidden rounded border border-[#6f85a3]/20 animate-in fade-in duration-300">
                  <input
                    className="flex-grow px-3 py-2 bg-white text-[#000000] outline-none text-xs border-none focus:ring-0 transition-all min-w-0"
                    placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Your email'}
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={isSubscribing}
                  />
                  <button
                    className="bg-[#f7e382] text-[#000000] font-bold px-4 py-2 text-xs hover:bg-[#f7e382]/90 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                    type="submit"
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? '...' : (locale === 'ar' ? 'اشترك' : 'Subscribe')}
                  </button>
                </form>
              )}
            </div>
            
            <div className="space-y-2 pt-3.5 border-t border-[#6f85a3]/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {locale === 'ar' ? 'أوقات العمل' : 'Office Hours'}
              </h3>
              <div className="text-xs text-[#6f85a3]">
                <p>{locale === 'ar' ? 'السبت – الخميس' : 'Saturday – Thursday'}</p>
                <p className="font-semibold text-white/90">8:30 AM – 4:30 PM</p>
                <p className="text-[10px] opacity-60">
                  {locale === 'ar' ? '(بتوقيت العراق المحلي)' : '(Iraq Local Time)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 pt-4 border-t border-[#6f85a3]/10 flex flex-col md:flex-row justify-between items-center gap-3.5 text-xs text-[#6f85a3]/70 text-center md:text-start">
          <p>
            {locale === 'ar'
              ? '© 2024 المنطقة السنوية المشتركة (JAZ). جميع الحقوق محفوظة.'
              : '© 2024 Joint Annual Zone (JAZ). All rights reserved.'}
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

