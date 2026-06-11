'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface ActionDialogProps {
    trigger: React.ReactNode
    title: string
    description: string
    email: string
    formLink?: string
}

export function ActionDialog({ trigger, title, description, email, formLink = '/contact' }: ActionDialogProps) {
    const { t } = useI18n()

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button asChild size="lg" className="w-full justify-between h-14 text-lg bg-blue-600 hover:bg-blue-700">
                        <a href={`mailto:${email}`}>
                            <span className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                {t.partnersPage.dialog.email}
                            </span>
                            <ArrowRight className="w-5 h-5 opacity-50" />
                        </a>
                    </Button>
                    
                    <Button asChild variant="outline" size="lg" className="w-full justify-between h-14 text-lg border-2 hover:bg-gray-50">
                        <Link href={formLink}>
                            <span className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {t.partnersPage.dialog.form}
                            </span>
                            <ArrowRight className="w-5 h-5 opacity-50" />
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
