'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Bot,
  X,
  ChevronLeft,
  Sparkles,
  Building2,
  CalendarDays,
  LayoutGrid,
  Handshake,
  GraduationCap,
  Briefcase,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { FAQ, type FaqItem } from '@/lib/chatbot/faq'
import { usePathname } from 'next/navigation'

type Role = 'user' | 'assistant'
interface Message {
  role: Role
  content: string
}

const ICONS: Record<string, LucideIcon> = {
  Building2,
  CalendarDays,
  LayoutGrid,
  Handshake,
  GraduationCap,
  Briefcase,
  Phone,
}

const STRINGS = {
  ar: {
    title: 'مساعد JAZ',
    subtitle: 'متواجد الآن · اختر سؤالك',
    greeting:
      'أهلاً وسهلاً! 👋\nأنا مساعد JAZ. اختر أحد المواضيع تحت ثم اضغط على السؤال اللي يهمك وراح يطلعلك الجواب فوراً.',
    pickTopic: 'اختر موضوعاً:',
    pickQuestion: 'اختر سؤالاً:',
    back: 'رجوع للمواضيع',
    open: 'افتح المساعد',
    whatsapp: 'تواصل معنا عبر واتساب',
    waIntro: 'مرحباً، هذه محادثتي مع مساعد JAZ:',
    more: 'عندك سؤال ثاني؟ اختر من المواضيع.',
  },
  en: {
    title: 'JAZ Assistant',
    subtitle: 'Online · Pick a question',
    greeting:
      "Hello! 👋\nI'm the JAZ assistant. Pick a topic below, then tap the question you care about and you'll get the answer instantly.",
    pickTopic: 'Choose a topic:',
    pickQuestion: 'Choose a question:',
    back: 'Back to topics',
    open: 'Open assistant',
    whatsapp: 'Contact us on WhatsApp',
    waIntro: 'Hello, here is my chat with the JAZ assistant:',
    more: 'Another question? Pick a topic.',
  },
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.738-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

export function ChatWidget() {
  const { locale, dir } = useI18n()
  const t = STRINGS[locale] ?? STRINGS.ar
  const categories = FAQ[locale] ?? FAQ.ar
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeCat, setActiveCat] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const normalizedPathname = pathname?.toLowerCase() ?? ''

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, activeCat])

  function askQuestion(item: FaqItem) {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: item.q },
      { role: 'assistant', content: item.a },
    ])
  }

  const activeCategory = categories.find((c) => c.id === activeCat) ?? null

  function whatsappUrl() {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? '🧑' : '🤖'} ${m.content}`)
      .join('\n\n')
    const text = `${t.waIntro}\n\n${transcript}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  if (normalizedPathname.startsWith('/dashboard') || normalizedPathname.startsWith('/admin-login')) return null

  return (
    <div dir={dir} className="fixed bottom-5 end-5 z-[60] flex flex-col items-end gap-3 print:hidden">
      {/* Chat panel */}
      {open && (
        <div
          className="flex h-[min(75vh,620px)] w-[min(calc(100vw-2rem),400px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20 ring-1 ring-black/8 animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label={t.title}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <Bot className="h-5 w-5" />
                <span className="absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-emerald-400" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-wide">{t.title}</p>
                <p className="flex items-center gap-1 text-[11px] text-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="relative rounded-full p-1.5 transition-colors hover:bg-white/20"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-4">
            <div className="space-y-3">
              <Bubble role="assistant">{t.greeting}</Bubble>

              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.content}
                </Bubble>
              ))}
            </div>

            {messages.length > 0 && WHATSAPP_NUMBER && (
              <div className="mt-4">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#20bd5a] hover:shadow-md active:scale-[0.98]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t.whatsapp}
                </a>
              </div>
            )}
          </div>

          {/* Navigator: topics ➜ questions */}
          <div className="border-t border-slate-100 bg-white px-3 py-3">
            {!activeCategory ? (
              <>
                <p className="mb-2 px-1 text-[11px] font-semibold text-slate-400">
                  {messages.length > 0 ? t.more : t.pickTopic}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const CatIcon = ICONS[cat.icon] ?? Sparkles
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-95"
                      >
                        <CatIcon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveCat(null)}
                  className="mb-2 flex items-center gap-1 px-1 text-[11px] font-semibold text-blue-600 transition-colors hover:text-blue-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" />
                  {t.back}
                </button>
                <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto pe-1">
                  {activeCategory.items.map((item) => (
                    <button
                      key={item.q}
                      onClick={() => askQuestion(item)}
                      className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-start text-xs font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 active:scale-[0.99]"
                    >
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                      {item.q}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/50 active:scale-95"
        aria-label={t.open}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  )
}

function Bubble({ role, children }: { role: Role; children: React.ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="me-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-ee-sm bg-blue-600 text-white shadow-blue-200'
            : 'rounded-es-sm border border-slate-100 bg-white text-slate-800'
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{children}</span>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-a:text-blue-600 prose-strong:text-slate-900">
            <ReactMarkdown>{String(children)}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
