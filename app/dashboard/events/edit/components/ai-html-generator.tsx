'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'

type SectionKey = 'hero' | 'agenda' | 'speakers' | 'cta' | 'faq' | 'contact' | 'gallery'

const SECTION_OPTIONS: { key: SectionKey; label: string }[] = [
    { key: 'hero', label: 'قسم رئيسي (Hero)' },
    { key: 'cta', label: 'زر التسجيل' },
    { key: 'agenda', label: 'الأجندة / الجدول' },
    { key: 'speakers', label: 'المتحدثون / المشاركون' },
    { key: 'gallery', label: 'معرض صور' },
    { key: 'faq', label: 'الأسئلة الشائعة' },
    { key: 'contact', label: 'التواصل والموقع' },
]

interface AiHtmlGeneratorProps {
    eventTitle?: string
    /** Called with the generated HTML when the user accepts it. */
    onGenerated: (html: string) => void
}

export function AiHtmlGenerator({ eventTitle, onGenerated }: AiHtmlGeneratorProps) {
    const [content, setContent] = useState('')
    const [instructions, setInstructions] = useState('')
    const [options, setOptions] = useState<Record<SectionKey, boolean>>({
        hero: true,
        cta: true,
        agenda: false,
        speakers: false,
        gallery: false,
        faq: false,
        contact: false,
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState('')

    const toggle = (key: SectionKey) =>
        setOptions(prev => ({ ...prev, [key]: !prev[key] }))

    const handleGenerate = async () => {
        if (!content.trim()) {
            setError('يرجى إدخال النص/المحتوى أولاً')
            return
        }
        setError('')
        setIsGenerating(true)
        try {
            const res = await fetch('/api/events/generate-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, instructions, options, eventTitle }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'فشل توليد المحتوى')
                return
            }
            if (data.html) {
                onGenerated(data.html)
            } else {
                setError('لم يتم توليد أي محتوى. حاول مرة أخرى.')
            }
        } catch {
            setError('تعذّر الاتصال بالخادم. حاول مرة أخرى.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">مساعد الذكاء الاصطناعي</h3>
                    <p className="text-xs text-gray-500">
                        يكتب محتوى HTML للفعالية بهوية الموقع — مع الحفاظ على نصّك كما هو حرفيًا.
                    </p>
                </div>
            </div>

            {/* The verbatim content */}
            <div className="space-y-1.5">
                <Label htmlFor="ai-content" className="text-xs font-medium text-gray-700">
                    النص / المحتوى <span className="text-gray-400">(سيظهر كما هو دون أي تغيير)</span>
                </Label>
                <textarea
                    id="ai-content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="اكتب أو الصق نص الفعالية هنا (عربي أو إنجليزي)..."
                />
            </div>

            {/* Optional sections */}
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                    أقسام اختيارية <span className="text-gray-400">(اختر ما تريد إضافته)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SECTION_OPTIONS.map(opt => (
                        <label
                            key={opt.key}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 cursor-pointer hover:border-blue-300"
                        >
                            <Checkbox
                                checked={options[opt.key]}
                                onCheckedChange={() => toggle(opt.key)}
                            />
                            <span className="text-xs text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Additional free-text instructions */}
            <div className="space-y-1.5">
                <Label htmlFor="ai-instructions" className="text-xs font-medium text-gray-700">
                    شروط / تعليمات إضافية <span className="text-gray-400">(اختياري)</span>
                </Label>
                <textarea
                    id="ai-instructions"
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="مثال: استخدم خلفية داكنة للقسم الرئيسي، أضف عدّاد تنازلي، رابط التسجيل هو..."
                />
            </div>

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}

            <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جارٍ التوليد...
                    </>
                ) : (
                    <>
                        <Wand2 className="h-4 w-4" />
                        توليد المحتوى
                    </>
                )}
            </Button>
            <p className="text-[11px] text-gray-400 text-center">
                سيُكتب المحتوى المُولَّد في محرّر HTML بالأسفل، ويمكنك تعديله قبل الحفظ.
            </p>
        </div>
    )
}
