'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const supabase = createClient()

        console.log('Attempting sign in with email:', email)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            console.error('Auth error:', authError)
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
            setIsLoading(false)
            return
        }

        console.log('Auth success, fetching profile for user:', authData.user.id)
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            console.error('Profile error or not admin:', profileError, profile)
            await supabase.auth.signOut()
            setError('ليس لديك صلاحية الوصول إلى لوحة التحكم')
            setIsLoading(false)
            return
        }

        console.log('Admin verified, redirecting...')
        router.push('/dashboard/home')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
                    <p className="text-gray-400 mt-2">JAZ Admin Panel</p>
                </div>

                <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
                    <CardHeader className="text-center pb-2">
                        <h2 className="text-xl font-bold text-white">تسجيل دخول المدير</h2>
                        <p className="text-gray-400 text-sm">أدخل بيانات حساب المدير</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@jaz.iq"
                                        required
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                                isLoading={isLoading}
                            >
                                <Lock className="w-4 h-4 ml-2" />
                                دخول لوحة التحكم
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                            <Link
                                href="/"
                                className="text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                العودة للموقع الرئيسي
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-gray-500 text-sm mt-6">
                    © {new Date().getFullYear()} JAZ. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    )
}
