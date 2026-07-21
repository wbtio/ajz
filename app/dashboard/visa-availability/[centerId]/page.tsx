'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Toaster, toast } from 'sonner'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Info,
    CheckCircle,
    User,
    Shield,
    Upload,
    ArrowRight,
    Globe,
    Plus,
    X,
    Bell,
    UserCheck,
    FileImage,
    Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardPermission } from '@/components/auth/use-dashboard-permission'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { OcrUploadModal } from '@/components/visa-availability/ocr-upload-modal'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'

interface VisaCenter {
    id: string
    name: string
    country: string
    city: string
    visa_type: string
    visa_category: string
    service: string
    website_url: string | null
    last_updated: string
    updated_by_name: string
}

interface Slot {
    id: string
    center_id: string
    slot_date: string
    slot_time: string
    status: 'available' | 'limited' | 'booked' | 'unavailable' | 'assigned' | 'booking_attempted' | 'expired'
    assigned_registration_id?: string | null
}

interface Log {
    id: string
    center_id: string
    performed_by_name: string
    action: string
    screenshot_url?: string | null
    created_at: string
}

interface WatchlistItem {
    id: string
    case_number: string
    full_name: string
    email: string
    case_status: string
}

interface Officer {
    id: string
    email: string
    full_name: string | null
}

export default function VisaCenterDetails() {
    // Check permissions for this page
    useDashboardPermission('/dashboard/visa-availability')

    const shouldReduceMotion = useReducedMotion()
    const today = useMemo(() => new Date(), [])
    const params = useParams()
    const router = useRouter()
    const centerId = params.centerId as string
    const supabase = createClient() as any
    const isMobile = useIsMobile()

    // Data states
    const [center, setCenter] = useState<VisaCenter | null>(null)
    const [slots, setSlots] = useState<Slot[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<{ id: string; email: string; full_name: string } | null>(null)

    // Waitlist & Officers list
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [officers, setOfficers] = useState<Officer[]>([])

    // Calendar states
    const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1)
    const [currentYear, setCurrentYear] = useState<number>(today.getFullYear())
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate()
    const activeDates = Array.from(
        { length: daysInCurrentMonth },
        (_, index) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
    )

    // Modals States
    const [isOcrOpen, setIsOcrOpen] = useState(false)
    const [isNotifyOpen, setIsNotifyOpen] = useState(false)
    const [isAssignOpen, setIsAssignOpen] = useState(false)
    const [isScreenshotViewOpen, setIsScreenshotViewOpen] = useState(false)
    const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null)

    // Form States - Notify Officer
    const [notifyOfficerId, setNotifyOfficerId] = useState<string>('')
    const [notifyClientId, setNotifyClientId] = useState<string>('')
    const [notifyMessage, setNotifyMessage] = useState<string>('')
    const [notifyPriority, setNotifyPriority] = useState<string>('High')
    const [notifySlotDetails, setNotifySlotDetails] = useState<{ date: string; time: string } | null>(null)

    // Form States - Assign to Client
    const [assignClientId, setAssignClientId] = useState<string>('')
    const [assignSlotDetails, setAssignSlotDetails] = useState<{ date: string; time: string } | null>(null)

    // Mouse Selection states
    const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({})
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
    const [openPopoverSlot, setOpenPopoverSlot] = useState<string | null>(null)

    // Bulk Mode states
    const [isBulkNotify, setIsBulkNotify] = useState(false)
    const [isBulkAssign, setIsBulkAssign] = useState(false)

    // Load initial context data
    const fetchContextData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('id, email, full_name')
                .eq('id', user.id)
                .single()
            
            setUserProfile({
                id: user.id,
                email: user.email || '',
                full_name: profile?.full_name || user.email || 'Staff member'
            })
        }

        // Fetch waiting registrations
        const { data: regData } = await supabase
            .from('registrations')
            .select('id, case_number, full_name, email')
            .in('case_status', ['visa_in_progress', 'appointment_pending'])
            .limit(10)
        setWatchlist((regData as any) || [])

        // Fetch Officers list
        const { data: usersData } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('role', ['admin', 'team'])
        setOfficers(usersData || [])
    }

    const fetchData = async () => {
        if (!centerId || centerId === 'undefined') {
            return
        }
        setIsLoading(true)
        try {
            // 1. Fetch center
            const { data: centerData, error: centerErr } = await supabase
                .from('visa_centers')
                .select()
                .eq('id', centerId)
                .single()
            if (centerErr) throw centerErr
            setCenter(centerData as any)

            // 2. Fetch slots for this center in current month
            const monthStr = String(currentMonth).padStart(2, '0')
            const startDate = `${currentYear}-${monthStr}-01`
            const endDate = `${currentYear}-${monthStr}-${String(new Date(currentYear, currentMonth, 0).getDate()).padStart(2, '0')}`

            const { data: slotsData, error: slotsErr } = await supabase
                .from('visa_availability_slots')
                .select()
                .eq('center_id', centerId)
                .gte('slot_date', startDate)
                .lte('slot_date', endDate)
            if (slotsErr) throw slotsErr
            setSlots((slotsData as any) || [])

            // 3. Fetch center logs
            const { data: logsData, error: logsErr } = await supabase
                .from('visa_availability_logs')
                .select()
                .eq('center_id', centerId)
                .order('created_at', { ascending: false })
                .limit(10)
            if (logsErr) throw logsErr
            setLogs((logsData as any) || [])
        } catch (err) {
            console.error('Error fetching details:', err, (err as any)?.message, (err as any)?.details, (err as any)?.hint)
            toast.error('Could not load the visa center. Refresh the page and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContextData()
    }, [])

    useEffect(() => {
        fetchData()
    }, [centerId, currentMonth, currentYear])

    // Clear, predictable click behavior for single and multiple selection.
    const handleSlotClick = (dateStr: string, timeStr: string) => {
        const slotKey = `${dateStr}_${timeStr}`

        if (isMultiSelectMode) {
            setSelectedSlots(prev => ({
                ...prev,
                [slotKey]: !prev[slotKey]
            }))
        } else {
            setOpenPopoverSlot(slotKey)
        }
    }

    const clearSelection = () => {
        setSelectedSlots({})
        setIsMultiSelectMode(false)
    }

    // Update single slot status
    const updateSlotStatus = async (
        dateStr: string, 
        timeStr: string, 
        newStatus: 'available' | 'limited' | 'booked' | 'unavailable' | 'assigned' | 'booking_attempted' | 'expired', 
        registrationId: string | null = null
    ) => {
        if (!userProfile) {
            toast.error('Sign in before updating appointment availability.')
            return
        }

        const statusLabels = {
            available: 'Available',
            limited: 'Limited',
            booked: 'Booked on portal',
            unavailable: 'Unavailable',
            assigned: 'Assigned to client',
            booking_attempted: 'Booking attempted',
            expired: 'Expired'
        }

        const clientName = registrationId 
            ? watchlist.find(w => w.id === registrationId)?.full_name 
            : null

        const clientLabel = clientName ? `for client: ${clientName}` : ''
        const actionText = `Changed the ${timeStr.substring(0, 5)} appointment on ${dateStr} to ${statusLabels[newStatus]} ${clientLabel}`

        try {
            const formattedRegId = registrationId || null

            // 1. Upsert slot status
            const { error: upsertErr } = await supabase
                .from('visa_availability_slots')
                .upsert({
                    center_id: centerId,
                    slot_date: dateStr,
                    slot_time: timeStr,
                    status: newStatus,
                    assigned_registration_id: formattedRegId,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'center_id,slot_date,slot_time' })
            if (upsertErr) throw upsertErr

            // 2. Log update
            const { error: logErr } = await supabase
                .from('visa_availability_logs')
                .insert({
                    center_id: centerId,
                    performed_by: userProfile.id,
                    performed_by_name: userProfile.full_name,
                    action: actionText,
                    registration_id: formattedRegId
                })
            if (logErr) throw logErr

            // 3. Update center last_updated
            const { error: centerErr } = await supabase
                .from('visa_centers')
                .update({
                    last_updated: new Date().toISOString(),
                    updated_by: userProfile.id,
                    updated_by_name: userProfile.full_name
                })
                .eq('id', centerId)
            if (centerErr) throw centerErr

            // Update local state optimistically
            setSlots(prev => {
                const idx = prev.findIndex(s => s.slot_date === dateStr && s.slot_time === timeStr)
                if (idx > -1) {
                    const copy = [...prev]
                    copy[idx] = { ...copy[idx], status: newStatus, assigned_registration_id: registrationId }
                    return copy
                } else {
                    return [...prev, {
                        id: Math.random().toString(),
                        center_id: centerId,
                        slot_date: dateStr,
                        slot_time: timeStr,
                        status: newStatus,
                        assigned_registration_id: registrationId
                    }]
                }
            })

            // Refresh logs
            const { data: logsData } = await supabase
                .from('visa_availability_logs')
                .select()
                .eq('center_id', centerId)
                .order('created_at', { ascending: false })
                .limit(10)
            if (logsData) setLogs(logsData as any)

            // Refresh center info
            if (center) {
                setCenter({
                    ...center,
                    last_updated: new Date().toISOString(),
                    updated_by_name: userProfile.full_name
                })
            }

            toast.success(`Appointment updated to ${statusLabels[newStatus]}.`)
        } catch (err) {
            console.error('Error updating slot status:', err, (err as any)?.message, (err as any)?.details, (err as any)?.hint)
            toast.error('Could not update the appointment status. Try again.')
        }
    }

    // Bulk operations handlers
    const handleBulkStatusChange = async (newStatus: 'available' | 'limited' | 'booked' | 'unavailable' | 'assigned' | 'booking_attempted' | 'expired') => {
        const activeKeys = Object.keys(selectedSlots).filter(k => selectedSlots[k])
        if (activeKeys.length === 0) return
        if (!userProfile) {
            toast.error('Sign in before updating appointment availability.')
            return
        }

        const statusLabels = {
            available: 'Available',
            limited: 'Limited',
            booked: 'Booked on portal',
            unavailable: 'Unavailable',
            assigned: 'Assigned to client',
            booking_attempted: 'Booking attempted',
            expired: 'Expired'
        }

        try {
            const records = activeKeys.map(key => {
                const [dateStr, timeStr] = key.split('_')
                return {
                    center_id: centerId,
                    slot_date: dateStr,
                    slot_time: timeStr,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                }
            })

            // 1. Bulk Upsert slots
            const { error: upsertErr } = await supabase
                .from('visa_availability_slots')
                .upsert(records, { onConflict: 'center_id,slot_date,slot_time' })
            if (upsertErr) throw upsertErr

            // 2. Audit log
            const actionText = `Changed ${activeKeys.length} appointments to ${statusLabels[newStatus]}`
            const { error: logErr } = await supabase
                .from('visa_availability_logs')
                .insert({
                    center_id: centerId,
                    performed_by: userProfile.id,
                    performed_by_name: userProfile.full_name,
                    action: actionText
                })
            if (logErr) throw logErr

            // 3. Update center last_updated
            const { error: centerErr } = await supabase
                .from('visa_centers')
                .update({
                    last_updated: new Date().toISOString(),
                    updated_by: userProfile.id,
                    updated_by_name: userProfile.full_name
                })
                .eq('id', centerId)
            if (centerErr) throw centerErr

            // Update local state
            setSlots(prev => {
                const updated = [...prev]
                records.forEach(rec => {
                    const idx = updated.findIndex(s => s.slot_date === rec.slot_date && s.slot_time === rec.slot_time)
                    if (idx > -1) {
                        updated[idx] = { ...updated[idx], status: rec.status }
                    } else {
                        updated.push({
                            id: Math.random().toString(),
                            center_id: centerId,
                            slot_date: rec.slot_date,
                            slot_time: rec.slot_time,
                            status: rec.status
                        })
                    }
                })
                return updated
            })

            // Refresh logs
            const { data: logsData } = await supabase
                .from('visa_availability_logs')
                .select()
                .eq('center_id', centerId)
                .order('created_at', { ascending: false })
                .limit(10)
            if (logsData) setLogs(logsData as any)

            // Refresh center
            if (center) {
                setCenter({
                    ...center,
                    last_updated: new Date().toISOString(),
                    updated_by_name: userProfile.full_name
                })
            }

            toast.success(`${activeKeys.length} appointments updated to ${statusLabels[newStatus]}.`)
            setSelectedSlots({})
            setIsMultiSelectMode(false)
        } catch (err) {
            console.error('Error bulk updating slots:', err)
            toast.error('Could not update the selected appointments. Try again.')
        }
    }

    const openBulkNotifyModal = () => {
        const activeKeys = Object.keys(selectedSlots).filter(k => selectedSlots[k])
        setIsBulkNotify(true)
        setNotifySlotDetails(null)
        setNotifyMessage(
            `Alert: ${activeKeys.length} appointments are available at ${center?.name}, ${center?.city}.\nOpen the portal now to begin booking for the selected clients.`
        )
        if (watchlist.length > 0) {
            setNotifyClientId(watchlist[0].id)
        }
        setIsNotifyOpen(true)
    }

    const openBulkAssignModal = () => {
        setIsBulkAssign(true)
        setAssignSlotDetails(null)
        if (watchlist.length > 0) {
            setAssignClientId(watchlist[0].id)
        }
        setIsAssignOpen(true)
    }

    const handleBulkAssignSubmit = async () => {
        const activeKeys = Object.keys(selectedSlots).filter(k => selectedSlots[k])
        if (activeKeys.length === 0 || !assignClientId) {
            toast.error('Select a client before assigning appointments.')
            return
        }
        if (!userProfile) {
            toast.error('Sign in before assigning appointments.')
            return
        }

        try {
            const clientName = watchlist.find(w => w.id === assignClientId)?.full_name || 'Client'
            const records = activeKeys.map(key => {
                const [dateStr, timeStr] = key.split('_')
                return {
                    center_id: centerId,
                    slot_date: dateStr,
                    slot_time: timeStr,
                    status: 'assigned' as const,
                    assigned_registration_id: assignClientId,
                    updated_at: new Date().toISOString()
                }
            })

            // 1. Bulk Upsert slots
            const { error: upsertErr } = await supabase
                .from('visa_availability_slots')
                .upsert(records, { onConflict: 'center_id,slot_date,slot_time' })
            if (upsertErr) throw upsertErr

            // 2. Audit log
            const actionText = `Assigned ${activeKeys.length} appointments to ${clientName}`
            const { error: logErr } = await supabase
                .from('visa_availability_logs')
                .insert({
                    center_id: centerId,
                    performed_by: userProfile.id,
                    performed_by_name: userProfile.full_name,
                    action: actionText,
                    registration_id: assignClientId
                })
            if (logErr) throw logErr

            // 3. Update center last_updated
            const { error: centerErr } = await supabase
                .from('visa_centers')
                .update({
                    last_updated: new Date().toISOString(),
                    updated_by: userProfile.id,
                    updated_by_name: userProfile.full_name
                })
                .eq('id', centerId)
            if (centerErr) throw centerErr

            // Update local state
            setSlots(prev => {
                const updated = [...prev]
                records.forEach(rec => {
                    const idx = updated.findIndex(s => s.slot_date === rec.slot_date && s.slot_time === rec.slot_time)
                    if (idx > -1) {
                        updated[idx] = { ...updated[idx], status: rec.status, assigned_registration_id: assignClientId }
                    } else {
                        updated.push({
                            id: Math.random().toString(),
                            center_id: centerId,
                            slot_date: rec.slot_date,
                            slot_time: rec.slot_time,
                            status: rec.status,
                            assigned_registration_id: assignClientId
                        })
                    }
                })
                return updated
            })

            // Refresh logs
            const { data: logsData } = await supabase
                .from('visa_availability_logs')
                .select()
                .eq('center_id', centerId)
                .order('created_at', { ascending: false })
                .limit(10)
            if (logsData) setLogs(logsData as any)

            // Refresh center
            if (center) {
                setCenter({
                    ...center,
                    last_updated: new Date().toISOString(),
                    updated_by_name: userProfile.full_name
                })
            }

            toast.success(`${activeKeys.length} appointments assigned to ${clientName}.`)
            setSelectedSlots({})
            setIsMultiSelectMode(false)
            setIsAssignOpen(false)
        } catch (err) {
            console.error('Bulk assign error:', err)
            toast.error('Could not assign the selected appointments. Try again.')
        }
    }

    // Save batch slots from OCR Screenshot scan
    const saveOcrBatch = async (batch: { slot_date: string; slot_time: string; status: 'available' | 'limited' | 'booked' | 'unavailable' | 'assigned' | 'booking_attempted' | 'expired' }[]) => {
        if (!userProfile) {
            toast.error('Sign in before saving extracted appointments.')
            return
        }
        if (batch.length === 0) {
            toast.error('No appointments were extracted from the screenshot.')
            return
        }

        try {
            const formattedBatch = batch.map(s => ({
                center_id: centerId,
                slot_date: s.slot_date,
                slot_time: s.slot_time,
                status: s.status,
                updated_at: new Date().toISOString()
            }))

            const { error: upsertErr } = await supabase
                .from('visa_availability_slots')
                .upsert(formattedBatch, { onConflict: 'center_id,slot_date,slot_time' })
            if (upsertErr) throw upsertErr

            const { error: logErr } = await supabase
                .from('visa_availability_logs')
                .insert({
                    center_id: centerId,
                    performed_by: userProfile.id,
                    performed_by_name: userProfile.full_name,
                    action: `Updated ${batch.length} appointments from screenshot recognition.`
                })
            if (logErr) throw logErr

            const { error: centerErr } = await supabase
                .from('visa_centers')
                .update({
                    last_updated: new Date().toISOString(),
                    updated_by: userProfile.id,
                    updated_by_name: userProfile.full_name
                })
                .eq('id', centerId)
            if (centerErr) throw centerErr

            toast.success(`${batch.length} appointments saved.`)
            fetchData()
        } catch (err) {
            console.error('Bulk save error:', err)
            toast.error('Could not save the extracted appointments. Review the screenshot and try again.')
        }
    }

    // Handle Notify Officer Submit
    const handleNotifySubmit = async () => {
        if (!notifyOfficerId) {
            toast.error('Select a registration officer to notify.')
            return
        }
        if (!notifyMessage.trim()) {
            toast.error('Enter an alert message before sending.')
            return
        }

        try {
            const officerName = officers.find(o => o.id === notifyOfficerId)?.full_name || 'Registration officer'
            
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: notifyOfficerId,
                    title: `Available Appointment Alert (${notifyPriority})`,
                    body: notifyMessage.trim(),
                    type: 'visa_appointment_alert',
                    is_read: false
                })
            if (error) throw error

            toast.success(`Alert sent to ${officerName}.`)
            setIsNotifyOpen(false)
        } catch (err) {
            console.error('Notification Error:', err)
            toast.error('Could not send the alert. Check the officer and try again.')
        }
    }

    const openNotifyModal = (dateStr: string, timeStr: string) => {
        setIsBulkNotify(false)
        setNotifySlotDetails({ date: dateStr, time: timeStr })
        if (watchlist.length > 0) {
            setNotifyClientId(watchlist[0].id)
            const clientLabel = `Client: ${watchlist[0].full_name} (${watchlist[0].case_number})`
            setNotifyMessage(
                `An appointment is available at ${center?.name}, ${center?.city}.\nDate: ${dateStr}\nTime: ${timeStr.substring(0, 5)}\n${clientLabel}\nOpen the official center website now to book.`
            )
        } else {
            setNotifyMessage(
                `An appointment is available at ${center?.name}, ${center?.city}.\nDate: ${dateStr}\nTime: ${timeStr.substring(0, 5)}\nBook through the official center website.`
            )
        }
        setIsNotifyOpen(true)
    }

    const openAssignModal = (dateStr: string, timeStr: string) => {
        setIsBulkAssign(false)
        setAssignSlotDetails({ date: dateStr, time: timeStr })
        if (watchlist.length > 0) {
            setAssignClientId(watchlist[0].id)
        }
        setIsAssignOpen(true)
    }

    const handleAssignSubmit = async () => {
        if (isBulkAssign) {
            await handleBulkAssignSubmit()
        } else {
            if (!assignSlotDetails || !assignClientId) {
                toast.error('Complete all required appointment details.')
                return
            }

            await updateSlotStatus(
                assignSlotDetails.date,
                assignSlotDetails.time,
                'assigned',
                assignClientId
            )
            setIsAssignOpen(false)
        }
    }

    // Month Navigation
    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12)
            setCurrentYear(prev => prev - 1)
        } else {
            setCurrentMonth(prev => prev - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1)
            setCurrentYear(prev => prev + 1)
        } else {
            setCurrentMonth(prev => prev + 1)
        }
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const timeSlices = [
        '08:00:00', '08:15:00', '08:30:00', '08:45:00', 
        '09:00:00', '09:15:00', '09:30:00', '09:45:00', 
        '10:00:00', '10:15:00', '10:30:00', '10:45:00', 
        '11:00:00', '11:15:00', '11:30:00', '11:45:00', 
        '12:00:00', '12:15:00', '12:30:00'
    ]

    const getStatusColors = (status?: string) => {
        switch (status) {
            case 'available':
                return 'bg-blue-50 hover:bg-blue-100/80 text-blue-600 border-blue-200 shadow-sm ring-1 ring-blue-150'
            case 'limited':
                return 'bg-amber-50 hover:bg-amber-100/80 text-amber-600 border-amber-200 shadow-sm ring-1 ring-amber-150'
            case 'booked':
                return 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-600 border-emerald-250 shadow-sm ring-1 ring-emerald-150'
            case 'unavailable':
                return 'bg-stone-50 hover:bg-stone-100/80 text-stone-400 border-stone-200'
            case 'assigned':
                return 'bg-purple-50 hover:bg-purple-100/80 text-purple-650 border-purple-200 shadow-sm ring-1 ring-purple-150'
            case 'booking_attempted':
                return 'bg-yellow-50 hover:bg-yellow-100/80 text-yellow-600 border-yellow-250 shadow-sm ring-1 ring-yellow-150'
            case 'expired':
                return 'bg-red-50 hover:bg-red-100/80 text-red-500 border-red-200 shadow-sm ring-1 ring-red-150'
            default:
                return 'bg-white hover:bg-stone-50 text-stone-450 border-stone-200 border-dashed'
        }
    }

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'available': return 'Available'
            case 'limited': return 'Limited'
            case 'booked': return 'Booked on portal'
            case 'unavailable': return 'Unavailable'
            case 'assigned': return 'Assigned to client'
            case 'booking_attempted': return 'Booking attempted'
            case 'expired': return 'Expired'
            default: return 'Select status'
        }
    }

    const getBreakdown = () => {
        const counts = {
            available: slots.filter(s => s.status === 'available').length,
            limited: slots.filter(s => s.status === 'limited').length,
            unavailable: slots.filter(s => s.status === 'unavailable').length,
            assigned: slots.filter(s => s.status === 'assigned').length,
            booking_attempted: slots.filter(s => s.status === 'booking_attempted').length,
            expired: slots.filter(s => s.status === 'expired').length,
        }
        return counts
    }

    const breakdown = getBreakdown()
    const selectedCount = Object.values(selectedSlots).filter(Boolean).length

    const formatDateLabel = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = d.getDate()
            return `${dayName} ${String(dayNum).padStart(2, '0')}`
        } catch (e) {
            return dateStr
        }
    }

    return (
        <div className="flex-1 bg-[#F8FAFC] min-h-screen p-6 font-sans" dir="ltr" lang="en">
            <Toaster richColors position="top-center" dir="ltr" />

            {/* Top Navigation */}
            <div className="mb-6 flex items-center justify-between">
                <Link 
                    href="/dashboard/visa-availability"
                    className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors text-xs font-bold bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-sm"
                >
                    <ArrowRight className="h-4 w-4" />
                    <span>Back to Availability Monitor</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Drawer direction={isMobile ? "bottom" : "right"}>
                        <DrawerTrigger asChild>
                            <Button 
                                variant="outline"
                                className="bg-white hover:bg-stone-50 border-stone-200 text-stone-700 rounded-xl h-10 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                                <Info className="h-4 w-4 text-stone-500" />
                                <span>Details & Logs</span>
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent dir="ltr" className={isMobile ? "" : "w-3/4 sm:max-w-md border-r-0 border-l"}>
                            <DrawerHeader className="border-b border-stone-100 pb-4 text-left">
                                <DrawerTitle className="text-lg font-black text-stone-900 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-[#8B0000]" />
                                    Center Information
                                </DrawerTitle>
                                <DrawerDescription className="text-stone-500 text-xs">
                                    Summary of center details and previous audit logs.
                                </DrawerDescription>
                            </DrawerHeader>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8FAFC]">
                                {/* Center info breakdown */}
                                <Card className="border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden text-left">
                                    <div className="border-b border-stone-100 p-4 bg-stone-50/50">
                                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-[#8B0000]" />
                                            <span>Center Details Summary</span>
                                        </h3>
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="text-xs space-y-2.5">
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">Center</span>
                                                <span className="font-bold text-stone-800">{center?.name}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">City & Country</span>
                                                <span className="font-bold text-stone-800">{center?.city}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">Visa Type</span>
                                                <span className="font-bold text-stone-800">{center?.visa_type}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">Visa Category</span>
                                                <span className="font-bold text-stone-800">{center?.visa_category}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">Service</span>
                                                <span className="font-bold text-stone-800">{center?.service}</span>
                                            </div>
                                            <div className="flex justify-between pb-1 border-b border-stone-50">
                                                <span className="text-stone-400">Last Checked</span>
                                                <span className="font-bold text-stone-800">
                                                    {center?.last_updated ? new Date(center.last_updated).toLocaleString('en-US', {
                                                        hour: '2-digit', minute: '2-digit',
                                                        day: '2-digit', month: '2-digit'
                                                    }) : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-400">Updated By</span>
                                                <span className="font-bold text-[#8B0000]">{center?.updated_by_name || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                                                <span className="text-[9px] text-blue-600 block font-bold">Available</span>
                                                <span className="text-xs font-black text-blue-700">{breakdown.available}</span>
                                            </div>
                                            <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                                                <span className="text-[9px] text-amber-600 block font-bold">Limited</span>
                                                <span className="text-xs font-black text-amber-700">{breakdown.limited}</span>
                                            </div>
                                            <div className="bg-purple-50/50 p-2 rounded-xl border border-purple-100">
                                                <span className="text-[9px] text-purple-600 block font-bold">Assigned</span>
                                                <span className="text-xs font-black text-purple-700">{breakdown.assigned}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent logs specific to this center */}
                                <Card className="border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden text-left">
                                    <div className="border-b border-stone-100 p-4 bg-stone-50/50">
                                        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-[#8B0000]" />
                                            <span>Audit & Modification Logs</span>
                                        </h3>
                                    </div>
                                    <CardContent className="p-4">
                                        {logs.length === 0 ? (
                                            <p className="text-xs text-stone-400 text-center py-4">No audit logs available currently.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {logs.map((log) => (
                                                    <div key={log.id} className="flex gap-2 pb-3 border-b border-stone-50 last:border-0 last:pb-0">
                                                        <div className="h-7 w-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                                                            <User className="h-3.5 w-3.5 text-stone-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[10px] text-stone-400 block">
                                                                {new Date(log.created_at).toLocaleString('en-US', {
                                                                    hour: '2-digit', minute: '2-digit',
                                                                    day: '2-digit', month: '2-digit'
                                                                })}
                                                            </span>
                                                            <p className="text-xs font-semibold text-stone-800 leading-normal mt-0.5">
                                                                {log.action}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-[9px] text-stone-450">
                                                                    By: {log.performed_by_name}
                                                                </span>
                                                                {log.screenshot_url && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedScreenshotUrl(log.screenshot_url || null)
                                                                            setIsScreenshotViewOpen(true)
                                                                        }}
                                                                        className="text-[9px] font-bold text-[#8B0000] hover:underline flex items-center gap-0.5"
                                                                    >
                                                                        <FileImage className="h-3 w-3" />
                                                                        <span>Proof</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </DrawerContent>
                    </Drawer>

                    <Button 
                        onClick={() => setIsOcrOpen(true)}
                        className="bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-xl h-10 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                        <Upload className="h-4 w-4" />
                        <span>Update Appointments from Screenshot</span>
                    </Button>
                </div>
            </div>

            {isLoading && !center ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl shadow-sm">
                    <RefreshCw className="h-8 w-8 text-[#8B0000] animate-spin mb-4" />
                    <p className="text-xs text-stone-500">Loading appointment calendar and center details…</p>
                </div>
            ) : (
                <div className="w-full">
                    
                    {/* The interactive slot editor */}
                    <div className="space-y-6">
                        
                        {/* Page header and calendar nav */}
                        <Card className="border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
                                <div>
                                    <h2 className="text-lg font-black text-stone-900">{center?.name}: Availability Details</h2>
                                    <p className="text-stone-500 text-xs mt-1">Review and update appointments in {center?.city} for {center?.visa_type} visas.</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => {
                                            setIsMultiSelectMode(!isMultiSelectMode)
                                            setSelectedSlots({})
                                        }}
                                        className={cn(
                                            "h-9 px-3.5 rounded-xl text-xs font-black transition-[background-color,border-color,color,box-shadow] duration-200 flex items-center gap-1.5 border shadow-sm",
                                            isMultiSelectMode 
                                                ? "bg-purple-50 border-purple-200 text-purple-650 ring-1 ring-purple-150" 
                                                : "bg-white border-stone-200 text-stone-500 hover:text-stone-950"
                                        )}
                                    >
                                        <UserCheck className="h-3.5 w-3.5" />
                                        <span>{isMultiSelectMode ? `Selecting (${selectedCount})` : 'Select multiple'}</span>
                                    </button>

                                    <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
                                        <button 
                                            onClick={handlePrevMonth}
                                            className="h-8 w-8 rounded-lg hover:bg-stone-50 flex items-center justify-center text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35"
                                            aria-label="Previous month"
                                        >
                                            <ChevronLeft className="h-4 w-4" aria-hidden />
                                        </button>
                                        <span className="text-xs font-bold text-stone-700 px-4 select-none min-w-[140px] text-center">
                                            {monthNames[currentMonth - 1]} {currentYear}
                                        </span>
                                        <button 
                                            onClick={handleNextMonth}
                                            className="h-8 w-8 rounded-lg hover:bg-stone-50 flex items-center justify-center text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B0000]/35"
                                            aria-label="Next month"
                                        >
                                            <ChevronRight className="h-4 w-4" aria-hidden />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* The calendar days grid */}
                            <CardContent className="p-6">
                                <div className="grid grid-flow-col auto-cols-[minmax(118px,1fr)] gap-3 overflow-x-auto pb-1 lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
                                    {activeDates.map(dateStr => {
                                        const dateSlots = slots.filter(s => s.slot_date === dateStr)

                                        return (
                                            <div key={dateStr} className="space-y-4">
                                                {/* Day Header */}
                                                <div className="text-center pb-2.5 border-b border-stone-100">
                                                    <span className="font-bold text-stone-800 text-xs block truncate">
                                                        {formatDateLabel(dateStr)}
                                                    </span>
                                                </div>

                                                {/* List of times */}
                                                <div className="space-y-2">
                                                    {timeSlices.map(timeStr => {
                                                        const slot = dateSlots.find(s => s.slot_time === timeStr)
                                                        const currentStatus = slot?.status
                                                        const slotKey = `${dateStr}_${timeStr}`
                                                        const isSelected = !!selectedSlots[slotKey]

                                                        return (
                                                            <Popover key={timeStr} open={!isMultiSelectMode && openPopoverSlot === slotKey} onOpenChange={(open) => setOpenPopoverSlot(open ? slotKey : null)}>
                                                                <PopoverTrigger asChild>
                                                                    <button
                                                                        onClick={() => handleSlotClick(dateStr, timeStr)}
                                                                        aria-pressed={isMultiSelectMode ? isSelected : undefined}
                                                                        className={cn(
                                                                            "relative w-full text-center py-2 border rounded-xl text-xs font-bold transition-[background-color,border-color,color,box-shadow] duration-200 shadow-sm flex flex-col items-center justify-center gap-0.5 min-h-[46px]",
                                                                            getStatusColors(currentStatus),
                                                                            isSelected && "ring-2 ring-[#8B0000] ring-offset-1 border-[#8B0000] shadow-md"
                                                                        )}
                                                                    >
                                                                        {isSelected && (
                                                                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B0000] text-white">
                                                                                <CheckCircle className="h-3 w-3" />
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[11px] block">{timeStr.substring(0, 5)}</span>
                                                                        <span className="text-[8px] font-semibold opacity-85 block truncate max-w-full px-1">
                                                                            {getStatusLabel(currentStatus)}
                                                                        </span>
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-56 p-3 rounded-2xl bg-white border border-stone-200 shadow-xl font-sans" align="center">
                                                                    <h4 className="text-xs font-black text-stone-850 mb-2 border-b border-stone-50 pb-1.5">
                                                                        Appointment Actions: {timeStr.substring(0, 5)}
                                                                    </h4>
                                                                    <div className="space-y-1">
                                                                        
                                                                        {/* Status Selection Buttons */}
                                                                        <div className="grid grid-cols-2 gap-1 mb-2 pb-2 border-b border-stone-50">
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'available')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                                                <span>Available</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'limited')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                                                <span>Limited</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'booking_attempted')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                                                <span>Booking Attempted</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'booked')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                                <span>Booked</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'expired')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                                <span>Expired</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateSlotStatus(dateStr, timeStr, 'unavailable')}
                                                                                className="text-left px-2 py-1.5 rounded-lg text-[10px] font-medium text-stone-500 hover:bg-stone-50 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <span className="h-2 w-2 rounded-full bg-stone-400" />
                                                                                <span>Unavailable</span>
                                                                            </button>
                                                                        </div>

                                                                        {/* Action Triggers */}
                                                                        <button
                                                                            onClick={() => openNotifyModal(dateStr, timeStr)}
                                                                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100/70 transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <Bell className="h-3.5 w-3.5" />
                                                                            <span>Notify Registration Officer</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => openAssignModal(dateStr, timeStr)}
                                                                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100/70 transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <UserCheck className="h-3.5 w-3.5" />
                                                                            <span>Assign to Client</span>
                                                                        </button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            )}

            {/* Modal: Notify Registration Officer */}
            <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                            <span>Notify Registration Officer</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Send an immediate alert to the registration officer so booking can begin on the portal.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 text-xs">
                        {notifySlotDetails && (
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-blue-700 font-bold">
                                <span>Date: {notifySlotDetails.date}</span>
                                <span>Time: {notifySlotDetails.time.substring(0, 5)}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Registration Officer</label>
                                <Select value={notifyOfficerId} onValueChange={setNotifyOfficerId}>
                                    <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                        <SelectValue placeholder="Select an officer…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {officers.map(o => (
                                            <SelectItem key={o.id} value={o.id} className="text-xs">{o.full_name || o.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Priority</label>
                                <Select value={notifyPriority} onValueChange={setNotifyPriority}>
                                    <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low" className="text-xs text-blue-600">Low</SelectItem>
                                        <SelectItem value="Medium" className="text-xs text-stone-600">Medium</SelectItem>
                                        <SelectItem value="High" className="text-xs text-amber-600 font-bold">High</SelectItem>
                                        <SelectItem value="Urgent" className="text-xs text-red-650 font-black">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-stone-700">Link to Waiting Application</label>
                            <Select value={notifyClientId} onValueChange={setNotifyClientId}>
                                <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                    <SelectValue placeholder="Select an application…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {watchlist.map(w => (
                                        <SelectItem key={w.id} value={w.id} className="text-xs">
                                            {w.full_name} ({w.case_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-stone-700">Alert Message</label>
                            <textarea
                                value={notifyMessage}
                                onChange={(e) => setNotifyMessage(e.target.value)}
                                className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#8B0000] min-h-[90px] leading-relaxed"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t border-stone-100 pt-3 flex gap-2 justify-end">
                        <Button 
                            onClick={handleNotifySubmit}
                            className="bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-xl h-10 px-5 font-bold text-xs flex items-center gap-1.5"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Send Alert</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsNotifyOpen(false)}
                            className="text-stone-500 rounded-xl h-10 px-4 text-xs hover:bg-stone-55"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Assign to Client */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                            <span>Assign Appointment to Client</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Reserve this available appointment for a client on the waiting list. The appointment will be marked as assigned.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 text-xs">
                        {assignSlotDetails && (
                            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between text-[11px] text-purple-700 font-bold">
                                <span>Date: {assignSlotDetails.date}</span>
                                <span>Time: {assignSlotDetails.time.substring(0, 5)}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="font-bold text-stone-700">Waiting-list Client</label>
                            <Select value={assignClientId} onValueChange={setAssignClientId}>
                                <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                    <SelectValue placeholder="Select a client…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {watchlist.map(w => (
                                        <SelectItem key={w.id} value={w.id} className="text-xs">
                                            {w.full_name} ({w.case_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-stone-100 pt-3 flex gap-2 justify-end">
                        <Button 
                            onClick={handleAssignSubmit}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 px-5 font-bold text-xs"
                        >
                            Assign Appointment
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsAssignOpen(false)}
                            className="text-stone-500 rounded-xl h-10 px-4 text-xs hover:bg-stone-55"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: View Screenshot Proof */}
            <Dialog open={isScreenshotViewOpen} onOpenChange={setIsScreenshotViewOpen}>
                <DialogContent className="max-w-xl rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <FileImage className="h-5 w-5 text-[#8B0000]" />
                            <span>Appointment Availability Evidence</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Screenshot attached as evidence of appointment availability at this center.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 flex justify-center bg-stone-50 rounded-2xl border border-stone-100 shadow-inner">
                        {selectedScreenshotUrl ? (
                            <Image
                                src={selectedScreenshotUrl} 
                                alt="Screenshot showing appointment availability"
                                width={900}
                                height={600}
                                unoptimized
                                className="max-h-[350px] object-contain rounded-xl border border-stone-200" 
                            />
                        ) : (
                            <p className="text-xs text-stone-400 py-8">No evidence has been uploaded.</p>
                        )}
                    </div>

                    <DialogFooter className="pt-2 flex justify-end">
                        <Button 
                            variant="outline"
                            onClick={() => setIsScreenshotViewOpen(false)}
                            className="border-stone-200 hover:bg-stone-50 rounded-xl h-10 px-5 text-xs text-stone-600"
                        >
                            Close Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Floating Selection Banner */}
            <AnimatePresence>
                {selectedCount > 0 && (
                    <motion.div 
                        initial={shouldReduceMotion ? { x: "-50%", opacity: 0 } : { y: 80, x: "-50%", opacity: 0 }}
                        animate={{ y: 0, x: "-50%", opacity: 1 }}
                        exit={shouldReduceMotion ? { x: "-50%", opacity: 0 } : { y: 80, x: "-50%", opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-950 text-white rounded-2xl p-4 shadow-2xl z-50 flex items-center gap-6 max-w-4xl border border-stone-800"
                    >
                        <div className="flex items-center gap-2 border-r border-stone-800 pr-4">
                            <span className="bg-[#8B0000] text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center">
                                {selectedCount}
                            </span>
                            <span className="text-xs font-bold whitespace-nowrap">slots selected</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                            <button 
                                onClick={() => handleBulkStatusChange('available')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                Available
                            </button>
                            <button 
                                onClick={() => handleBulkStatusChange('limited')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                            >
                                Limited
                            </button>
                            <button 
                                onClick={() => handleBulkStatusChange('booking_attempted')}
                                className="px-2.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-stone-950 transition-colors"
                            >
                                Attempted
                            </button>
                            <button 
                                onClick={() => handleBulkStatusChange('booked')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                                Booked
                            </button>
                            <button 
                                onClick={() => handleBulkStatusChange('expired')}
                                className="px-2.5 py-1.5 rounded-lg bg-red-650 hover:bg-red-750 text-white transition-colors"
                            >
                                Expired
                            </button>
                            <button 
                                onClick={() => handleBulkStatusChange('unavailable')}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white transition-colors"
                            >
                                Unavailable
                            </button>

                            <span className="h-4 w-px bg-stone-800 mx-1 shrink-0" />

                            <button 
                                onClick={openBulkNotifyModal}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors flex items-center gap-1 shrink-0"
                            >
                                <Bell className="h-3.5 w-3.5" />
                                <span>Notify</span>
                            </button>

                            <button 
                                onClick={openBulkAssignModal}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-750 text-white transition-colors flex items-center gap-1 shrink-0"
                            >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Assign</span>
                            </button>
                        </div>

                        <button 
                            onClick={clearSelection}
                            className="border-l border-stone-850 pl-3 text-xs font-semibold text-stone-400 hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OCR screenshot upload modal */}
            {center && (
                <OcrUploadModal 
                    isOpen={isOcrOpen}
                    onClose={() => setIsOcrOpen(false)}
                    centerName={center.name}
                    defaultDate={activeDates[0]}
                    onSave={saveOcrBatch}
                />
            )}
        </div>
    )
}
