'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { triggerSearch } from '@/lib/actions/event-discovery.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2 } from 'lucide-react'

export function SearchForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const keywords = formData.get('keywords') as string
        const sector = formData.get('sector') as string
        const country = formData.get('country') as string
        const dateRangeStart = formData.get('dateRangeStart') as string
        const dateRangeEnd = formData.get('dateRangeEnd') as string
        const eventType = formData.get('eventType') as string

        try {
            const { success } = await triggerSearch({
                keywords,
                sector: sector || undefined,
                country: country || undefined,
                dateRangeStart: dateRangeStart || undefined,
                dateRangeEnd: dateRangeEnd || undefined,
                eventType: eventType && eventType !== 'all' ? eventType : undefined
            })

            if (success) {
                // Redirect to sessions page to monitor progress
                router.push('/dashboard/event-discovery/sessions')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to trigger search')
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>New Event Discovery Search</CardTitle>
                <CardDescription>
                    Trigger a new search via n8n workflow. The AI will analyze the results and cache them for your review.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords / Search Query *</Label>
                        <Input
                            id="keywords"
                            name="keywords"
                            placeholder="e.g. AI Conference, FinTech Summit..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sector">Sector</Label>
                            <Input id="sector" name="sector" placeholder="e.g. Technology" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Location / Country</Label>
                            <Input id="country" name="country" placeholder="e.g. UAE, Remote" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dateRangeStart">Date Range Start</Label>
                            <Input type="date" id="dateRangeStart" name="dateRangeStart" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateRangeEnd">Date Range End</Label>
                            <Input type="date" id="dateRangeEnd" name="dateRangeEnd" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type</Label>
                        <Select name="eventType" defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                                <SelectItem value="webinar">Webinar</SelectItem>
                                <SelectItem value="hackathon">Hackathon</SelectItem>
                                <SelectItem value="exhibition">Exhibition</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                        {isSubmitting ? 'Starting Search...' : 'Start Discovery'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
