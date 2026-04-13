'use client'

import { DynamicForm } from '@/components/shared/dynamic-form'
import { type FormField } from '@/lib/types'
import { submitSectorRegistration } from '@/app/sectors/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Building2, UserRound } from 'lucide-react'
import { getSectorRegistrationFallback } from '@/app/sectors/sector-content'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SectorRegistrationFormProps {
  sectorId: string
  sectorName: string
  config: FormField[] | null
  intro?: string
  variant?: 'card' | 'plain'
  className?: string
  showHeader?: boolean
}

export function SectorRegistrationForm({
  sectorId,
  sectorName,
  config,
  intro,
  variant = 'card',
  className,
  showHeader = true,
}: SectorRegistrationFormProps) {
  const { locale } = useI18n()
  const isArabic = locale === 'ar'
  const fields = config && config.length > 0 ? config : getSectorRegistrationFallback()
  const title = isArabic ? 'نموذج التسجيل' : 'Registration Form'
  const description =
    intro || `يمكنكم استخدام هذا النموذج للتواصل مع فريق ${sectorName} بخصوص فرص التعاون أو المشاركة أو الاستفسارات المهنية.`

  const handleSubmit = async (data: Record<string, string>) => {
    const result = await submitSectorRegistration(sectorId, data)
    if (!result.success) {
      throw new Error('Failed to submit')
    }
  }

  const infoCards = [
    {
      icon: UserRound,
      title: isArabic ? 'المعلومات الشخصية' : 'Personal Information',
      description: isArabic ? 'بيانات الهوية والتواصل الشخصي للمشارك.' : 'Identity and personal contact details for the attendee.',
    },
    {
      icon: FileText,
      title: isArabic ? 'وثائق الباسبور' : 'Passport Documents',
      description: isArabic ? 'نوع الوثيقة ورقمها وبيانات الإصدار.' : 'Document type, number, and issuing details.',
    },
    {
      icon: FileText,
      title: isArabic ? 'معلومات الإقامة' : 'Residence Information',
      description: isArabic ? 'بيانات الإقامة وتصريح الإقامة والدولة والتواريخ المرتبطة بها.' : 'Residency status, permit number, country, and permit dates.',
    },
    {
      icon: FileText,
      title: isArabic ? 'معلومات إضافية' : 'Additional Information',
      description: isArabic ? 'بيانات الفيزا السابقة إن وجدت.' : 'Previous visa details when applicable.',
    },
    {
      icon: Building2,
      title: isArabic ? 'معلومات الشركة' : 'Company Information',
      description: isArabic ? 'معلومات الشركة والاتصال الأساسي.' : 'Company identity and primary contact details.',
    },
  ]

  if (variant === 'plain') {
    return (
      <div className={cn('space-y-5', className)} dir={isArabic ? 'rtl' : 'ltr'}>
        <Card className="overflow-hidden rounded-[1.7rem] border border-stone-200 bg-white shadow-[0_28px_70px_-58px_rgba(15,23,42,0.3)]">
          <CardHeader className="border-b border-stone-200 bg-[#faf6f0] px-5 py-5 sm:px-6 sm:py-6">
            <div className={cn('flex items-start justify-between gap-4', isArabic ? 'flex-row-reverse text-right' : 'text-left')}>
              <div className="min-w-0 flex-1">
                <Badge
                  variant="outline"
                  className="mb-3 rounded-full border-[#8b0000]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0000]"
                >
                  {isArabic ? 'استمارة رسمية' : 'Official Dossier'}
                </Badge>
                {showHeader && (
                  <>
                    <CardTitle className="text-2xl font-bold text-stone-950 sm:text-[2rem]">{title}</CardTitle>
                    <CardDescription className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
                      {description}
                    </CardDescription>
                  </>
                )}
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-[#8b0000]">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {infoCards.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className={cn(
                      'rounded-2xl border border-stone-200 bg-white p-4',
                      isArabic ? 'text-right' : 'text-left',
                    )}
                  >
                    <div className={cn('mb-3 flex items-center gap-3', isArabic ? 'flex-row-reverse' : '')}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b0000]/8 text-[#8b0000]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                    </div>
                    <p className="text-xs leading-6 text-stone-500">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="px-4 py-5 sm:px-6 sm:py-6">
            <Separator className="mb-5 bg-stone-200" />
            <DynamicForm
              fields={fields}
              onSubmit={handleSubmit}
              submitLabel={isArabic ? 'إرسال الطلب' : 'Submit Request'}
              successMessage={isArabic ? 'تم إرسال طلبكم بنجاح، وسيتواصل معكم فريقنا قريباً.' : 'Your request has been submitted successfully. Our team will contact you soon.'}
              variant="sector-elegant"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className={cn('border-[#8b0000]/10 bg-white shadow-sm', className)} dir={isArabic ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b0000]/10 text-[#8b0000]">
          <FileText className="h-5 w-5" />
        </div>
        <CardTitle className={`text-2xl ${isArabic ? 'text-right' : 'text-left'}`}>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicForm
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel={isArabic ? 'إرسال الطلب' : 'Submit Request'}
          successMessage={isArabic ? 'تم إرسال طلبكم بنجاح، وسيتواصل معكم فريقنا قريباً.' : 'Your request has been submitted successfully. Our team will contact you soon.'}
          variant="sector-elegant"
        />
      </CardContent>
    </Card>
  )
}
