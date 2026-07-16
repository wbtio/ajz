'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Loader2, Upload, ExternalLink, Loader2 as Spinner } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { uploadRegistrationDocument } from '../../actions'

/* ============================================================
   JAZ Design Tokens — Tab Suite
   Surfaces, hairlines, type ramp and rhythm for case-detail tabs.
   Tokens reference the global CSS variables in app/globals.css so
   the case-detail suite stays token-consistent with the dashboard.
   ============================================================ */

const TOKENS = {
    surface: 'bg-[var(--jaz-surface)]',
    surface2: 'bg-[var(--jaz-surface-2)]',
    ink: 'text-[var(--jaz-ink)]',
    inkSoft: 'text-[var(--jaz-ink-soft)]',
    muted: 'text-[var(--jaz-muted)]',
    whisper: 'text-[var(--jaz-whisper)]',
    line: 'border-[var(--jaz-line)]',
    lineStrong: 'border-[var(--jaz-line-strong)]',
    sovereign: 'text-[var(--jaz-sovereign)]',
    sovereignBg: 'bg-[var(--jaz-sovereign)]',
    emerald: 'text-[var(--jaz-emerald)]',
    amber: 'text-[var(--jaz-amber)]',
    info: 'text-[var(--jaz-info)]',
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/*  Defines a clear region (group) using hairline borders, not cards.  */
/* ------------------------------------------------------------------ */

export function Section({
    title,
    desc,
    icon: Icon,
    children,
    actions,
    className,
}: {
    title: string
    desc?: string
    icon?: LucideIcon
    children: React.ReactNode
    actions?: React.ReactNode
    className?: string
}) {
    return (
        <section
            className={cn(
                'rounded-md border bg-[var(--jaz-surface)] border-[var(--jaz-line)] overflow-hidden',
                className,
            )}
        >
            <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--jaz-line)]">
                <div className="flex items-start gap-3 min-w-0">
                    {Icon && (
                        <span
                            aria-hidden
                            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--jaz-surface-2)] border border-[var(--jaz-line)] text-[var(--jaz-ink-soft)]"
                        >
                            <Icon className="size-3.5" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 className="jaz-title text-[var(--jaz-ink)] leading-tight">
                            {title}
                        </h2>
                        {desc && (
                            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--jaz-muted)] max-w-prose">
                                {desc}
                            </p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </header>
            <div className="px-5 py-5">{children}</div>
        </section>
    )
}

/* ------------------------------------------------------------------ */
/*  Field label                                                       */
/* ------------------------------------------------------------------ */

export function FieldLabel({
    children,
    required,
    hint,
}: {
    children: React.ReactNode
    required?: boolean
    hint?: string
}) {
    return (
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <label className="block text-[12px] font-medium text-[var(--jaz-ink-soft)]">
                {children}
                {required && (
                    <span className="text-[var(--jaz-sovereign)] ml-0.5" aria-hidden>*</span>
                )}
            </label>
            {hint && (
                <span className="text-[10.5px] text-[var(--jaz-whisper)]">{hint}</span>
            )}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Field input variants — locked tokens, no per-call styling          */
/* ------------------------------------------------------------------ */

const baseInput =
    'h-10 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] text-[13px] text-[var(--jaz-ink)] ' +
    'placeholder:text-[var(--jaz-whisper)] focus:outline-none focus:border-[var(--jaz-sovereign)]/50 ' +
    'focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 transition-colors duration-150 w-full'

export const inputClass = baseInput

export const selectClass =
    'h-10 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] ' +
    'text-[13px] text-[var(--jaz-ink)] focus:outline-none focus:border-[var(--jaz-sovereign)]/50 ' +
    'focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 transition-colors duration-150 w-full ' +
    'appearance-none bg-no-repeat bg-[length:14px_14px] bg-[position:right_12px_center]'

export const textareaClass =
    'min-h-[88px] py-2.5 px-3 rounded-md border border-[var(--jaz-line)] bg-[var(--jaz-surface)] ' +
    'text-[13px] text-[var(--jaz-ink)] placeholder:text-[var(--jaz-whisper)] ' +
    'focus:outline-none focus:border-[var(--jaz-sovereign)]/50 focus:ring-2 focus:ring-[var(--jaz-sovereign)]/15 ' +
    'transition-colors duration-150 w-full resize-y'

/* ------------------------------------------------------------------ */
/*  Save button — single action footer for the section.               */
/*  Sticky-flavored at the bottom of the section without overlap.     */
/* ------------------------------------------------------------------ */

export function SaveFooter({
    saving,
    onSave,
    label = 'حفظ',
    aside,
}: {
    saving: boolean
    onSave: () => void
    label?: string
    aside?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between gap-3 pt-4 mt-5 border-t border-[var(--jaz-line)]">
            <div className="text-[11px] text-[var(--jaz-muted)]">{aside}</div>
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className={cn(
                    'inline-flex items-center gap-2 h-9 px-4 rounded-md',
                    'bg-[var(--jaz-sovereign)] hover:bg-[var(--jaz-sovereign-2)] text-white',
                    'text-[13px] font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jaz-sovereign)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--jaz-surface)]',
                    'disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]',
                )}
            >
                {saving ? (
                    <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>جارٍ الحفظ…</span>
                    </>
                ) : (
                    <span>{label}</span>
                )}
            </button>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Inline alert — replaces bg-amber-* / bg-rose-* blocks             */
/* ------------------------------------------------------------------ */

export function InlineAlert({
    variant,
    children,
}: {
    variant: 'warn' | 'info' | 'success' | 'danger'
    children: React.ReactNode
}) {
    const map = {
        warn: { fg: 'text-[var(--jaz-amber)]', bg: 'bg-[var(--jaz-amber-soft)]', border: 'border-[var(--jaz-amber)]/15' },
        info: { fg: 'text-[var(--jaz-info)]', bg: 'bg-[var(--jaz-info-soft)]', border: 'border-[var(--jaz-info)]/15' },
        success: { fg: 'text-[var(--jaz-emerald)]', bg: 'bg-[var(--jaz-emerald-soft)]', border: 'border-[var(--jaz-emerald)]/15' },
        danger: { fg: 'text-[var(--jaz-sovereign)]', bg: 'bg-[var(--jaz-sovereign)]/8', border: 'border-[var(--jaz-sovereign)]/15' },
    } as const
    const v = map[variant]
    return (
        <div className={cn('flex items-start gap-2 text-[12px] leading-relaxed rounded-md border px-3.5 py-2.5', v.fg, v.bg, v.border)}>
            {children}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Form grid — single source for the 2-column responsive grid        */
/* ------------------------------------------------------------------ */

export function FormGrid({
    children,
    columns = 2,
    className,
}: {
    children: React.ReactNode
    columns?: 1 | 2 | 3
    className?: string
}) {
    const colMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }
    return (
        <div className={cn('grid gap-x-5 gap-y-4', colMap[columns], className)}>
            {children}
        </div>
    )
}

export function FormField({
    label,
    required,
    hint,
    span = 1,
    children,
}: {
    label?: string
    required?: boolean
    hint?: string
    span?: 1 | 2
    children: React.ReactNode
}) {
    return (
        <div className={cn(span === 2 ? 'md:col-span-2' : 'col-span-1')}>
            {label && (
                <FieldLabel required={required} hint={hint}>
                    {label}
                </FieldLabel>
            )}
            {children}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  File upload field                                                 */
/* ------------------------------------------------------------------ */

export function FileUploadField({
    caseId,
    docType,
    label,
    documents,
    existingUrl,
}: {
    caseId: string
    docType: string
    label: string
    documents?: Array<{ type?: string; path?: string; name?: string }>
    existingUrl?: string | null
}) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const storedDocument = documents?.find((document) => document.type === docType)
    const [url] = useState(existingUrl || storedDocument?.path || '')
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(file: File) {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'events-bucket')
            formData.append('type', docType)
            const { error } = await uploadRegistrationDocument(caseId, formData, docType, label)
            if (error) toast.error(error)
            else {
                toast.success(`تم رفع ${label}`)
                router.refresh()
            }
        } catch {
            toast.error('فشل رفع الملف')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                    e.target.value = ''
                }}
            />
            {url ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--jaz-emerald)]/25 bg-[var(--jaz-emerald-soft)] px-3 py-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] text-[var(--jaz-emerald)] font-medium hover:underline min-w-0"
                    >
                        <ExternalLink className="size-3.5 shrink-0" />
                        <span className="truncate">عرض الملف المرفوع</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="text-[11px] font-medium text-[var(--jaz-ink-soft)] hover:text-[var(--jaz-sovereign)] disabled:opacity-50 shrink-0 transition-colors"
                    >
                        استبدال
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className={cn(
                        'w-full flex items-center justify-center gap-2 px-3 py-3 rounded-md',
                        'border border-dashed border-[var(--jaz-line-strong)] bg-[var(--jaz-surface-2)]/40',
                        'text-[12px] text-[var(--jaz-muted)] font-medium',
                        'hover:border-[var(--jaz-sovereign)]/40 hover:text-[var(--jaz-sovereign)]',
                        'transition-colors duration-150 disabled:opacity-50',
                    )}
                >
                    {uploading ? <Spinner className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    {uploading ? 'جارٍ الرفع…' : 'اختر ملف (PDF أو صورة)'}
                </button>
            )}
        </div>
    )
}
