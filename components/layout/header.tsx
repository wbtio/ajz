'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays,
  Globe,
  Handshake,
  Home,
  LayoutGrid,
  Link as LinkIcon,
  Menu,
  Newspaper,
  Search,
  User,
  X,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export function Header({ isAdmin }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const { locale, setLocale, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (
    normalizedPathname.startsWith('/dashboard') ||
    normalizedPathname.startsWith('/admin') ||
    isEventDetailsPage
  ) {
    return null
  }

  const navigation = [
    { name: t.nav.home, href: '/', icon: Home },
    { name: t.nav.partners, href: '/partners', icon: Handshake },
    { name: t.nav.sectors, href: '/sectors', icon: LayoutGrid },
    { name: t.nav.events, href: '/events', icon: CalendarDays },
    { name: t.nav.training, href: '/training', icon: User },
    { name: t.nav.blog, href: '/blog', icon: Newspaper },
    { name: t.nav.links, href: '/links', icon: LinkIcon },
  ]

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    router.push(`/events?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setIsOpen(false)
  }

  const searchPlaceholder =
    locale === 'ar' ? 'البحث في موقع JAZ' : 'Search in JAZ Website'

  return (
    <>
      {/* Desktop Navbar - شريط علوي أفقي للشاشات الكبيرة */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block',
          (isHomePage && !scrolled)
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md shadow-lg shadow-black/5'
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 bg-gradient-to-br from-[#8b0000] to-[#6b0000] shadow-[#8b0000]/20">
                <span>J</span>
              </div>
              <span className="text-lg font-bold tracking-[0.24em] text-gray-900">
                JAZ
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-[#8b0000]/10 text-[#8b0000]"
                        : "text-gray-600 hover:text-[#8b0000] hover:bg-gray-100"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-[#8b0000] hover:bg-gray-100"
            >
              <Globe className="h-4 w-4" />
              <span>{locale === 'ar' ? 'EN' : 'عر'}</span>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Navbar - شريط مبسط للموبايل */}
      <div className="fixed top-4 z-50 w-full pointer-events-none md:hidden">
        <Container>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-lg shadow-black/5 backdrop-blur"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b0000] to-[#6b0000] text-sm font-bold text-white shadow-md shadow-[#8b0000]/20">
                J
              </div>
              <span className="text-sm font-bold tracking-[0.24em] text-gray-900">
                JAZ
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLocale}
                aria-label={locale === 'ar' ? 'تغيير اللغة' : 'Change language'}
                className="pointer-events-auto flex h-12 items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 text-gray-800 shadow-lg shadow-black/10 backdrop-blur transition hover:scale-[1.02] hover:text-[#8b0000]"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{locale === 'ar' ? 'EN' : 'عر'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
                className="pointer-events-auto flex h-12 items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 text-gray-800 shadow-lg shadow-black/10 backdrop-blur transition hover:scale-[1.02] hover:text-[#8b0000]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm transition-all duration-300 md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar Menu */}
      <aside
        className={cn(
          'fixed top-0 z-[70] flex h-full w-[min(92vw,380px)] flex-col overflow-hidden border-l border-gray-200 bg-[#faf8f5] shadow-2xl shadow-black/20 transition-transform duration-300 will-change-transform md:hidden',
          locale === 'ar' ? 'right-0' : 'left-0'
        )}
        aria-hidden={!isOpen}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        style={{
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen
            ? 'translateX(0)'
            : locale === 'ar'
              ? 'translateX(100%)'
              : 'translateX(-100%)',
        }}
      >
        <div className="border-b border-gray-200 bg-white px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b0000] to-[#6b0000] text-lg font-bold text-white shadow-lg shadow-[#8b0000]/20">
                  J
                </div>
                <div>
                  <div className="text-lg font-bold tracking-[0.18em] text-gray-900">
                    JAZ
                  </div>
                  <div className="text-xs text-gray-500">
                    {locale === 'ar' ? 'القائمة الرئيسية' : 'Main menu'}
                  </div>
                </div>
              </Link>

            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-[#8b0000]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <form
            onSubmit={handleSearch}
            className="rounded-3xl border border-gray-200 bg-white p-4"
          >
            <label className="mb-3 block text-sm font-semibold text-gray-800">
              {locale === 'ar' ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-[#faf8f5] text-sm text-gray-900 outline-none transition focus:border-[#8b0000] focus:bg-white focus:ring-4 focus:ring-[#8b0000]/10 ltr:pl-4 ltr:pr-11 rtl:pr-4 rtl:pl-11"
              />
              <button
                type="submit"
                className="absolute top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#8b0000] ltr:right-4 rtl:left-4"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {locale === 'ar' ? 'التنقل' : 'Navigation'}
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition',
                      isActive
                        ? 'border-[#8b0000] bg-[#8b0000] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#8b0000]/30 hover:bg-[#fcf7f5] hover:text-[#8b0000]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center transition',
                        isActive
                          ? 'text-white'
                          : 'text-[#8b0000]'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-200 bg-white px-5 py-5">
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="block">
              <Button
                variant="outline"
                size="md"
                className="h-12 w-full gap-2 rounded-2xl border-gray-200 text-gray-700 hover:border-[#8b0000] hover:bg-[#8b0000]/5 hover:text-[#8b0000]"
              >
                <User className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
