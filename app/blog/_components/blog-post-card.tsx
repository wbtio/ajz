'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowUpLeft, ArrowUpRight, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { Database } from '@/lib/database.types'
import { formatCategoryName } from './blog-filter-bar'

type Post = Database['public']['Tables']['posts']['Row']

interface BlogPostCardProps {
  post: Post
  variant?: 'default' | 'compact'
}

export function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const { locale } = useI18n()
  const isRTL = locale === 'ar'
  const dateLocale = isRTL ? 'ar-IQ' : 'en-US'
  const ReadArrow = isRTL ? ArrowUpRight : ArrowUpLeft

  const title = isRTL ? post.title_ar || post.title : post.title || post.title_ar || ''
  const excerpt =
    isRTL
      ? post.excerpt_ar || post.excerpt || post.content_ar?.substring(0, 150)
      : post.excerpt || post.excerpt_ar || post.content?.substring(0, 150)

  const isCompact = variant === 'compact'

  return (
    <Link key={post.id} href={`/blog/${post.id}`} className="group h-full">
      <article
        className={`flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)] ${
          isCompact ? 'rounded-[1rem]' : ''
        }`}
      >
        <div data-impeccable-variants="155927ec" data-impeccable-variant-count="4" style={{ display: 'contents' }}>
          {/* impeccable-variants-start 155927ec */}
          {/* Original */}
          <div data-impeccable-variant="original">
            <div className="relative h-28 sm:h-32 md:h-36 w-full overflow-hidden bg-slate-100">
              <Image
                src={post.image_url || '/image/default_blog_cover.png'}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          {/* Variants: insert below this line */}
          <style data-impeccable-css="155927ec">{`
            @scope ([data-impeccable-variant="1"]) {
              :scope > .v1-container {
                position: relative;
                height: 7rem;
                @media (min-width: 640px) { height: 8rem; }
                @media (min-width: 768px) { height: 9rem; }
                width: 100%;
                overflow: hidden;
                background: #001a33;
                border-bottom: 2px solid #8B0000;
              }
              :scope .v1-image {
                object-fit: cover;
                transition: transform 0.5s ease-out, filter 0.5s ease-out;
                opacity: calc(1.0 - var(--p-contrast, 0.2));
              }
              :scope > .v1-container:hover .v1-image {
                transform: scale(1.05);
              }
              :scope .v1-overlay-text {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 3rem;
                font-weight: 900;
                color: #8B0000;
                opacity: 0.12;
                pointer-events: none;
                user-select: none;
                font-family: var(--font-plus-jakarta-sans), sans-serif;
                transition: transform 0.5s ease-out, opacity 0.5s ease-out;
              }
              :scope[data-p-monogram-size="giant"] .v1-overlay-text {
                font-size: 4.5rem;
                opacity: 0.18;
              }
              :scope > .v1-container:hover .v1-overlay-text {
                transform: translateY(-5px) scale(1.05);
                opacity: 0.25;
              }
              :scope .v1-badge {
                position: absolute;
                bottom: 1rem;
                left: 1.5rem;
                background: #8B0000;
                color: #ffffff;
                font-size: 0.7rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                padding: 0.35rem 0.8rem;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(139, 0, 0, 0.25);
                z-index: 10;
              }
            }
            @scope ([data-impeccable-variant="2"]) {
              :scope > .v2-container {
                position: relative;
                height: 7rem;
                @media (min-width: 640px) { height: 8rem; }
                @media (min-width: 768px) { height: 9rem; }
                width: 100%;
                overflow: hidden;
                background: #001a33;
              }
              :scope .v2-image-wrap {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
              }
              :scope .v2-slash {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(139, 0, 0, 0.95), rgba(0, 26, 51, 0.98));
                clip-path: polygon(0 0, 60% 0, 40% 100%, 0% 100%);
                z-index: 10;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 1.5rem;
                color: #ffffff;
                transition: clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              }
              :scope[data-p-angle="steep"] .v2-slash {
                clip-path: polygon(0 0, 75% 0, 45% 100%, 0% 100%);
              }
              :scope .v2-slash-content {
                max-width: 55%;
              }
              :scope .v2-image {
                object-fit: cover;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
              }
              :scope .v2-image.v2-duotone-active {
                filter: sepia(1) hue-rotate(320deg) saturate(1.5) contrast(1.2);
              }
              :scope > .v2-container:hover .v2-image {
                transform: scale(1.08);
              }
              :scope > .v2-container:hover .v2-slash {
                clip-path: polygon(0 0, 5% 0, 0% 100%, 0% 100%);
              }
            }
            @scope ([data-impeccable-variant="3"]) {
              :scope > .v3-container {
                position: relative;
                height: 7rem;
                @media (min-width: 640px) { height: 8rem; }
                @media (min-width: 768px) { height: 9rem; }
                background: #001a33;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: var(--p-frame-inset, 16px);
                transition: padding 0.3s ease;
              }
              :scope .v3-frame {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #111e38;
                border: 1px solid rgba(139, 0, 0, 0.6);
                transition: border-color 0.3s ease, transform 0.4s ease;
              }
              :scope[data-p-border-style="double"] .v3-frame {
                border: 3px double rgba(139, 0, 0, 0.8);
              }
              :scope > .v3-container:hover .v3-frame {
                border-color: #8B0000;
                transform: scale(0.98);
              }
              :scope .v3-image {
                object-fit: cover;
                transition: transform 0.5s ease;
              }
              :scope > .v3-container:hover .v3-image {
                transform: scale(1.06);
              }
              :scope .v3-label {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: rgba(0, 26, 51, 0.85);
                border: 1px dashed rgba(255, 255, 255, 0.3);
                color: #ffffff;
                font-size: 0.6rem;
                padding: 0.2rem 0.5rem;
                font-family: monospace;
                letter-spacing: 0.1em;
                backdrop-filter: blur(4px);
              }
            }
            @scope ([data-impeccable-variant="4"]) {
              :scope > .v4-container {
                position: relative;
                height: 7rem;
                @media (min-width: 640px) { height: 8rem; }
                @media (min-width: 768px) { height: 9rem; }
                overflow: hidden;
                background: #0f172a;
              }
              :scope .v4-image {
                object-fit: cover;
                transition: transform 0.5s ease;
              }
              :scope > .v4-container:hover .v4-image {
                transform: scale(1.04);
              }
              :scope .v4-mesh {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 10;
                opacity: var(--p-mesh-opacity, 0.45);
                background-image: 
                  radial-gradient(circle, rgba(139, 0, 0, 0.4) 1px, transparent 1px),
                  linear-gradient(to right, rgba(139, 0, 0, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(139, 0, 0, 0.15) 1px, transparent 1px);
                background-size: 20px 20px;
                transition: opacity 0.3s ease;
              }
              :scope .v4-banner {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                width: 2rem;
                background: #8B0000;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.65rem;
                font-weight: 900;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                z-index: 12;
                box-shadow: 2px 0 10px rgba(0,0,0,0.2);
              }
              :scope[data-p-banner-side="right"] .v4-banner {
                left: auto;
                right: 0;
                box-shadow: -2px 0 10px rgba(0,0,0,0.2);
              }
            }
          `}</style>

          <div data-impeccable-variant="1" data-impeccable-params='[
            {"id":"contrast","kind":"range","min":0,"max":0.8,"step":0.05,"default":0.2,"label":"Contrast Overlay"},
            {"id":"monogram-size","kind":"steps","default":"standard","label":"Monogram Size","options":[
              {"value":"standard","label":"Standard"},
              {"value":"giant","label":"Giant"}
            ]}
          ]' style={{ display: 'none' }}>
            <div className="v1-container">
              <Image
                src={post.image_url || '/image/default_blog_cover.png'}
                alt={title}
                fill
                className="v1-image"
              />
              <div className="v1-overlay-text">JAZ</div>
              <span className="v1-badge">JAZ BLOG</span>
            </div>
          </div>

          <div data-impeccable-variant="2" data-impeccable-params='[
            {"id":"duotone","kind":"toggle","default":true,"label":"Sovereign Duotone"},
            {"id":"angle","kind":"steps","default":"standard","label":"Slash Angle","options":[
              {"value":"standard","label":"Standard"},
              {"value":"steep","label":"Steep"}
            ]}
          ]' style={{ display: 'none' }}>
            <div className="v2-container">
              <div className="v2-slash">
                <div className="v2-slash-content text-left">
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-wider block mb-1">SOVEREIGN</span>
                  <h4 className="text-xs font-black tracking-tight leading-tight uppercase">Zone Insight</h4>
                </div>
              </div>
              <div className="v2-image-wrap">
                <Image
                  src={post.image_url || '/image/default_blog_cover.png'}
                  alt={title}
                  fill
                  className="v2-image v2-duotone-active"
                />
              </div>
            </div>
          </div>

          <div data-impeccable-variant="3" data-impeccable-params='[
            {"id":"frame-inset","kind":"range","min":12,"max":28,"step":2,"default":16,"label":"Frame Inset (px)"},
            {"id":"border-style","kind":"steps","default":"double","label":"Frame Border","options":[
              {"value":"single","label":"Single Pinstripe"},
              {"value":"double","label":"Double Crest"}
            ]}
          ]' style={{ display: 'none' }}>
            <div className="v3-container">
              <div className="v3-frame">
                <Image
                  src={post.image_url || '/image/default_blog_cover.png'}
                  alt={title}
                  fill
                  className="v3-image"
                />
                <span className="v3-label">PRESTIGE</span>
              </div>
            </div>
          </div>

          <div data-impeccable-variant="4" data-impeccable-params='[
            {"id":"mesh-opacity","kind":"range","min":0.1,"max":0.8,"step":0.05,"default":0.45,"label":"Coordinate Mesh Opacity"},
            {"id":"banner-side","kind":"steps","default":"left","label":"Meridian Side","options":[
              {"value":"left","label":"Left Edge"},
              {"value":"right","label":"Right Edge"}
            ]}
          ]' style={{ display: 'none' }}>
            <div className="v4-container">
              <div className="v4-banner">MERIDIAN</div>
              <div className="v4-mesh"></div>
              <Image
                src={post.image_url || '/image/default_blog_cover.png'}
                alt={title}
                fill
                className="v4-image"
              />
            </div>
          </div>
          {/* impeccable-variants-end 155927ec */}
        </div>

        <div className="flex flex-grow flex-col p-3.5 sm:p-4 text-start">
          {post.category && (
            <span className="mb-1 inline-flex w-fit items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">
              <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
              {formatCategoryName(post.category, isRTL)}
            </span>
          )}

          <h2
            className={`mb-1.5 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-slate-700 text-sm sm:text-base`}
          >
            {title}
          </h2>

          <p className="mb-3 line-clamp-2 flex-grow text-[11px] sm:text-xs leading-relaxed text-slate-500">{excerpt}</p>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {formatDateTime(post.published_at || post.created_at || '', dateLocale)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors duration-300 group-hover:bg-slate-800">
              <ReadArrow className="h-4 w-4 text-slate-700 transition-colors duration-300 group-hover:text-white" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
