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
import { RegistrationFormBuilder } from '@/components/shared/registration-form-builder'
import type { FormField } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import type { Sector } from '@/lib/database.types'
import { getSectorRegistrationFallback } from '@/app/departments/department-content'
import { useDashboardPermission } from '@/components/auth/use-dashboard-permission'

const iconMap: Record<string, any> = {
    Building2,
    Heart,
    Cpu,
    GraduationCap,
}

const ICONS = [
    { value: 'Building2', label: 'Construction', icon: Building2 },
    { value: 'Heart', label: 'Health', icon: Heart },
    { value: 'Cpu', label: 'Technology', icon: Cpu },
    { value: 'GraduationCap', label: 'Education', icon: GraduationCap },
]

interface SectorRegistration {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    status: string
    data: Record<string, unknown> | null
    created_at: string
    sectors: { name?: string; name_ar?: string; registration_config?: FormField[] } | null
    users: { full_name?: string; email?: string } | null
}

export default function SectorsPage() {
    // Check permissions for this page
    useDashboardPermission('/dashboard/sectors')

    const [sectors, setSectors] = useState<Sector[]>([])
    const [registrations, setRegistrations] = useState<SectorRegistration[]>([])
    const [selectedRegistration, setSelectedRegistration] = useState<SectorRegistration | null>(null)
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
        if (!confirm('Are you sure you want to delete this?')) return
        try {
            const result = await deleteSector(id)
            if (result.success) {
                fetchSectors()
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred while deleting')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        // Basic validation
        if (!formData.name || !formData.name_ar || !formData.slug) {
            alert('Please fill in the required fields (Name, Arabic Name, Slug)')
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
            alert('An error occurred while saving')
            console.error(e)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sectors Management</h1>
                {activeTab === 'sectors' && (
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 ml-2" />
                        Add Sector
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
                    Sectors
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'registrations'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                >
                    Partnership Requests
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
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Icon</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Description</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                                    ) : sectors.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No data available</td></tr>
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
                                                        <div className="font-medium">{sector.name}</div>
                                                        <div className="text-xs text-gray-400">{sector.name_ar}</div>
                                                    </td>
                                                    <td className="py-3 px-4 max-w-xs truncate text-gray-500">
                                                        {sector.description}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${sector.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {sector.is_active ? 'Active' : 'Inactive'}
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
                            All Incoming Requests
                        </h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center">Loading...</div>
                        ) : registrations && registrations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/30">
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Sector</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Applicant</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Submitted Data</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {registrations.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">
                                                        {reg.sectors?.name_ar || reg.sectors?.name || 'Deleted Sector'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {reg.full_name || reg.users?.full_name || 'Guest'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {reg.email || reg.users?.email || '-'}
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
                                                        const config = getSectorRegistrationFallback();
                                                        
                                                        return (
                                                            <div className="space-y-2 max-w-sm">
                                                                {Object.entries(data).slice(0, 3).map(([key, value]) => {
                                                                    const fieldConfig = Array.isArray(config) ? config.find((f: FormField) => f.id === key) : null;
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
                                                                        ... and more
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
                                                        {reg.status === 'confirmed' || reg.status === 'approved' ? 'Approved' :
                                                         reg.status === 'rejected' ? 'Rejected' : 'Under Review'}
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
                                <p className="text-gray-900 font-medium mb-1">No partnership requests yet</p>
                                <p className="text-gray-500 text-sm">Requests will appear here once submitted by potential partners</p>
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
                            <h2 className="text-lg font-bold">{editingId ? 'Edit Sector' : 'Add Sector'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name (Arabic)</Label>
                                        <Input
                                            value={formData.name_ar}
                                            onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                                            required dir="rtl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name (English)</Label>
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
                                        <Label>URL (Slug)</Label>
                                        <Input
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            required dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sort Order</Label>
                                        <Input
                                            type="number"
                                            value={formData.sort_order || 0}
                                            onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    {/* Short Description */}
                                    <div className="col-span-full space-y-2">
                                        <Label>Short Description (Arabic)</Label>
                                        <Textarea
                                            value={formData.description_ar || ''}
                                            onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                                            dir="rtl"
                                            className="h-20"
                                        />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <Label>Short Description (English)</Label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            dir="ltr"
                                            className="h-20"
                                        />
                                    </div>

                                    {/* Long Description - New */}
                                    <div className="col-span-full space-y-2 bg-gray-50 p-4 rounded-lg border">
                                        <h3 className="font-semibold text-gray-700 mb-2">Full Details About the Sector</h3>
                                        <div className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                                            <p className="font-semibold mb-1 text-blue-800">You can use Markdown formatting to write the content:</p>
                                            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                                                <li>Use <code># Heading</code> for main headings</li>
                                                <li>Use <code>## Subheading</code> for subheadings</li>
                                                <li>Use <code>**bold text**</code> to make text bold</li>
                                                <li>Use <code>- item</code> for bullet lists</li>
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Detailed Description (Arabic)</Label>
                                                <Textarea
                                                    value={formData.long_description_ar || ''}
                                                    onChange={e => setFormData({ ...formData, long_description_ar: e.target.value })}
                                                    dir="rtl"
                                                    className="h-64 font-mono text-sm"
                                                    placeholder="# Sector Overview&#10;&#10;Write the full details here...&#10;&#10;## Our Goals&#10;- First goal&#10;- Second goal"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Detailed Description (English)</Label>
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

                                    {/* Images - New */}
                                    <div className="col-span-full space-y-2">
                                        <Label>Cover Image</Label>
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
                                                                <p className="text-xs text-gray-500">Click to upload an image</p>
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
                                                                alert('Image upload failed')
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
                                            <Label className="text-xs text-gray-500">Or enter the image URL directly</Label>
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
                                        <Label>Icon</Label>
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
                                        <Label>Color</Label>
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

                                    {/* Additional Options - New */}
                                    <div className="col-span-full flex gap-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={formData.is_active || false}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                checked={formData.is_featured || false}
                                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <Label htmlFor="is_featured" className="text-orange-600 font-bold">Featured</Label>
                                        </div>
                                    </div>

                                    {/* Registration Form Builder */}
                                    <div className="col-span-full space-y-4 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900">Custom Registration Form</h3>
                                        <p className="text-sm text-gray-500">Customize the fields that will be requested when registering for this sector.</p>
                                        <RegistrationFormBuilder
                                            fields={(formData.registration_config as FormField[]) || []}
                                            onChange={(fields) => setFormData({ ...formData, registration_config: fields })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Save
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
                        <DialogTitle>Partnership Request Details</DialogTitle>
                        <DialogDescription>
                            Applicant: {selectedRegistration?.full_name || selectedRegistration?.users?.full_name || 'Guest'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistration && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <Label className="text-xs text-gray-500">Email</Label>
                                    <p className="text-sm font-medium">{selectedRegistration.email || selectedRegistration.users?.email || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Phone Number</Label>
                                    <p className="text-sm font-medium" dir="ltr">{selectedRegistration.phone || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Sector</Label>
                                    <p className="text-sm font-medium">{selectedRegistration.sectors?.name_ar}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Request Date</Label>
                                    <p className="text-sm font-medium">{formatDate(selectedRegistration.created_at)}</p>
                                </div>
                            </div>

                            {/* Form Data */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">Form Data</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const data = selectedRegistration.data || {};
                                        const config = getSectorRegistrationFallback();

                                        if (Object.keys(data).length === 0) {
                                            return <p className="text-gray-500 text-center py-4">No additional data</p>;
                                        }

                                        return Object.entries(data).map(([key, value]) => {
                                            const fieldConfig = Array.isArray(config) ? config.find((f: FormField) => f.id === key) : null;
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
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
