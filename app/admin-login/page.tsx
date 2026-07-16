'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDashboardRole, defaultRouteForRole } from '@/lib/permissions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        document.body.classList.add('admin-login-surface')
        return () => document.body.classList.remove('admin-login-surface')
    }, [])

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
            setError('Invalid email or password')
            setIsLoading(false)
            return
        }

        console.log('Auth success, fetching profile for user:', authData.user.id)
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, permissions, is_active')
            .eq('id', authData.user.id)
            .single()

        if (profileError || !isDashboardRole(profile?.role)) {
            console.error('Profile error or no dashboard access:', profileError, profile)
            await supabase.auth.signOut()
            setError('You do not have access to the dashboard')
            setIsLoading(false)
            return
        }

        if (profile?.is_active === false) {
            await supabase.auth.signOut()
            setError('Your account is temporarily disabled. Please contact an administrator.')
            setIsLoading(false)
            return
        }

        console.log('Access verified, redirecting by role...')
        router.push(defaultRouteForRole(profile?.role, profile?.permissions))
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4fb_38%,_#e8eef7_100%)] flex items-center justify-center p-4">
            <div className="w-full max-w-md" dir="ltr">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-white border border-slate-200 shadow-lg shadow-slate-200/60">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">JAZ Operations Hub</h1>
                </div>

                <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                    <CardHeader className="text-left pb-2">
                        <h2 className="text-xl font-semibold text-slate-900">Administrator Sign In</h2>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
                            {error && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block w-full text-left text-sm font-medium text-slate-700 mb-1">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                                        placeholder="admin@jaz.iq"
                                        required
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block w-full text-left text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-10 pr-20 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                                        placeholder="••••••••"
                                        required
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                                isLoading={isLoading}
                            >
                                <Lock className="w-4 h-4 ml-2" />
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                            <Link
                                href="/"
                                className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
                            >
                                Back to website
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
