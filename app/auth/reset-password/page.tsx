'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Shield, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const MIN_LENGTH = 10

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [hasSession, setHasSession] = useState(false)

    // The recovery link lands on /auth/callback, which establishes the session
    // and forwards here. Without a session there is nothing to update.
    useEffect(() => {
        const supabase = createClient()

        supabase.auth.getSession().then(({ data }) => {
            setHasSession(!!data.session)
            setChecking(false)
        })

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setHasSession(true)
                setChecking(false)
            }
        })

        return () => sub.subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < MIN_LENGTH) {
            setError(`Password must be at least ${MIN_LENGTH} characters`)
            return
        }
        if (password !== confirm) {
            setError('The two passwords do not match')
            return
        }

        setIsLoading(true)
        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password })

        if (updateError) {
            setError(updateError.message || 'Could not update the password')
            setIsLoading(false)
            return
        }

        setDone(true)
        setIsLoading(false)
        setTimeout(() => router.push('/admin-login'), 2500)
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
                        <h2 className="text-xl font-semibold text-slate-900">Set a new password</h2>
                    </CardHeader>
                    <CardContent>
                        {checking ? (
                            <p className="text-sm text-slate-500 py-4">Verifying your link…</p>
                        ) : done ? (
                            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Password updated. Redirecting you to sign in…</span>
                            </div>
                        ) : !hasSession ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                        This reset link is invalid or has expired. Request a new one and open it
                                        in the same browser.
                                    </span>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="inline-block text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Request a new link
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block w-full text-left text-sm font-medium text-slate-700 mb-1">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pl-10 pr-20 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                                            placeholder="••••••••••"
                                            required
                                            minLength={MIN_LENGTH}
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
                                    <p className="mt-1 text-xs text-slate-500">
                                        At least {MIN_LENGTH} characters.
                                    </p>
                                </div>

                                <div>
                                    <label className="block w-full text-left text-sm font-medium text-slate-700 mb-1">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                                            placeholder="••••••••••"
                                            required
                                            minLength={MIN_LENGTH}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                                    isLoading={isLoading}
                                >
                                    <Lock className="w-4 h-4 ml-2" />
                                    Update password
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                            <Link
                                href="/admin-login"
                                className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
