'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DASHBOARD_PAGES } from '@/lib/permissions'
import { toast } from 'sonner'
import {
  UserPlus, Loader2, Copy, Check, RefreshCw, KeyRound, MessageCircle,
  ShieldCheck, Users, Trash2, Save, Mail,
} from 'lucide-react'

const MIN_PASSWORD = 10

type Member = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string | null
  permissions: string[] | null
  is_active: boolean | null
}

/** Readable but strong — the admin has to pass this to a person, often by phone. */
function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = upper + lower + digits + symbols

  const pick = (set: string, count: number) =>
    Array.from(crypto.getRandomValues(new Uint32Array(count)), (n) => set[n % set.length])

  const chars = [
    ...pick(upper, 2), ...pick(lower, 5), ...pick(digits, 3), ...pick(symbols, 2),
    ...pick(all, 2),
  ]
  // Fisher–Yates with crypto randomness so the character classes are not in a fixed order
  const rand = crypto.getRandomValues(new Uint32Array(chars.length))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 shrink-0"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

export function StaffAccountsPanel() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'admin' | 'team'>('team')
  const [permissions, setPermissions] = useState<string[]>(['/dashboard/team-tasks'])
  const [password, setPassword] = useState(generatePassword())

  /** The one moment the password is visible — it is never retrievable later. */
  const [handover, setHandover] = useState<{ name: string; email: string; phone: string; password: string } | null>(null)
  const [resetFor, setResetFor] = useState<Member | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [permsFor, setPermsFor] = useState<Member | null>(null)
  const [draftPerms, setDraftPerms] = useState<string[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/team-members', { cache: 'no-store' })
      if (res.ok) setMembers(await res.json())
    } catch {
      toast.error('Could not load the staff list')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const message = useMemo(() => {
    if (!handover) return ''
    return [
      `Hello ${handover.name},`,
      '',
      'Here are your sign-in details for the JAZ dashboard:',
      `Link: https://jaz.iq/admin-login`,
      `Email: ${handover.email}`,
      `Password: ${handover.password}`,
      '',
      'Please change this password after your first sign-in, under Settings → My account.',
    ].join('\n')
  }, [handover])

  const whatsappUrl = useMemo(() => {
    if (!handover?.phone) return null
    const digits = handover.phone.replace(/[^\d]/g, '').replace(/^0+/, '')
    if (!digits) return null
    const intl = digits.startsWith('964') ? digits : `964${digits}`
    return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
  }, [handover, message])

  /**
   * Opens the admin's own mail client with everything filled in. Deliberately
   * not sent from the server: the sending domain is not verified yet, so a
   * server-side send would fail silently and the employee would wait for an
   * email that never arrives. This way the admin sees it leave their outbox.
   */
  const mailtoUrl = useMemo(() => {
    if (!handover) return null
    const subject = 'Your JAZ dashboard sign-in details'
    return `mailto:${encodeURIComponent(handover.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  }, [handover, message])

  const createMember = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (password.length < MIN_PASSWORD) {
      toast.error(`Password must be at least ${MIN_PASSWORD} characters`)
      return
    }

    setBusy('create')
    try {
      const res = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || null,
          role,
          permissions: role === 'team' ? permissions : [],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not create the account')

      setHandover({ name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password })
      setFullName(''); setEmail(''); setPhone('')
      setRole('team'); setPermissions(['/dashboard/team-tasks'])
      setPassword(generatePassword())
      await load()
      toast.success('Account created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create the account')
    } finally {
      setBusy(null)
    }
  }

  const setActive = async (member: Member, isActive: boolean) => {
    setBusy(member.id)
    try {
      const res = await fetch(`/api/team-members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not apply the change')
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, is_active: isActive } : m)))
      toast.success(isActive ? 'Account enabled' : 'Account disabled')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not apply the change')
    } finally {
      setBusy(null)
    }
  }

  const removeMember = async (member: Member) => {
    if (!window.confirm(`Remove ${member.full_name || member.email} from the team? They will lose dashboard access.`)) return
    setBusy(member.id)
    try {
      const res = await fetch(`/api/team-members/${member.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not remove them')
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
      toast.success('Removed from the team')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove them')
    } finally {
      setBusy(null)
    }
  }

  const savePermissions = async () => {
    if (!permsFor) return
    setBusy(permsFor.id)
    try {
      const res = await fetch(`/api/team-members/${permsFor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: draftPerms }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not save')
      setMembers((prev) =>
        prev.map((m) => (m.id === permsFor.id ? { ...m, permissions: draftPerms } : m))
      )
      setPermsFor(null)
      toast.success('Permissions saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setBusy(null)
    }
  }

  const applyReset = async () => {
    if (!resetFor) return
    if (resetPassword.length < MIN_PASSWORD) {
      toast.error(`Password must be at least ${MIN_PASSWORD} characters`)
      return
    }
    setBusy(resetFor.id)
    try {
      const res = await fetch(`/api/team-members/${resetFor.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not change the password')

      setHandover({
        name: resetFor.full_name || resetFor.email,
        email: resetFor.email,
        phone: resetFor.phone || '',
        password: resetPassword,
      })
      setResetFor(null)
      setResetPassword('')
      toast.success('Password changed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change the password')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Handover card: shown once ── */}
      {handover && (
        <Card className="border-green-300 bg-green-50/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-900">
              <ShieldCheck className="w-5 h-5" /> Sign-in details — copy them now
            </CardTitle>
            <CardDescription className="text-green-800">
              This password will not be shown again. Send it to the employee, then close this card.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly dir="ltr" value={handover.email} className="font-mono bg-white" />
              <CopyButton value={handover.email} label="Email" />
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly dir="ltr" value={handover.password} className="font-mono bg-white" />
              <CopyButton value={handover.password} label="Password" />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <CopyButton value={message} label="Copy full message" />
              {whatsappUrl && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
                  </a>
                </Button>
              )}
              {mailtoUrl && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={mailtoUrl}>
                    <Mail className="w-3.5 h-3.5" /> Send by email
                  </a>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setHandover(null)}>
                Done, close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Add an employee ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add an employee
          </CardTitle>
          <CardDescription>
            Creates a full sign-in account — no need to open the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmed Ali"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@jaz.iq" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07701234567" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'team')}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="team">Team member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="flex items-center gap-2">
              <Input dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
              <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setPassword(generatePassword())}>
                <RefreshCw className="w-3.5 h-3.5" /> Generate
              </Button>
            </div>
            <p className="text-xs text-slate-500">{MIN_PASSWORD} characters or more. Shown once after the account is created.</p>
          </div>

          {role === 'team' && (
            <div className="space-y-2">
              <Label>Pages they may open</Label>
              <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-md border border-slate-200 p-3 sm:grid-cols-2">
                {DASHBOARD_PAGES.map((page) => (
                  <label key={page.path} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={permissions.includes(page.path)}
                      onChange={(e) =>
                        setPermissions((prev) =>
                          e.target.checked ? [...prev, page.path] : prev.filter((p) => p !== page.path)
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {page.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">An administrator sees every page automatically.</p>
            </div>
          )}

          <Button onClick={createMember} disabled={busy === 'create'} className="gap-2">
            {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create account
          </Button>
        </CardContent>
      </Card>

      {/* ── Current staff ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" /> Staff
          </CardTitle>
          <CardDescription>Disabling an account blocks sign-in immediately without deleting anything.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading…</p>
          ) : members.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No staff yet.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {member.full_name || '—'}
                      <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                        {member.role === 'admin' ? 'Administrator' : 'Team member'}
                      </span>
                    </p>
                    <p dir="ltr" className="truncate text-right text-xs text-slate-500">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={member.is_active !== false}
                        disabled={busy === member.id}
                        onCheckedChange={(v) => setActive(member, v)}
                      />
                      <span className="text-xs text-slate-500">
                        {member.is_active === false ? 'Disabled' : 'Enabled'}
                      </span>
                    </div>
                    {member.role === 'team' && (
                      <Button
                        type="button" variant="outline" size="sm" className="gap-1.5"
                        onClick={() => {
                          setPermsFor(permsFor?.id === member.id ? null : member)
                          setDraftPerms(member.permissions ?? [])
                        }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Permissions
                      </Button>
                    )}
                    <Button
                      type="button" variant="outline" size="sm" className="gap-1.5"
                      onClick={() => { setResetFor(member); setResetPassword(generatePassword()) }}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Password
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="text-slate-400 hover:text-red-600"
                      disabled={busy === member.id}
                      onClick={() => removeMember(member)}
                      aria-label={`Remove ${member.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {permsFor?.id === member.id && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-md border border-slate-200 p-3 sm:grid-cols-2">
                      {DASHBOARD_PAGES.map((page) => (
                        <label key={page.path} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={draftPerms.includes(page.path)}
                            onChange={(e) =>
                              setDraftPerms((prev) =>
                                e.target.checked
                                  ? [...prev, page.path]
                                  : prev.filter((p) => p !== page.path)
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          {page.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={busy === member.id} onClick={savePermissions}>
                        Save permissions
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPermsFor(null)}>Cancel</Button>
                      <span className="text-xs text-slate-500">{draftPerms.length} selected</span>
                    </div>
                  </div>
                )}

                {resetFor?.id === member.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <Input
                      dir="ltr" value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      className="h-9 max-w-xs font-mono"
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-1.5"
                      onClick={() => setResetPassword(generatePassword())}>
                      <RefreshCw className="w-3.5 h-3.5" /> Generate
                    </Button>
                    <Button size="sm" disabled={busy === member.id} onClick={applyReset}>
                      Set
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setResetFor(null)}>Cancel</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
