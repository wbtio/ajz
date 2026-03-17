'use client'

import { DynamicForm } from '@/components/shared/dynamic-form'
import { type FormField } from '@/lib/types'
import { submitSectorRegistration } from '@/app/sectors/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { getSectorRegistrationFallback } from '@/app/sectors/sector-content'
import { useI18n } from '@/lib/i18n'

interface SectorRegistrationFormProps {
    sectorId: string
    sectorName: string
    config: FormField[] | null
    intro?: string
}

export function SectorRegistrationForm({ sectorId, sectorName, config, intro }: SectorRegistrationFormProps) {
    const { locale } = useI18n()
    const isArabic = locale === 'ar'
    const fields = config && config.length > 0 ? config : getSectorRegistrationFallback(sectorName, locale)

    const handleSubmit = async (data: Record<string, string>) => {
        const result = await submitSectorRegistration(sectorId, data)
        if (!result.success) {
            throw new Error('Failed to submit')
        }
    }

    return (
        <Card className="border-[#8b0000]/10 bg-white shadow-sm" dir={isArabic ? 'rtl' : 'ltr'}>
            <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b0000]/10 text-[#8b0000]">
                    <FileText className="h-5 w-5" />
                </div>
                <CardTitle className={`text-2xl ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'نموذج التسجيل' : 'Registration Form'}</CardTitle>
                <CardDescription>
                    {intro || `يمكنكم استخدام هذا النموذج للتواصل مع فريق ${sectorName} بخصوص فرص التعاون أو المشاركة أو الاستفسارات المهنية.`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DynamicForm 
                    fields={fields} 
                    onSubmit={handleSubmit} 
                    submitLabel={isArabic ? 'إرسال الطلب' : 'Submit Request'}
                    successMessage={isArabic ? 'تم إرسال طلبكم بنجاح، وسيتواصل معكم فريقنا قريباً.' : 'Your request has been submitted successfully. Our team will contact you soon.'}
                />
            </CardContent>
        </Card>
    )
}
