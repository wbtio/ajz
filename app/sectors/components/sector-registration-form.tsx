'use client'

import { useState } from 'react'
import { DynamicForm } from '@/components/shared/dynamic-form'
import { type FormField } from '@/lib/types'
import { submitSectorRegistration } from '@/app/sectors/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActionDialog } from '@/app/partners/components/action-dialog' // Or make a generic one
import { FileText } from 'lucide-react'

interface SectorRegistrationFormProps {
    sectorId: string
    sectorName: string
    config: FormField[] | null
}

export function SectorRegistrationForm({ sectorId, sectorName, config }: SectorRegistrationFormProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!config || config.length === 0) return null

    const handleSubmit = async (data: any) => {
        const result = await submitSectorRegistration(sectorId, data)
        if (!result.success) {
            throw new Error('Failed to submit')
        }
    }

    return (
        <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader>
                <CardTitle>انضم لشركاء قطاع {sectorName}</CardTitle>
                <CardDescription>
                    هل أنت مهتم بالاستثمار أو الشراكة في هذا القطاع؟ املأ النموذج أدناه للتواصل معنا.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DynamicForm 
                    fields={config} 
                    onSubmit={handleSubmit} 
                    submitLabel="إرسال طلب الشراكة"
                    successMessage="تم إرسال طلبك بنجاح! سنتواصل معك قريباً."
                />
            </CardContent>
        </Card>
    )
}
