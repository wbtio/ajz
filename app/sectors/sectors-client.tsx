'use client'

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Heart, Cpu, GraduationCap, ArrowLeft } from 'lucide-react'
import type { Tables } from '@/lib/database.types'
import { useI18n } from '@/lib/i18n'
import { mergeSectorWithContent } from './sector-content'

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Building2,
    Heart,
    Cpu,
    GraduationCap,
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function SectorsClient({ sectors }: { sectors: Tables<'sectors'>[] | null }) {
    const { locale, dir } = useI18n()
    const isArabic = locale === 'ar'
    const mergedSectors = (sectors || [])
        .map((sector) => mergeSectorWithContent(sector))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    return (
        <div className="pt-36 pb-12 overflow-hidden" dir={dir} lang={locale}>
            <Container>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16 relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#8b0000]/20 blur-[80px] rounded-full -z-10 animate-pulse"></div>

                    <h1 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-[#8b0000] mb-6">
                        {isArabic ? 'القطاعات' : 'Sectors'}
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {isArabic
                            ? 'تعمل Joint Annual Zone كمنصة ربط استراتيجي، تهدف إلى دمج الأفكار والشركات والكوادر المهنية في كبرى المعارض والمؤتمرات الدولية لتحقيق أهداف عملائها.'
                            : 'Joint Annual Zone operates as a strategic connection platform, integrating ideas, companies, and professional talent into major international exhibitions and conferences.'}
                    </p>
                </motion.div>

                {/* Sectors Grid */}
                {mergedSectors.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
                    >
                        {mergedSectors.map((sector) => {
                            const IconComponent = iconMap[sector.icon || 'Building2'] || Building2
                            return (
                                <motion.div key={sector.id} variants={itemVariants} whileHover={{ y: -5 }}>
                                    <Link href={`/sectors/${sector.slug}`}>
                                        <Card className="h-full hover:shadow-2xl hover:shadow-[#8b0000]/5 transition-all duration-300 group overflow-hidden border-gray-100 hover:border-[#8b0000]/30 bg-white">
                                            <CardContent className="p-8 relative">
                                                {/* decorative background shape */}
                                                <div className="absolute top-0 left-0 w-32 h-32 bg-gray-50/50 rounded-br-full -z-10 group-hover:scale-125 group-hover:bg-[#8b0000]/5 transition-all duration-700"></div>

                                                <div className={`flex flex-col items-start gap-6 relative z-10 ${isArabic ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'}`}>
                                                    {/* Icon */}
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm"
                                                        style={{ backgroundColor: `${sector.color}15` }}
                                                    >
                                                        <IconComponent
                                                            className="w-8 h-8 transition-transform duration-500 group-hover:scale-110"
                                                            style={{ color: sector.color || '#3B82F6' }}
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 mt-2 sm:mt-0">
                                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#8b0000] transition-colors duration-300">
                                                            {isArabic ? sector.name_ar : sector.name}
                                                        </h2>
                                                        <p className="text-gray-600 mb-5 leading-relaxed">
                                                            {isArabic ? (sector.description_ar || sector.description) : sector.description}
                                                        </p>
                                                        <span className="inline-flex items-center text-[#8b0000] font-bold group-hover:text-[#a01010] transition-colors">
                                                            {isArabic ? 'اكتشف المزيد' : 'Discover More'}
                                                            <ArrowLeft className={`w-5 h-5 ${isArabic ? 'mr-2 group-hover:-translate-x-2' : 'ml-2 rotate-180 group-hover:translate-x-2'} transition-transform duration-300`} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <p className="text-gray-500 text-lg">{isArabic ? 'لا توجد قطاعات متاحة حالياً' : 'No sectors available at the moment'}</p>
                    </motion.div>
                )}
            </Container>
        </div>
    )
}
