'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, Building2, UserRound, Sparkles, FileText, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FormField } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface DynamicFormProps {
    fields: FormField[]
    onSubmit: (data: Record<string, string>) => Promise<void>
    submitLabel?: string
    successMessage?: string
    variant?: 'default' | 'sector-elegant'
}

interface SectorFormSection {
    key: string
    title_en: string
    title_ar: string
    badge_en: string
    badge_ar: string
    icon: LucideIcon
    fieldIds: string[]
}

const sectorFormSections: SectorFormSection[] = [
    {
        key: 'personal',
        title_en: 'Personal Information',
        title_ar: 'المعلومات الشخصية',
        badge_en: 'Section 01',
        badge_ar: 'القسم 01',
        icon: UserRound,
        fieldIds: [
            'full_name',
            'surname',
            'sex',
            'civil_status',
            'date_of_birth',
            'nationality',
            'personal_telephone',
            'personal_email_address',
            'personal_home_address',
        ],
    },
    {
        key: 'document',
        title_en: 'Passport Documents',
        title_ar: 'وثائق الباسبور',
        badge_en: 'Section 02',
        badge_ar: 'القسم 02',
        icon: FileText,
        fieldIds: [
            'type_of_travel_document',
            'number_of_travel_document',
            'date_of_issue',
            'date_of_expiry',
            'issuing_authority',
            'issued_by_country',
        ],
    },
    {
        key: 'travel',
        title_en: 'Residence Information',
        title_ar: 'معلومات الإقامة',
        badge_en: 'Section 03',
        badge_ar: 'القسم 03',
        icon: FileText,
        fieldIds: [
            'residence_in_other_country',
            'residence_permit_number',
            'residence_permit_country',
            'residence_permit_issue_date',
            'residence_permit_valid_until',
            'additional_residence_in_other_country',
            'secondary_residence_permit_number',
            'secondary_residence_permit_country',
            'secondary_residence_permit_issue_date',
            'secondary_residence_permit_valid_until',
        ],
    },
    {
        key: 'additional',
        title_en: 'Additional Information',
        title_ar: 'معلومات إضافية',
        badge_en: 'Section 04',
        badge_ar: 'القسم 04',
        icon: Sparkles,
        fieldIds: [
            'fingerprints_collected_previously',
            'previous_visa_issue_date',
            'previous_visa_valid_until',
            'previous_visa_number_if_known',
            'previous_visa_source_country',
            'additional_previous_visa',
            'secondary_previous_visa_issue_date',
            'secondary_previous_visa_valid_until',
            'secondary_previous_visa_number_if_known',
            'secondary_previous_visa_source_country',
        ],
    },
    {
        key: 'company',
        title_en: 'Company Information',
        title_ar: 'معلومات الشركة',
        badge_en: 'Section 05',
        badge_ar: 'القسم 05',
        icon: Building2,
        fieldIds: [
            'company_name',
            'company_specialization',
            'position_in_company',
            'company_registration_number',
            'city',
            'zip_code',
            'country',
            'telephone',
            'email',
            'company_website',
        ],
    },
]

function normalizeSectorFields(fields: FormField[]) {
    let normalizedFields = fields.filter(
        (field) => field.id !== 'other_travel_document_details'
            && field.id !== 'arrival_date'
            && field.id !== 'departure_date'
            && field.id !== 'embassy_or_consulate_of_reference'
            && field.id !== 'address'
    )

    normalizedFields = normalizedFields.map((field) => {
        if (field.id === 'type_of_travel_document') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'full_name') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'surname') {
            return {
                ...field,
                label_en: 'Surname',
                label_ar: 'اللقب',
                width: 'half',
                placeholder_en: field.placeholder_en || 'Surname as shown in passport',
                placeholder_ar: field.placeholder_ar || 'اللقب كما هو مكتوب في الجواز أو الباسبور',
            }
        }

        if (field.id === 'issued_by_country') {
            return {
                ...field,
                label_en: 'Place of Birth',
                label_ar: 'محل الميلاد',
                placeholder_en: 'Enter place of birth...',
                placeholder_ar: 'أدخل محل الميلاد...',
            }
        }

        if (field.id === 'residence_permit_valid_until') {
            return {
                ...field,
                label_en: 'Residence Permit Expiry Date',
                label_ar: 'تاريخ النفاذ',
                width: 'half',
            }
        }

        if (field.id === 'residence_permit_number') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'secondary_residence_permit_number') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'secondary_residence_permit_valid_until') {
            return {
                ...field,
                label_en: 'Second Residence Permit Expiry Date',
                label_ar: 'تاريخ نفاذ الإقامة الأخرى',
                width: 'half',
            }
        }

        if (field.id === 'previous_visa_number_if_known') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'secondary_previous_visa_number_if_known') {
            return {
                ...field,
                width: 'half',
            }
        }

        if (field.id === 'secondary_previous_visa_valid_until') {
            return {
                ...field,
                label_en: 'Second Previous Visa Expiry Date',
                label_ar: 'تاريخ نفاذ الفيزا السابقة الأخرى',
                width: 'half',
            }
        }

        if (field.id === 'fingerprints_collected_previously') {
            return {
                ...field,
                label_en: 'Do You Have a Previous Visa?',
                label_ar: 'هل لديك فيزا سابقة؟',
            }
        }

        if (field.id === 'company_name_ar') {
            return {
                ...field,
                id: 'company_specialization',
                label_en: 'Company Specialization',
                label_ar: 'تخصص الشركة',
                description_en: 'Enter the company specialization or field of work.',
                description_ar: 'أدخل تخصص الشركة أو مجال عملها.',
                placeholder_en: 'Company specialization',
                placeholder_ar: 'تخصص الشركة',
                width: 'half',
            }
        }

        if (field.id === 'company_registration_number') {
            return {
                ...field,
                required: false,
            }
        }

        if (field.id === 'previous_fingerprint_date') {
            return {
                ...field,
                id: 'previous_visa_issue_date',
                label_en: 'Previous Visa Issue Date',
                label_ar: 'تاريخ إصدار التأشيرة السابقة',
                width: 'half',
            }
        }

        return field
    })

    const hasIssuingAuthority = normalizedFields.some((field) => field.id === 'issuing_authority')
    const hasCityOfIssue = normalizedFields.some((field) => field.id === 'issued_by_country')

    if (!hasIssuingAuthority && hasCityOfIssue) {
        const issuingAuthorityField: FormField = {
            id: 'issuing_authority',
            label_en: 'Issuing Authority',
            label_ar: 'جهة الإصدار',
            type: 'text',
            required: true,
            width: 'half',
            placeholder_en: 'Enter issuing authority...',
            placeholder_ar: 'أدخل جهة الإصدار...',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'issued_by_country') {
                return [issuingAuthorityField, field]
            }

            return [field]
        })
    }

    const hasResidencePermitIssueDate = normalizedFields.some((field) => field.id === 'residence_permit_issue_date')
    const hasResidencePermitExpiryDate = normalizedFields.some((field) => field.id === 'residence_permit_valid_until')

    if (!hasResidencePermitIssueDate && hasResidencePermitExpiryDate) {
        const residencePermitIssueDateField: FormField = {
            id: 'residence_permit_issue_date',
            label_en: 'Residence Permit Issue Date',
            label_ar: 'تاريخ الإصدار',
            type: 'date',
            required: false,
            width: 'half',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'residence_permit_valid_until') {
                return [residencePermitIssueDateField, field]
            }

            return [field]
        })
    }

    const hasResidencePermitCountry = normalizedFields.some((field) => field.id === 'residence_permit_country')
    const hasResidencePermitNumber = normalizedFields.some((field) => field.id === 'residence_permit_number')
    const hasAdditionalResidenceToggle = normalizedFields.some((field) => field.id === 'additional_residence_in_other_country')
    const hasSecondaryResidencePermitNumber = normalizedFields.some((field) => field.id === 'secondary_residence_permit_number')
    const hasSecondaryResidenceCountry = normalizedFields.some((field) => field.id === 'secondary_residence_permit_country')
    const hasSecondaryResidenceIssueDate = normalizedFields.some((field) => field.id === 'secondary_residence_permit_issue_date')
    const hasSecondaryResidenceValidUntil = normalizedFields.some((field) => field.id === 'secondary_residence_permit_valid_until')

    if (!hasResidencePermitCountry && hasResidencePermitNumber) {
        const residencePermitCountryField: FormField = {
            id: 'residence_permit_country',
            label_en: 'Country',
            label_ar: 'الدولة',
            type: 'text',
            required: false,
            width: 'half',
            placeholder_en: 'Enter country...',
            placeholder_ar: 'أدخل الدولة...',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'residence_permit_number') {
                return [
                    {
                        ...field,
                        width: 'half',
                    },
                    residencePermitCountryField,
                ]
            }

            return [field]
        })
    }

    if (!hasAdditionalResidenceToggle && hasResidencePermitNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'additional_residence_in_other_country',
                label_en: 'Do You Hold Another Residence Permit?',
                label_ar: 'هل لديكم إقامة أخرى أيضًا؟',
                type: 'select',
                required: false,
                width: 'full',
                options: ['No', 'Yes'],
                options_ar: ['لا', 'نعم'],
            },
        ]
    }

    if (!hasSecondaryResidencePermitNumber && hasResidencePermitNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_residence_permit_number',
                label_en: 'Second Residence Permit or Equivalent Number',
                label_ar: 'رقم تصريح الإقامة الأخرى أو ما يعادله',
                type: 'text',
                required: false,
                width: 'half',
            },
        ]
    }

    if (!hasSecondaryResidenceCountry && hasResidencePermitNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_residence_permit_country',
                label_en: 'Second Residence Country',
                label_ar: 'دولة الإقامة الأخرى',
                type: 'text',
                required: false,
                width: 'half',
                placeholder_en: 'Enter second residence country...',
                placeholder_ar: 'أدخل دولة الإقامة الأخرى...',
            },
        ]
    }

    if (!hasSecondaryResidenceIssueDate && hasResidencePermitNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_residence_permit_issue_date',
                label_en: 'Second Residence Permit Issue Date',
                label_ar: 'تاريخ إصدار الإقامة الأخرى',
                type: 'date',
                required: false,
                width: 'half',
            },
        ]
    }

    if (!hasSecondaryResidenceValidUntil && hasResidencePermitNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_residence_permit_valid_until',
                label_en: 'Second Residence Permit Expiry Date',
                label_ar: 'تاريخ نفاذ الإقامة الأخرى',
                type: 'date',
                required: false,
                width: 'half',
            },
        ]
    }

    const hasPreviousVisaSourceCountry = normalizedFields.some((field) => field.id === 'previous_visa_source_country')
    const hasPreviousVisaNumber = normalizedFields.some((field) => field.id === 'previous_visa_number_if_known')
    const hasPreviousVisaIssueDate = normalizedFields.some((field) => field.id === 'previous_visa_issue_date')
    const hasPreviousVisaValidUntil = normalizedFields.some((field) => field.id === 'previous_visa_valid_until')
    const hasAdditionalPreviousVisaToggle = normalizedFields.some((field) => field.id === 'additional_previous_visa')
    const hasSecondaryPreviousVisaIssueDate = normalizedFields.some((field) => field.id === 'secondary_previous_visa_issue_date')
    const hasSecondaryPreviousVisaValidUntil = normalizedFields.some((field) => field.id === 'secondary_previous_visa_valid_until')
    const hasSecondaryPreviousVisaNumber = normalizedFields.some((field) => field.id === 'secondary_previous_visa_number_if_known')
    const hasSecondaryPreviousVisaSourceCountry = normalizedFields.some((field) => field.id === 'secondary_previous_visa_source_country')

    if (!hasPreviousVisaSourceCountry && hasPreviousVisaNumber) {
        const previousVisaSourceCountryField: FormField = {
            id: 'previous_visa_source_country',
            label_en: 'Source Country',
            label_ar: 'دولة المصدر',
            type: 'text',
            required: false,
            width: 'half',
            placeholder_en: 'Enter source country...',
            placeholder_ar: 'أدخل دولة المصدر...',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'previous_visa_number_if_known') {
                return [
                    {
                        ...field,
                        width: 'half',
                    },
                    previousVisaSourceCountryField,
                ]
            }

            return [field]
        })
    }

    if (!hasPreviousVisaIssueDate && hasPreviousVisaNumber) {
        const previousVisaIssueDateField: FormField = {
            id: 'previous_visa_issue_date',
            label_en: 'Previous Visa Issue Date',
            label_ar: 'تاريخ إصدار التأشيرة السابقة',
            type: 'date',
            required: false,
            width: 'half',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'previous_visa_number_if_known') {
                return [previousVisaIssueDateField, field]
            }

            return [field]
        })
    }

    if (!hasPreviousVisaValidUntil && hasPreviousVisaNumber) {
        const previousVisaValidUntilField: FormField = {
            id: 'previous_visa_valid_until',
            label_en: 'Previous Visa Expiry Date',
            label_ar: 'تاريخ نفاذ التأشيرة السابقة',
            type: 'date',
            required: false,
            width: 'half',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id === 'previous_visa_number_if_known') {
                return [previousVisaValidUntilField, field]
            }

            return [field]
        })
    }

    if (!hasAdditionalPreviousVisaToggle && hasPreviousVisaNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'additional_previous_visa',
                label_en: 'Do You Have Another Previous Visa?',
                label_ar: 'هل لديكم فيزا سابقة أخرى أيضًا؟',
                type: 'select',
                required: false,
                width: 'full',
                options: ['No', 'Yes'],
                options_ar: ['لا', 'نعم'],
            },
        ]
    }

    if (!hasSecondaryPreviousVisaIssueDate && hasPreviousVisaNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_previous_visa_issue_date',
                label_en: 'Second Previous Visa Issue Date',
                label_ar: 'تاريخ إصدار الفيزا السابقة الأخرى',
                type: 'date',
                required: false,
                width: 'half',
            },
        ]
    }

    if (!hasSecondaryPreviousVisaValidUntil && hasPreviousVisaNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_previous_visa_valid_until',
                label_en: 'Second Previous Visa Expiry Date',
                label_ar: 'تاريخ نفاذ الفيزا السابقة الأخرى',
                type: 'date',
                required: false,
                width: 'half',
            },
        ]
    }

    if (!hasSecondaryPreviousVisaNumber && hasPreviousVisaNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_previous_visa_number_if_known',
                label_en: 'Second Previous Visa Number (If Known)',
                label_ar: 'رقم الفيزا السابقة الأخرى إن وجد',
                type: 'text',
                required: false,
                width: 'half',
            },
        ]
    }

    if (!hasSecondaryPreviousVisaSourceCountry && hasPreviousVisaNumber) {
        normalizedFields = [
            ...normalizedFields,
            {
                id: 'secondary_previous_visa_source_country',
                label_en: 'Second Previous Visa Source Country',
                label_ar: 'دولة مصدر الفيزا السابقة الأخرى',
                type: 'text',
                required: false,
                width: 'half',
                placeholder_en: 'Enter second previous visa source country...',
                placeholder_ar: 'أدخل دولة مصدر الفيزا السابقة الأخرى...',
            },
        ]
    }

    const hasFullName = normalizedFields.some((field) => field.id === 'full_name')
    const hasLegacyNameFields = normalizedFields.some((field) => field.id === 'given_name' || field.id === 'surname')

    const defaultSurnameField: FormField = {
        id: 'surname',
        label_en: 'Surname',
        label_ar: 'اللقب',
        type: 'text',
        required: false,
        width: 'half',
        placeholder_en: 'Surname as shown in passport',
        placeholder_ar: 'اللقب كما هو مكتوب في الجواز أو الباسبور',
    }

    if (!hasFullName && hasLegacyNameFields) {
        const givenNameField = normalizedFields.find((field) => field.id === 'given_name')
        const surnameField = normalizedFields.find((field) => field.id === 'surname') || defaultSurnameField
        const fullNameField: FormField = {
            id: 'full_name',
            label_en: 'Full Name',
            label_ar: 'الاسم الكامل',
            type: 'text',
            required: Boolean(givenNameField?.required || surnameField?.required),
            width: 'half',
            description_en: 'Enter the full name exactly as it appears in the passport.',
            description_ar: 'أدخل الاسم الكامل كما هو مكتوب في الجواز أو الباسبور.',
            placeholder_en: 'Full name as shown in passport',
            placeholder_ar: 'الاسم الكامل كما هو مكتوب في الجواز أو الباسبور',
        }

        let insertedFullName = false

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id !== 'given_name' && field.id !== 'surname') {
                return [field]
            }

            if (insertedFullName) {
                return []
            }

            insertedFullName = true
            return [fullNameField, surnameField]
        })
    }

    if (!normalizedFields.some((field) => field.id === 'surname') && normalizedFields.some((field) => field.id === 'full_name')) {
        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id !== 'full_name') {
                return [field]
            }

            return [
                {
                    ...field,
                    width: 'half',
                },
                defaultSurnameField,
            ]
        })
    }

    const hasCompanySpecialization = normalizedFields.some((field) => field.id === 'company_specialization')
    const companyNameField = normalizedFields.find((field) => field.id === 'company_name')

    if (!hasCompanySpecialization && companyNameField) {
        const companySpecializationField: FormField = {
            id: 'company_specialization',
            label_en: 'Company Specialization',
            label_ar: 'تخصص الشركة',
            type: 'text',
            required: false,
            width: 'half',
            description_en: 'Enter the company specialization or field of work.',
            description_ar: 'أدخل تخصص الشركة أو مجال عملها.',
            placeholder_en: 'Company specialization',
            placeholder_ar: 'تخصص الشركة',
        }

        normalizedFields = normalizedFields.flatMap((field) => {
            if (field.id !== 'company_name') {
                return [field]
            }

            return [
                {
                    ...field,
                    width: 'half',
                },
                companySpecializationField,
            ]
        })
    }

    return normalizedFields
}

function getSectorSections(fields: FormField[]) {
    const sections = sectorFormSections
        .map((section) => ({
            ...section,
            fields: section.fieldIds
                .map((fieldId) => fields.find((field) => field.id === fieldId))
                .filter((field): field is FormField => Boolean(field)),
        }))
        .filter((section) => section.fields.length > 0)

    const knownFieldIds = new Set(sections.flatMap((section) => section.fields.map((field) => field.id)))
    const remainingFields = fields.filter((field) => !knownFieldIds.has(field.id))

    if (remainingFields.length > 0) {
        sections.push({
            key: 'overflow',
            title_en: 'More Details',
            title_ar: 'تفاصيل إضافية',
            badge_en: 'More',
            badge_ar: 'المزيد',
            icon: Sparkles,
            fieldIds: [],
            fields: remainingFields,
        })
    }

    return sections
}

function isAffirmativeAnswer(value: string | undefined) {
    if (!value) return false
    const normalized = value.trim().toLowerCase()
    return normalized === 'yes' || normalized === 'نعم'
}

const sixMonthMinimumFieldIds = new Set(['date_of_expiry'])
const fiveYearVisaIssueFieldIds = new Set([
    'previous_visa_issue_date',
    'secondary_previous_visa_issue_date',
])

function parseDateInputValue(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

    const [year, month, day] = value.split('-').map(Number)
    const parsedDate = new Date(year, month - 1, day)

    if (
        Number.isNaN(parsedDate.getTime())
        || parsedDate.getFullYear() !== year
        || parsedDate.getMonth() !== month - 1
        || parsedDate.getDate() !== day
    ) {
        return null
    }

    parsedDate.setHours(0, 0, 0, 0)
    return parsedDate
}

function addMonths(date: Date, months: number) {
    const nextDate = new Date(date)
    const originalDay = nextDate.getDate()

    nextDate.setMonth(nextDate.getMonth() + months)

    if (nextDate.getDate() !== originalDay) {
        nextDate.setDate(0)
    }

    nextDate.setHours(0, 0, 0, 0)
    return nextDate
}

function formatDateInputValue(date: Date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

export function DynamicForm({
    fields,
    onSubmit,
    submitLabel = 'إرسال',
    successMessage = 'تم الإرسال بنجاح',
    variant = 'default',
}: DynamicFormProps) {
    const { locale, dir } = useI18n()
    const isArabic = locale === 'ar'
    const isSectorVariant = variant === 'sector-elegant'
    const preparedFields = isSectorVariant ? normalizeSectorFields(fields) : fields
    const initialFormEntries: Array<[string, string]> = preparedFields.flatMap((field) =>
        typeof field.defaultValue === 'string' ? [[field.id, field.defaultValue]] : []
    )
    const [formData, setFormData] = useState<Record<string, string>>(
        Object.fromEntries(initialFormEntries)
    )
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const sections = isSectorVariant ? getSectorSections(preparedFields) : []
    const [activeSectionIndex, setActiveSectionIndex] = useState(0)

    useEffect(() => {
        if (!sections.length) return

        setActiveSectionIndex((current) => Math.min(current, sections.length - 1))
    }, [sections.length])

    useEffect(() => {
        if (isAffirmativeAnswer(formData.residence_in_other_country)) return

        setFormData((current) => {
            if (
                !current.residence_permit_number
                && !current.residence_permit_country
                && !current.residence_permit_issue_date
                && !current.residence_permit_valid_until
                && !current.additional_residence_in_other_country
                && !current.secondary_residence_permit_number
                && !current.secondary_residence_permit_country
                && !current.secondary_residence_permit_issue_date
                && !current.secondary_residence_permit_valid_until
            ) {
                return current
            }

            return {
                ...current,
                residence_permit_number: '',
                residence_permit_country: '',
                residence_permit_issue_date: '',
                residence_permit_valid_until: '',
                additional_residence_in_other_country: '',
                secondary_residence_permit_number: '',
                secondary_residence_permit_country: '',
                secondary_residence_permit_issue_date: '',
                secondary_residence_permit_valid_until: '',
            }
        })
    }, [formData.residence_in_other_country])

    useEffect(() => {
        if (isAffirmativeAnswer(formData.additional_residence_in_other_country)) return

        setFormData((current) => {
            if (
                !current.secondary_residence_permit_number
                && !current.secondary_residence_permit_country
                && !current.secondary_residence_permit_issue_date
                && !current.secondary_residence_permit_valid_until
            ) {
                return current
            }

            return {
                ...current,
                secondary_residence_permit_number: '',
                secondary_residence_permit_country: '',
                secondary_residence_permit_issue_date: '',
                secondary_residence_permit_valid_until: '',
            }
        })
    }, [formData.additional_residence_in_other_country])

    useEffect(() => {
        if (isAffirmativeAnswer(formData.fingerprints_collected_previously)) return

        setFormData((current) => {
            if (
                !current.previous_fingerprint_date
                && !current.previous_visa_issue_date
                && !current.previous_visa_valid_until
                && !current.previous_visa_number_if_known
                && !current.previous_visa_source_country
                && !current.additional_previous_visa
                && !current.secondary_previous_visa_issue_date
                && !current.secondary_previous_visa_valid_until
                && !current.secondary_previous_visa_number_if_known
                && !current.secondary_previous_visa_source_country
            ) {
                return current
            }

            return {
                ...current,
                previous_fingerprint_date: '',
                previous_visa_issue_date: '',
                previous_visa_valid_until: '',
                previous_visa_number_if_known: '',
                previous_visa_source_country: '',
                additional_previous_visa: '',
                secondary_previous_visa_issue_date: '',
                secondary_previous_visa_valid_until: '',
                secondary_previous_visa_number_if_known: '',
                secondary_previous_visa_source_country: '',
            }
        })
    }, [formData.fingerprints_collected_previously])

    useEffect(() => {
        if (isAffirmativeAnswer(formData.additional_previous_visa)) return

        setFormData((current) => {
            if (
                !current.secondary_previous_visa_issue_date
                && !current.secondary_previous_visa_valid_until
                && !current.secondary_previous_visa_number_if_known
                && !current.secondary_previous_visa_source_country
            ) {
                return current
            }

            return {
                ...current,
                secondary_previous_visa_issue_date: '',
                secondary_previous_visa_valid_until: '',
                secondary_previous_visa_number_if_known: '',
                secondary_previous_visa_source_country: '',
            }
        })
    }, [formData.additional_previous_visa])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const firstIncompleteSectionIndex = getFirstIncompleteSectionIndex()

        if (firstIncompleteSectionIndex !== -1) {
            goToSection(firstIncompleteSectionIndex)
            return
        }

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
            <Card className={cn(
                'overflow-hidden border shadow-sm',
                isSectorVariant
                    ? 'rounded-[1.75rem] border-emerald-200 bg-[linear-gradient(145deg,#f7fffb_0%,#ffffff_60%,#effdf5_100%)] shadow-[0_28px_70px_-50px_rgba(16,185,129,0.45)]'
                    : 'rounded-2xl border-slate-200/80 bg-white shadow-sm',
            )}>
                <CardContent className="flex flex-col items-center justify-center px-5 py-8 text-center sm:px-6 sm:py-10">
                    <div className={cn(
                        'mb-4 flex items-center justify-center rounded-full',
                        isSectorVariant ? 'h-20 w-20 bg-emerald-50 text-emerald-600' : 'h-16 w-16 bg-slate-100 text-slate-700',
                    )}>
                        <CheckCircle className={cn(isSectorVariant ? 'h-10 w-10' : 'h-8 w-8')} />
                    </div>
                    {isSectorVariant && (
                        <Badge variant="outline" className="mb-3 rounded-full border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            {isArabic ? 'تم الاستلام' : 'Received'}
                        </Badge>
                    )}
                    <h3 className="mb-2 text-xl font-bold text-slate-900">{successMessage}</h3>
                    <p className="max-w-md text-sm leading-7 text-slate-600">
                        {isArabic
                            ? 'استلم فريقنا بياناتكم، وسيتم التواصل معكم بعد المراجعة عبر القنوات الرسمية المرسلة في الاستمارة.'
                            : 'Our team has received your information and will follow up through the official contact channels you provided.'}
                    </p>
                    <Button
                        onClick={() => setSuccess(false)}
                        variant="outline"
                        className={cn(
                            'mt-5 rounded-xl',
                            isSectorVariant && 'rounded-full border-[#8b0000]/15 px-5 text-[#8b0000] hover:bg-[#8b0000]/5 hover:text-[#8b0000]',
                            !isSectorVariant && 'border-slate-200 text-slate-800 hover:bg-slate-50',
                        )}
                    >
                        {isArabic ? 'إرسال رد آخر' : 'Send another response'}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const getFieldLabel = (field: FormField) => isArabic ? (field.label_ar || field.label_en) : field.label_en
    const getFieldDescription = (field: FormField) => isArabic ? (field.description_ar || field.description_en) : (field.description_en || field.description_ar)
    const getFieldPlaceholder = (field: FormField) => {
        if (isArabic) {
            return field.placeholder_ar || `أدخل ${field.label_ar || field.label_en}...`
        }

        return field.placeholder_en || `Enter ${field.label_en}...`
    }
    const getFieldOptions = (field: FormField) => isArabic ? (field.options_ar || field.options || []) : (field.options || field.options_ar || [])
    const NextSectionIcon = isArabic ? ArrowLeft : ArrowRight
    const PreviousSectionIcon = isArabic ? ArrowRight : ArrowLeft
    const hasFieldValue = (field: FormField) => {
        const value = formData[field.id]
        return typeof value === 'string' && value.trim() !== ''
    }
    const getMinimumDateForField = (field: FormField) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (sixMonthMinimumFieldIds.has(field.id)) {
            return formatDateInputValue(addMonths(today, 6))
        }

        if (fiveYearVisaIssueFieldIds.has(field.id)) {
            return formatDateInputValue(addMonths(today, -60))
        }

        return undefined
    }
    const getMaximumDateForField = (field: FormField) => {
        if (!fiveYearVisaIssueFieldIds.has(field.id)) {
            return undefined
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return formatDateInputValue(today)
    }
    const getFieldError = (field: FormField) => {
        const value = formData[field.id]

        if (!value) {
            return ''
        }

        if (sixMonthMinimumFieldIds.has(field.id)) {
            const selectedDate = parseDateInputValue(value)
            const minimumDateValue = getMinimumDateForField(field)
            const minimumDate = minimumDateValue ? parseDateInputValue(minimumDateValue) : null

            if (!selectedDate || !minimumDate || selectedDate < minimumDate) {
                return isArabic
                    ? 'يجب ان تاريخ النفذ لمدة ستة اشهر على الاقل'
                    : 'The expiry date must be at least six months from today.'
            }
        }

        if (fiveYearVisaIssueFieldIds.has(field.id)) {
            const selectedDate = parseDateInputValue(value)
            const minimumDateValue = getMinimumDateForField(field)
            const maximumDateValue = getMaximumDateForField(field)
            const minimumDate = minimumDateValue ? parseDateInputValue(minimumDateValue) : null
            const maximumDate = maximumDateValue ? parseDateInputValue(maximumDateValue) : null

            if (
                !selectedDate
                || !minimumDate
                || !maximumDate
                || selectedDate < minimumDate
                || selectedDate > maximumDate
            ) {
                return isArabic
                    ? 'يجب أن يكون تاريخ إصدار الفيزا خلال آخر خمس سنوات'
                    : 'The visa issue date must be within the last five years.'
            }
        }

        return ''
    }
    const hasFieldError = (field: FormField) => Boolean(getFieldError(field))

    const shouldShowField = (fieldId: string) => {
        if (
            (
                fieldId === 'residence_permit_number'
                || fieldId === 'residence_permit_country'
                || fieldId === 'residence_permit_issue_date'
                || fieldId === 'residence_permit_valid_until'
                || fieldId === 'additional_residence_in_other_country'
            )
            && !isAffirmativeAnswer(formData.residence_in_other_country)
        ) {
            return false
        }

        if (
            (
                fieldId === 'secondary_residence_permit_number'
                || fieldId === 'secondary_residence_permit_country'
                || fieldId === 'secondary_residence_permit_issue_date'
                || fieldId === 'secondary_residence_permit_valid_until'
            )
            && (
                !isAffirmativeAnswer(formData.residence_in_other_country)
                || !isAffirmativeAnswer(formData.additional_residence_in_other_country)
            )
        ) {
            return false
        }

        if (
            (
                fieldId === 'previous_fingerprint_date'
                || fieldId === 'previous_visa_issue_date'
                || fieldId === 'previous_visa_valid_until'
                || fieldId === 'previous_visa_number_if_known'
                || fieldId === 'previous_visa_source_country'
                || fieldId === 'additional_previous_visa'
            )
            && !isAffirmativeAnswer(formData.fingerprints_collected_previously)
        ) {
            return false
        }

        if (
            (
                fieldId === 'secondary_previous_visa_issue_date'
                || fieldId === 'secondary_previous_visa_valid_until'
                || fieldId === 'secondary_previous_visa_number_if_known'
                || fieldId === 'secondary_previous_visa_source_country'
            )
            && (
                !isAffirmativeAnswer(formData.fingerprints_collected_previously)
                || !isAffirmativeAnswer(formData.additional_previous_visa)
            )
        ) {
            return false
        }

        return true
    }

    const getVisibleSectionFields = (section: { fields: FormField[] }) =>
        section.fields.filter((field) => shouldShowField(field.id))

    const isSectionComplete = (sectionIndex: number) => {
        const section = sections[sectionIndex]

        if (!section) return true

        return getVisibleSectionFields(section).every((field) => {
            const hasValue = hasFieldValue(field)

            if (field.required && !hasValue) {
                return false
            }

            if (!hasValue) {
                return true
            }

            return !hasFieldError(field)
        })
    }

    const getFirstIncompleteSectionIndex = () => sections.findIndex((_, index) => !isSectionComplete(index))

    const canAccessSection = (sectionIndex: number) => {
        if (sectionIndex <= activeSectionIndex) return true

        for (let index = 0; index < sectionIndex; index += 1) {
            if (!isSectionComplete(index)) {
                return false
            }
        }

        return true
    }

    const goToSection = (nextIndex: number) => {
        if (!sections.length) return

        const clampedIndex = Math.max(0, Math.min(nextIndex, sections.length - 1))
        const targetIndex = canAccessSection(clampedIndex)
            ? clampedIndex
            : Math.max(0, getFirstIncompleteSectionIndex())

        setActiveSectionIndex(targetIndex)

        if (typeof document !== 'undefined') {
            requestAnimationFrame(() => {
                document.getElementById(`sector-section-${sections[targetIndex]?.key}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                })
            })
        }
    }
    const completedSectionsCount = sections.filter((_, index) => isSectionComplete(index)).length

    const renderField = (field: FormField, style: 'default' | 'sector') => {
        if (!shouldShowField(field.id)) {
            return null
        }

        const label = getFieldLabel(field)
        const description = getFieldDescription(field)
        const errorMessage = getFieldError(field)
        const isWide = field.type === 'textarea' || field.width !== 'half'
        const wrapperClassName = style === 'sector'
            ? `${isWide ? 'md:col-span-2' : 'md:col-span-1'} space-y-2.5`
            : `${isWide ? 'md:col-span-2' : 'md:col-span-1'} space-y-2`
        const labelClassName = style === 'sector'
            ? cn('flex items-center gap-2 text-sm font-semibold text-stone-800', isArabic ? 'justify-start tracking-normal' : 'justify-start text-stone-700')
            : 'inline-flex flex-wrap items-baseline gap-1.5 text-start text-sm font-medium leading-snug text-slate-800'
        const controlClassName = style === 'sector'
            ? cn(
                'h-12 rounded-xl border bg-white px-4 text-sm text-stone-950 transition-colors placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-[#8b0000]/10',
                errorMessage ? 'border-[#8b0000]/35 focus:border-[#8b0000]' : 'border-stone-200 focus:border-[#8b0000]/30',
            )
            : cn(
                'h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors',
                'placeholder:text-slate-400',
                'focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800/10',
                'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70',
                errorMessage
                    ? 'border-red-400/90 focus-visible:border-red-500 focus-visible:ring-red-500/15'
                    : 'border-slate-200',
            )
        const textareaClassName = style === 'sector'
            ? cn(
                'min-h-[112px] rounded-xl border bg-white px-4 py-3 text-sm text-stone-950 transition-colors placeholder:text-stone-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-[#8b0000]/10',
                errorMessage ? 'border-[#8b0000]/35 focus-visible:border-[#8b0000]' : 'border-stone-200 focus-visible:border-[#8b0000]/30',
            )
            : cn(
                'min-h-[108px] rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors',
                'placeholder:text-slate-400',
                'focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800/10',
                'disabled:cursor-not-allowed disabled:opacity-70',
                errorMessage
                    ? 'border-red-400/90 focus-visible:border-red-500 focus-visible:ring-red-500/15'
                    : 'border-slate-200',
            )

        return (
            <div key={field.id} className={wrapperClassName}>
                <div className={style === 'sector' ? 'space-y-2.5' : 'space-y-2'}>
                    <Label className={labelClassName}>
                        <span>{label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {description && (
                        <p className={cn(
                            'text-xs leading-relaxed text-slate-500',
                            style === 'sector' ? 'mb-3 mt-2' : '',
                        )}>
                            {description}
                        </p>
                    )}
                    {field.type === 'textarea' ? (
                        <Textarea
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className={textareaClassName}
                            placeholder={getFieldPlaceholder(field)}
                            aria-invalid={Boolean(errorMessage)}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className={cn(
                                'w-full border text-sm transition-colors focus:outline-none',
                                style === 'sector'
                                    ? errorMessage
                                        ? 'h-12 rounded-xl border-[#8b0000]/35 bg-white px-4 text-sm text-stone-950 focus:border-[#8b0000] focus:bg-white focus:ring-2 focus:ring-[#8b0000]/10'
                                        : 'h-12 rounded-xl border-stone-200 bg-white px-4 text-sm text-stone-950 focus:border-[#8b0000]/30 focus:bg-white focus:ring-2 focus:ring-[#8b0000]/10'
                                    : cn(
                                        'h-11 rounded-xl bg-white px-3.5 py-2 text-slate-900 shadow-sm',
                                        'focus:border-slate-400 focus:ring-2 focus:ring-slate-800/10',
                                        errorMessage
                                            ? 'border-red-400/90 focus:border-red-500 focus:ring-red-500/15'
                                            : 'border-slate-200',
                                    ),
                            )}
                            aria-invalid={Boolean(errorMessage)}
                        >
                            <option value="">
                                {isArabic ? `— اختر: ${label} —` : `— Select: ${field.label_en} —`}
                            </option>
                            {getFieldOptions(field).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            type={field.type}
                            required={field.required}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            className={controlClassName}
                            placeholder={getFieldPlaceholder(field)}
                            min={field.type === 'date' ? getMinimumDateForField(field) : undefined}
                            max={field.type === 'date' ? getMaximumDateForField(field) : undefined}
                            aria-invalid={Boolean(errorMessage)}
                        />
                    )}
                    {errorMessage && (
                        <p className={cn(
                            'mt-3 text-sm font-medium text-[#8b0000]',
                            style === 'sector' ? 'leading-6' : 'leading-5',
                        )}>
                            {errorMessage}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    if (!isSectorVariant) {
        return (
            <form
                dir={dir}
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-6 md:gap-y-5"
            >
                {preparedFields.map((field) => renderField(field, 'default'))}
                <Button
                    type="submit"
                    className="mt-1 h-12 w-full rounded-xl bg-slate-800 text-base font-semibold text-white shadow-md transition-colors hover:bg-slate-700 md:col-span-2"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : submitLabel}
                </Button>
            </form>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {sections.map((section, index) => {
                const Icon = section.icon
                const isActive = index === activeSectionIndex
                const isLastSection = index === sections.length - 1
                const isAccessible = canAccessSection(index)
                const isCurrentSectionComplete = isSectionComplete(index)

                return (
                    <Card
                        id={`sector-section-${section.key}`}
                        key={section.key}
                        className={cn(
                            'overflow-hidden rounded-[1.5rem] border bg-white transition-all duration-300',
                            isActive
                                ? 'border-[#8b0000]/18 shadow-[0_26px_65px_-54px_rgba(15,23,42,0.35)]'
                                : 'border-stone-200 shadow-[0_18px_44px_-42px_rgba(15,23,42,0.3)]',
                        )}
                    >
                        <CardHeader className={cn(
                            'px-5 py-5 sm:px-6',
                            isActive ? 'border-b border-stone-200 bg-[#faf6f0]' : 'bg-white',
                        )}>
                            <button
                                type="button"
                                onClick={() => goToSection(index)}
                                className={cn(
                                    'w-full appearance-none bg-transparent p-0 text-inherit',
                                    !isAccessible && index > activeSectionIndex && 'cursor-not-allowed opacity-75',
                                )}
                            >
                                <div className={cn('flex items-start gap-4', isArabic ? 'flex-row-reverse text-right' : 'text-left')}>
                                    <div className={cn(
                                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-[#8b0000]',
                                        isActive ? 'border-[#8b0000]/12 bg-[#fff7f2]' : 'border-stone-200 bg-stone-50',
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={cn('mb-3 flex items-center gap-2', isArabic ? 'flex-row-reverse justify-between' : 'justify-between')}>
                                            <Badge
                                                variant="outline"
                                                className="rounded-full border-[#8b0000]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0000]"
                                            >
                                                {isArabic ? section.badge_ar : section.badge_en}
                                            </Badge>
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-[#8b0000]">
                                                {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-stone-950">
                                            {isArabic ? section.title_ar : section.title_en}
                                        </CardTitle>
                                        <p className="mt-2 text-sm text-stone-500">
                                            {isArabic
                                                ? `القسم ${index + 1} من ${sections.length}`
                                                : `Section ${index + 1} of ${sections.length}`}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </CardHeader>
                        {isActive && (
                            <CardContent className="px-5 py-5 sm:px-6">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    {section.fields.map((field) => renderField(field, 'sector'))}
                                </div>
                                <div className={cn('mt-6 flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between', isArabic ? 'sm:flex-row-reverse' : '')}>
                                    <div className="space-y-1">
                                        <span className="block text-sm text-stone-500">
                                            {isArabic
                                                ? `اكتمل ${completedSectionsCount} من ${sections.length} أقسام`
                                                : `${completedSectionsCount} of ${sections.length} sections complete`}
                                        </span>
                                        {!isCurrentSectionComplete && (
                                            <span className="block text-xs font-medium text-[#8b0000]">
                                                {isArabic
                                                    ? 'أكمل الحقول الإلزامية وصحح الأخطاء أولاً للانتقال إلى القسم التالي.'
                                                    : 'Complete the required fields and fix any errors before moving to the next section.'}
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn('flex gap-3', isArabic ? 'flex-row-reverse' : '')}>
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-xl border-[#8b0000]/15 px-5 text-[#8b0000] hover:bg-[#8b0000]/5 hover:text-[#8b0000]"
                                                onClick={() => goToSection(index - 1)}
                                            >
                                                <PreviousSectionIcon className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
                                                {isArabic ? 'القسم السابق' : 'Previous Section'}
                                            </Button>
                                        )}
                                        {!isLastSection && (
                                            <Button
                                                type="button"
                                                className="rounded-xl bg-[#8b0000] px-5 text-white shadow-[0_18px_45px_-24px_rgba(139,0,0,0.45)] hover:bg-[#740000]"
                                                onClick={() => goToSection(index + 1)}
                                                disabled={!isCurrentSectionComplete}
                                            >
                                                {isArabic ? 'القسم التالي' : 'Next Section'}
                                                <NextSectionIcon className={cn('h-4 w-4', isArabic ? 'mr-2' : 'ml-2')} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )
            })}

            <Card className={cn(
                'overflow-hidden rounded-[1.5rem] border border-stone-200 bg-[#faf6f0] shadow-[0_24px_64px_-56px_rgba(15,23,42,0.3)] transition-all duration-300',
                sections.length > 0 && activeSectionIndex !== sections.length - 1 && 'pointer-events-none hidden opacity-0',
            )}>
                <CardContent className="px-5 py-5 sm:px-6">
                    <div className={cn('flex flex-col gap-5', isArabic ? 'text-right' : 'text-left')}>
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="rounded-full bg-[#8b0000] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                                {isArabic ? 'جاهز للإرسال' : 'Ready to Submit'}
                            </Badge>
                            <span className="text-sm text-stone-500">
                                {isArabic
                                    ? 'يرجى التأكد من صحة البيانات الرسمية قبل الإرسال.'
                                    : 'Please review the official details carefully before submitting.'}
                            </span>
                        </div>
                        <Separator className="bg-stone-200" />
                        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', isArabic ? 'sm:flex-row-reverse' : '')}>
                            <p className="max-w-xl text-sm leading-7 text-stone-600">
                                {isArabic
                                    ? 'بمجرد إرسال هذه الاستمارة، سيقوم فريقنا بمراجعتها والتواصل معكم عبر البريد الرسمي أو رقم الهاتف المذكور.'
                                    : 'Once submitted, our team will review your dossier and contact you using the official email or phone number provided.'}
                            </p>
                            <Button
                                type="submit"
                                className="min-h-12 rounded-xl bg-[#8b0000] px-6 text-base text-white shadow-[0_18px_45px_-24px_rgba(139,0,0,0.55)] hover:bg-[#740000] focus:ring-[#8b0000]/30"
                                disabled={loading || getFirstIncompleteSectionIndex() !== -1}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : submitLabel}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
