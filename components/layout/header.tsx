'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Globe,
  Handshake,
  Home,
  LayoutGrid,
  Link as LinkIcon,
  Menu,
  Newspaper,
  User,
  X,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

export function Header({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { locale, setLocale, t } = useI18n()
  const pathname = usePathname()


  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)
  const accent = {
    logo: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 shadow-slate-900/20',
    hoverText: 'hover:text-stone-700',
    focusField: 'focus:border-stone-500 focus:bg-white focus:ring-4 focus:ring-stone-500/10',
    menuActive: 'border-stone-800 bg-stone-800 text-white shadow-[0_12px_30px_rgba(41,37,36,0.18)]',
    menuInactive: 'border-stone-200 bg-white/90 text-stone-700 hover:border-stone-400/25 hover:bg-stone-50 hover:text-stone-800',
    menuIcon: 'text-stone-600',
    actionHover: 'hover:border-stone-400/25 hover:bg-stone-100/80 hover:text-stone-800',
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (
    normalizedPathname.startsWith('/dashboard') ||
    normalizedPathname.startsWith('/admin') ||
    normalizedPathname.startsWith('/tasks') ||
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

  const menuLabel = locale === 'ar' ? 'القائمة' : 'Menu'
  const closeMenuLabel = locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'
  const mainMenuLabel = locale === 'ar' ? 'القائمة الرئيسية' : 'Main menu'
  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <header
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        lang={locale}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isOpen ? 'pointer-events-none' : 'pointer-events-auto'
        )}
      >
        <Container className="pt-4">
          <div
            className={cn(
              'flex items-center justify-between gap-3 rounded-[1.75rem] border px-4 py-3 shadow-lg shadow-black/5 transition-all duration-300',
              scrolled
                ? 'border-white/80 bg-white/92 backdrop-blur-xl'
                : 'border-white/70 bg-white/82 backdrop-blur-xl'
            )}
          >
            <Link
              href="/"
              className="group block shrink-0"
            >
              <div className="relative aspect-[3/1] w-28 transition-transform duration-300 group-hover:scale-[1.02] sm:w-32">
                <Image
                  src="/Joint Annual Zone logo.png"
                  alt="Joint Annual Zone Logo"
                  fill
                  sizes="(min-width: 640px) 8rem, 7rem"
                  className="object-contain ltr:object-left rtl:object-right"
                  priority
                />
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLocale}
                aria-label={locale === 'ar' ? 'تغيير اللغة' : 'Change language'}
                className={cn("flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/92 px-4 text-slate-800 shadow-sm transition hover:scale-[1.02]", accent.hoverText)}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {locale === 'ar' ? 'EN' : 'ع'}
                </span>
              </button>

              <button
                type="button"
                onClick={openMenu}
                aria-label={locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]',
                  'bg-slate-900 hover:bg-slate-800'
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="hidden sm:inline">{menuLabel}</span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm transition-all duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMenu}
      />

      <AnimatePresence>
      {isOpen && (
      <motion.aside
        key="sidebar"
        initial={{ x: locale === 'ar' ? '100%' : '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: locale === 'ar' ? '100%' : '-100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={cn(
          'fixed top-0 z-[70] flex h-full w-[min(92vw,420px)] flex-col overflow-hidden bg-slate-50 shadow-2xl shadow-slate-900/20 will-change-transform',
          locale === 'ar'
            ? 'right-0 border-l border-white/70'
            : 'left-0 border-r border-white/70'
        )}
        aria-label={mainMenuLabel}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8">
          <div className="mb-8 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
            >
              <Link href="/" className="group block shrink-0" onClick={closeMenu}>
                <div className="relative aspect-[3/1] w-28 transition-transform duration-300 group-hover:scale-[1.02] sm:w-32">
                  <Image
                    src="/Joint Annual Zone logo.png"
                    alt="Joint Annual Zone Logo"
                    fill
                    sizes="(min-width: 640px) 8rem, 7rem"
                    className="object-contain ltr:object-left rtl:object-right"
                  />
                </div>
              </Link>
            </motion.div>

            <motion.button
              type="button"
              onClick={closeMenu}
              aria-label={closeMenuLabel}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.25, ease: 'easeOut' }}
              className={cn("flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100/90 text-stone-600 shadow-sm transition hover:bg-stone-200", accent.hoverText)}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <nav className="space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: index * 0.055 + 0.12,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-[0_8px_20px_rgba(41,37,36,0.04)] transition',
                      isActive ? accent.menuActive : accent.menuInactive
                    )}
                  >
                    <span className={cn('flex items-center justify-center transition', isActive ? 'text-white' : accent.menuIcon)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </div>
      </motion.aside>
      )}
      </AnimatePresence>
    </>
  )
}
