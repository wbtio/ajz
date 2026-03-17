'use client'

import { motion, useReducedMotion, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { EyeIcon as Eye, RocketIcon as Rocket, UsersIcon as Users, HeartHandshakeIcon as Handshake } from 'lucide-animated'
import { Briefcase, Globe, Mail, Phone, Target, Trophy } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function AboutJazSection() {
    const { t, locale } = useI18n()
    const isRTL = locale === 'ar'
    const shouldReduceMotion = useReducedMotion()

    const overviewCards = [
        {
            icon: Eye,
            title: t.about.vision,
            description: t.about.visionText,
        },
        {
            icon: Target,
            title: t.about.mission,
            description: t.about.missionText,
        },
        {
            icon: Users,
            title: t.about.partnerTitle,
            description: t.about.partnerText,
        },
    ]

    const pillars = [
        {
            icon: Trophy,
            title: t.about.pillarSuccessTitle,
            description: t.about.pillarSuccessText,
        },
        {
            icon: Handshake,
            title: t.about.pillarRelationshipsTitle,
            description: t.about.pillarRelationshipsText,
        },
        {
            icon: Rocket,
            title: t.about.pillarOpportunitiesTitle,
            description: t.about.pillarOpportunitiesText,
        },
    ]

    const services = [
        {
            icon: Users,
            title: t.about.matchmakingTitle,
            description: t.about.matchmakingText,
        },
        {
            icon: Briefcase,
            title: t.about.trainingTitle,
            description: t.about.trainingText,
        },
    ]

    const contacts = [
        {
            icon: Mail,
            label: t.contact.email,
            value: t.about.contactEmail,
            href: `mailto:${t.about.contactEmail}`,
        },
        {
            icon: Phone,
            label: t.contact.phone,
            value: t.about.contactPhone,
            href: `tel:${t.about.contactPhone}`,
        },
        {
            icon: Globe,
            label: t.about.websiteLabel,
            value: t.about.contactWebsite,
            href: `https://${t.about.contactWebsite}`,
        },
    ]

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants: Variants = {
        hidden: (index: number = 0) => ({
            opacity: 0,
            y: 28,
            x: shouldReduceMotion ? 0 : (isRTL ? (index % 2 === 0 ? 16 : -16) : (index % 2 === 0 ? -16 : 16)),
            scale: 0.98,
        }),
        visible: (index: number = 0) => ({
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.68,
                delay: shouldReduceMotion ? 0 : index * 0.07,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    }

    return (
        <section className="relative -mt-24 overflow-hidden bg-slate-50 pt-32 pb-16 sm:-mt-28 sm:pt-36 sm:pb-20 lg:-mt-32 lg:pt-44 lg:pb-28">
            <div className="home-grid-pattern absolute inset-0"></div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,#f8fafc_0%,rgba(248,250,252,0.92)_54%,transparent_100%)]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#8b0000] opacity-20 blur-[100px]"></div>
            <Container className="relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mx-auto max-w-6xl"
                >
                    <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
                        <motion.div
                            variants={itemVariants}
                            custom={0}
                            className="mb-4"
                        >
                            <span className="inline-flex min-h-11 items-center rounded-full border border-[#8b0000]/12 bg-[#8b0000]/[0.03] px-4 py-1.5 text-sm font-medium text-[#8b0000]">
                                {t.about.sectionTitle}
                            </span>
                        </motion.div>
                        <motion.h2 variants={itemVariants} custom={1} className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:mb-6 md:text-5xl">
                            {t.about.heroTitle}
                        </motion.h2>
                        <motion.p variants={itemVariants} custom={2} className="text-base leading-relaxed text-gray-500 sm:text-lg">
                            {t.about.description}
                        </motion.p>
                    </div>

                    <div className="mb-16 grid grid-cols-1 gap-5 sm:gap-6 lg:mb-20 lg:grid-cols-12">
                        <motion.div
                            variants={itemVariants}
                            custom={0}
                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                            className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-8 md:p-10 lg:col-span-7"
                        >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                            <div className="mb-5 h-1 w-16 rounded-full bg-[#8b0000]" />
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b0000]">
                                {t.about.aboutLabel}
                            </p>
                            <p className="max-w-3xl text-base leading-8 text-gray-700 sm:text-lg md:text-xl">
                                {t.about.longDescription}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:col-span-5">
                            {overviewCards.map((card, index) => {
                                const Icon = card.icon
                                return (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        custom={index + 1}
                                        whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                        transition={{ duration: 0.25 }}
                                        className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#8b0000]/8 text-[#8b0000]">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{card.title}</h3>
                                                <p className="leading-7 text-gray-600">{card.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="relative mb-20 overflow-hidden rounded-[2rem] border border-white/50 bg-white/40 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.05)] backdrop-blur-lg sm:p-8 lg:p-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#8b0000]/5" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
                        <div className="relative z-10">
                        <motion.div variants={itemVariants} custom={1} className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
                            <h3 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                                {t.about.pillarsTitle}
                            </h3>
                            <p className="leading-7 text-gray-500">
                                {t.about.pillarsDescription}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
                            {pillars.map((pillar, index) => {
                                const Icon = pillar.icon

                                return (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        custom={index + 2}
                                        whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                        className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                        <div className={`mb-6 flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#8b0000]/8 text-[#8b0000] sm:h-16 sm:w-16">
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <div className="rounded-full border border-[#8b0000]/12 bg-[#8b0000]/[0.03] px-3 py-1 text-sm font-semibold text-[#8b0000]">
                                                {`0${index + 1}`}
                                            </div>
                                        </div>
                                        <h4 className="mb-3 text-xl font-bold text-gray-900">{pillar.title}</h4>
                                        <p className="leading-7 text-gray-600">{pillar.description}</p>
                                    </motion.div>
                                )
                            })}
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-12">
                        <motion.div
                            variants={itemVariants}
                            custom={0}
                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                            className="group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/30 p-6 shadow-[0_8px_40px_rgba(139,0,0,0.05)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_16px_50px_rgba(139,0,0,0.08)] sm:p-8 md:p-10 lg:col-span-7"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-[#8b0000]/5" />
                            <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-[#8b0000]/10 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                            <div className="relative z-10 flex h-full flex-col">
                                <div className="mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#8b0000] to-red-500" />
                                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b0000]">
                                    {t.about.servicesTitle}
                                </p>
                                <h3 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl">{t.about.servicesHeading}</h3>
                                <p className="mb-8 max-w-2xl leading-relaxed text-slate-600">
                                    {t.about.servicesDescription}
                                </p>

                                <div className="mt-auto grid grid-cols-1 gap-4 sm:gap-5">
                                    {services.map((service, index) => {
                                        const Icon = service.icon
                                        return (
                                            <motion.div
                                                key={index}
                                                variants={itemVariants}
                                                custom={index + 2}
                                                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                                                className="group/service relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/50 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] backdrop-blur-xl transition-all duration-300 hover:bg-white/80 hover:shadow-[0_12px_32px_rgba(139,0,0,0.06)]"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent opacity-50" />
                                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                                                <div className={`relative z-10 flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 text-[#8b0000] transition-colors duration-300 group-hover/service:bg-[#8b0000] group-hover/service:text-white">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-2 text-lg font-bold text-slate-900">{service.title}</h4>
                                                        <p className="leading-relaxed text-slate-600">{service.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-5">
                            <motion.div variants={itemVariants} custom={1} whileHover={shouldReduceMotion ? undefined : { y: -4 }} className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(139,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_16px_40px_rgba(139,0,0,0.08)] sm:p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent" />
                                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-[50px] transition-opacity duration-500 group-hover:bg-cyan-400/20" />
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                                <div className="relative z-10">
                                    <div className="mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r from-[#8b0000] to-red-500" />
                                    <h3 className="mb-4 text-2xl font-bold text-slate-900">{t.about.whyTitle}</h3>
                                    <p className="leading-relaxed text-slate-600">{t.about.whyText}</p>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} custom={2} whileHover={shouldReduceMotion ? undefined : { y: -4 }} className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(139,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_16px_40px_rgba(139,0,0,0.08)] sm:p-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/10 blur-[50px] transition-opacity duration-500 group-hover:bg-amber-400/20" />
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                                <div className="relative z-10 flex flex-col">
                                    <div className="mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r from-[#8b0000] to-red-500" />
                                    <div className={`${isRTL ? 'text-right' : ''}`}>
                                        <h3 className="text-2xl font-bold text-slate-900">{t.contact.title}</h3>
                                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-[0.95rem]">
                                            {isRTL ? 'يمكنك التواصل معنا مباشرة عبر البريد أو الهاتف أو الموقع الرسمي.' : 'Reach us directly by email, phone, or through the official website.'}
                                        </p>
                                    </div>
                                    <div className="relative z-20 mt-6 space-y-2 rounded-[1.6rem] border border-white/70 bg-white/80 p-2.5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-3">
                                        {contacts.map((contact, index) => {
                                            const Icon = contact.icon
                                            return (
                                                <a
                                                    key={index}
                                                    href={contact.href}
                                                    className={`group/link relative flex min-h-14 items-center gap-3 overflow-hidden rounded-[1.25rem] border border-slate-200/70 bg-white px-3 py-3.5 shadow-[0_6px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8b0000]/15 hover:bg-white hover:shadow-[0_12px_28px_rgba(139,0,0,0.08)] sm:min-h-16 sm:px-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                                                >
                                                    <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100 ${isRTL ? 'bg-gradient-to-l from-[#8b0000]/[0.04] via-white/40 to-transparent' : 'bg-gradient-to-r from-[#8b0000]/[0.04] via-white/40 to-transparent'}`} />
                                                    <div className={`relative z-10 flex w-full items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 text-[#8b0000] transition-colors duration-300 group-hover/link:bg-[#8b0000] group-hover/link:text-white sm:h-12 sm:w-12">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className={`flex min-w-0 flex-1 flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                                                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">{contact.label}</p>
                                                            <p className="mt-1 break-all text-sm font-semibold text-slate-900 sm:text-base" dir="ltr">{contact.value}</p>
                                                        </div>
                                                        <div className={`shrink-0 text-slate-300 transition-colors duration-300 group-hover/link:text-[#8b0000] ${isRTL ? 'rotate-180' : ''}`}>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                                        </div>
                                                    </div>
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </section>
    )
}
