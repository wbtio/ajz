import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react'

export const metadata = {
  title: 'الشروط والأحكام | JAZ',
  description: 'الشروط والأحكام لاستخدام موقع وخدمات JAZ',
}

export default function TermsPage() {
  const sections = [
    {
      icon: CheckCircle,
      title: 'قبول الشروط',
      content: `باستخدامك لموقع JAZ وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.

يحق لنا تعديل هذه الشروط في أي وقت، وسيتم نشر التعديلات على هذه الصفحة. استمرارك في استخدام الموقع بعد نشر التعديلات يعني موافقتك عليها.`,
    },
    {
      icon: FileText,
      title: 'استخدام الموقع',
      content: `عند استخدام موقعنا، توافق على:

• تقديم معلومات صحيحة ودقيقة عند التسجيل
• الحفاظ على سرية بيانات حسابك
• عدم استخدام الموقع لأغراض غير قانونية
• عدم محاولة الوصول غير المصرح به إلى أنظمتنا
• احترام حقوق الملكية الفكرية

نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط.`,
    },
    {
      icon: Scale,
      title: 'التسجيل في الفعاليات',
      content: `عند التسجيل في فعالية:

• التسجيل ملزم ويخضع لسياسة الإلغاء الخاصة بكل فعالية
• يجب تقديم معلومات صحيحة للتسجيل
• التذاكر شخصية وغير قابلة للتحويل إلا بموافقتنا
• نحتفظ بالحق في رفض أو إلغاء التسجيل
• في حالة إلغاء الفعالية، سيتم إخطارك واسترداد المبالغ المدفوعة

سياسة الاسترداد تختلف حسب كل فعالية ويتم توضيحها عند التسجيل.`,
    },
    {
      icon: AlertCircle,
      title: 'إخلاء المسؤولية',
      content: `• نسعى لتقديم معلومات دقيقة، لكننا لا نضمن خلو الموقع من الأخطاء
• لسنا مسؤولين عن أي أضرار ناتجة عن استخدام الموقع
• الروابط الخارجية لا تعني تأييدنا لمحتواها
• نحتفظ بالحق في تعديل أو إيقاف أي خدمة دون إشعار مسبق
• المحتوى المقدم للأغراض المعلوماتية فقط

في حالة وجود نزاع، تخضع هذه الشروط للقوانين المعمول بها في العراق.`,
    },
  ]

  return (
    <div className="pt-36 pb-12">
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            الشروط والأحكام
          </h1>
          <p className="text-gray-600">
            آخر تحديث: يناير 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg shrink-0">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="p-6 lg:p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              هل لديك استفسارات؟
            </h2>
            <p className="text-gray-600 mb-4">
              للاستفسار عن الشروط والأحكام، يرجى التواصل معنا
            </p>
            <a
              href="mailto:legal@jaz.iq"
              className="text-blue-600 font-medium hover:underline"
            >
              legal@jaz.iq
            </a>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
