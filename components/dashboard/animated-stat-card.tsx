'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface AnimatedStatCardProps {
    name: string
    value: number
    icon: React.ReactNode
    color: string
    textColor: string
    bgLight: string
    index: number
    href?: string
}

export function AnimatedStatCard({
    name,
    value,
    icon,
    color,
    textColor,
    bgLight,
    index,
    href
}: AnimatedStatCardProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    // Animation for the number
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        duration: 2
    })

    useEffect(() => {
        if (isInView) {
            motionValue.set(value)
        }
    }, [isInView, value, motionValue])

    const Content = (
        <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer h-full">
            <CardContent className="p-6 relative">
                {/* Background Decoration */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bgLight} opacity-50 group-hover:scale-150 transition-transform duration-500`} />

                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`p-3 rounded-xl ${bgLight} group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgLight} ${textColor} flex items-center gap-1`}>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + (index * 0.1) }}
                        >
                            +
                        </motion.span>
                    </span>
                </div>

                <div className="relative z-10">
                    <p className="text-sm font-medium text-gray-500 mb-1">{name}</p>
                    <div className="flex items-baseline gap-1">
                        <motion.h3 className="text-3xl font-bold text-gray-900">
                            <NumberDisplay value={springValue} />
                        </motion.h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <motion.div
            ref={ref}
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : { y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            {href ? (
                <Link href={href} className="block h-full">
                    {Content}
                </Link>
            ) : Content}
        </motion.div>
    )
}

function NumberDisplay({ value }: { value: any }) {
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        return value.on("change", (latest: number) => {
            if (ref.current) {
                // Format number with commas or just integer
                ref.current.textContent = Math.floor(latest).toLocaleString('en-US')
            }
        })
    }, [value])

    return <span ref={ref} />
}
