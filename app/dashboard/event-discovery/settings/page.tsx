import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-lg font-medium leading-6 text-stone-900">Module Settings</h2>
                <p className="mt-1 text-sm text-stone-500">
                    Configure the connections to n8n and AI thresholds.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>n8n Webhook Configuration</CardTitle>
                    <CardDescription>
                        Set the URL of the n8n webhook that receives search parameters. This should be configured in your environment variables as <code>N8N_WEBHOOK_URL</code>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Webhook URL</Label>
                        <Input disabled value={process.env.N8N_WEBHOOK_URL || 'https://ollama75.app.n8n.cloud/webhook-test/jaz-event-search'} />
                        <p className="text-xs text-stone-500">To change this, update your .env file and restart the server.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Thresholds</CardTitle>
                    <CardDescription>
                        Configure the minimum score for an event to be considered "ready for review" vs "weak result".
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Review Threshold Score</Label>
                        <Input disabled value="70" type="number" />
                        <p className="text-xs text-stone-500">Currently hardcoded in the n8n workflow.</p>
                    </div>
                    <Button disabled>Save Configuration</Button>
                </CardContent>
            </Card>
        </div>
    )
}
