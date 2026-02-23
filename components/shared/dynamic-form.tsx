'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle } from 'lucide-react'
import type { FormField } from '@/lib/types'

interface DynamicFormProps {
    fields: FormField[]
    onSubmit: (data: Record<string, any>) => Promise<void>
    submitLabel?: string
    successMessage?: string
}

export function DynamicForm({ fields, onSubmit, submitLabel = 'إرسال', successMessage = 'تم الإرسال بنجاح' }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit(formData)
            setSuccess(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{successMessage}</h3>
                <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4">
                    إرسال رد آخر
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                        {field.label_ar || field.label_en}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                        <Textarea
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors min-h-[100px]"
                            placeholder={`أدخل ${field.label_ar}...`}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors h-11"
                        >
                            <option value="">{`اختر ${field.label_ar || field.label_en}...`}</option>
                            {(field.options || []).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            type={field.type}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                            placeholder={`أدخل ${field.label_ar}...`}
                        />
                    )}
                </div>
            ))}
            <Button type="submit" className="w-full h-12 mt-4 text-base" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : submitLabel}
            </Button>
        </form>
    )
}
