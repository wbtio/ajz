import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Heart, Cpu, GraduationCap, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'القطاعات الاستراتيجية | JAZ',
  description: 'تعرف على القطاعات الاستراتيجية التي نغطيها في JAZ',
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2,
  Heart,
  Cpu,
  GraduationCap,
}

export default async function SectorsPage() {
  const supabase = await createClient()

  const { data: sectors } = await supabase
    .from('sectors')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="pt-36 pb-12">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            القطاعات الاستراتيجية
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نغطي مجموعة واسعة من القطاعات الحيوية التي تساهم في تطوير الاقتصاد العراقي وتوفير فرص النمو والتواصل
          </p>
        </div>

        {/* Sectors Grid */}
        {sectors && sectors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sectors.map((sector) => {
              const IconComponent = iconMap[sector.icon || 'Building2'] || Building2
              return (
                <Link key={sector.id} href={`/sectors/${sector.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${sector.color}15` }}
                        >
                          <IconComponent
                            className="w-8 h-8"
                            style={{ color: sector.color || '#3B82F6' }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {sector.name_ar}
                          </h2>
                          <p className="text-gray-500 mb-4 line-clamp-3">
                            {sector.description_ar}
                          </p>
                          <span className="inline-flex items-center text-blue-600 font-medium">
                            اكتشف المزيد
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">لا توجد قطاعات متاحة حالياً</p>
          </div>
        )}
      </Container>
    </div>
  )
}
