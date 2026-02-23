import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, MapPin, Users, CheckCircle2, XCircle, Clock, Presentation } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConferenceSubmissionsTable } from './components/conference-submissions-table'

interface EventDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Event Details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (eventError || !event) {
        notFound()
    }

    // Fetch Conference Submissions
    const { data: confSubmissions } = await supabase
        .from('conference_submissions')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })

    const totalSubmissions = confSubmissions?.length || 0
    const approvedSubmissions = confSubmissions?.filter(s => s.status === 'approved').length || 0
    const pendingSubmissions = confSubmissions?.filter(s => s.status === 'pending').length || 0
    const rejectedSubmissions = confSubmissions?.filter(s => s.status === 'rejected').length || 0

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/events">
                    <Button variant="outline" size="sm">
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{event.title_ar || event.title}</h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {[event.location_ar || event.location, event.country_ar || event.country].filter(Boolean).join('، ')}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            event.status === 'published' ? 'bg-green-100 text-green-700' :
                            event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {event.status === 'published' ? 'منشور' :
                             event.status === 'cancelled' ? 'ملغي' :
                             event.status === 'completed' ? 'مكتمل' : 'مسودة'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                        <p className="text-xs text-muted-foreground">طلب وارد للفعالية</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المقبولة</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedSubmissions}</div>
                        <p className="text-xs text-muted-foreground">طلبات مقبولة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions}</div>
                        <p className="text-xs text-muted-foreground">بانتظار المراجعة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المرفوضة</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedSubmissions}</div>
                        <p className="text-xs text-muted-foreground">طلبات مرفوضة</p>
                    </CardContent>
                </Card>
            </div>

            {/* Conference Submissions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Presentation className="w-5 h-5 text-blue-600" />
                        <div>
                            <CardTitle>طلبات التسجيل</CardTitle>
                            <CardDescription>
                                {totalSubmissions} طلب وارد
                                {pendingSubmissions > 0 && (
                                    <Badge variant="secondary" className="mr-2 text-[10px]">
                                        {pendingSubmissions} قيد الانتظار
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ConferenceSubmissionsTable
                        submissions={(confSubmissions || []) as any[]}
                        eventId={id}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
