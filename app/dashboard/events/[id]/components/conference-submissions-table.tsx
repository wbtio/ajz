'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

interface ConferenceSubmission {
    id: string
    section_slug: string
    data: Record<string, any> | null
    status: string | null
    created_at: string | null
}

const sectionLabels: Record<string, string> = {
    sponsors: 'الرعاة',
    exhibitors: 'العارضون',
    partners: 'الشركاء',
    registration: 'التسجيل',
    home: 'الصفحة الرئيسية',
    theme: 'موضوع المؤتمر',
}

interface Props {
    submissions: ConferenceSubmission[]
    eventId: string
}

export function ConferenceSubmissionsTable({ submissions: initialSubmissions, eventId }: Props) {
    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [selected, setSelected] = useState<ConferenceSubmission | null>(null)
    const [filter, setFilter] = useState<string>('all')

    const filtered = filter === 'all' ? submissions : submissions.filter(s => s.section_slug === filter)
    const uniqueSections = [...new Set(submissions.map(s => s.section_slug))]

    const updateStatus = async (id: string, status: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('conference_submissions')
            .update({ status })
            .eq('id', id)

        if (!error) {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
            if (selected?.id === id) setSelected({ ...selected, status })
        }
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>لا توجد طلبات مؤتمر لهذه الفعالية بعد</p>
            </div>
        )
    }

    return (
        <div>
            {/* Filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    الكل ({submissions.length})
                </button>
                {uniqueSections.map(slug => (
                    <button
                        key={slug}
                        onClick={() => setFilter(slug)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === slug ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {sectionLabels[slug] || slug} ({submissions.filter(s => s.section_slug === slug).length})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">القسم</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">البيانات</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الحالة</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">التاريخ</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className="text-xs">
                                        {sectionLabels[sub.section_slug] || sub.section_slug}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="max-w-xs truncate text-sm text-gray-600">
                                        {sub.data ? Object.values(sub.data).slice(0, 3).join(' • ') : '—'}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {sub.status === 'approved' ? <><CheckCircle className="w-3 h-3" /> مقبول</> :
                                         sub.status === 'rejected' ? <><XCircle className="w-3 h-3" /> مرفوض</> :
                                         <><Clock className="w-3 h-3" /> قيد الانتظار</>}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                    {sub.created_at ? formatDate(sub.created_at) : '—'}
                                </td>
                                <td className="py-3 px-4">
                                    <Button variant="ghost" size="sm" onClick={() => setSelected(sub)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب - {selected ? (sectionLabels[selected.section_slug] || selected.section_slug) : ''}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">التاريخ</span>
                                    <span className="font-medium">{selected.created_at ? formatDate(selected.created_at) : '—'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">الحالة</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                        selected.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        selected.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {selected.status === 'approved' ? 'مقبول' : selected.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                                    </span>
                                </div>
                            </div>

                            <div className="border rounded-xl p-4 bg-gray-50">
                                <h3 className="font-semibold mb-3 text-sm text-gray-700">البيانات المقدمة</h3>
                                <div className="space-y-2">
                                    {selected.data && Object.entries(selected.data).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                            <span className="text-gray-600 text-sm">{key}</span>
                                            <span className="font-medium text-sm">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatus(selected.id, 'rejected')}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                >
                                    رفض
                                </Button>
                                <Button
                                    onClick={() => updateStatus(selected.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    قبول
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
