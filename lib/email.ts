interface EmailData {
  to: string[]
  subject: string
  html: string
}

/**
 * Sender address. This was `noreply@jaz-iraq.com` — a domain that is not
 * registered at all, so Resend rejected every message and no email the site
 * ever tried to send was delivered. It must be an address on a domain verified
 * in the Resend dashboard.
 */
const DEFAULT_FROM = 'JAZ <noreply@jaz.iq>'

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    // Using Resend API for email sending
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      // Loud on purpose: a silent failure here is why nobody noticed that
      // registration confirmations were never arriving.
      console.error(
        `Email send failed (${response.status}) from="${process.env.EMAIL_FROM || DEFAULT_FROM}" to=${to.join(',')}:`,
        error
      )
      return { success: false, error: `Failed to send email: ${error}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: 'Email service error' }
  }
}

/** Visitor-supplied text lands in these templates; keep it from becoming markup. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateSectorRegistrationEmail(data: {
  sectorName: string
  fullName: string
  email: string
  phone?: string
  formData: Record<string, string>
  isAdminEmail: boolean
}) {
  const { sectorName, fullName, email, phone, formData, isAdminEmail } = data

  if (isAdminEmail) {
    // Email to admin (jaz.registr@gmail.com)
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b0000 0%, #a01010 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-section { margin-bottom: 25px; }
    .info-section h2 { color: #8b0000; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #8b0000; padding-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #555; }
    .info-value { color: #333; text-align: left; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 طلب تسجيل جديد - ${esc(sectorName)}</h1>
    </div>
    <div class="content">
      <div class="info-section">
        <h2>معلومات المتقدم</h2>
        <div class="info-row">
          <span class="info-label">الاسم الكامل:</span>
          <span class="info-value">${esc(fullName) || '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">البريد الإلكتروني:</span>
          <span class="info-value">${esc(email) || '-'}</span>
        </div>
        ${phone ? `
        <div class="info-row">
          <span class="info-label">رقم الهاتف:</span>
          <span class="info-value">${esc(phone)}</span>
        </div>
        ` : ''}
      </div>

      <div class="info-section">
        <h2>تفاصيل النموذج</h2>
        ${Object.entries(formData).map(([key, value]) => `
        <div class="info-row">
          <span class="info-label">${esc(key)}:</span>
          <span class="info-value">${esc(value)}</span>
        </div>
        `).join('')}
      </div>

      <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-right: 4px solid #ffc107; border-radius: 4px;">
        <strong>ملاحظة:</strong> يرجى مراجعة الطلب والرد على المتقدم في أقرب وقت ممكن.
      </p>
    </div>
    <div class="footer">
      <p>هذا البريد تم إرساله تلقائياً من نظام JAZ Iraq</p>
      <p>© 2026 JAZ Iraq. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
    `
  } else {
    // Email to user
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b0000 0%, #a01010 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; line-height: 1.8; }
    .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; background: #8b0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ تم استلام طلبكم بنجاح</h1>
    </div>
    <div class="content">
      <div class="success-icon">🎉</div>
      <p>عزيزي/عزيزتي <strong>${esc(fullName)}</strong>،</p>
      <p>شكراً لتقديم طلب التسجيل في قطاع <strong>${esc(sectorName)}</strong>.</p>
      <p>تم استلام طلبكم بنجاح وسيقوم فريقنا بمراجعته والتواصل معكم في أقرب وقت ممكن.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #0284c7;">
        <h3 style="margin-top: 0; color: #0284c7;">معلومات التواصل:</h3>
        <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${esc(email)}</p>
        ${phone ? `<p style="margin: 5px 0;"><strong>رقم الهاتف:</strong> ${esc(phone)}</p>` : ''}
      </div>

      <p>إذا كان لديكم أي استفسارات، يرجى التواصل معنا عبر:</p>
      <p>📧 <a href="mailto:info@jaz.iq">info@jaz.iq</a></p>
    </div>
    <div class="footer">
      <p>هذا البريد تم إرساله تلقائياً من نظام JAZ Iraq</p>
      <p>© 2026 JAZ Iraq. جميع الحقوق محفوظة.</p>
    </div>
  </div>
</body>
</html>
    `
  }
}

/** Alert sent to whoever is listed under Settings → Notifications. */
export function generateContactMessageEmail(data: {
  fullName: string
  email: string
  phone?: string | null
  subject?: string | null
  category?: string | null
  message: string
}) {
  const { fullName, email, phone, subject, category, message } = data

  const row = (label: string, value: unknown) =>
    value
      ? `<div class="info-row"><span class="info-label">${label}:</span><span class="info-value">${esc(value)}</span></div>`
      : ''

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b0000 0%, #a01010 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { padding: 30px; }
    .info-section h2 { color: #8b0000; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #8b0000; padding-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-label { font-weight: bold; color: #555; }
    .info-value { color: #333; text-align: left; }
    .message { background: #f8fafc; border-right: 4px solid #8b0000; border-radius: 4px; padding: 16px; margin-top: 20px; white-space: pre-wrap; line-height: 1.8; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ رسالة تواصل جديدة</h1>
    </div>
    <div class="content">
      <div class="info-section">
        <h2>معلومات المُرسِل</h2>
        ${row('الاسم', fullName)}
        ${row('البريد الإلكتروني', email)}
        ${row('رقم الهاتف', phone)}
        ${row('الموضوع', subject)}
        ${row('التصنيف', category)}
      </div>
      <div class="message">${esc(message)}</div>
    </div>
    <div class="footer">
      <p>هذا البريد تم إرساله تلقائياً من نظام JAZ Iraq</p>
    </div>
  </div>
</body>
</html>
  `
}
