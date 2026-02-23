import { Calendar, CheckCircle2, CircleCheckBig, Clock3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  total: number
  published: number
  completed: number
  upcoming: number
}

export function StatsCards({ total, published, completed, upcoming }: StatsCardsProps) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الفعاليات</CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الفعاليات المنشورة</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{published}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الفعاليات المكتملة</CardTitle>
          <CircleCheckBig className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{completed}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الفعاليات القادمة</CardTitle>
          <Clock3 className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{upcoming}</p>
        </CardContent>
      </Card>
    </div>
  )
}
