import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, Eye, FileText } from 'lucide-react'

export const metadata = {
  title: 'سياسة الخصوصية | JAZ',
  description: 'سياسة الخصوصية وحماية البيانات في JAZ',
}

export default function PrivacyPage() {
  const sections = [
    {
      icon: Shield,
      title: 'جمع المعلومات',
      content: `نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند:
      
• التسجيل في الموقع أو إنشاء حساب
• التسجيل في الفعاليات والمعارض
• التواصل معنا عبر نموذج الاتصال
• الاشتراك في النشرة البريدية

المعلومات التي نجمعها قد تشمل: الاسم، البريد الإلكتروني، رقم الهاتف، والمعلومات المهنية.`,
    },
    {
      icon: Lock,
      title: 'حماية المعلومات',
      content: `نحن ملتزمون بحماية معلوماتك الشخصية من خلال:

• استخدام تقنيات التشفير المتقدمة
• تطبيق سياسات أمان صارمة على قواعد البيانات
• تقييد الوصول إلى المعلومات الشخصية
• مراجعة دورية لإجراءات الأمان

لن نشارك معلوماتك مع أطراف ثالثة دون موافقتك الصريحة.`,
    },
    {
      icon: Eye,
      title: 'استخدام المعلومات',
      content: `نستخدم المعلومات التي نجمعها للأغراض التالية:

• تقديم خدماتنا وتحسينها
• إرسال تأكيدات التسجيل والتذاكر
• التواصل معك بشأن الفعاليات والتحديثات
• تحليل استخدام الموقع لتحسين تجربة المستخدم
• الامتثال للمتطلبات القانونية`,
    },
    {
      icon: FileText,
      title: 'حقوقك',
      content: `لديك الحق في:

• الوصول إلى معلوماتك الشخصية
• تصحيح أو تحديث معلوماتك
• طلب حذف معلوماتك
• الانسحاب من القوائم البريدية
• تقديم شكوى بشأن معالجة بياناتك

للاستفسار عن حقوقك أو تقديم طلب، يرجى التواصل معنا.`,
    },
  ]

  return (
    <div className="pt-36 pb-12">
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-gray-600">
            آخر تحديث: يناير 2026
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6 lg:p-8">
            <p className="text-gray-700 leading-relaxed">
              نحن في <strong>JAZ</strong> نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام موقعنا وخدماتنا. باستخدامك لموقعنا، فإنك توافق على الممارسات الموضحة في هذه السياسة.
            </p>
          </CardContent>
        </Card>

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
              هل لديك أسئلة؟
            </h2>
            <p className="text-gray-600 mb-4">
              إذا كان لديك أي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا
            </p>
            <a
              href="mailto:privacy@jaz.iq"
              className="text-blue-600 font-medium hover:underline"
            >
              privacy@jaz.iq
            </a>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
