import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Eye, Award, Users } from 'lucide-react'

export const metadata = {
  title: 'من نحن | JAZ',
  description: 'تعرف على شركة JAZ ورؤيتنا ورسالتنا في تنظيم الفعاليات والمعارض في العراق',
}

const values = [
  {
    icon: Target,
    title: 'رسالتنا',
    description: 'تقديم خدمات تنظيم فعاليات ومعارض متميزة تساهم في تطوير القطاعات الاقتصادية في العراق.',
  },
  {
    icon: Eye,
    title: 'رؤيتنا',
    description: 'أن نكون الشركة الرائدة في تنظيم الفعاليات والمعارض على مستوى العراق والمنطقة.',
  },
  {
    icon: Award,
    title: 'قيمنا',
    description: 'الجودة، الابتكار، الاحترافية، والالتزام بتقديم أفضل تجربة لعملائنا وشركائنا.',
  },
  {
    icon: Users,
    title: 'فريقنا',
    description: 'فريق متخصص من الخبراء في تنظيم الفعاليات والتسويق والإدارة.',
  },
]

const stats = [
  { value: '50+', label: 'معرض ناجح' },
  { value: '100K+', label: 'زائر' },
  { value: '200+', label: 'شريك' },
  { value: '10+', label: 'سنوات خبرة' },
]

export default function AboutPage() {
  return (
    <div className="pt-36 pb-12">
      <Container>
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            من نحن
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <strong>JAZ (Joint Annual Zone to Your Place)</strong> هي شركة عراقية رائدة متخصصة في تنظيم الفعاليات والمعارض وبرامج التدريب والتطوير. نعمل على ربط القطاعات الاقتصادية المختلفة وتوفير منصات للتواصل والنمو.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <p className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10">
            ما يميزنا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg h-fit">
                    <value.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            قصتنا
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              بدأت رحلتنا في العراق برؤية واضحة: إنشاء منصة متكاملة تجمع بين القطاعات الاقتصادية المختلفة وتوفر فرصاً للتواصل والتطوير. على مدار السنوات، نجحنا في تنظيم عشرات المعارض والفعاليات التي استقطبت آلاف الزوار والمشاركين.
            </p>
            <p>
              نؤمن بأن الفعاليات والمعارض هي أدوات قوية للتنمية الاقتصادية، ونسعى دائماً لتقديم تجارب استثنائية تلبي تطلعات عملائنا وشركائنا.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
