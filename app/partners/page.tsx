'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
    Building2, Users, Lightbulb, Mail, ArrowRight, Share2, Palette, 
    Kanban, Megaphone, Heart, Code, Monitor, Briefcase, Loader2 
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getPartnerCategories, getPartnerOpportunities, submitPartnerForm } from '@/app/dashboard/partners/actions'
import { DynamicForm } from '@/components/shared/dynamic-form'
import type { FormField } from '@/lib/types'
import { ActionDialog } from './components/action-dialog'

// Icon mapping to render dynamic icons
const iconMap: Record<string, any> = {
    Building2, Users, Lightbulb, Mail, Share2, Palette, 
    Kanban, Megaphone, Heart, Code, Monitor, Briefcase
}

export default function PartnersPage() {
    const { t } = useI18n()
    const [categories, setCategories] = useState<any[]>([])
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, opps] = await Promise.all([
                    getPartnerCategories(),
                    getPartnerOpportunities()
                ])
                setCategories(cats || [])
                setOpportunities(opps || [])
            } catch (error) {
                console.error("Failed to load partners data", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="pt-28 lg:pt-36 pb-10 min-h-screen bg-gray-50/30">
            <Container>
                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        {t.partnersPage.hero.title}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {t.partnersPage.hero.subtitle}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:auto-rows-fr">
                        {categories.map((category) => {
                            const CatIcon = iconMap[category.icon || 'Building2'] || Building2
                            const categoryOpps = opportunities.filter(op => op.category_id === category.id)

                            return (
                                <Card key={category.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        <div className="flex flex-col h-full">
                                            {/* Header Section */}
                                            <div className={`p-6 text-center ${category.color || 'bg-gray-50'}`}>
                                                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/60 backdrop-blur-sm rounded-lg mb-3 text-current">
                                                    <CatIcon className="w-6 h-6" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                                    {category.title_ar}
                                                </h2>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {category.description_ar}
                                                </p>
                                            </div>

                                            {/* Opportunities Section */}
                                            <div className="p-6 bg-white">
                                                {categoryOpps.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {categoryOpps.map((opp) => {
                                                            const OppIcon = iconMap[opp.icon || 'Building2'] || Building2
                                                            return (
                                                                <div key={opp.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                                                                    <div className={`w-10 h-10 ${opp.color || 'bg-gray-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                                        <OppIcon className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="text-base font-semibold text-gray-900 mb-1">{opp.title_ar}</h3>
                                                                        <p className="text-sm text-gray-600 leading-relaxed">{opp.description_ar}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                                                        <Lightbulb className="w-10 h-10 mb-2 opacity-20" />
                                                        <p className="text-sm">لا توجد عناصر</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA Section */}
                                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 mt-auto">
                                                {category.registration_config && category.registration_config.length > 0 ? (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className="w-full h-11 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                                                                ابدأ الآن
                                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>نموذج {category.title_ar}</DialogTitle>
                                                            </DialogHeader>
                                                            <DynamicForm 
                                                                fields={category.registration_config as FormField[]}
                                                                onSubmit={async (data) => {
                                                                    await submitPartnerForm({
                                                                        opportunity_id: null,
                                                                        category_id: category.id,
                                                                        data,
                                                                        status: 'pending'
                                                                    })
                                                                }}
                                                                submitLabel="إرسال الطلب"
                                                                successMessage="تم استلام طلبك بنجاح! سنتواصل معك قريباً."
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : (
                                                    <ActionDialog
                                                        title={category.title_ar}
                                                        description="تواصل معنا للمزيد من المعلومات"
                                                        email="partners@jaz.iq"
                                                        trigger={
                                                            <Button className="w-full h-11 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                                                                تواصل معنا
                                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {categories.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                                <p className="text-gray-500 text-lg">لا توجد أقسام متاحة حالياً.</p>
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </div>
    )
}
