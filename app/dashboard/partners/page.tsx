'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
    Building2, Plus, Edit, Trash2, Heart, Cpu, GraduationCap, X, Loader2, 
    Upload, FileText, CheckCircle, Clock, XCircle, Eye, Briefcase, 
    Lightbulb, Users, Share2, Megaphone, Monitor, Palette, Kanban, Code, Mail
} from 'lucide-react'
import { 
    getPartnerCategories, createPartnerCategory, updatePartnerCategory, deletePartnerCategory,
    getPartnerOpportunities, createPartnerOpportunity, updatePartnerOpportunity, deletePartnerOpportunity,
    getPartnerSubmissions, updatePartnerSubmissionStatus
} from './actions'
import { RegistrationFormBuilder } from '@/components/shared/registration-form-builder'
import type { FormField } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { useDashboardPermission } from '@/components/auth/use-dashboard-permission'

// Icon picker mapping
const iconMap: Record<string, any> = {
    Building2,
    Heart,
    Cpu,
    GraduationCap,
    Briefcase,
    Lightbulb, Users, 
    Share2, Megaphone, Monitor, Palette, Kanban, Code, Mail
}

const ICONS = Object.keys(iconMap).map(key => ({ value: key, icon: iconMap[key] }))

export default function PartnersDashboard() {
    // Check permissions for this page
    useDashboardPermission('/dashboard/partners')

    const [activeTab, setActiveTab] = useState<'content' | 'submissions'>('content')
    const [categories, setCategories] = useState<any[]>([])
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form States
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)
    const [isOpportunityFormOpen, setIsOpportunityFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [editingOpportunity, setEditingOpportunity] = useState<any>(null)
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null)

    const [categoryForm, setCategoryForm] = useState({
        title_ar: '', title_en: '', description_ar: '', description_en: '',
        icon: 'Building2', color: 'bg-blue-50 text-blue-600', slug: '', sort_order: 0,
        registration_config: [] as FormField[]
    })

    const [opportunityForm, setOpportunityForm] = useState({
        category_id: '', title_ar: '', title_en: '', description_ar: '', description_en: '',
        icon: 'Building2', color: '', sort_order: 0
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [cats, opps, subs] = await Promise.all([
                getPartnerCategories(),
                getPartnerOpportunities(),
                getPartnerSubmissions()
            ])
            setCategories(cats || [])
            setOpportunities(opps || [])
            setSubmissions(subs || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // --- Category Handlers ---
    const handleCreateCategory = () => {
        setEditingCategory(null)
        setCategoryForm({
            title_ar: '', title_en: '', description_ar: '', description_en: '',
            icon: 'Building2', color: 'bg-blue-50 text-blue-600', slug: '', sort_order: categories.length + 1,
            registration_config: []
        })
        setIsCategoryFormOpen(true)
    }

    const handleEditCategory = (cat: any) => {
        setEditingCategory(cat)
        setCategoryForm({
            title_ar: cat.title_ar, title_en: cat.title_en,
            description_ar: cat.description_ar || '', description_en: cat.description_en || '',
            icon: cat.icon || 'Building2', color: cat.color || 'bg-blue-50 text-blue-600',
            slug: cat.slug, sort_order: cat.sort_order || 0,
            registration_config: cat.registration_config || []
        })
        setIsCategoryFormOpen(true)
    }

    const submitCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingCategory) {
                await updatePartnerCategory(editingCategory.id, categoryForm)
            } else {
                await createPartnerCategory(categoryForm)
            }
            setIsCategoryFormOpen(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure? All cards and submissions linked to this category will be deleted!')) return
        await deletePartnerCategory(id)
        fetchData()
    }

    // --- Opportunity Handlers ---
    const handleCreateOpportunity = (categoryId: string) => {
        setEditingOpportunity(null)
        setOpportunityForm({
            category_id: categoryId,
            title_ar: '', title_en: '', description_ar: '', description_en: '',
            icon: 'Building2', color: '', sort_order: 0
        })
        setIsOpportunityFormOpen(true)
    }

    const handleEditOpportunity = (opp: any) => {
        setEditingOpportunity(opp)
        setOpportunityForm({
            category_id: opp.category_id,
            title_ar: opp.title_ar, title_en: opp.title_en,
            description_ar: opp.description_ar || '', description_en: opp.description_en || '',
            icon: opp.icon || 'Building2', color: opp.color || '',
            sort_order: opp.sort_order || 0
        })
        setIsOpportunityFormOpen(true)
    }

    const submitOpportunity = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingOpportunity) {
                await updatePartnerOpportunity(editingOpportunity.id, opportunityForm)
            } else {
                await createPartnerOpportunity(opportunityForm)
            }
            setIsOpportunityFormOpen(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    const handleDeleteOpportunity = async (id: string) => {
        if (!confirm('Are you sure you want to delete this card?')) return
        await deletePartnerOpportunity(id)
        fetchData()
    }

    // --- Submission Handlers ---
    const handleStatusUpdate = async (id: string, status: string) => {
        await updatePartnerSubmissionStatus(id, status)
        fetchData()
        if (selectedSubmission && selectedSubmission.id === id) {
            setSelectedSubmission({ ...selectedSubmission, status })
        }
    }

    const opportunitiesByCategory = useMemo(() => {
        const map = new Map<string, any[]>()
        for (const op of opportunities) {
            const list = map.get(op.category_id)
            if (list) list.push(op)
            else map.set(op.category_id, [op])
        }
        return map
    }, [opportunities])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Partners Page Management</h1>
                {activeTab === 'content' && (
                    <Button onClick={handleCreateCategory}>
                        <Plus className="w-4 h-4 ml-2" />
                        Add Main Category
                    </Button>
                )}
            </div>

            <div role="tablist" className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    role="tab"
                    id="tab-content"
                    aria-selected={activeTab === 'content'}
                    aria-controls="panel-content"
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                    Content & Cards
                </button>
                <button
                    role="tab"
                    id="tab-submissions"
                    aria-selected={activeTab === 'submissions'}
                    aria-controls="panel-submissions"
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'submissions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                    Partnership Requests ({submissions.filter(s => s.status === 'pending').length})
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-500">Loading data...</p>
                </div>
            ) : activeTab === 'content' ? (
                <div id="panel-content" role="tabpanel" aria-labelledby="tab-content" className="space-y-8">
                    {categories.map(category => (
                        <Card key={category.id} className="overflow-hidden border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color?.includes('bg-') ? category.color : 'bg-gray-100'}`}>
                                        {(() => {
                                            const Icon = iconMap[category.icon || 'Building2']
                                            return Icon ? <Icon className="w-5 h-5" /> : null
                                        })()}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{category.title_ar}</CardTitle>
                                        <CardDescription>{category.title_en}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                                        <Edit className="w-4 h-4 ml-2" />
                                        Edit Category
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCategory(category.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-500">Sub-cards (Opportunities)</h3>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => handleCreateOpportunity(category.id)}>
                                        <Plus className="w-4 h-4 ml-2" />
                                        Add Card
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(opportunitiesByCategory.get(category.id) || []).map(op => (
                                        <div key={op.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white group relative">
                                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditOpportunity(op)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteOpportunity(op.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${op.color || 'bg-gray-100 text-gray-600'}`}>
                                                    {(() => {
                                                        const Icon = iconMap[op.icon || 'Building2']
                                                        return Icon ? <Icon className="w-4 h-4" /> : null
                                                    })()}
                                                </div>
                                                <div className="font-medium text-gray-900 truncate">{op.title_ar}</div>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{op.description_ar}</p>
                                        </div>
                                    ))}
                                    {(opportunitiesByCategory.get(category.id) || []).length === 0 && (
                                        <div className="col-span-full py-8 text-center text-gray-400 text-sm border-2 border-dashed rounded-xl">
                                            No cards in this category yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Get started by adding a new main category
                        </div>
                    )}
                </div>
            ) : (
                /* Submissions Tab */
                <Card id="panel-submissions" role="tabpanel" aria-labelledby="tab-submissions">
                    <CardHeader>
                        <CardTitle>Incoming Partnership Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{sub.opportunity?.category?.title_ar || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{sub.opportunity?.title_ar}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="max-w-xs truncate text-sm text-gray-600">
                                                    {Object.values(sub.data || {}).join(', ')}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {sub.status === 'approved' ? 'Approved' : sub.status === 'rejected' ? 'Rejected' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {formatDate(sub.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(sub)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {submissions.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No requests found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Category Modal */}
            <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCategory} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name (Arabic)</Label>
                                <Input value={categoryForm.title_ar} onChange={e => setCategoryForm({...categoryForm, title_ar: e.target.value})} required dir="rtl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Name (English)</Label>
                                <Input value={categoryForm.title_en} onChange={e => setCategoryForm({...categoryForm, title_en: e.target.value})} required dir="ltr" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Description (Arabic)</Label>
                                <Textarea value={categoryForm.description_ar} onChange={e => setCategoryForm({...categoryForm, description_ar: e.target.value})} dir="rtl" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Description (English)</Label>
                                <Textarea value={categoryForm.description_en} onChange={e => setCategoryForm({...categoryForm, description_en: e.target.value})} dir="ltr" />
                            </div>
                            <div className="space-y-2">
                                <Label>URL (Slug)</Label>
                                <Input value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input type="number" value={categoryForm.sort_order} onChange={e => setCategoryForm({...categoryForm, sort_order: parseInt(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    value={categoryForm.icon}
                                    onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})}
                                >
                                    {ICONS.map(i => <option key={i.value} value={i.value}>{i.value}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Color (Tailwind Classes)</Label>
                                <Input value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} placeholder="e.g. bg-blue-50 text-blue-600" dir="ltr" />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-bold mb-4">Build the Registration Form for this Category</h3>
                            <RegistrationFormBuilder
                                fields={categoryForm.registration_config}
                                onChange={fields => setCategoryForm({...categoryForm, registration_config: fields})}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCategoryFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Opportunity Modal */}
            <Dialog open={isOpportunityFormOpen} onOpenChange={setIsOpportunityFormOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingOpportunity ? 'Edit Card' : 'Add New Card'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitOpportunity} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title (Arabic)</Label>
                            <Input value={opportunityForm.title_ar} onChange={e => setOpportunityForm({...opportunityForm, title_ar: e.target.value})} required dir="rtl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Title (English)</Label>
                            <Input value={opportunityForm.title_en} onChange={e => setOpportunityForm({...opportunityForm, title_en: e.target.value})} required dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Arabic)</Label>
                            <Textarea value={opportunityForm.description_ar} onChange={e => setOpportunityForm({...opportunityForm, description_ar: e.target.value})} dir="rtl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (English)</Label>
                            <Textarea value={opportunityForm.description_en} onChange={e => setOpportunityForm({...opportunityForm, description_en: e.target.value})} dir="ltr" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    value={opportunityForm.icon}
                                    onChange={e => setOpportunityForm({...opportunityForm, icon: e.target.value})}
                                >
                                    {ICONS.map(i => <option key={i.value} value={i.value}>{i.value}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Color (Tailwind Classes)</Label>
                                <Input value={opportunityForm.color} onChange={e => setOpportunityForm({...opportunityForm, color: e.target.value})} placeholder="e.g. bg-blue-50 text-blue-600" dir="ltr" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpportunityFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Submission Detail Modal */}
            <Dialog open={!!selectedSubmission} onOpenChange={open => !open && setSelectedSubmission(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Category</span>
                                    <span className="font-medium">{selectedSubmission.opportunity?.category?.title_ar}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Request Date</span>
                                    <span className="font-medium">{formatDate(selectedSubmission.created_at)}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block">Current Status</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                        selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        selectedSubmission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {selectedSubmission.status === 'approved' ? 'Approved' : selectedSubmission.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="border rounded-xl p-4 bg-gray-50">
                                <h3 className="font-semibold mb-3 text-sm text-gray-700">Submitted Data</h3>
                                <div className="space-y-2">
                                    {Object.entries(selectedSubmission.data || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                            <span className="text-gray-600 text-sm">{key}</span>
                                            <span className="font-medium text-sm">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => handleStatusUpdate(selectedSubmission.id, 'rejected')} className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                                    Reject Request
                                </Button>
                                <Button onClick={() => handleStatusUpdate(selectedSubmission.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">
                                    Approve Request
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
