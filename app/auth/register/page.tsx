'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { locale, t, dir } = useI18n()
  const isAr = locale === 'ar'

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }

    if (formData.password.length < 6) {
      setError(t.auth.passwordTooShort)
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // إذا لم يُفعَّل تأكيد البريد، تُنشأ الجلسة مباشرة وننتقل لإكمال الملف الشخصي
    if (data.session) {
      router.push('/auth/complete-profile')
      return
    }

    router.push('/auth/verify')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] pb-16 pt-28 sm:pt-32" dir={dir}>
      <Container className="max-w-5xl">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-[#0b1426] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-[#d4af37]">JOINT ANNUAL ZONE</p>
              <h2 className="mt-8 text-3xl font-extrabold leading-tight">
                {isAr ? 'بوابتك إلى الفعاليات الدولية' : 'Your gateway to international events'}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {isAr ? 'أنشئ حسابك للوصول إلى التسجيلات، الدعوات، وتحديثات الفعاليات.' : 'Create your account to access registrations, invitations, and event updates.'}
              </p>
            </div>
            <p className="text-xs text-slate-400">{isAr ? 'تجربة ثنائية اللغة، مصممة للمشاركين والشركاء.' : 'A bilingual experience for participants and partners.'}</p>
          </div>
          <div>
          <Card className="rounded-none border-0 shadow-none">
          <CardHeader className="px-6 pb-5 pt-8 text-center sm:px-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#8b0000] text-2xl font-extrabold text-white">J</div>
            <h1 className="text-2xl font-extrabold text-[#101a33]">{t.auth.register}</h1>
            <p className="mt-2 text-sm text-[#53647d]">{t.auth.registerSubtitle}</p>
          </CardHeader>
          <CardContent className="px-6 pb-8 sm:px-10">
            <form onSubmit={handleRegister} className="space-y-3.5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="relative">
                <User className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  name="fullName"
                  placeholder={t.auth.fullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="ps-10"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder={t.auth.email}
                  value={formData.email}
                  onChange={handleChange}
                  className="ps-10"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  name="phone"
                  placeholder={t.auth.phone}
                  value={formData.phone}
                  onChange={handleChange}
                  className="ps-10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder={t.auth.password}
                  value={formData.password}
                  onChange={handleChange}
                  className="ps-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder={t.auth.confirmPassword}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="ps-10"
                  required
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t.auth.createAccount}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-[#53647d]">{t.auth.hasAccount}</span>{' '}
              <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
                {t.auth.login}
              </Link>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </Container>
    </main>
  )
}
