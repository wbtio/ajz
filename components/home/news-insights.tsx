'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import type { Tables } from '@/lib/database.types'

type Post = Tables<'posts'>

interface NewsInsightsProps {
  posts?: Post[]
}

export function NewsInsights({ posts = [] }: NewsInsightsProps) {
  const { t, locale, dir } = useI18n()
  const isRTL = locale === 'ar'
  const shouldReduceMotion = useReducedMotion() ?? false

  const defaultPosts = [
    {
      id: '1',
      slug: 'digital-infrastructure-iraq',
      title: isRTL 
        ? 'تمكين البنية التحتية الرقمية في العراق' 
        : 'Empowering Iraq\'s Digital Infrastructure',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '2',
      slug: 'healthcare-collaboration-basra',
      title: isRTL 
        ? 'آفاق التعاون الصحي الثنائي في البصرة' 
        : 'Bilateral Healthcare Collaborations in Basra',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '3',
      slug: 'jaz-delegation-global-expo',
      title: isRTL 
        ? 'جاز يقود وفداً تجارياً إلى المعرض العالمي' 
        : 'JAZ Leads Commercial Delegation to Global Expo',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
    },
  ]

  // Convert DB posts if available, otherwise use defaults
  const displayPosts = posts.length > 0 
    ? posts.slice(0, 3).map(p => ({
        id: p.id,
        slug: p.slug,
        title: isRTL ? p.title_ar || p.title : p.title || p.title_ar,
        image: p.image_url || p.featured_image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80'
      }))
    : defaultPosts

  return (
    <div className="w-full text-start" data-purpose="news-insights">
      <h2 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-[#8B0000] rounded-sm"></span>
        {t.homepage.news.title}
      </h2>
      
      <div className="flex gap-3">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={shouldReduceMotion ? {} : { y: -3, scale: 1.02 }}
            className="flex-1 aspect-[4/5] relative bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden shadow-sm group cursor-pointer"
          >
            <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20" aria-label={post.title || undefined} />
            <Image
              src={post.image}
              alt={post.title || ''}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-108"
              sizes="(max-width: 768px) 100px, 150px"
            />
            {/* Soft text overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300 z-10" />
            
            <div className="absolute inset-x-0 bottom-0 p-3 z-15 flex flex-col justify-end h-full">
              <span className="text-[9px] font-bold text-slate-200 leading-tight line-clamp-2">
                {post.title}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
