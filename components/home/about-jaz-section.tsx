'use client'

import { motion, Variants } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { Target, Eye, Star, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CountingNumber } from '@/components/ui/counting-number'

export function AboutJazSection() {
    const { t, locale } = useI18n()
    const isRTL = locale === 'ar'

    const stats = [
        { value: '50+', label: t.about.stats.exhibitions },
        { value: '100K+', label: t.about.stats.visitors },
        { value: '200+', label: t.about.stats.partners },
        { value: '10+', label: t.about.stats.experience },
    ]

    const features = [
        {
            icon: Target,
            title: t.about.mission,
            description: t.about.missionText,
            colSpan: 'lg:col-span-7',
        },
        {
            icon: Eye,
            title: t.about.vision,
            description: t.about.visionText,
            colSpan: 'lg:col-span-5',
        },
        {
            icon: Star,
            title: t.about.values,
            description: t.about.valuesText,
            colSpan: 'lg:col-span-5',
        },
        {
            icon: Users,
            title: t.about.team,
            description: t.about.teamText,
            colSpan: 'lg:col-span-7',
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
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    }

    return (
        <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
            <Container>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <motion.div variants={itemVariants} className="mb-4">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-[#8b0000]/5 text-[#8b0000] text-sm font-medium">
                                {t.about.sectionTitle}
                            </span>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {isRTL ? "نصنع التميز في عالم الفعاليات" : "Creating Excellence in the World of Events"}
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-lg text-gray-500 leading-relaxed">
                            {t.about.description}
                        </motion.p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                        {stats.map((stat, index) => {
                            const numStr = stat.value.replace(/[^0-9]/g, '')
                            const suffix = stat.value.replace(/[0-9]/g, '')
                            const number = parseInt(numStr) || 0

                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100"
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 flex items-center justify-center" dir="ltr">
                                        {number > 0 ? (
                                            <CountingNumber
                                                number={number}
                                                inView
                                                transition={{ stiffness: 50, damping: 30 }}
                                            />
                                        ) : (
                                            numStr
                                        )}
                                        {suffix && <span className="text-[#8b0000]">{suffix}</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Features Header */}
                    <div className="mb-12 text-center">
                        <motion.div variants={itemVariants}>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                {t.about.whatMakesUsDifferent}
                            </h3>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                {t.about.whatMakesUsDifferentDescription}
                            </p>
                        </motion.div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className={`group relative bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${feature.colSpan}`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 shrink-0 rounded-xl bg-[#8b0000]/5 text-[#8b0000] flex items-center justify-center group-hover:bg-[#8b0000] group-hover:text-white transition-colors duration-300">
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8b0000] transition-colors">
                                                {feature.title}
                                            </h4>
                                            <p className="text-gray-500 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </Container>
        </section>
    )
}
