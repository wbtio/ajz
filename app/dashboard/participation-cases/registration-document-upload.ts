'use client'

import { createClient } from '@/lib/supabase/client'
import {
    finalizeRegistrationDocumentUpload,
    prepareRegistrationDocumentUpload,
} from './actions'

export async function uploadRegistrationDocumentDirect(
    regId: string,
    file: File,
    docType: string,
    label: string,
) {
    const prepared = await prepareRegistrationDocumentUpload(
        regId,
        { name: file.name, size: file.size, type: file.type },
        docType,
    )

    if (prepared.error || !prepared.bucket || !prepared.path || !prepared.token) {
        return { error: prepared.error || 'تعذر تجهيز رفع الملف' }
    }

    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
        .from(prepared.bucket)
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: file.type || 'application/octet-stream',
            cacheControl: '3600',
        })

    if (uploadError) {
        console.error('uploadRegistrationDocumentDirect storage upload failed:', uploadError)
        return { error: uploadError.message || 'فشل رفع الملف إلى التخزين' }
    }

    const finalized = await finalizeRegistrationDocumentUpload(
        regId,
        prepared.path,
        docType,
        label,
    )

    if (finalized.error) {
        await supabase.storage.from(prepared.bucket).remove([prepared.path]).catch(() => undefined)
    }

    return finalized
}
