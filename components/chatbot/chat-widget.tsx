'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, X, Send, Mic, Square, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Role = 'user' | 'assistant'
interface Message {
  role: Role
  content: string
}

const STRINGS = {
  ar: {
    title: 'مساعد JAZ',
    subtitle: 'اسألني عن الفعاليات والخدمات',
    placeholder: 'اكتب سؤالك هنا…',
    greeting: 'أهلاً! 👋 أنا مساعد JAZ. اسألني عن الفعاليات، الدورات التدريبية، القطاعات أو أي شيء عن المنصة.',
    suggestions: [
      'شنو الفعاليات القادمة؟',
      'عندكم دورات تدريبية؟',
      'شنو القطاعات الموجودة؟',
      'آخر أخبار المدونة',
    ],
    send: 'إرسال',
    listening: 'جارٍ التسجيل… اضغط للإيقاف',
    micStart: 'تسجيل صوتي',
    error: 'صار خطأ، حاول مرة ثانية.',
    micError: 'تعذّر الوصول للمايكروفون.',
    open: 'افتح المساعد',
    whatsapp: 'تواصل معنا عبر واتساب',
    waIntro: 'مرحباً، هذه محادثتي مع مساعد JAZ:',
  },
  en: {
    title: 'JAZ Assistant',
    subtitle: 'Ask me about events & services',
    placeholder: 'Type your question…',
    greeting: "Hi! 👋 I'm the JAZ assistant. Ask me about events, trainings, sectors, or anything about the platform.",
    suggestions: [
      'What events are coming up?',
      'Do you offer trainings?',
      'What sectors are available?',
      'Latest blog news',
    ],
    send: 'Send',
    listening: 'Recording… tap to stop',
    micStart: 'Voice input',
    error: 'Something went wrong, please try again.',
    micError: 'Could not access the microphone.',
    open: 'Open assistant',
    whatsapp: 'Contact us on WhatsApp',
    waIntro: 'Hello, here is my chat with the JAZ assistant:',
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

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Auto-scroll to bottom on new messages / loading.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  async function sendMessage(text: string) {
    const question = text.trim()
    if (!question || loading) return

    const next: Message[] = [...messages, { role: 'user', content: question }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const answer = res.ok && data.answer ? data.answer : data.error || t.error
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t.error }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  // ---- Voice recording -----------------------------------------------------
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : ''
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        await transcribe(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t.micError }])
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  async function transcribe(blob: Blob) {
    setTranscribing(true)
    try {
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'
      const form = new FormData()
      form.append('file', blob, `recording.${ext}`)
      const res = await fetch('/api/chatbot/transcribe', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.text) {
        await sendMessage(data.text)
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error || t.error }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t.error }])
    } finally {
      setTranscribing(false)
    }
  }

  const showWelcome = messages.length === 0

  function whatsappUrl() {
    const transcript = messages
      .map((m) => `${m.role === 'user' ? '🧑' : '🤖'} ${m.content}`)
      .join('\n\n')
    const text = `${t.waIntro}\n\n${transcript}`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  return (
    <div dir={dir} className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 print:hidden">
      {/* Chat panel */}
      {open && (
        <div
          className="flex h-[min(70vh,600px)] w-[min(calc(100vw-2.5rem),384px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-label={t.title}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] text-blue-100">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 transition-colors hover:bg-white/20"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {showWelcome && (
              <>
                <Bubble role="assistant">{t.greeting}</Bubble>
                <div className="flex flex-wrap gap-2 pt-1">
                  {t.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ))}

            {(loading || transcribing) && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">…</span>
              </div>
            )}

            {/* WhatsApp hand-off — appears once the conversation has started */}
            {!showWelcome && !loading && !transcribing && WHATSAPP_NUMBER && (
              <div className="pt-1">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t.whatsapp}
                </a>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                disabled={transcribing || loading}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50',
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                aria-label={recording ? t.listening : t.micStart}
                title={recording ? t.listening : t.micStart}
              >
                {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                rows={1}
                placeholder={recording ? t.listening : t.placeholder}
                disabled={recording}
                className="max-h-28 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                aria-label={t.send}
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
        aria-label={t.open}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  )
}

function Bubble({ role, children }: { role: Role; children: React.ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed text-start',
          isUser
            ? 'rounded-ee-sm bg-blue-600 text-white'
            : 'rounded-es-sm border border-gray-200 bg-white text-gray-800'
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{children}</span>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-a:text-blue-600">
            <ReactMarkdown>{String(children)}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
