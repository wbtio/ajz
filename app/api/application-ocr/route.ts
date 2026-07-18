import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function normalizeAppointmentTime(value: string) {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i)
    if (!match) return ''
    let hour = Number(match[1])
    const minute = match[2]
    const meridiem = match[3]?.toUpperCase()
    if (meridiem === 'PM' && hour < 12) hour += 12
    if (meridiem === 'AM' && hour === 12) hour = 0
    return hour >= 0 && hour <= 23 ? `${String(hour).padStart(2, '0')}:${minute}` : ''
}

const APPLICATION_ANNOTATION_FORMAT = {
    type: 'json_schema',
    json_schema: {
        name: 'application_form_fields',
        strict: true,
        schema: {
            type: 'object',
            additionalProperties: false,
            required: ['application_number'],
            properties: {
                application_number: {
                    type: 'string',
                    description: 'The value printed next to "Application number:" in the official form. Copy exactly, preserving letters and digits but removing only visual spaces.',
                },
            },
        },
    },
}

const APPOINTMENT_ANNOTATION_FORMAT = {
    type: 'json_schema',
    json_schema: {
        name: 'appointment_confirmation_fields',
        strict: true,
        schema: {
            type: 'object',
            additionalProperties: false,
            required: ['group_number', 'appointment_date', 'appointment_time', 'appointment_center', 'appointment_city'],
            properties: {
                group_number: { type: 'string', description: 'The short number printed next to "Group number:". Do not use the long barcode, application number, or visa reference.' },
                appointment_date: { type: 'string', description: 'Appointment date in YYYY-MM-DD format.' },
                appointment_time: { type: 'string', description: 'Appointment time in 24-hour HH:mm format.' },
                appointment_center: { type: 'string', description: 'Visa application center name.' },
                appointment_city: { type: 'string', description: 'City where the appointment takes place.' },
            },
        },
    },
}

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 })

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY غير مضبوط' }, { status: 500 })

    const form = await req.formData()
    const kind = form.get('kind') === 'appointment' ? 'appointment' : 'application'
    const file = form.get('file')
    if (!(file instanceof Blob)) return NextResponse.json({ error: 'لا يوجد ملف' }, { status: 400 })
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'حجم الملف كبير جدًا' }, { status: 400 })
    if (!file.type.includes('pdf') && !file.type.startsWith('image/')) return NextResponse.json({ error: 'يرجى رفع PDF أو صورة' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`
    const response = await fetch('https://api.mistral.ai/v1/ocr', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'mistral-ocr-latest',
            document: file.type.includes('pdf')
                ? { type: 'document_url', document_url: dataUrl }
                : { type: 'image_url', image_url: dataUrl },
            document_annotation_format: kind === 'appointment' ? APPOINTMENT_ANNOTATION_FORMAT : APPLICATION_ANNOTATION_FORMAT,
            document_annotation_prompt: kind === 'appointment'
                ? 'Read the appointment confirmation. Extract ONLY the short number next to "Group number:" as the appointment reference. Never return the long Visa Application Number, barcode number, passport number, or date. Also extract appointment date, appointment time, center, and city. Return exact values and use the requested date/time formats.'
                : 'Read only the official Schengen form field labelled Application number. Do not use Date of application, passport number, or any other number. Return an empty string if unreadable.',
        }),
    })
    if (!response.ok) return NextResponse.json({ error: 'تعذّرت قراءة نموذج الطلب' }, { status: 502 })

    const result = await response.json()
    let applicationNumber = ''
    let appointmentReferenceNumber = ''
    let appointmentDate = ''
    let appointmentTime = ''
    let appointmentCenter = ''
    let appointmentCity = ''
    try {
        const annotation = JSON.parse(result.document_annotation || '{}')
        if (kind === 'appointment') {
            appointmentReferenceNumber = String(annotation.group_number || '')
            appointmentDate = String(annotation.appointment_date || '')
            appointmentTime = String(annotation.appointment_time || '')
            appointmentCenter = String(annotation.appointment_center || '')
            appointmentCity = String(annotation.appointment_city || '')
        } else applicationNumber = String(annotation.application_number || '')
    } catch { /* fall back to raw OCR */ }

    const rawText = (result.pages || []).map((page: { markdown?: string }) => page.markdown || '').join('\n')
    if (kind === 'appointment') {
        if (!appointmentReferenceNumber) appointmentReferenceNumber = rawText.match(/group\s*number\s*[:#-]?\s*(\d{5,15})/i)?.[1] || ''
        appointmentReferenceNumber = appointmentReferenceNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')
        appointmentDate = /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ? appointmentDate : ''
        appointmentTime = normalizeAppointmentTime(appointmentTime)
        return NextResponse.json({ appointmentReferenceNumber, appointmentDate, appointmentTime, appointmentCenter, appointmentCity, rawText })
    }
    if (!applicationNumber) {
        const match = rawText.match(/application\s*number\s*[:\-]?\s*([A-Z0-9][A-Z0-9\s-]{5,30})/i)
        applicationNumber = match?.[1] || ''
    }
    applicationNumber = applicationNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!/^[A-Z]{2,}[A-Z0-9]{4,}$/.test(applicationNumber)) applicationNumber = ''

    return NextResponse.json({ applicationNumber, rawText })
}
