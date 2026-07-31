'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Shield, Mail, AlertCircle, CheckCircle2, Send } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const supabase = createClient()
        // Point straight at the reset page — it resolves the session itself
        // whichever shape the link arrives in (code, token_hash, or fragment).
        const redirectTo = `${window.location.origin}/auth/reset-password`

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo,
        })

        if (resetError) {
            setError(resetError.message || 'Could not send the reset email')
            setIsLoading(false)
            return
        }

        // Always show the same confirmation — never reveal whether an account exists.
        setSent(true)
        setIsLoading(false)
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
                        <h2 className="text-xl font-semibold text-slate-900">Reset your password</h2>
                    </CardHeader>
                    <CardContent>
                        {sent ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                        If an account exists for <strong>{email}</strong>, a reset link is on its
                                        way. Open it in this same browser.
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    The link expires after a short time. If it does not arrive, check the spam
                                    folder or request another one.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <p className="text-sm text-slate-600">
                                    Enter your email and we will send you a link to set a new password.
                                </p>

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
                                            placeholder="exec@jaz.iq"
                                            required
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                                    isLoading={isLoading}
                                >
                                    <Send className="w-4 h-4 ml-2" />
                                    Send reset link
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
