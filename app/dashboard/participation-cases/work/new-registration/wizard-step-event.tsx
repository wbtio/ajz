'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClientSummary } from './client-summary'
import { buildTravelPurpose, formatEventDate } from './wizard-helpers'
import { useWizardEvent, useWizardShell } from './wizard-view-context'

export function EventStep() {
  const router = useRouter()
  const { step, client, registration, registrationId, caseNumber, onClose } = useWizardShell()
  const {
    events,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    participationType,
    setParticipationType,
    travelPurpose,
    setTravelPurpose,
    inviterConfig,
    handleSaveEventDetails,
    handleSaveEventDraft,
  } = useWizardEvent()

  if (step !== 1) return null

  const hostFirstName = inviterConfig.host_contact_name.split(' ')[0]
  const hostLastName = inviterConfig.host_contact_name.split(' ').slice(1).join(' ')

  return (
    <div className="w-full space-y-2.5 animate-in fade-in duration-300">
      <Card className="space-y-4 border-slate-200/80 p-4 shadow-sm sm:p-5">
        {client && registration && <ClientSummary client={client} caseNumber={caseNumber} />}

        {/* Event details form */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Event Registration Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-12">
              <label className="text-xs font-bold text-slate-600">Select Event *</label>
              <select
                value={selectedEventId}
                onChange={(event) => {
                  const nextEventId = event.target.value
                  const nextEvent = events.find((item) => item.id === nextEventId)
                  setSelectedEventId(nextEventId)
                  setTravelPurpose(buildTravelPurpose(nextEvent, participationType))
                }}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {[event.title || event.title_ar, event.location || event.country || event.location_ar || event.country_ar, formatEventDate(event.date)].filter(Boolean).join(' • ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <label className="text-xs font-bold text-slate-600">Participation Type *</label>
              <select
                value={participationType}
                onChange={(event) => {
                  const nextType = event.target.value
                  const currentEvent = events.find((item) => item.id === selectedEventId)
                  setParticipationType(nextType)
                  setTravelPurpose(buildTravelPurpose(currentEvent, nextType))
                }}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white focus:outline-none"
              >
                <option value="Business Visitor">Business Visitor</option>
                <option value="Exhibitor">Exhibitor</option>
                <option value="Speaker">Speaker</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-9">
              <label className="text-xs font-bold text-slate-600">Travel Purpose *</label>
              <div className="min-h-10 px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-sm leading-5 text-slate-700">{travelPurpose}</div>
            </div>
          </div>
        </div>

        {/* Auto-filled event information (read-only) */}
        {selectedEvent && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Event Information (Auto-Filled)</h3>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                Read-only
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 text-xs sm:grid-cols-3 lg:grid-cols-[minmax(0,3.5fr)_minmax(0,1.16fr)_minmax(0,1.19fr)_minmax(0,1.04fr)_minmax(0,1fr)]">
              <div className="min-w-0">
                <span className="text-slate-400 block">Event Name</span>
                <span className="block break-words font-semibold leading-4 text-slate-700">{selectedEvent.title || selectedEvent.title_ar}</span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Event Type</span>
                <span className="block break-words font-semibold leading-4 text-slate-700">{selectedEvent.event_type || 'Not recorded'}</span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Sector</span>
                <span className="block break-words font-semibold leading-4 text-slate-700">{selectedEvent.sector || 'Not recorded'}</span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">Country</span>
                <span className="block break-words font-semibold leading-4 text-slate-700">{selectedEvent.country || selectedEvent.country_ar || 'Not recorded'}</span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-400 block">City</span>
                <span className="block break-words font-semibold leading-4 text-slate-700">{selectedEvent.location || selectedEvent.location_ar || 'Not recorded'}</span>
              </div>
            </div>

            {/* Inviting organization / host information */}
            <div className="rounded-lg border border-[#8B0000]/30 bg-[#8B0000]/[0.025] px-2.5 py-2">
              <h4 className="mb-0.5 text-[10px] font-bold leading-4 text-[#8B0000]">Inviting Organization / Host Information (Auto-Filled)</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs sm:grid-cols-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,.7fr)_minmax(0,1.2fr)_minmax(0,.85fr)] xl:gap-y-0">
                <div className="min-w-0">
                  <span className="block text-slate-400">Organization Name</span>
                  <span className="block break-words font-semibold leading-4 text-slate-700">{inviterConfig.host_org}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">Address</span>
                  <span className="block break-words font-semibold leading-4 text-slate-700">{inviterConfig.host_address}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">First Name</span>
                  <span className="block break-words font-semibold leading-4 text-slate-700">{hostFirstName || 'Not recorded'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">Last Name</span>
                  {/* This previously fell back to the placeholder surname "Dupont". */}
                  <span className="block break-words font-semibold leading-4 text-slate-700">{hostLastName || 'Not recorded'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">Position</span>
                  <span className="block break-words font-semibold leading-4 text-slate-700">{inviterConfig.host_contact_position || 'Not recorded'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">Email</span>
                  <span dir="ltr" className="block break-all font-semibold leading-4 text-slate-700">{inviterConfig.host_contact_email}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-slate-400">Phone Number</span>
                  <span dir="ltr" className="block break-words font-semibold leading-4 text-slate-700">{inviterConfig.host_contact_phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          {onClose ? (
            <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600">
              Cancel / Exit
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push('/dashboard/home')} className="border-slate-200 text-slate-600">
              Back to Dashboard
            </Button>
          )}
          <div className="flex gap-2">
            {registrationId && (
              /* This button used to only show a success toast without saving anything. */
              <Button variant="outline" onClick={() => void handleSaveEventDraft()} className="border-slate-200 text-slate-600">
                Save Draft
              </Button>
            )}
            <Button onClick={() => void handleSaveEventDetails(true)} className="bg-[#8B0000] hover:bg-[#6B0000] text-white min-w-[125px] shadow-sm">
              Continue to Client Search
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
