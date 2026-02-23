import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Clock, Users, Award, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'التدريب والتطوير | JAZ',
  description: 'برامج تدريبية متخصصة لتطوير المهارات والكفاءات في مختلف المجالات',
}

export default async function TrainingPage() {
  const supabase = await createClient()

  const { data: trainings } = await supabase
    .from('trainings')
    .select('*')
    .order('created_at', { ascending: false })

  const features = [
    {
      icon: GraduationCap,
      title: 'مدربون خبراء',
      description: 'نخبة من المدربين المعتمدين ذوي الخبرة العملية',
    },
    {
      icon: Award,
      title: 'شهادات معتمدة',
      description: 'شهادات معترف بها محلياً ودولياً',
    },
    {
      icon: Users,
      title: 'تدريب تفاعلي',
      description: 'ورش عمل عملية وتطبيقات حقيقية',
    },
    {
      icon: Clock,
      title: 'مرونة في الوقت',
      description: 'جداول مرنة تناسب احتياجاتك',
    },
  ]

  return (
    <div className="pt-36 pb-12">
      <Container>
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">مركز التدريب والتطوير</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            طوّر مهاراتك مع JAZ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نقدم برامج تدريبية متخصصة في مختلف المجالات لتطوير الكفاءات وبناء القدرات المهنية
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Training Programs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            البرامج التدريبية المتاحة
          </h2>

          {trainings && trainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {training.title_ar || training.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {training.description_ar || training.description || 'برنامج تدريبي متخصص'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {training.instructor && (
                          <span>المدرب: {training.instructor}</span>
                        )}
                      </div>
                      {training.price ? (
                        <span className="font-bold text-blue-600">
                          {training.price.toLocaleString()} د.ع
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">مجاني</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  قريباً... برامج تدريبية جديدة
                </h3>
                <p className="text-gray-500 mb-6">
                  نعمل على إعداد برامج تدريبية متميزة. تابعنا للحصول على آخر التحديثات.
                </p>
                <Link href="/contact">
                  <Button>
                    تواصل معنا للاستفسار
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            هل تحتاج برنامج تدريبي مخصص؟
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            نقدم برامج تدريبية مخصصة للشركات والمؤسسات حسب احتياجاتكم
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              تواصل معنا
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
