'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon as Iconify } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Theme helpers
// dark  → light text / translucent navy bg  (page is dark, e.g. Home hero)
// light → dark text / translucent white bg  (page is light/white)
// ─────────────────────────────────────────────────────────────────────────────
type HeaderTheme = 'dark' | 'light'

function resolveBaseTheme(pathname: string): HeaderTheme {
  const norm = pathname.toLowerCase().replace(/\/$/, '')
  if (norm === '' || norm === '/blog') return 'dark'
  return 'light'
}

export function Header({ isAdmin }: { isAdmin: boolean }) {
  const { locale, setLocale, t } = useI18n()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  // Tracks whether user has scrolled past the dark hero into the light area
  const [pastHero, setPastHero] = useState(false)
  // Mobile menu open state
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  
  // isAdmin is used in route guarding logic below

  const normalizedPathname = pathname?.toLowerCase() ?? ''
  const isHomePage = normalizedPathname === '/'
  const isRtl = locale === 'ar'

  // ── scroll listener (always registered, hooks must not be conditional) ──
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      // Home hero is ~70-80vh tall. 540px is where the light Sectors section
      // becomes dominant behind the header. For other pages, the hero is shorter.
      setPastHero(y > (isHomePage ? 540 : 200))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Run once on mount so initial state is correct
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

   // ── close drawer on route change ──
   useEffect(() => {
     setMobileOpen(false)
   }, [pathname])

  // ── prevent body scroll when drawer is open ──
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      // Focus the close button for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isEventDetailsPage = /^\/events\/[^/]+\/?$/.test(normalizedPathname)

  // ── guard: hide on admin / dashboard / event-detail routes ──
  if (
    normalizedPathname.startsWith('/dashboard') ||
    normalizedPathname.startsWith('/admin') ||
    normalizedPathname.startsWith('/tasks') ||
    isEventDetailsPage
  ) {
    return null
  }

  // ── resolve effective theme ──
  const isDark = false

  // ── navigation items ──
  const navigation = [
    { name: t.nav.home,     href: '/',         icon: 'solar:home-smile-angle-bold-duotone'    },
    { name: t.nav.partners, href: '/partnership',  icon: 'solar:handshake-bold-duotone'            },
    { name: t.nav.sectors,  href: '/departments',   icon: 'solar:widget-3-bold-duotone'             },
    { name: t.nav.events,   href: '/events',    icon: 'solar:calendar-date-bold-duotone'        },
    { name: t.nav.training, href: '/training',  icon: 'solar:square-academic-cap-bold-duotone'  },
    { name: t.nav.blog,     href: '/blog',      icon: 'solar:notes-bold-duotone'                },
    { name: t.nav.services, href: '/services',  icon: 'solar:settings-bold-duotone'             },
    { name: t.nav.invitationSupport, href: '/invitation-support', icon: 'solar:letter-bold-duotone' },
    { name: t.nav.about,    href: '/about',     icon: 'solar:info-circle-bold-duotone'          },
    { name: t.nav.contact,  href: '/contact',   icon: 'solar:letter-bold-duotone'               },
    { name: t.nav.links,    href: '/links',     icon: 'solar:link-round-bold-duotone'           },
  ]


  const toggleLocale = () => setLocale(locale === 'ar' ? 'en' : 'ar')

  // ──────────────────────────────────────────────────────────────────────────
  // Colour tokens — dynamic glassmorphic styles
  // ──────────────────────────────────────────────────────────────────────────

  // Outer header class (touches top/left/right, with bottom border and glassmorphism)
  const headerClass = cn(
    'w-full transition-all duration-500 border-b px-4 py-3 sm:py-4',
    scrolled
      ? 'border-slate-200 bg-white text-slate-900 shadow-md shadow-slate-900/5'
      : 'border-slate-200/60 bg-white text-slate-800 shadow-sm shadow-slate-900/2'
  )

  // Active indicator pill behind nav item
  const activeTabBg = isDark
    ? 'bg-white shadow-black/10'
    : 'bg-slate-900 shadow-slate-900/10'

  // Active nav text (must contrast with its background)
  const activeTabText = isDark ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold'

  // Inactive nav text
  const inactiveTabText = isDark
    ? 'text-slate-300 hover:text-white hover:bg-white/8'
    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'

  // Logo: invert to white when header is dark
  const logoCn = cn(
    'relative aspect-[3/1] w-20 transition-all duration-500 group-hover:scale-[1.02] sm:w-24 lg:w-28 xl:w-32',
    isDark && 'brightness-0 invert'
  )

  // Language toggle button
  const langBtnCn = cn(
    'flex min-h-10 h-10 items-center gap-2 rounded-2xl border shadow-sm transition-all duration-300 hover:scale-[1.02] px-2.5 sm:px-4',
    isDark
      ? 'border-white/12 bg-white/6 text-white hover:bg-white/14'
      : 'border-slate-200 bg-white/90 text-slate-800 hover:bg-slate-50'
  )

  // Hamburger button colour
  const hamburgerCn = cn(
    'lg:hidden flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 shrink-0',
    isDark
      ? 'border-white/12 bg-white/6 text-white hover:bg-white/14'
      : 'border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100'
  )

  // Mobile drawer - always solid white with dark text
  const drawerBg = 'bg-white text-slate-900'
  const drawerBorder = 'border-slate-200'
  const drawerActiveBg = 'bg-[#001a33] text-white'
  const drawerInactiveText = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  const drawerActiveText = 'text-white'
  const drawerIconInactive = 'text-slate-400'
  const drawerIconActive = 'text-red-500'

  // ── drawer animation: slides from the inline-start edge ──
  // In LTR: left. In RTL: right.
  const drawerVariants = {
    hidden:  isRtl ? { x: '100%' } : { x: '-100%' },
    visible: { x: 0 },
    exit:    isRtl ? { x: '100%' } : { x: '-100%' },
  }

  return (
    <>
      <header
        dir={isRtl ? 'rtl' : 'ltr'}
        lang={locale}
        className="fixed inset-x-0 top-0 z-50 w-full pointer-events-auto"
      >
        <div className={headerClass}>
          <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 w-full flex items-center justify-between gap-3">

            {/* ── Logo ── */}
            <Link href="/" className="group block shrink-0">
              <div className={logoCn}>
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

            {/* ── Navigation (desktop only: lg+) ── */}
            <nav
              aria-label={isRtl ? 'القائمة الرئيسية' : 'Main navigation'}
              className="hidden lg:flex flex-1 items-center justify-start py-1 mx-2"
            >
              <div className="flex items-center gap-0.5 lg:gap-1 xl:gap-1.5 2xl:gap-3 mx-auto min-w-max">
                {navigation.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)

                  const isLinks = item.href === '/links'

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.name}
                      className={cn(
                        'group relative isolate flex items-center justify-center rounded-full transition-all duration-200 shrink-0',
                        isLinks
                          ? 'p-2 w-9 h-9'
                          : 'px-1.5 lg:px-2 xl:px-3 py-1.5 text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-sm font-bold whitespace-nowrap',
                        isActive ? activeTabText : inactiveTabText
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeNavBackground"
                          className={cn(
                            'absolute inset-0 -z-10 rounded-full shadow-md',
                            activeTabBg
                          )}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {isLinks ? (
                        <Iconify
                          icon={item.icon}
                          className="shrink-0 transition-transform duration-300 group-hover:scale-110 w-[19px] h-[19px] xl:w-[21px] xl:h-[21px]"
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language Toggle */}
              <button
                id="header-locale-toggle"
                type="button"
                onClick={toggleLocale}
                aria-label={isRtl ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
                className={langBtnCn}
              >
                <Iconify icon="solar:global-bold-duotone" className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">
                  {locale === 'ar' ? 'EN' : 'ع'}
                </span>
              </button>

              {/* Hamburger (mobile only) */}
              <button
                ref={openButtonRef}
                id="header-mobile-menu-open"
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
                className={hamburgerCn}
              >
                <Iconify icon="solar:hamburger-menu-bold-duotone" className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/80 lg:hidden"
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />

              {/* Drawer panel */}
              <motion.div
                key="mobile-drawer"
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-label={isRtl ? 'القائمة الرئيسية' : 'Main navigation'}
                dir={isRtl ? 'rtl' : 'ltr'}
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.8 }}
                className={cn(
                  'fixed top-0 bottom-0 z-[70] flex flex-col w-72 max-w-[85vw] lg:hidden shadow-2xl',
                  isRtl ? 'right-0' : 'left-0',
                  drawerBg
                )}
              >
                {/* Drawer header */}
                <div className={cn(
                  'flex items-center justify-between px-5 pt-6 pb-4',
                  drawerBorder
                )}>
                 <Link
                   href="/"
                   onClick={() => setMobileOpen(false)}
                   className="group block"
                   aria-label="Joint Annual Zone — Home"
                 >
                   <div className={cn(
                     'relative aspect-[3/1] w-24 transition-opacity group-hover:opacity-80',
                     isDark ? 'brightness-0 invert' : ''
                   )}>
                     <Image
                       src="/Joint Annual Zone logo.png"
                       alt="Joint Annual Zone Logo"
                       fill
                       sizes="6rem"
                       className="object-contain ltr:object-left rtl:object-right"
                       priority
                     />
                   </div>
                 </Link>

                  <button
                    ref={closeButtonRef}
                    id="header-mobile-menu-close"
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      openButtonRef.current?.focus()
                    }}
                    aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                      'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    <Iconify icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
                  </button>
               </div>

               {/* Nav items */}
               <nav
                 aria-label={isRtl ? 'القائمة الرئيسية' : 'Main navigation'}
                 className="flex-1 overflow-y-auto py-4 px-3"
               >
                 <ul role="list" className="flex flex-col gap-1">
                    {navigation.map((item, idx) => {
                      const isActive =
                        item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href)
                     return (
                       <motion.li
                         key={item.href}
                         initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.06 + idx * 0.04, duration: 0.22 }}
                       >
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-all duration-150',
                              isActive
                                ? drawerActiveBg
                                : drawerInactiveText
                            )}
                          >
                            <Iconify
                              icon={item.icon}
                              className={cn('w-5 h-5 shrink-0', 
                                isActive 
                                  ? drawerIconActive
                                  : drawerIconInactive
                              )}
                            />
                            <span className={isActive ? drawerActiveText : drawerInactiveText}>{item.name}</span>
                             {isActive && (
                               <span className={cn(
                                 'ms-auto w-1.5 h-1.5 rounded-full shrink-0',
                                 'bg-red-500'
                               )} />
                             )}
                         </Link>
                       </motion.li>
                     )
                   })}
                 </ul>
               </nav>

                {/* Drawer footer — language toggle */}
                <div className={cn(
                  'px-5 py-5',
                  drawerBorder
                )}>
                  <button
                    type="button"
                    onClick={() => { toggleLocale(); setMobileOpen(false) }}
                    aria-label={isRtl ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border transition-colors px-4 py-3 text-[15px] font-semibold',
                      'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    )}
                  >
                    <Iconify
                      icon="solar:global-bold-duotone"
                      className="w-5 h-5 shrink-0 text-slate-500"
                    />
                    <span>{isRtl ? 'English' : 'العربية'}</span>
                  </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
