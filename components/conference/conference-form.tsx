'use client'

import { createClient } from '@/lib/supabase/client'
import { DynamicForm } from '@/components/shared/dynamic-form'
import type { FormField } from '@/lib/types'

interface ConferenceFormProps {
    eventId: string
    sectionSlug: string
    fields: FormField[]
    submitLabel?: string
}

export function ConferenceForm({ eventId, sectionSlug, fields, submitLabel }: ConferenceFormProps) {
    const handleSubmit = async (data: Record<string, any>) => {
        const supabase = createClient()
        const { error } = await supabase.from('conference_submissions').insert({
            event_id: eventId,
            section_slug: sectionSlug,
            data,
            status: 'pending',
        })
        if (error) throw new Error(error.message)
    }

    return (
        <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel={submitLabel || 'إرسال الطلب'}
            successMessage="تم إرسال طلبك بنجاح! سنتواصل معك قريباً."
        />
    )
}
