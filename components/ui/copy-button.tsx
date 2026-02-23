'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
    data: any
    label?: string
}

export function CopyButton({ data, label = 'نسخ البيانات' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!data) return

        // Format data for copying
        const textToCopy = typeof data === 'object' 
            ? Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n')
            : String(data)

        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return null
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
            title={label}
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">{label}</span>
        </Button>
    )
}
