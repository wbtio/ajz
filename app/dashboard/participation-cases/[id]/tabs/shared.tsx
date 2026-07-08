'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, ExternalLink, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { uploadRegistrationDocument } from '../../actions'

// ─── رأس قسم داخل التبويب ───
export function SectionHeader({
    icon: Icon,
    title,
    desc,
}: {
    icon: LucideIcon
    title: string
    desc?: string
}) {
    return (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-500" />
            <div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                {desc && <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>}
            </div>
        </div>
    )
}

// ─── زر حفظ موحّد للتبويبات ───
export function SaveButton({
    saving,
    onSave,
    label = 'حفظ',
}: {
    saving: boolean
    onSave: () => void
    label?: string
}) {
    return (
        <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="bg-[linear-gradient(135deg,#8b0000,#c2410c)] hover:opacity-90 text-white gap-1.5 rounded-lg h-9"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'جارٍ الحفظ...' : label}
            </Button>
        </div>
    )
}

// ─── تسمية حقل ───
export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-semibold text-slate-700 block mb-1">
            {children}
            {required && <span className="text-rose-500 mr-0.5">*</span>}
        </label>
    )
}

// ─── صنف الإدخال الموحّد ───
export const inputClass =
    'border-slate-200 focus:border-[#8b0000] focus:ring-[#8b0000]/20 rounded-lg bg-white'

export const selectClass =
    'h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:border-[#8b0000] focus:outline-none w-full'

// ─── حقل رفع ملف (PDF/صورة) قابل لإعادة الاستخدام ───
// يرفع الملف إلى case_documents ويعرض رابط الملف المرفوع.
export function FileUploadField({
    caseId,
    docType,
    label,
    existingUrl,
}: {
    caseId: string
    docType: string
    label: string
    existingUrl?: string | null
}) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [url, setUrl] = useState(existingUrl || '')
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(file: File) {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'events-bucket')
            formData.append('type', docType)
            const { error } = await uploadRegistrationDocument(caseId, formData, docType, label)
            if (error) {
                toast.error(error)
            } else {
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
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-emerald-200 bg-emerald-50/40">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline min-w-0">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">عرض الملف المرفوع</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="text-[11px] text-slate-500 hover:text-slate-700 disabled:opacity-50 shrink-0"
                    >
                        استبدال
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'جارٍ الرفع...' : 'رفع ملف'}
                </button>
            )}
        </div>
    )
}
