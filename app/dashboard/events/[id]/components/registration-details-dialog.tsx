'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"

interface RegistrationDetailsDialogProps {
    data: any
    userName: string
}

export function RegistrationDetailsDialog({ data, userName }: RegistrationDetailsDialogProps) {
    if (!data) return <span className="text-gray-400">-</span>

    // Parse data if it's a string, otherwise use as is
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data
    const hasData = parsedData && Object.keys(parsedData).length > 0

    if (!hasData) return <span className="text-gray-400">-</span>

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="sr-only">عرض التفاصيل</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>بيانات التسجيل</DialogTitle>
                    <DialogDescription>
                        البيانات الإضافية التي قام {userName} بتعبئتها
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {Object.entries(parsedData).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-sm font-medium text-gray-500">{key}</span>
                            <span className="text-sm text-gray-900 font-medium whitespace-pre-wrap">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
