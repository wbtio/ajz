'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import { sanitizeEnglishText } from '@/lib/english-only'

type SectionKey = 'hero' | 'agenda' | 'speakers' | 'cta' | 'faq' | 'contact' | 'gallery'

const SECTION_OPTIONS: { key: SectionKey; label: string }[] = [
    { key: 'hero', label: 'Hero' },
    { key: 'cta', label: 'Registration CTA' },
    { key: 'agenda', label: 'Agenda / Schedule' },
    { key: 'speakers', label: 'Speakers / Participants' },
    { key: 'gallery', label: 'Image Gallery' },
    { key: 'faq', label: 'FAQ' },
    { key: 'contact', label: 'Contact and Location' },
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
            setError('Enter the event content first.')
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
                setError(data.error || 'Could not generate the content.')
                return
            }
            if (data.html) {
                onGenerated(sanitizeEnglishText(data.html))
            } else {
                setError('No content was generated. Try again.')
            }
        } catch {
            setError('Could not connect to the server. Try again.')
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
                    <h3 className="text-sm font-bold text-gray-900">AI Content Assistant</h3>
                    <p className="text-xs text-gray-500">
                        Generates English HTML content for the event using the site design system.
                    </p>
                </div>
            </div>

            {/* The verbatim content */}
            <div className="space-y-1.5">
                <Label htmlFor="ai-content" className="text-xs font-medium text-gray-700">
                    Content <span className="text-gray-400">(English only)</span>
                </Label>
                <textarea
                    id="ai-content"
                    value={content}
                    onChange={e => setContent(sanitizeEnglishText(e.target.value))}
                    className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="Write or paste the event content in English..."
                />
            </div>

            {/* Optional sections */}
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                    Optional Sections <span className="text-gray-400">(select what to include)</span>
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
                    Additional Instructions <span className="text-gray-400">(optional)</span>
                </Label>
                <textarea
                    id="ai-instructions"
                    value={instructions}
                    onChange={e => setInstructions(sanitizeEnglishText(e.target.value))}
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="e.g. Use a dark hero, add a countdown, and include the registration URL..."
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
                        Generating...
                    </>
                ) : (
                    <>
                        <Wand2 className="h-4 w-4" />
                        Generate Content
                    </>
                )}
            </Button>
            <p className="text-[11px] text-gray-400 text-center">
                Generated content is placed in the HTML editor below for review before saving.
            </p>
        </div>
    )
}
