'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Building2, Plus, Edit, Trash2, Heart, Cpu, GraduationCap, X, Loader2, Upload, ImageIcon, FileText, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import { createSector, updateSector, deleteSector, getSectors, uploadImage, getSectorRegistrations } from './actions'
import type { Sector } from '@/lib/database.types'
import { RegistrationFormBuilder } from '@/components/shared/registration-form-builder'
import type { FormField } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const iconMap: Record<string, any> = {
    Building2,
    Heart,
    Cpu,
    GraduationCap,
}

const ICONS = [
    { value: 'Building2', label: 'بناء', icon: Building2 },
    { value: 'Heart', label: 'صحة', icon: Heart },
    { value: 'Cpu', label: 'تقنية', icon: Cpu },
    { value: 'GraduationCap', label: 'تعليم', icon: GraduationCap },
]

export default function SectorsPage() {
    const [sectors, setSectors] = useState<Sector[]>([])
    const [registrations, setRegistrations] = useState<any[]>([])
    const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'sectors' | 'registrations'>('sectors')
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Omit<Partial<Sector>, 'registration_config'> & { registration_config?: FormField[] }>({
        name: '', name_ar: '', description: '', description_ar: '',
        long_description: '', long_description_ar: '', cover_image: '',
        slug: '', icon: 'Building2', color: '#3B82F6', sort_order: 0,
        is_active: true, is_featured: false, registration_config: []
    })
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fetchSectors = async () => {
        setLoading(true)
        try {
            const data = await getSectors()
            setSectors(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRegistrations = async () => {
        setLoading(true)
        try {
            const data = await getSectorRegistrations()
            setRegistrations(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'sectors') {
            fetchSectors()
        } else {
            fetchRegistrations()
        }
    }, [activeTab])

    const handleEdit = (sector: Sector) => {
        setFormData({
            ...sector,
            registration_config: (sector.registration_config as unknown as FormField[]) || []
        })
        setEditingId(sector.id)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setFormData({
            name: '', name_ar: '', description: '', description_ar: '',
            long_description: '', long_description_ar: '', cover_image: '',
            slug: '', icon: 'Building2', color: '#3B82F6', sort_order: 0,
            is_active: true, is_featured: false, registration_config: []
        })
        setEditingId(null)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return
        try {
            const result = await deleteSector(id)
            if (result.success) {
                fetchSectors()
            }
        } catch (e) {
            console.error(e)
            alert('حدث خطأ أثناء الحذف')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        // Basic validation
        if (!formData.name || !formData.name_ar || !formData.slug) {
            alert('الرجاء تعبئة الحقول المطلوبة (الاسم، الاسم بالعربية، الرابط)')
            setSubmitting(false)
            return
        }

        try {
            // Remove fields that shouldn't be sent to the database or are handled separately
            const { id, created_at, updated_at, ...dataToSave } = formData as any;

            if (editingId) {
                await updateSector(editingId, dataToSave)
            } else {
                await createSector(dataToSave)
            }
            setIsFormOpen(false)
            fetchSectors()
        } catch (e) {
            alert('حدث خطأ أثناء الحفظ')
            console.error(e)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة القطاعات</h1>
                {activeTab === 'sectors' && (
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة قطاع
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('sectors')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'sectors'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    القطاعات
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'registrations'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    طلبات الشراكة
                </button>
            </div>

            {/* Content */}
            {activeTab === 'sectors' ? (
                /* Sectors List */
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الأيقونة</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الاسم</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الوصف</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-8 text-center">جار التحميل...</td></tr>
                                    ) : sectors.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد بيانات</td></tr>
                                    ) : (
                                        sectors.map((sector) => {
                                            const Icon = iconMap[sector.icon || 'Building2'] || Building2
                                            return (
                                                <tr key={sector.id} className="hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${sector.color}20`, color: sector.color || '#666' }}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium">{sector.name_ar}</div>
                                                        <div className="text-xs text-gray-400">{sector.name}</div>
                                                    </td>
                                                    <td className="py-3 px-4 max-w-xs truncate text-gray-500">
                                                        {sector.description_ar}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${sector.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {sector.is_active ? 'نشط' : 'غير نشط'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEdit(sector)} className="p-2 text-gray-500 hover:text-blue-600">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(sector.id)} className="p-2 text-gray-500 hover:text-red-600">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Registrations List */
                <Card>
                    <CardHeader className="border-b bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            جميع الطلبات الواردة
                        </h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center">جار التحميل...</div>
                        ) : registrations && registrations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/30">
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">القطاع</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">مقدم الطلب</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">البيانات المقدمة</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الحالة</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">التاريخ</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {registrations.map((reg: any) => (
                                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">
                                                        {(reg.sectors as any)?.name_ar || (reg.sectors as any)?.name || 'قطاع محذوف'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {reg.full_name || (reg.users as any)?.full_name || 'زائر'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {reg.email || (reg.users as any)?.email || '-'}
                                                        </span>
                                                        {reg.phone && (
                                                            <span className="text-xs text-gray-400 mt-0.5" dir="ltr">
                                                                {reg.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {(() => {
                                                        const data = reg.data || {};
                                                        if (Object.keys(data).length === 0) return <span className="text-gray-400 text-sm">-</span>;

                                                        // Get config to map labels
                                                        const config = (reg.sectors as any)?.registration_config || [];
                                                        
                                                        return (
                                                            <div className="space-y-2 max-w-sm">
                                                                {Object.entries(data).slice(0, 3).map(([key, value]) => {
                                                                    const fieldConfig = Array.isArray(config) ? config.find((f: any) => f.id === key) : null;
                                                                    const label = fieldConfig?.label_ar || fieldConfig?.label_en || key;
                                                                    
                                                                    return (
                                                                        <div key={key} className="text-sm border-r-2 border-gray-200 pr-2 mr-1">
                                                                            <span className="text-gray-500 ml-1 text-xs block">{label}:</span>
                                                                            <span className="text-gray-900 font-medium break-words block truncate max-w-[200px]">{String(value)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                {Object.keys(data).length > 3 && (
                                                                    <span className="text-xs text-blue-600 font-medium cursor-pointer" onClick={() => setSelectedRegistration(reg)}>
                                                                        ... والمزيد
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                        reg.status === 'confirmed' || reg.status === 'approved' 
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : reg.status === 'rejected'
                                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                        {reg.status === 'confirmed' || reg.status === 'approved' ? (
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                        ) : reg.status === 'rejected' ? (
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Clock className="w-3.5 h-3.5" />
                                                        )}
                                                        {reg.status === 'confirmed' || reg.status === 'approved' ? 'تم القبول' :
                                                         reg.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                                                    {reg.created_at ? formatDate(reg.created_at) : '-'}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setSelectedRegistration(reg)}
                                                        className="text-gray-500 hover:text-blue-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-900 font-medium mb-1">لا توجد طلبات شراكة حتى الآن</p>
                                <p className="text-gray-500 text-sm">ستظهر الطلبات هنا بمجرد تقديمها من قبل الشركاء المحتملين</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modal/Overlay Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                            <h2 className="text-lg font-bold">{editingId ? 'تعديل قطاع' : 'إضافة قطاع'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>الاسم (بالعربية)</Label>
                                        <Input
                                            value={formData.name_ar}
                                            onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                                            required dir="rtl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الاسم (باللغة الإنجليزية)</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    name: val,
                                                    slug: val.toLowerCase().replace(/\s+/g, '-')
                                                })
                                            }}
                                            required dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الرابط (Slug)</Label>
                                        <Input
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            required dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الترتيب</Label>
                                        <Input
                                            type="number"
                                            value={formData.sort_order || 0}
                                            onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* الوصف القصير */}
                                    <div className="col-span-full space-y-2">
                                        <Label>وصف مختصر (بالعربية)</Label>
                                        <Textarea
                                            value={formData.description_ar || ''}
                                            onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                                            dir="rtl"
                                            className="h-20"
                                        />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <Label>وصف مختصر (باللغة الإنجليزية)</Label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            dir="ltr"
                                            className="h-20"
                                        />
                                    </div>

                                    {/* الوصف الطويل - جديد */}
                                    <div className="col-span-full space-y-2 bg-gray-50 p-4 rounded-lg border">
                                        <h3 className="font-semibold text-gray-700 mb-2">تفاصيل كاملة حول القطاع</h3>
                                        <div className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                                            <p className="font-semibold mb-1 text-blue-800">يمكنك استخدام تنسيق Markdown لكتابة المحتوى:</p>
                                            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                                                <li>استخدم <code># عنوان</code> للعناوين الرئيسية</li>
                                                <li>استخدم <code>## عنوان فرعي</code> للعناوين الفرعية</li>
                                                <li>استخدم <code>**نص عريض**</code> لجعل النص غامقاً</li>
                                                <li>استخدم <code>- عنصر</code> للقوائم النقطية</li>
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>وصف تفصيلي (بالعربية)</Label>
                                                <Textarea
                                                    value={formData.long_description_ar || ''}
                                                    onChange={e => setFormData({ ...formData, long_description_ar: e.target.value })}
                                                    dir="rtl"
                                                    className="h-64 font-mono text-sm"
                                                    placeholder="# نبذة عن القطاع&#10;&#10;اكتب هنا التفاصيل الكاملة...&#10;&#10;## أهدافنا&#10;- الهدف الأول&#10;- الهدف الثاني"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>وصف تفصيلي (باللغة الإنجليزية)</Label>
                                                <Textarea
                                                    value={formData.long_description || ''}
                                                    onChange={e => setFormData({ ...formData, long_description: e.target.value })}
                                                    dir="ltr"
                                                    className="h-64 font-mono text-sm"
                                                    placeholder="# Sector Overview&#10;&#10;Write detailed description here...&#10;&#10;## Our Goals&#10;- Goal 1&#10;- Goal 2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* صور - جديد */}
                                    <div className="col-span-full space-y-2">
                                        <Label>صورة الغلاف (Cover Image)</Label>
                                        <div className="flex items-center gap-4">
                                            {formData.cover_image && (
                                                <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                                                    <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {uploading ? (
                                                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                                <p className="text-xs text-gray-500">انقر لرفع صورة</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        disabled={uploading}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0]
                                                            if (!file) return
                                                            
                            setUploading(true)
                                                            try {
                                                                const formDataUpload = new FormData()
                                                                formDataUpload.append('file', file)
                                                                // Use the action directly
                                                                const url = await uploadImage(formDataUpload)
                                                                if (url) {
                                                                    setFormData(prev => ({ ...prev, cover_image: url }))
                                                                }
                                                            } catch (error) {
                                                                alert('فشل رفع الصورة')
                                                                console.error(error)
                                                            } finally {
                                                                setUploading(false)
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <Label className="text-xs text-gray-500">أو أدخل رابط الصورة مباشرة</Label>
                                            <Input
                                                value={formData.cover_image || ''}
                                                onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
                                                dir="ltr"
                                                placeholder="https://example.com/image.jpg"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full space-y-2">
                                        <Label>الأيقونة</Label>
                                        <div className="flex gap-4">
                                            {ICONS.map(icon => (
                                                <div
                                                    key={icon.value}
                                                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                                                    className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center gap-2 ${formData.icon === icon.value ? 'border-blue-500 bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <icon.icon className="w-5 h-5" />
                                                    <span className="text-xs">{icon.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>اللون</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={formData.color || '#3B82F6'}
                                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                className="w-12 h-10 p-1"
                                            />
                                            <Input
                                                value={formData.color || ''}
                                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* الخيارات الإضافية - جديد */}
                                    <div className="col-span-full flex gap-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={formData.is_active || false}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <Label htmlFor="is_active">نشط (Active)</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                checked={formData.is_featured || false}
                                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <Label htmlFor="is_featured" className="text-orange-600 font-bold">مميز (Featured)</Label>
                                        </div>
                                    </div>

                                    {/* منشئ نموذج التسجيل */}
                                    <div className="col-span-full space-y-4 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900">نموذج التسجيل المخصص</h3>
                                        <p className="text-sm text-gray-500">قم بتخصيص الحقول التي سيتم طلبها عند التسجيل في هذا القطاع.</p>
                                        <RegistrationFormBuilder
                                            fields={(formData.registration_config as FormField[]) || []}
                                            onChange={(fields) => setFormData({ ...formData, registration_config: fields })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        إلغاء
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        حفظ
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Registration Details Modal */}
            <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تفاصيل طلب الشراكة</DialogTitle>
                        <DialogDescription>
                            مقدم الطلب: {selectedRegistration?.full_name || (selectedRegistration?.users as any)?.full_name || 'زائر'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistration && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <Label className="text-xs text-gray-500">البريد الإلكتروني</Label>
                                    <p className="text-sm font-medium">{selectedRegistration.email || (selectedRegistration.users as any)?.email || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">رقم الهاتف</Label>
                                    <p className="text-sm font-medium" dir="ltr">{selectedRegistration.phone || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">القطاع</Label>
                                    <p className="text-sm font-medium">{(selectedRegistration.sectors as any)?.name_ar}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">تاريخ الطلب</Label>
                                    <p className="text-sm font-medium">{formatDate(selectedRegistration.created_at)}</p>
                                </div>
                            </div>

                            {/* Form Data */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">بيانات الاستمارة</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const data = selectedRegistration.data || {};
                                        const config = (selectedRegistration.sectors as any)?.registration_config || [];
                                        
                                        if (Object.keys(data).length === 0) {
                                            return <p className="text-gray-500 text-center py-4">لا توجد بيانات إضافية</p>;
                                        }

                                        return Object.entries(data).map(([key, value]) => {
                                            const fieldConfig = Array.isArray(config) ? config.find((f: any) => f.id === key) : null;
                                            const label = fieldConfig?.label_ar || fieldConfig?.label_en || key;
                                            
                                            return (
                                                <div key={key} className="bg-white border p-3 rounded-lg">
                                                    <Label className="text-xs text-gray-500 mb-1 block">{label}</Label>
                                                    <div className="text-sm text-gray-900 whitespace-pre-wrap font-medium">
                                                        {String(value)}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={() => setSelectedRegistration(null)}>
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
