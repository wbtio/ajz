'use client'

import { useState } from 'react'
import { submitReview, ReviewStatus } from '@/lib/actions/event-discovery.actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react'

export function ReviewPanel({ eventId, currentStatus }: { eventId: string, currentStatus: string }) {
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionToSubmit, setActionToSubmit] = useState<ReviewStatus | null>(null)

    async function handleAction(action: ReviewStatus) {
        setIsSubmitting(true)
        setActionToSubmit(action)
        try {
            await submitReview(eventId, action, notes)
            setNotes('') // Clear notes after success
        } catch (error) {
            console.error('Failed to submit review', error)
            alert('Failed to submit review. Check console for details.')
        } finally {
            setIsSubmitting(false)
            setActionToSubmit(null)
        }
    }

    return (
        <Card className="border-stone-200">
            <CardHeader className="bg-stone-50/50">
                <CardTitle>Human Review Decision</CardTitle>
                <CardDescription>
                    Current Status: <span className="font-semibold">{currentStatus || 'pending'}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <Textarea 
                    placeholder="Optional review notes or context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                />
                
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Button 
                        variant="outline" 
                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        onClick={() => handleAction('approved_for_outreach')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && actionToSubmit === 'approved_for_outreach' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Approve
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        onClick={() => handleAction('rejected')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && actionToSubmit === 'rejected' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                    </Button>

                    <Button 
                        variant="outline" 
                        className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        onClick={() => handleAction('mark_for_manual_review')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && actionToSubmit === 'mark_for_manual_review' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <AlertCircle className="mr-2 h-4 w-4" />
                        )}
                        Needs Review
                    </Button>

                    <Button 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                        onClick={() => handleAction('ready_to_publish')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && actionToSubmit === 'ready_to_publish' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Ready
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
