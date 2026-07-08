'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Sector = Database['public']['Tables']['sectors']['Row']

const COMPANY_POSITIONS = [
  { value: 'owner', label: 'مالك' },
  { value: 'authorized_manager', label: 'مدير مفوض' },
  { value: 'employee', label: 'موظف' },
  { value: 'other', label: 'آخر' },
] as const

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [sectors, setSectors] = useState<Sector[]>([])
  const [sectorId, setSectorId] = useState('')
  const [subSector, setSubSector] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyPosition, setCompanyPosition] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSectors, setLoadingSectors] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sectors')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setSectors(data ?? [])
        setLoadingSectors(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!sectorId || !subSector.trim() || !companyName.trim() || !companyPosition || !city.trim() || !country.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    const { error } = await supabase
      .from('users')
      .update({
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
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-28 sm:pt-32 lg:pt-36 pb-12">
        <Container className="max-w-md">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">أنجزت ملفك الشخصي!</h1>
              <p className="text-gray-500 mb-6">حفظنا معلوماتك وراح نستخدمها لنرشّح لك أفضل الفعاليات المناسبة لك</p>
              <Button
                className="w-full"
                onClick={() => {
                  router.push(redirect)
                  router.refresh()
                }}
              >
                متابعة
              </Button>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-28 sm:pt-32 lg:pt-36 pb-12">
      <Container className="max-w-md">
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">أكمل ملفك الشخصي</h1>
            <p className="text-gray-500 mt-2">هذه المعلومات ضرورية لنرشّح لك الفعاليات والتوصيات المناسبة</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما هو تخصصك الرئيسي؟</p>
                {loadingSectors ? (
                  <p className="text-sm text-gray-400">جارٍ التحميل…</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSectorId(s.id)}
                        className={cn(
                          'px-4 py-2 rounded-full border text-sm transition-colors',
                          sectorId === s.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                        )}
                      >
                        {s.name_ar || s.name_en || s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما هو تخصصك الفرعي بالتحديد؟</p>
                <Input
                  value={subSector}
                  onChange={(e) => setSubSector(e.target.value)}
                  placeholder="مثال: طاقة شمسية، أنابيب وفتنغات…"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ما اسم شركتك أو جهتك؟</p>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="اسم الشركة"
                />
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
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">من أي مدينة أنت؟</p>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="المدينة"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">من أي دولة أنت؟</p>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="الدولة"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                حفظ ومتابعة
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
