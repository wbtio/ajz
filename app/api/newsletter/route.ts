import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Newsletter sign-up from the public footer.
 *
 * Anonymous visitors may insert only — the RLS policies on
 * `newsletter_subscribers` stop them reading the list back.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254

export async function POST(request: Request) {
  let body: { email?: unknown; locale?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
  }

  const locale = body.locale === 'en' ? 'en' : 'ar'
  const supabase = await createClient()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, locale, source: 'footer' })

  // 23505 = مشترك مسبقاً؛ نعامله كنجاح حتى لا نكشف من هو مشترك ومن ليس كذلك
  if (error && error.code !== '23505') {
    console.error('Newsletter subscribe failed:', error)
    return NextResponse.json({ error: 'تعذّر إتمام الاشتراك' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
