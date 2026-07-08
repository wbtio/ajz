'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import {
    Save,
    Loader2,
    X,
    Globe,
    Facebook,
    Instagram,
    Video,
    Twitter,
    Linkedin,
    Youtube,
    Ghost,
    MessageSquare,
    ClipboardList,
    DollarSign,
    Bell,
    Clock
} from 'lucide-react'

interface StepPublishingProps {
    event: any
    onUpdate: (updatedEvent: any) => void
    isReadOnly: boolean
}

type CampaignChannel = {
    platform: string
    label: string
    publish_date: string
    promo_budget: number
    start_date: string
    end_date: string
    days_count: number
    reminder_enabled: boolean
    status: string // 'pending' | 'active' | 'completed' | 'paused'
}

export function StepPublishing({ event, onUpdate, isReadOnly }: StepPublishingProps) {
    const config = event.conference_config || {}
    const workflow = config.workflow || {}
    const step3 = workflow.step3 || {}

    // States for Campaign Plan & Exhibition Price
    const [exhibitionPrice, setExhibitionPrice] = useState<number>(step3.exhibition_price || event.price || 0)
    const [campaignPlan, setCampaignPlan] = useState<CampaignChannel[]>(
        step3.campaign_plan || [
            { platform: 'website', label: 'الموقع الإلكتروني', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'facebook', label: 'فيسبوك', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'instagram', label: 'انستغرام', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'tiktok', label: 'تيك توك', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'x', label: 'إكس / تويتر', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'snapchat', label: 'سناب شات', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'linkedin', label: 'لينكد إن', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'youtube', label: 'يوتيوب', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' },
            { platform: 'whatsapp', label: 'واتساب', publish_date: '', promo_budget: 0, start_date: '', end_date: '', days_count: 0, reminder_enabled: false, status: 'pending' }
        ]
    )
    const [workPlanCompleted, setWorkPlanCompleted] = useState(step3.work_plan_completed || false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'website': return <Globe className="w-4 h-4 text-indigo-600" />
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-650" />
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-650" />
            case 'tiktok': return <Video className="w-4 h-4 text-slate-800" />
            case 'x': return <Twitter className="w-4 h-4 text-slate-900" />
            case 'snapchat': return <Ghost className="w-4 h-4 text-amber-500 fill-amber-500" />
            case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-800" />
            case 'youtube': return <Youtube className="w-4 h-4 text-rose-600" />
            case 'whatsapp': return <MessageSquare className="w-4 h-4 text-emerald-600" />
            default: return null
        }
    }

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0
        const s = new Date(start)
        const e = new Date(end)
        const diffTime = e.getTime() - s.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    const handleCampaignChange = (index: number, field: keyof CampaignChannel, value: any) => {
        if (isReadOnly) return
        setCampaignPlan(prev => prev.map((channel, idx) => {
            if (idx === index) {
                const updated = { ...channel, [field]: value }
                if (field === 'start_date' || field === 'end_date') {
                    updated.days_count = calculateDays(
                        field === 'start_date' ? value : channel.start_date,
                        field === 'end_date' ? value : channel.end_date
                    )
                }
                return updated
            }
            return channel
        }))
    }

    const handleSaveCampaign = async (complete = false) => {
        if (isReadOnly) return
        setIsSaving(true)
        setMessage(null)

        const targetWpCompleted = complete
        setWorkPlanCompleted(complete)

        try {
            const updatedConfig = {
                ...config,
                workflow: {
                    ...workflow,
                    step3: {
                        status: targetWpCompleted ? 'completed' : 'in_progress',
                        exhibition_price: exhibitionPrice,
                        campaign_plan: campaignPlan,
                        work_plan_completed: targetWpCompleted
                    }
                }
            }

            const supabase = createClient()
            const { data, error } = await supabase
                .from('events')
                .update({
                    conference_config: updatedConfig as any,
                    price: exhibitionPrice || event.price || 0
                })
                .eq('id', event.id)
                .select()
                .single()

            if (error) throw error

            setMessage({ type: 'success', text: 'تم حفظ وتحديث خطة النشر وحملة الترويج بنجاح!' })
            onUpdate(data)
        } catch (err: any) {
            console.error('Error saving step 3 publishing:', err)
            setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ خطة النشر والترويج' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <Card className="border-slate-100 shadow-md bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-850 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                                الخطوة 4: خطة النشر والترويج
                            </CardTitle>
                            <CardDescription className="mt-1 text-slate-500">
                                تحديد تواريخ إطلاق وتكلفة ترويج كل منصة إعلانية وموعد الانتهاء
                            </CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            workPlanCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                            {workPlanCompleted ? 'خطة معتمدة' : 'قيد الإعداد'}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-1.5">
                            <ClipboardList className="w-5 h-5 text-indigo-650" />
                            <div>
                                <h3 className="font-black text-slate-800 text-sm">خطة النشر وتفاصيل الترويج للفعالية</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">تحديد تواريخ إطلاق وتكلفة ترويج كل منصة إعلانية وموعد الانتهاء.</p>
                            </div>
                        </div>
                        
                        {/* Exhibition Price & Total Promo Budget */}
                        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                            {/* Exhibition Price */}
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <Label htmlFor="exhibPrice" className="text-xs font-bold text-slate-700">سعر المعرض الإجمالي:</Label>
                                <Input
                                    id="exhibPrice"
                                    type="number"
                                    value={exhibitionPrice || ''}
                                    onChange={(e) => setExhibitionPrice(Number(e.target.value))}
                                    disabled={isReadOnly}
                                    placeholder="أدخل سعر المعرض"
                                    className="w-28 text-xs h-7 text-center font-bold text-slate-800 border-slate-200 bg-white"
                                />
                                <span className="text-[10px] text-slate-500 font-bold">دولار</span>
                            </div>

                            {/* Total Promotion Budget */}
                            <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/50 text-xs">
                                <span className="font-bold text-indigo-950">إجمالي ميزانية الترويج:</span>
                                <span className="font-black text-indigo-650 bg-white px-2 py-0.5 rounded-lg border border-indigo-100">
                                    {campaignPlan.reduce((sum, c) => sum + (c.promo_budget || 0), 0)} $
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-x-auto">
                        <table className="w-full text-right text-xs border border-slate-150 rounded-xl overflow-hidden min-w-[700px]">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                                <tr>
                                    <th className="p-3">المنصة</th>
                                    <th className="p-3">تاريخ النشر</th>
                                    <th className="p-3">ميزانية الترويج ($)</th>
                                    <th className="p-3">تاريخ بدء الترويج</th>
                                    <th className="p-3">تاريخ انتهاء الترويج</th>
                                    <th className="p-3 text-center">المدة (أيام)</th>
                                    <th className="p-3 text-center">تفعيل التنبيه</th>
                                    <th className="p-3">حالة الترويج</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {campaignPlan.map((channel, index) => (
                                    <tr key={channel.platform} className="hover:bg-slate-50/40">
                                        <td className="p-3 flex items-center gap-1.5 font-bold text-slate-800">
                                            {getPlatformIcon(channel.platform)}
                                            <span>{channel.label}</span>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="date"
                                                value={channel.publish_date}
                                                onChange={(e) => handleCampaignChange(index, 'publish_date', e.target.value)}
                                                disabled={isReadOnly}
                                                className="h-8 text-xs font-mono w-32 border-slate-200"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                value={channel.promo_budget || ''}
                                                onChange={(e) => handleCampaignChange(index, 'promo_budget', Number(e.target.value))}
                                                disabled={isReadOnly}
                                                className="h-8 text-xs font-semibold w-20 border-slate-200"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="date"
                                                value={channel.start_date}
                                                onChange={(e) => handleCampaignChange(index, 'start_date', e.target.value)}
                                                disabled={isReadOnly}
                                                className="h-8 text-xs font-mono w-32 border-slate-200"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="date"
                                                value={channel.end_date}
                                                onChange={(e) => handleCampaignChange(index, 'end_date', e.target.value)}
                                                disabled={isReadOnly}
                                                className="h-8 text-xs font-mono w-32 border-slate-200"
                                            />
                                        </td>
                                        <td className="p-3 text-center font-bold text-slate-700">
                                            {channel.days_count > 0 ? (
                                                <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded-md font-bold">
                                                    {channel.days_count} يوم
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={channel.reminder_enabled}
                                                    onCheckedChange={(checked) => handleCampaignChange(index, 'reminder_enabled', checked)}
                                                    disabled={isReadOnly}
                                                    size="sm"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <select
                                                value={channel.status}
                                                onChange={(e) => handleCampaignChange(index, 'status', e.target.value)}
                                                disabled={isReadOnly}
                                                className="text-[11px] h-8 rounded border border-slate-250 bg-white px-2 focus:ring-1 focus:ring-indigo-500 w-28"
                                            >
                                                <option value="pending">بانتظار النشر</option>
                                                <option value="active">ترويج نشط</option>
                                                <option value="completed">مكتمل النشر</option>
                                                <option value="paused">متوقف مؤقتاً</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Active Notifications alerts preview */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-amber-500" />
                            الإشعارات المجدولة النشطة:
                        </h4>
                        <div className="space-y-1.5">
                            {campaignPlan.filter(c => c.reminder_enabled).map(c => (
                                <div key={c.platform} className="text-[10px] text-slate-655 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>تنبيه مفعل: سيتم إشعارك بانتهاء فترة ترويج <b>{c.label}</b> بعد <b>{c.days_count || 0} أيام</b> (في {c.end_date || 'تاريخ غير حدد'}).</span>
                                </div>
                            ))}
                            {campaignPlan.filter(c => c.reminder_enabled).length === 0 && (
                                <p className="text-[10px] text-slate-400">لا يوجد أي تنبيهات مجدولة حالياً. قم بتفعيل الخيار لأي منصة أعلاه.</p>
                            )}
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                onClick={() => handleSaveCampaign(true)}
                                disabled={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
                            >
                                {workPlanCompleted ? 'تحديث وتأكيد خطة الترويج (تم ✓)' : 'اعتماد وحفظ خطة الترويج ✓'}
                            </Button>
                            {workPlanCompleted && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSaveCampaign(false)}
                                    className="h-9 px-2 text-red-500 hover:text-red-700 border-red-200"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
