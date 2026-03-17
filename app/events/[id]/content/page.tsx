import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isHiddenEvent } from '@/lib/events-visibility'

interface EventContentPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EventContentPage({ params }: EventContentPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: event, error } = await supabase
        .from('events')
        .select('html_content, html_content_url, title, title_ar')
        .eq('id', id)
        .single()

    if (error || !event) {
        notFound()
    }

    if (isHiddenEvent(event)) {
        notFound()
    }

    const htmlContent = event.html_content

    if (!htmlContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">📄</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">لا يوجد محتوى HTML</h1>
                    <p className="text-gray-600 mb-6">
                        هذه الفعالية لا تحتوي على محتوى HTML. يرجى رفع ملف HTML من لوحة التحكم.
                    </p>
                    <a 
                        href={`/events/${id}`}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        العودة إلى الفعالية
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="w-full min-h-screen"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    )
}
