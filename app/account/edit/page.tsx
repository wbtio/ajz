'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Sector = Database['public']['Tables']['sectors']['Row']

const COMPANY_POSITIONS = [
  { value: 'owner', label: 'مالك' },
  { value: 'authorized_manager', label: 'مدير مفوّض' },
  { value: 'employee', label: 'موظف' },
  { value: 'other', label: 'أخرى' },
] as const

export default function EditProfilePage() {
  const router = useRouter()

  const [sectors, setSectors] = useState<Sector[]>([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [sectorId, setSectorId] = useState('')
  const [subSector, setSubSector] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyPosition, setCompanyPosition] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login?redirect=/account/edit')
        return
      }
      const [{ data: sectorsData }, { data: profile }] = await Promise.all([
        supabase.from('sectors').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('users').select('*').eq('id', user.id).single(),
      ])
      setSectors(sectorsData ?? [])
      if (profile) {
        setFullName(profile.full_name ?? '')
        setPhone(profile.phone ?? '')
        setSectorId(profile.preferred_sector_id ?? '')
        setSubSector(profile.sub_sector ?? '')
        setCompanyName(profile.company_name ?? '')
        setCompanyPosition(profile.company_position ?? '')
        setCity(profile.city ?? '')
        setCountry(profile.country ?? '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !sectorId || !subSector.trim() || !companyName.trim() || !companyPosition || !city.trim() || !country.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/account/edit')
      return
    }

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        preferred_sector_id: sectorId,
        sub_sector: subSector.trim(),
        company_name: companyName.trim(),
        company_position: companyPosition,
        city: city.trim(),
        country: country.trim(),
      })
      .eq('id', user.id)

    setIsLoading(false)
    if (error) {
      setError('تعذّر حفظ الملف الشخصي، حاول مجدداً')
      return
    }
    setDone(true)
    setTimeout(() => {
      router.push('/account')
      router.refresh()
    }, 900)
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-28">
        <div className="animate-spin w-8 h-8 border-4 border-[#8b0000] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-28 sm:pt-32 lg:pt-36 pb-12" dir="rtl">
        <Container className="max-w-md">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">تم حفظ التعديلات</h1>
              <p className="text-gray-500">جارٍ العودة إلى حسابك…</p>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] pt-28 sm:pt-32 lg:pt-36 pb-12" dir="rtl">
      <Container className="max-w-md">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#8b0000] mb-4 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة إلى حسابي
        </Link>
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">ملفي الشخصي</h1>
            <p className="text-gray-500 mt-2">حدّث معلوماتك لتصلك توصيات وفعاليات أنسب لك</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">الاسم الكامل</p>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">رقم الهاتف</p>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXXX" inputMode="tel" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما هو تخصصك الرئيسي؟</p>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSectorId(s.id)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm transition-colors',
                        sectorId === s.id
                          ? 'bg-[#8b0000] border-[#8b0000] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#8b0000]/50',
                      )}
                    >
                      {s.name_ar || s.name_en || s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما هو تخصصك الفرعي بالتحديد؟</p>
                <Input value={subSector} onChange={(e) => setSubSector(e.target.value)} placeholder="مثال: طاقة شمسية، أنابيب وفتنغات…" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما اسم شركتك أو جهتك؟</p>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="اسم الشركة" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما هو منصبك بالشركة؟</p>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setCompanyPosition(p.value)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm transition-colors',
                        companyPosition === p.value
                          ? 'bg-[#8b0000] border-[#8b0000] text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-[#8b0000]/50',
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">المدينة</p>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">الدولة</p>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="الدولة" />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                حفظ التعديلات
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
