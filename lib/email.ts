interface EmailData {
  to: string[]
  subject: string
  html: string
}

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
        from: 'JAZ Registration <noreply@jaz-iraq.com>',
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Email send failed:', error)
      return { success: false, error: 'Failed to send email' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: 'Email service error' }
  }
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
      <h1>🎯 طلب تسجيل جديد - ${sectorName}</h1>
    </div>
    <div class="content">
      <div class="info-section">
        <h2>معلومات المتقدم</h2>
        <div class="info-row">
          <span class="info-label">الاسم الكامل:</span>
          <span class="info-value">${fullName || '-'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">البريد الإلكتروني:</span>
          <span class="info-value">${email || '-'}</span>
        </div>
        ${phone ? `
        <div class="info-row">
          <span class="info-label">رقم الهاتف:</span>
          <span class="info-value">${phone}</span>
        </div>
        ` : ''}
      </div>

      <div class="info-section">
        <h2>تفاصيل النموذج</h2>
        ${Object.entries(formData).map(([key, value]) => `
        <div class="info-row">
          <span class="info-label">${key}:</span>
          <span class="info-value">${value}</span>
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
      <p>عزيزي/عزيزتي <strong>${fullName}</strong>،</p>
      <p>شكراً لتقديم طلب التسجيل في قطاع <strong>${sectorName}</strong>.</p>
      <p>تم استلام طلبكم بنجاح وسيقوم فريقنا بمراجعته والتواصل معكم في أقرب وقت ممكن.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #0284c7;">
        <h3 style="margin-top: 0; color: #0284c7;">معلومات التواصل:</h3>
        <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${email}</p>
        ${phone ? `<p style="margin: 5px 0;"><strong>رقم الهاتف:</strong> ${phone}</p>` : ''}
      </div>

      <p>إذا كان لديكم أي استفسارات، يرجى التواصل معنا عبر:</p>
      <p>📧 <a href="mailto:jaz.registr@gmail.com">jaz.registr@gmail.com</a></p>
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
