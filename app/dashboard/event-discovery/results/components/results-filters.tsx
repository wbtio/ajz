'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export function ResultsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5 mb-6 rounded-lg border border-stone-200 bg-white p-4">
            <div className="space-y-2">
                <Label>Search</Label>
                <Input
                    placeholder="Search by title or organizer..."
                    defaultValue={searchParams.get('search') ?? ''}
                    onChange={(e) => {
                        // debounce this in a real app
                        router.push('?' + createQueryString('search', e.target.value))
                    }}
                />
            </div>
            
            <div className="space-y-2">
                <Label>AI Relevance Status</Label>
                <Select
                    defaultValue={searchParams.get('status') ?? 'all'}
                    onValueChange={(val) => router.push('?' + createQueryString('status', val === 'all' ? '' : val))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="ready_for_review">Ready for Review (&gt;70)</SelectItem>
                        <SelectItem value="weak_result">Weak Result</SelectItem>
                        <SelectItem value="duplicate">Duplicate</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Review Status</Label>
                <Select
                    defaultValue={searchParams.get('reviewStatus') ?? 'all'}
                    onValueChange={(val) => router.push('?' + createQueryString('reviewStatus', val === 'all' ? '' : val))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved_for_outreach">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="mark_for_manual_review">Manual Review</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Score (Min)</Label>
                <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 80"
                    defaultValue={searchParams.get('minScore') ?? ''}
                    onChange={(e) => router.push('?' + createQueryString('minScore', e.target.value))}
                />
            </div>

            <div className="flex flex-col justify-center space-y-4 pt-6">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="hasOrganizer"
                        checked={searchParams.get('hasOrganizer') === 'true'}
                        onCheckedChange={(checked) => router.push('?' + createQueryString('hasOrganizer', checked ? 'true' : ''))}
                    />
                    <Label htmlFor="hasOrganizer">Has Organizer</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="hideDuplicates"
                        checked={searchParams.get('duplicate') === 'false'}
                        onCheckedChange={(checked) => router.push('?' + createQueryString('duplicate', checked ? 'false' : ''))}
                    />
                    <Label htmlFor="hideDuplicates">Hide Duplicates</Label>
                </div>
            </div>
        </div>
    )
}
