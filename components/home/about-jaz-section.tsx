'use client'

import { motion, useReducedMotion, Variants } from 'framer-motion'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { EyeIcon as Eye, RocketIcon as Rocket, UsersIcon as Users, HeartHandshakeIcon as Handshake } from 'lucide-animated'
import { Briefcase, Target, Trophy } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function AboutJazSection() {
    const { t, locale, dir } = useI18n()
    const isRTL = locale === 'ar'
    const shouldReduceMotion = useReducedMotion()

    const overviewCards = [
        { icon: Eye,    title: t.about.vision,  description: t.about.visionText },
        { icon: Target, title: t.about.mission, description: t.about.missionText },
    ]

    const pillars = [
        { icon: Trophy,    title: t.about.pillarSuccessTitle,       description: t.about.pillarSuccessText },
        { icon: Handshake, title: t.about.pillarRelationshipsTitle, description: t.about.pillarRelationshipsText },
        { icon: Rocket,    title: t.about.pillarOpportunitiesTitle, description: t.about.pillarOpportunitiesText },
    ]

    const services = [
        { icon: Users,    title: t.about.matchmakingTitle, description: t.about.matchmakingText },
        { icon: Briefcase, title: t.about.trainingTitle,  description: t.about.trainingText },
    ]

    // ── Shared timing ────────────────────────────────────────────────
    const D = shouldReduceMotion ? 0 : 1.0
    const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
    const vp = { once: true, margin: '-80px' as const }

    // ── Base variants ────────────────────────────────────────────────
    const fadeUp: Variants = {
        hidden:  { opacity: 0, y: shouldReduceMotion ? 0 : 32, scale: shouldReduceMotion ? 1 : 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: D, ease } },
    }

    const fadeLeft: Variants = {
        hidden:  { opacity: 0, x: shouldReduceMotion ? 0 : (isRTL ? 55 : -55), y: shouldReduceMotion ? 0 : 18, scale: shouldReduceMotion ? 1 : 0.97 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: D, ease } },
    }

    const fadeRight: Variants = {
        hidden:  { opacity: 0, x: shouldReduceMotion ? 0 : (isRTL ? -55 : 55), y: shouldReduceMotion ? 0 : 18, scale: shouldReduceMotion ? 1 : 0.97 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: D, ease } },
    }

    // ── Stagger wrappers ─────────────────────────────────────────────
    const staggerRow: Variants = {
        hidden:  {},
        visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.2 } },
    }

    const staggerItems: Variants = {
        hidden:  {},
        visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.15 } },
    }

    // ── whileInView shorthand ────────────────────────────────────────
    const inView = {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: vp,
    }

    return (
        <section
            dir={dir}
            lang={locale}
            className="relative -mt-24 overflow-hidden bg-slate-50 pt-32 pb-6 sm:-mt-28 sm:pt-36 sm:pb-8 lg:-mt-32 lg:pt-44 lg:pb-10"
        >
            <div className="home-grid-pattern absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,#f8fafc_0%,rgba(248,250,252,0.92)_54%,transparent_100%)]" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-slate-500 opacity-20 blur-[100px]" />

            <Container className="relative z-10">
                <div className="mx-auto max-w-6xl">

                    {/* ── Section title ─────────────────────────────────────── */}
                    <motion.div variants={fadeUp} {...inView} className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
                        <span className="mb-3 block text-2xl font-bold text-gray-900 md:text-3xl">
                            {t.about.aboutLabel}
                        </span>
                    </motion.div>

                    {/* ── Description + Vision/Mission ──────────────────────── */}
                    <motion.div
                        variants={staggerRow}
                        initial="hidden"
                        whileInView="visible"
                        viewport={vp}
                        className="mb-16 grid grid-cols-1 gap-5 sm:gap-6 lg:mb-20 lg:grid-cols-12"
                    >
                        {/* Left – long description */}
                        <motion.div
                            variants={fadeLeft}
                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                            className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-8 md:p-10 lg:col-span-7"
                        >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                            <div className="mb-5 h-1 w-16 rounded-full bg-slate-600" />
                            <p className={`max-w-3xl text-start text-base text-gray-700 sm:text-lg md:text-xl ${isRTL ? 'leading-[2.05]' : 'leading-8'}`}>
                                {t.about.longDescription}
                            </p>
                        </motion.div>

                        {/* Right – Vision & Mission cards */}
                        <motion.div variants={staggerItems} className="grid grid-cols-1 gap-4 sm:gap-5 lg:col-span-5">
                            {overviewCards.map((card, index) => {
                                const Icon = card.icon
                                return (
                                    <motion.div
                                        key={index}
                                        variants={fadeRight}
                                        whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                        className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-600/8 text-slate-700">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1 text-start">
                                                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{card.title}</h3>
                                                <p className="leading-7 text-gray-600">{card.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </motion.div>

                    {/* ── Our Services ──────────────────────────────────────── */}
                    <div className="mb-16 lg:mb-20">
                        <motion.div variants={fadeUp} {...inView} className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
                            <h3 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                                {t.about.ourServicesTitle}
                            </h3>
                            <p className="text-base text-gray-600 leading-7">
                                {t.about.ourServicesSubtitle}
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerItems}
                            {...inView}
                            className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3"
                        >
                            {[
                                { image: '/image/JAZ Industrie (4).svg', title: t.about.serviceEventMgmtTitle,  text: t.about.serviceEventMgmtText },
                                { image: '/image/JAZ Industrie (3).svg', title: t.about.serviceExhibitionTitle, text: t.about.serviceExhibitionText },
                                { image: '/image/image copy 2.png',      title: t.about.serviceCustomerTitle,   text: t.about.serviceCustomerText },
                            ].map((service, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeUp}
                                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                    className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
                                >
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                    <div className="p-4 pb-0">
                                        <div className="relative h-32 overflow-hidden rounded-[1.25rem]">
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                fill
                                                className="object-cover"
                                                unoptimized={service.image.endsWith('.svg')}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 text-start">
                                        <h4 className="mb-2 text-lg font-bold text-gray-900">{service.title}</h4>
                                        <p className={isRTL ? 'leading-8 text-gray-600' : 'leading-7 text-gray-600'}>{service.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Pillars ───────────────────────────────────────────── */}
                    <motion.div variants={fadeUp} {...inView} className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                            {t.about.pillarsTitle}
                        </h3>
                    </motion.div>

                    <div className="relative mb-20 overflow-hidden rounded-[2rem] border border-white/50 bg-white/40 p-4 shadow-[0_30px_100px_rgba(15,23,42,0.05)] backdrop-blur-lg sm:p-5 lg:p-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-500/5" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
                        <div className="relative z-10">
                            <motion.div
                                variants={staggerItems}
                                {...inView}
                                className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3"
                            >
                                {pillars.map((pillar, index) => {
                                    const Icon = pillar.icon
                                    return (
                                        <motion.div
                                            key={index}
                                            variants={fadeUp}
                                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                            className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 p-4 text-start shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5"
                                        >
                                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                            <div className="mb-3 flex justify-start">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-600/8 text-slate-700">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <h4 className="mb-2 text-base font-bold text-gray-900">{pillar.title}</h4>
                                            <p className="text-sm leading-6 text-gray-600">{pillar.description}</p>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        </div>
                    </div>

                    {/* ── Training & Contacts ───────────────────────────────── */}
                    <div className="pt-10 sm:pt-12">
                        <motion.div variants={fadeUp} {...inView} className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
                            <span className="mb-3 block text-2xl font-bold text-gray-900 md:text-3xl">
                                {t.about.servicesTitle}
                            </span>
                        </motion.div>

                        <motion.div
                            variants={staggerRow}
                            {...inView}
                            className="grid grid-cols-1 items-stretch gap-5 sm:gap-6"
                        >
                            {/* Left – service cards */}
                            <motion.div
                                variants={fadeLeft}
                                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                className="group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/30 p-4 shadow-[0_8px_40px_rgba(51,65,85,0.05)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_16px_50px_rgba(51,65,85,0.08)] sm:p-5 md:p-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-slate-500/5" />
                                <div className="absolute -bottom-32 -start-32 h-64 w-64 rounded-full bg-slate-500/10 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                                <div className="relative z-10 flex h-full flex-col">
                                    <motion.div variants={staggerItems} className="grid grid-cols-1 gap-4 sm:gap-5">
                                        {services.map((service, index) => {
                                            const Icon = service.icon
                                            return (
                                                <motion.div
                                                    key={index}
                                                    variants={fadeUp}
                                                    whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                                                    className="group/service relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/50 p-5 text-start shadow-[0_4px_24px_rgba(15,23,42,0.03)] backdrop-blur-xl transition-all duration-300 hover:bg-white/80 hover:shadow-[0_12px_32px_rgba(51,65,85,0.06)]"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent opacity-50" />
                                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                                                    <div className="relative z-10 flex items-start gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 text-slate-700 transition-colors duration-300 group-hover/service:bg-slate-700 group-hover/service:text-white">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="mb-2 text-lg font-bold text-slate-900">{service.title}</h4>
                                                            <p className={isRTL ? 'leading-8 text-slate-600' : 'leading-relaxed text-slate-600'}>{service.description}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </motion.div>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>

                </div>
            </Container>
        </section>
    )
}
