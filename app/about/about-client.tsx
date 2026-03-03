'use client'

import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Eye, Award, Users } from 'lucide-react'
import { motion, Variants, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

const values = [
    {
        icon: Target,
        title: 'Our Mission',
        description: 'Delivering exceptional event and exhibition services that contribute to the development of economic sectors in Iraq.',
    },
    {
        icon: Eye,
        title: 'Our Vision',
        description: 'To be the leading company in organizing events and exhibitions across Iraq and the region.',
    },
    {
        icon: Award,
        title: 'Our Values',
        description: 'Quality, innovation, professionalism, and commitment to delivering the best experience for our clients and partners.',
    },
    {
        icon: Users,
        title: 'Our Team',
        description: 'A specialized team of experts in event management, marketing, and administration.',
    },
]

const stats = [
    { value: 50, suffix: '+', label: 'Successful Exhibitions' },
    { value: 100, suffix: 'K+', label: 'Visitors' },
    { value: 200, suffix: '+', label: 'Partners' },
    { value: 10, suffix: '+', label: 'Years Experience' },
]

function AnimatedNumber({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
    })
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [isInView, motionValue, value])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat('en-US').format(Math.floor(latest))
            }
        })
    }, [springValue])

    return <span ref={ref}>0</span>
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export function AboutClient() {
    return (
        <div className="pt-36 pb-12 overflow-hidden" dir="ltr" lang="en">
            <Container>
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-20 relative"
                >
                    {/* subtle animated background blur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#8b0000]/20 blur-[100px] rounded-full opacity-50 -z-10 animate-pulse"></div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8b0000] to-gray-900"
                    >
                        About Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        <strong className="text-[#8b0000] font-bold">JAZ (Joint Annual Zone to Your Place)</strong> is a leading Iraqi company specialized in organizing events, exhibitions, and training programs. We work to connect various economic sectors and provide platforms for networking and growth.
                    </motion.p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 relative z-10"
                >
                    {stats.map((stat) => (
                        <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                            <Card className="h-full border-[#8b0000]/10 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#8b0000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="p-8 text-center relative z-10">
                                    <motion.p
                                        className="text-4xl lg:text-5xl font-black text-[#8b0000] mb-3 drop-shadow-sm"
                                    >
                                        <AnimatedNumber value={stat.value} />{stat.suffix}
                                    </motion.p>
                                    <p className="text-gray-500 font-medium text-lg">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Values */}
                <div className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-[#8b0000]">
                            What Sets Us Apart
                        </h2>
                        <div className="h-1.5 w-24 bg-[#8b0000] rounded-full mx-auto mt-4"></div>
                    </motion.div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {values.map((value) => (
                            <motion.div key={value.title} variants={itemVariants}>
                                <Card className="h-full overflow-hidden group hover:shadow-2xl hover:shadow-[#8b0000]/5 transition-all duration-500 border-gray-100 hover:border-[#8b0000]/30 bg-white">
                                    <CardContent className="p-8 flex flex-col sm:flex-row gap-6 items-start relative">
                                        {/* decorative background shape */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b0000]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                                        <div className="p-5 bg-gradient-to-br from-[#8b0000]/5 to-[#8b0000]/10 group-hover:from-[#8b0000] group-hover:to-[#a01010] transition-colors duration-500 rounded-2xl shrink-0 shadow-sm">
                                            <value.icon className="w-8 h-8 text-[#8b0000] group-hover:text-white transition-colors duration-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#8b0000] transition-colors">
                                                {value.title}
                                            </h3>
                                            <p className="text-gray-600 text-lg leading-relaxed">{value.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Story */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative bg-gradient-to-br from-white to-[#8b0000]/5 rounded-3xl p-8 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#8b0000]/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 translate-x-1/3 -translate-y-1/3 animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#a52a2a]/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDuration: '5s' }}></div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-4 mb-8">
                                <span className="w-12 h-1.5 bg-[#8b0000] rounded-full"></span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                    Our Story
                                </h2>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-600">
                                <TextGenerateEffect
                                    words="Our journey in Iraq began with a clear vision: to create an integrated platform that brings together various economic sectors and provides opportunities for networking and development. Over the years, we have successfully organized dozens of exhibitions and events that have attracted thousands of visitors and participants."
                                    className="text-xl leading-relaxed mb-6 font-normal"
                                    duration={0.7}
                                    staggerDelay={0.05}
                                />
                                <TextGenerateEffect
                                    words="We believe that events and exhibitions are powerful tools for economic development, and we always strive to deliver exceptional experiences that meet the expectations of our clients and partners."
                                    className="text-xl leading-relaxed font-normal"
                                    duration={0.7}
                                    staggerDelay={0.05}
                                />
                            </div>
                        </div>
                        {/* Decorative image placeholder */}
                        <div className="hidden lg:block lg:w-1/3 relative">
                            <div className="aspect-square rounded-full bg-gradient-to-tr from-[#8b0000]/10 to-white shadow-xl shadow-[#8b0000]/5 flex items-center justify-center p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                <Target className="w-32 h-32 text-[#8b0000]/20" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    )
}
