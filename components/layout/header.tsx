'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Globe, User, Search } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

export function Header({ isAdmin }: { isAdmin?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { locale, setLocale, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)

  if (
    normalizedPathname.startsWith('/dashboard') ||
    normalizedPathname.startsWith('/admin') ||
    isEventDetailsPage
  ) {
    return null
  }

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.about, href: '/about' },
    { name: t.nav.partners, href: '/partners' },
    { name: t.nav.sectors, href: '/sectors' },
    {
      name: t.nav.services,
      href: '#',
      children: [
        { name: t.nav.events, href: '/events' },
        { name: t.nav.training, href: '/training' },
      ],
    },
    { name: t.nav.blog, href: '/blog' },
    { name: t.nav.calendar, href: '/calendar' },
    { name: t.nav.links, href: '/links' },
  ]

  // Flat list for mobile nav (expand children inline)
  const mobileNavItems: { name: string; href: string }[] = []
  for (const item of navigation) {
    if (item.children) {
      for (const child of item.children) mobileNavItems.push(child)
    } else {
      mobileNavItems.push({ name: item.name, href: item.href })
    }
  }

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/events?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300",
        isScrolled && "shadow-md"
      )}
    >
      {/* ===== Default: Row 1 (Logo + Search + Lang) ===== */}
      <div className={cn(
        "border-b border-gray-200 transition-all duration-300 overflow-hidden",
        isScrolled ? "max-h-0 border-transparent" : "max-h-16"
      )}>
        <Container>
          <div className="flex items-center justify-center gap-4 py-2.5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-all duration-300 border border-blue-500/10">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-950">
                JAZ
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'البحث في موقع JAZ' : 'Search in JAZ Website'}
                  className="w-full h-9 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 -translate-y-1/2 ltr:right-0.5 rtl:left-0.5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded-full transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="shrink-0 h-9 px-3 flex items-center gap-1.5 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {isAdmin && (
              <Link href="/admin" className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 gap-1.5 border-gray-200 text-gray-500 bg-gray-50 rounded-full hover:bg-white hover:text-blue-600 hover:border-blue-200">
                  <User className="w-3.5 h-3.5" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </Container>
      </div>

      {/* ===== Default: Row 2 (Nav Links only) / Scrolled: Single Row (Logo icon + Nav Links) ===== */}
      <div className="border-b border-gray-200 bg-white">
        <Container>
          <div className="flex items-center justify-center overflow-x-auto scrollbar-hide -mb-px">
            {/* Logo icon - only visible when scrolled */}
            <Link
              href="/"
              className={cn(
                "shrink-0 transition-all duration-300 flex items-center",
                isScrolled ? "opacity-100 w-auto ltr:mr-4 rtl:ml-4" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20 border border-blue-500/10">
                <span className="text-white font-bold text-sm">J</span>
              </div>
            </Link>

            {/* Nav Links */}
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                    isActive
                      ? "text-blue-700 border-blue-600"
                      : "text-gray-600 border-transparent hover:text-blue-700 hover:border-gray-300"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </Container>
      </div>
    </header>
  )
}