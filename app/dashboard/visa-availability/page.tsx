'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Toaster, toast } from 'sonner'
import {
    Calendar,
    Globe,
    RefreshCw,
    ExternalLink,
    Edit3,
    ChevronRight,
    ChevronDown,
    MapPin,
    AlertCircle,
    User,
    ArrowRight,
    TrendingUp,
    Bell,
    UserCheck,
    Eye,
    Plus,
    Clock,
    FileImage,
    Send,
    Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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
    editor?: { full_name: string | null; email: string; avatar_url: string | null } | null
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
    visa_centers?: {
        name: string
    }
    editor?: { full_name: string | null; email: string; avatar_url: string | null } | null
}

interface WatchlistItem {
    id: string
    case_number: string
    full_name: string
    email: string
    case_status: string
    event_id: string
    priority: 'Urgent' | 'High' | 'Medium' | 'VIP'
    center_interest: string
}

interface Officer {
    id: string
    email: string
    full_name: string | null
}

const CENTERS_PER_PAGE = 2

function toLocalDateInput(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getDefaultDateRange() {
    const start = new Date()
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start: toLocalDateInput(start), end: toLocalDateInput(end) }
}

const getPaginationItems = (currentPage: number, totalPages: number) => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
    const visiblePages = [...pages].filter(page => page > 0 && page <= totalPages).sort((a, b) => a - b)
    const items: Array<number | 'ellipsis'> = []

    visiblePages.forEach((page, index) => {
        if (index > 0 && page - visiblePages[index - 1] > 1) items.push('ellipsis')
        items.push(page)
    })

    return items
}

export default function VisaAvailabilityDashboard() {
    const supabase = createClient() as any
    const defaultDateRange = useMemo(getDefaultDateRange, [])

    // Filter states
    const [selectedCountry, setSelectedCountry] = useState<string>('france')
    const [selectedCity, setSelectedCity] = useState<string>('all')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [startDate, setStartDate] = useState<string>(defaultDateRange.start)
    const [endDate, setEndDate] = useState<string>(defaultDateRange.end)

    // Data states
    const [centers, setCenters] = useState<VisaCenter[]>([])
    const [slots, setSlots] = useState<Slot[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [officers, setOfficers] = useState<Officer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Current user state
    const [currentUser, setCurrentUser] = useState<{ id: string; email: string; full_name: string } | null>(null)

    // Modals States
    const [isManualCheckOpen, setIsManualCheckOpen] = useState(false)
    const [isNotifyOpen, setIsNotifyOpen] = useState(false)
    const [isScreenshotViewOpen, setIsScreenshotViewOpen] = useState(false)
    const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null)

    // Form States - Manual Check
    const [manualCheckCenter, setManualCheckCenter] = useState<string>('')
    const [manualCheckRegistration, setManualCheckRegistration] = useState<string>('')
    const [manualCheckDate, setManualCheckDate] = useState<string>(defaultDateRange.start)
    const [manualCheckTime, setManualCheckTime] = useState<string>('09:30')
    const [manualCheckStatus, setManualCheckStatus] = useState<'available' | 'limited' | 'booked' | 'unavailable' | 'booking_attempted'>('available')
    const [manualCheckNotes, setManualCheckNotes] = useState<string>('')
    const [manualCheckScreenshot, setManualCheckScreenshot] = useState<File | null>(null)

    // Form States - Notify Officer
    const [notifyOfficerId, setNotifyOfficerId] = useState<string>('')
    const [notifyClientId, setNotifyClientId] = useState<string>('')
    const [notifyMessage, setNotifyMessage] = useState<string>('')
    const [notifyPriority, setNotifyPriority] = useState<string>('High')
    const [notifySlotDetails, setNotifySlotDetails] = useState<{ centerName: string; date: string; time: string } | null>(null)

    // Load data from Supabase
    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Get Current User
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('id, email, full_name')
                    .eq('id', user.id)
                    .single()
                setCurrentUser({
                    id: user.id,
                    email: user.email || '',
                    full_name: profile?.full_name || user.email || 'Staff member'
                })
            }

            const [centersResult, slotsResult, logsResult, registrationsResult, usersResult] = await Promise.all([
                supabase.from('visa_centers').select('id, name, country, city, visa_type, visa_category, service, website_url, last_updated, updated_by_name, editor:users!visa_centers_updated_by_fkey(full_name, email, avatar_url)'),
                supabase.from('visa_availability_slots').select('id, center_id, slot_date, slot_time, status, assigned_registration_id').gte('slot_date', startDate).lte('slot_date', endDate),
                supabase.from('visa_availability_logs').select('id, center_id, performed_by_name, action, screenshot_url, created_at, visa_centers(name), editor:users!visa_availability_logs_performed_by_fkey(full_name, email, avatar_url)').order('created_at', { ascending: false }).limit(8),
                supabase.from('registrations').select('id, case_number, full_name, email, case_status, event_id, form_data').in('case_status', ['visa_in_progress', 'appointment_pending', 'appointment_booked']).limit(10),
                supabase.from('users').select('id, email, full_name').in('role', ['admin', 'team']),
            ])
            if (centersResult.error) throw centersResult.error
            if (slotsResult.error) throw slotsResult.error
            if (logsResult.error) throw logsResult.error
            if (registrationsResult.error) throw registrationsResult.error
            if (usersResult.error) throw usersResult.error
            setCenters((centersResult.data as any) || [])
            setSlots((slotsResult.data as any) || [])
            setLogs((logsResult.data as any) || [])
            const registrationsData = registrationsResult.data

            const parsedWatchlist: WatchlistItem[] = (registrationsData || []).map((r: any) => {
                const formData = r.form_data && typeof r.form_data === 'object' && !Array.isArray(r.form_data)
                    ? r.form_data as Record<string, unknown>
                    : {}
                const storedPriority = typeof formData.priority === 'string' ? formData.priority : ''
                const priority: WatchlistItem['priority'] = ['Urgent', 'High', 'Medium', 'VIP'].includes(storedPriority)
                    ? storedPriority as WatchlistItem['priority']
                    : r.case_status === 'appointment_pending' ? 'High' : 'Medium'
                const centerInterest = [formData.visa_center_name, formData.visa_center, formData.preferred_visa_center]
                    .find((value) => typeof value === 'string' && value.trim())
                return {
                    id: r.id,
                    case_number: r.case_number,
                    full_name: r.full_name,
                    email: r.email,
                    case_status: r.case_status,
                    event_id: r.event_id,
                    priority,
                    center_interest: typeof centerInterest === 'string' ? centerInterest : 'Not specified'
                }
            })
            setWatchlist(parsedWatchlist)

            setOfficers(usersResult.data || [])

            return true

        } catch (err) {
            console.error('Error fetching visa availability:', err)
            toast.error('Could not load visa availability. Check your connection and try again.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const refreshTimer = window.setTimeout(() => { void fetchData() }, 250)
        return () => window.clearTimeout(refreshTimer)
    }, [startDate, endDate])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        const refreshed = await fetchData()
        setIsRefreshing(false)
        if (refreshed) toast.success('Visa availability refreshed.')
    }

    const resetFilters = () => {
        setCurrentPage(1)
        setSelectedCountry('france')
        setSelectedCity('all')
        setSelectedCategory('all')
        setSelectedStatus('all')
        setStartDate(defaultDateRange.start)
        setEndDate(defaultDateRange.end)
        toast.info('Filters have been reset.')
    }

    // Handle Manual Check Submit
    const handleManualCheckSubmit = async () => {
        if (!manualCheckCenter) {
            toast.error('Select a visa center before saving the check.')
            return
        }
        if (!manualCheckDate || !/^\d{2}:\d{2}$/.test(manualCheckTime)) {
            toast.error('Enter a valid check date and time.')
            return
        }
        if (!currentUser) {
            toast.error('Sign in before recording a manual check.')
            return
        }

        let uploadedScreenshotPath: string | null = null
        try {
            setIsRefreshing(true)
            let screenshotUrl: string | null = null
            if (manualCheckScreenshot) {
                if (!manualCheckScreenshot.type.startsWith('image/')) throw new Error('The evidence file must be an image.')
                if (manualCheckScreenshot.size > 8 * 1024 * 1024) throw new Error('The evidence image must be smaller than 8 MB.')
                const extension = manualCheckScreenshot.name.split('.').pop()?.toLowerCase() || 'jpg'
                uploadedScreenshotPath = `visa-availability/evidence/${manualCheckCenter}/${crypto.randomUUID()}.${extension}`
                const { error: uploadError } = await supabase.storage
                    .from('events-bucket')
                    .upload(uploadedScreenshotPath, manualCheckScreenshot, { contentType: manualCheckScreenshot.type, upsert: false })
                if (uploadError) throw uploadError
                screenshotUrl = supabase.storage.from('events-bucket').getPublicUrl(uploadedScreenshotPath).data.publicUrl
            }

            const centerName = centers.find(c => c.id === manualCheckCenter)?.name || 'Selected center'
            const statusLabels = {
                available: 'Available',
                limited: 'Limited',
                booked: 'Booked',
                unavailable: 'Unavailable',
                booking_attempted: 'Booking attempted'
            }

            const notesSuffix = manualCheckNotes.trim() ? `. Notes: ${manualCheckNotes.trim()}` : ''
            const actionText = `Manual check: recorded an appointment at ${manualCheckTime} on ${manualCheckDate} with status ${statusLabels[manualCheckStatus]}${notesSuffix}`

            // 1. Insert slot
            const { error: upsertErr } = await supabase
                .from('visa_availability_slots')
                .upsert({
                    center_id: manualCheckCenter,
                    slot_date: manualCheckDate,
                    slot_time: manualCheckTime,
                    status: manualCheckStatus,
                    assigned_registration_id: manualCheckRegistration || null,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'center_id,slot_date,slot_time' })
            if (upsertErr) throw upsertErr

            // 2. Insert log
            const { error: logErr } = await supabase
                .from('visa_availability_logs')
                .insert({
                    center_id: manualCheckCenter,
                    registration_id: manualCheckRegistration || null,
                    performed_by: currentUser.id,
                    performed_by_name: currentUser.full_name,
                    action: actionText,
                    screenshot_url: screenshotUrl
                })
            if (logErr) throw logErr

            // 3. Update last check on center
            const { error: centerErr } = await supabase
                .from('visa_centers')
                .update({
                    last_updated: new Date().toISOString(),
                    updated_by: currentUser.id,
                    updated_by_name: currentUser.full_name
                })
                .eq('id', manualCheckCenter)
            if (centerErr) throw centerErr

            toast.success('Manual check logged and the schedule updated.')
            setIsManualCheckOpen(false)
            setManualCheckNotes('')
            setManualCheckRegistration('')
            setManualCheckScreenshot(null)
            await fetchData()
        } catch (err) {
            console.error('Error logging manual check:', err)
            if (uploadedScreenshotPath) {
                await supabase.storage.from('events-bucket').remove([uploadedScreenshotPath]).catch(() => undefined)
            }
            toast.error(err instanceof Error ? err.message : 'Could not save the manual check. Try again.')
        } finally {
            setIsRefreshing(false)
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
            setIsRefreshing(true)
            const officerName = officers.find(o => o.id === notifyOfficerId)?.full_name || 'registration officer'
            
            // Insert notification into Database
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: notifyOfficerId,
                    title: `🚨 Available appointment alert (${notifyPriority})`,
                    body: notifyMessage.trim(),
                    type: 'visa_appointment_alert',
                    is_read: false
                })
            if (error) throw error

            toast.success(`Alert sent to ${officerName}.`)
            setIsNotifyOpen(false)
        } catch (err) {
            console.error('Notification Error:', err)
            toast.error('Failed to send the alert.')
        } finally {
            setIsRefreshing(false)
        }
    }

    // Open Notify Modal and pre-populate message
    const openNotifyModal = (slot: Slot, center: VisaCenter) => {
        const matchingClient = watchlist.find(w => w.center_interest === center.name)
        
        setNotifySlotDetails({
            centerName: center.name,
            date: slot.slot_date,
            time: slot.slot_time
        })
        
        if (matchingClient) {
            setNotifyClientId(matchingClient.id)
        } else if (watchlist.length > 0) {
            setNotifyClientId(watchlist[0].id)
        }

        const clientLabel = matchingClient ? `Client: ${matchingClient.full_name} (${matchingClient.case_number})` : ''

        setNotifyMessage(
            `An appointment is available at ${center.name}, ${center.city}.\nDate: ${slot.slot_date}\nTime: ${slot.slot_time.substring(0, 5)}\n${clientLabel}\nPlease book immediately through the center's official website.`
        )
        setIsNotifyOpen(true)
    }

    // Filter centers based on selection
    const filteredCenters = centers.filter(c => {
        if (selectedCountry !== 'all' && c.country.toLowerCase() !== selectedCountry.toLowerCase()) return false
        if (selectedCity !== 'all' && c.city.toLowerCase() !== selectedCity.toLowerCase()) return false
        if (selectedCategory !== 'all' && c.visa_category.toLowerCase() !== selectedCategory.toLowerCase()) return false
        return true
    })

    const totalPages = Math.ceil(filteredCenters.length / CENTERS_PER_PAGE)
    const paginatedCenters = filteredCenters.slice(
        (currentPage - 1) * CENTERS_PER_PAGE,
        currentPage * CENTERS_PER_PAGE
    )
    const paginationItems = getPaginationItems(currentPage, totalPages)

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCountry, selectedCity, selectedCategory])

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages)
    }, [currentPage, totalPages])

    // Group slots by center & date
    const getSlotsForCenter = (centerId: string) => {
        return slots.filter(s => s.center_id === centerId)
    }

    // Calculate dynamic summary statistics
    const getSummaryStats = () => {
        const activeCenterIds = filteredCenters.map(c => c.id)
        const relevantSlots = slots.filter(s => activeCenterIds.includes(s.center_id))
        
        // Filter by status if selected
        let finalSlots = relevantSlots
        if (selectedStatus !== 'all') {
            finalSlots = relevantSlots.filter(s => s.status === selectedStatus)
        }

        const counts = {
            available: finalSlots.filter(s => s.status === 'available').length,
            limited: finalSlots.filter(s => s.status === 'limited').length,
            unavailable: finalSlots.filter(s => s.status === 'unavailable').length,
            booked: finalSlots.filter(s => s.status === 'booked').length,
            assigned: finalSlots.filter(s => s.status === 'assigned').length,
            booking_attempted: finalSlots.filter(s => s.status === 'booking_attempted').length,
            expired: finalSlots.filter(s => s.status === 'expired').length,
            total: finalSlots.length
        }
        return counts
    }

    const stats = getSummaryStats()

    // Format date label
    const formatDateLabel = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            const dayNum = d.getDate()
            const enDay = d.toLocaleDateString('en-US', { weekday: 'short' }) // Tue, Wed etc.
            return `${enDay} ${String(dayNum).padStart(2, '0')}`
        } catch (e) {
            return dateStr
        }
    }

    // Helper for status styling & labels
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/75'
            case 'limited':
                return 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/75'
            case 'booked':
                return 'bg-emerald-50 text-emerald-600 border-emerald-250 hover:bg-emerald-100/75'
            case 'unavailable':
                return 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100/75'
            case 'assigned':
                return 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100/75'
            case 'booking_attempted':
                return 'bg-yellow-50 text-yellow-600 border-yellow-250 hover:bg-yellow-100/75'
            case 'expired':
                return 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100/75'
            default:
                return 'bg-white text-stone-500 border-stone-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'Available'
            case 'limited': return 'Limited'
            case 'booked': return 'Booked on portal'
            case 'unavailable': return 'Unavailable'
            case 'assigned': return 'Assigned to client'
            case 'booking_attempted': return 'Booking attempted'
            case 'expired': return 'Expired'
            default: return status
        }
    }

    const getDisplayDates = () => {
        const dates: string[] = []
        const cursor = new Date(`${startDate}T00:00:00Z`)
        const rangeEnd = new Date(`${endDate}T00:00:00Z`)

        while (cursor <= rangeEnd && dates.length < 6) {
            dates.push(cursor.toISOString().slice(0, 10))
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }

        return dates
    }

    const displayDates = getDisplayDates()

    // Helper for source site dynamic title
    const getSourceSiteLabel = (centerName: string) => {
        if (centerName.toLowerCase().includes('tls')) return 'Open TLS Website'
        if (centerName.toLowerCase().includes('vfs')) return 'Open VFS Website'
        if (centerName.toLowerCase().includes('bls')) return 'Open BLS Website'
        return 'Open Visa Website'
    }

    return (
        <div className="relative flex-1 min-h-screen bg-transparent p-4 font-sans md:p-5" dir="ltr">
            <Toaster richColors position="top-center" dir="ltr" />

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-[#8B0000]" />
                        <span>Visa Center Availability Monitor</span>
                    </h1>
                    <p className="mt-1 text-xs text-stone-500">Filter a center, review its open slots, or add an appointment manually.</p>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsManualCheckOpen(true)}
                        className="bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-xl h-11 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add appointment</span>
                    </Button>
                </div>
            </div>

            {/* Compact always-visible filters */}
            <div className="mb-5 grid grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(120px,1fr))_repeat(2,minmax(135px,1fr))_auto]">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-500">Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="h-8 bg-white text-xs"><SelectValue placeholder="France" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="italy">Italy</SelectItem>
                            <SelectItem value="spain">Spain</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-500">City</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-8 bg-white text-xs"><SelectValue placeholder="All cities" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All cities</SelectItem>
                            <SelectItem value="baghdad, iraq">Baghdad, Iraq</SelectItem>
                            <SelectItem value="erbil, iraq">Erbil, Iraq</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-stone-500">Visa category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8 bg-white text-xs"><SelectValue placeholder="All categories" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="tourism">Tourism</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="visa-filter-start" className="text-[10px] font-semibold text-stone-500">From</label>
                    <Input id="visa-filter-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-8 bg-white text-xs" />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="visa-filter-end" className="text-[10px] font-semibold text-stone-500">To</label>
                    <Input id="visa-filter-end" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-8 bg-white text-xs" />
                </div>

                <div className="flex h-8 items-center gap-1">
                    <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm" className="h-8 gap-1.5 border-stone-200 px-2.5 text-xs text-stone-700">
                        <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                        <span className="sr-only xl:not-sr-only">Refresh</span>
                    </Button>
                    <Button onClick={resetFilters} variant="ghost" size="sm" className="h-8 px-2 text-xs text-stone-500">
                        Reset
                    </Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Right Side Info Cards */}
                <div className="contents">
                    <div className="flex gap-2 md:absolute md:right-[190px] md:top-6">
                        <Drawer direction="right">
                            <DrawerTrigger asChild>
                                <Button className="h-11 justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-black shadow-sm hover:bg-stone-50">
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-black" />Appointment Watchlist</span>
                                    <Badge className="rounded-full border-stone-200 bg-stone-100 text-black">{watchlist.length}</Badge>
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-white" dir="ltr">
                                <DrawerHeader className="border-b border-stone-100">
                                    <DrawerTitle>Appointment Watchlist</DrawerTitle>
                                    <DrawerDescription>Clients waiting for a matching visa appointment.</DrawerDescription>
                                </DrawerHeader>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {watchlist.length === 0 ? (
                                        <p className="py-8 text-center text-xs text-stone-400">No watchlist requests at the moment.</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {watchlist.map((item) => {
                                                const matchingSlots = slots.filter(slot => slot.status === 'available' && centers.find(center => center.id === slot.center_id)?.name === item.center_interest)
                                                return (
                                                    <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-stone-200 p-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-bold text-stone-900">{item.full_name}</span>
                                                            <Badge variant="outline">{item.priority}</Badge>
                                                        </div>
                                                        <div className="flex flex-col gap-1 text-xs text-stone-500">
                                                            <span>{item.case_number}</span>
                                                            <span>{item.center_interest}</span>
                                                        </div>
                                                        {matchingSlots.length > 0 && <Badge variant="secondary">{matchingSlots.length} matching appointments</Badge>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </DrawerContent>
                        </Drawer>

                        <Drawer direction="right">
                            <DrawerTrigger asChild>
                                <Button className="h-11 justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 text-xs font-bold text-black shadow-sm hover:bg-stone-50">
                                    <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-black" />Recent Updates</span>
                                    <Badge className="rounded-full border-stone-200 bg-stone-100 text-black">{logs.length}</Badge>
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-white" dir="ltr">
                                <DrawerHeader className="border-b border-stone-100">
                                    <DrawerTitle>Recent Updates</DrawerTitle>
                                    <DrawerDescription>Latest manual checks and availability changes.</DrawerDescription>
                                </DrawerHeader>
                                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                                    {logs.length === 0 ? (
                                        <p className="py-8 text-center text-xs text-stone-400">No updates have been logged.</p>
                                    ) : logs.map(log => (
                                        <div key={log.id} className="flex gap-3 border-b border-stone-100 pb-4 last:border-0">
                                            <Avatar className="h-8 w-8 shrink-0" title={log.performed_by_name}>
                                                <AvatarImage src={log.editor?.avatar_url || undefined} alt={log.performed_by_name} />
                                                <AvatarFallback className="bg-stone-100 text-[10px] font-bold text-stone-600">{log.performed_by_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-stone-800">{log.performed_by_name}</p>
                                                <p className="mt-1 text-xs leading-relaxed text-stone-500"><span className="font-bold text-stone-700">{log.visa_centers?.name}</span>: {log.action}</p>
                                                <span className="mt-1 block text-[10px] text-stone-400">{new Date(log.created_at).toLocaleString('en-US')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>

                    {false && (<>
                    
                    {/* Stats Card */}
                    <details className="group border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                        <summary className="p-4 bg-stone-50/50 flex cursor-pointer list-none items-center justify-between transition-colors hover:bg-stone-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0000]/40 [&::-webkit-details-marker]:hidden">
                            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#8B0000]" />
                                <span>Appointment Slot Status</span>
                            </h3>
                            <ChevronDown className="h-4 w-4 text-stone-400 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <CardContent className="border-t border-stone-100 p-4 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <span>Available</span>
                                </span>
                                <span className="text-sm font-bold text-blue-650">{stats.available}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                    <span>Limited</span>
                                </span>
                                <span className="text-sm font-bold text-amber-650">{stats.limited}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                                    <span>Assigned to client</span>
                                </span>
                                <span className="text-sm font-bold text-purple-650">{stats.assigned}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                    <span>Booking attempted</span>
                                </span>
                                <span className="text-sm font-bold text-yellow-650">{stats.booking_attempted}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    <span>Booked on portal</span>
                                </span>
                                <span className="text-sm font-bold text-emerald-600">{stats.booked}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                    <span>Expired</span>
                                </span>
                                <span className="text-sm font-bold text-red-500">{stats.expired}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
                                    <span>Unavailable</span>
                                </span>
                                <span className="text-sm font-bold text-stone-500">{stats.unavailable}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 font-bold text-stone-900">
                                <span className="text-xs">Total</span>
                                <span className="text-base">{stats.total}</span>
                            </div>
                        </CardContent>
                    </details>

                    {/* Watchlist Card */}
                    <details className="group border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                        <summary className="p-4 bg-stone-50/50 flex cursor-pointer list-none items-center justify-between transition-colors hover:bg-stone-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0000]/40 [&::-webkit-details-marker]:hidden">
                            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#8B0000]" />
                                <span>Appointment Watchlist</span>
                            </h3>
                            <ChevronDown className="h-4 w-4 text-stone-400 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <CardContent className="border-t border-stone-100 p-3">
                            {watchlist.length === 0 ? (
                                <p className="text-xs text-stone-400 text-center py-4">No watchlist requests at the moment.</p>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {watchlist.map((item) => {
                                        const matchingSlots = slots.filter(s => s.status === 'available' && centers.find(c => c.id === s.center_id)?.name === item.center_interest)
                                        return (
                                            <div key={item.id} className="p-2.5 rounded-xl border border-stone-150 bg-stone-50/30 flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-stone-800">{item.full_name}</span>
                                                    <Badge 
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[9px] font-black rounded-full px-2 py-0.5",
                                                            item.priority === 'Urgent' ? "bg-red-50 text-red-650 border-red-150" :
                                                            item.priority === 'High' ? "bg-amber-50 text-amber-650 border-amber-150" :
                                                            item.priority === 'VIP' ? "bg-purple-50 text-purple-650 border-purple-150" :
                                                            "bg-blue-50 text-blue-650 border-blue-150"
                                                        )}
                                                    >
                                                        {item.priority}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                                                    <span>{item.case_number}</span>
                                                    <span className="text-[#8B0000]">{item.center_interest}</span>
                                                </div>
                                                {matchingSlots.length > 0 && (
                                                    <div className="mt-1 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-1.5 text-[9px] text-blue-700 font-bold">
                                                        <span>Matching appointments available: {matchingSlots.length}</span>
                                                        <Link href={`/dashboard/visa-availability`} className="underline flex items-center gap-0.5">
                                                            <span>View</span>
                                                            <ChevronRight className="h-2 w-2" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </details>

                    {/* Recent Updates Card */}
                    <details className="group border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                        <summary className="p-4 bg-stone-50/50 flex cursor-pointer list-none items-center justify-between transition-colors hover:bg-stone-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0000]/40 [&::-webkit-details-marker]:hidden">
                            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-[#8B0000]" />
                                <span>Recent Updates</span>
                            </h3>
                            <ChevronDown className="h-4 w-4 text-stone-400 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <CardContent className="border-t border-stone-100 p-4">
                            {logs.length === 0 ? (
                                <p className="text-xs text-stone-400 text-center py-4">No updates have been logged.</p>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex gap-2.5 border-b border-stone-50 pb-3 last:border-0 last:pb-0">
                                            <Avatar className="h-7 w-7 shrink-0" title={log.performed_by_name}>
                                                <AvatarImage src={log.editor?.avatar_url || undefined} alt={log.performed_by_name} />
                                                <AvatarFallback className="bg-stone-100 text-[9px] font-bold text-stone-600">{log.performed_by_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-stone-800">
                                                    {log.performed_by_name}
                                                </p>
                                                <p className="text-[10px] text-stone-500 mt-0.5 leading-normal">
                                                    <span className="font-bold text-stone-700">{log.visa_centers?.name}</span>: {log.action}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[9px] text-stone-400">
                                                        {new Date(log.created_at).toLocaleString('en-US', {
                                                            hour: '2-digit', minute: '2-digit',
                                                            day: '2-digit', month: '2-digit'
                                                        })}
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
                                                            <span>View proof</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </details>
                    </>)}

                </div>

                {/* Left Side: Visa Center Cards */}
                <div className="lg:col-span-4 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl shadow-sm">
                            <RefreshCw className="h-8 w-8 text-[#8B0000] animate-spin mb-4" />
                            <p className="text-xs text-stone-500">Loading visa centers and appointment availability…</p>
                        </div>
                    ) : filteredCenters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
                            <AlertCircle className="h-10 w-10 text-stone-400 mb-4" />
                            <h3 className="font-bold text-stone-900 text-base">No matching centers</h3>
                            <p className="text-xs text-stone-500 mt-1 max-w-xs">No center matches the selected country, city, or visa category.</p>
                            <Button onClick={resetFilters} variant="outline" size="sm" className="mt-4 h-8 border-stone-200 text-xs">
                                Reset filters
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {paginatedCenters.map((center, index) => {
                                const centerSlots = getSlotsForCenter(center.id)
                                const centerStats = {
                                    available: centerSlots.filter(slot => slot.status === 'available').length,
                                    limited: centerSlots.filter(slot => slot.status === 'limited').length,
                                    assigned: centerSlots.filter(slot => slot.status === 'assigned').length,
                                    bookingAttempted: centerSlots.filter(slot => slot.status === 'booking_attempted').length,
                                    booked: centerSlots.filter(slot => slot.status === 'booked').length,
                                    expired: centerSlots.filter(slot => slot.status === 'expired').length,
                                    unavailable: centerSlots.filter(slot => slot.status === 'unavailable').length,
                                    total: centerSlots.length,
                                }
                                
                                return (
                                    <Card key={center.id} className="border border-stone-200/80 shadow-sm rounded-2xl bg-white overflow-hidden transition-[box-shadow,border-color] duration-300 hover:shadow-md">
                                        
                                        {/* Card Header */}
                                        <div className="p-4 bg-stone-50/50 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-stone-400 text-xs">.{(currentPage - 1) * CENTERS_PER_PAGE + index + 1}</span>
                                                    <h3 className="font-black text-stone-900 text-base">{center.name}</h3>
                                                    <Badge className="bg-red-50 text-[#8B0000] border-red-150 text-[10px] font-bold">
                                                        {center.visa_category}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1.5 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                                                        <span>{center.city}</span>
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-stone-300 hidden md:inline" />
                                                    <span>Visa type: {center.visa_type}</span>
                                                    <span className="h-1 w-1 rounded-full bg-stone-300 hidden md:inline" />
                                                    <span>Service: {center.service}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                {center.website_url && (
                                                    <a 
                                                        href={center.website_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-3 h-9 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        <span>{getSourceSiteLabel(center.name)}</span>
                                                    </a>
                                                )}
                                                <Link 
                                                    href={`/dashboard/visa-availability/${center.id}`}
                                                    className="px-3 h-9 rounded-lg bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                    <span>Edit appointments</span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Card Content - Slots Grid */}
                                        <CardContent className="p-5">
                                            
                                            {/* Date columns container */}
                                            <div className="grid grid-flow-col auto-cols-[minmax(112px,1fr)] gap-2 overflow-x-auto pb-1 lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
                                                {displayDates.map(dateStr => {
                                                    const dateSlots = centerSlots.filter(s => s.slot_date === dateStr)
                                                    
                                                    // Sort slots by time
                                                    const sortedDateSlots = dateSlots.sort((a, b) => a.slot_time.localeCompare(b.slot_time))
                                                    const visibleSlots = sortedDateSlots.slice(0, 5)
                                                    const hasMore = sortedDateSlots.length > 5

                                                    return (
                                                        <div key={dateStr} className="min-w-0 space-y-2.5">
                                                            <div className="text-center pb-2 border-b border-stone-100">
                                                                <span className="font-bold text-stone-800 text-xs block">
                                                                    {formatDateLabel(dateStr)}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="space-y-1.5">
                                                                {visibleSlots.length === 0 ? (
                                                                    <div className="text-center py-4 border border-dashed border-stone-100 rounded-xl">
                                                                        <span className="text-[10px] text-stone-400">No appointments</span>
                                                                    </div>
                                                                ) : (
                                                                    visibleSlots.map(slot => (
                                                                        <div 
                                                                            key={slot.id}
                                                                            className="relative group"
                                                                        >
                                                                            <button 
                                                                                onClick={() => openNotifyModal(slot, center)}
                                                                                className={cn(
                                                                                    "w-full text-center py-1.5 border rounded-lg text-xs font-bold transition-[background-color,border-color,color,box-shadow] duration-200 shadow-sm flex flex-col items-center justify-center gap-0.5 min-h-[40px]",
                                                                                    getStatusColors(slot.status)
                                                                                )}
                                                                            >
                                                                                <span className="text-[10px] block">{slot.slot_time.substring(0, 5)}</span>
                                                                                <span className="text-[8px] font-semibold opacity-85 block truncate max-w-full px-1">
                                                                                    {getStatusLabel(slot.status)}
                                                                                </span>
                                                                            </button>

                                                                            {/* Hover quick action notify bubble */}
                                                                            {slot.status === 'available' && (
                                                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] font-bold rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-25 flex items-center gap-1 shadow-md">
                                                                                    <Bell className="h-2 w-2 text-yellow-400" />
                                                                                    <span>Notify officer</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                )}
                                                                
                                                                {hasMore && (
                                                                    <Link 
                                                                        href={`/dashboard/visa-availability/${center.id}`}
                                                                        className="block w-full text-center py-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-700 bg-stone-50 rounded-lg border border-stone-150 transition-colors"
                                                                    >
                                                                        View More…
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* Legend & Last updated */}
                                            <div className="mt-6 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap border-t border-stone-100 pt-4 text-xs text-stone-500">
                                                
                                                {/* Legend */}
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                                        <span>Available <strong className="text-blue-650">{centerStats.available}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                                        <span>Limited <strong className="text-amber-650">{centerStats.limited}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                                                        <span>Assigned <strong className="text-purple-650">{centerStats.assigned}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                                        <span>Attempted <strong className="text-yellow-650">{centerStats.bookingAttempted}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                        <span>Booked <strong className="text-emerald-600">{centerStats.booked}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                                        <span>Expired <strong className="text-red-500">{centerStats.expired}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
                                                        <span>Unavailable <strong className="text-stone-600">{centerStats.unavailable}</strong></span>
                                                    </div>
                                                    <div className="font-bold text-stone-700">Total {centerStats.total}</div>
                                                </div>

                                                {/* Last updated info */}
                                                <div className="flex shrink-0 items-center gap-1.5 text-stone-400 font-medium">
                                                    <span>Last checked: {new Date(center.last_updated).toLocaleString('en-US', {
                                                        hour: '2-digit', minute: '2-digit',
                                                        day: '2-digit', month: '2-digit'
                                                    })}</span>
                                                    <span>|</span>
                                                    <Avatar
                                                        size="sm"
                                                        title={`Updated by ${center.updated_by_name}`}
                                                        aria-label={`Updated by ${center.updated_by_name}`}
                                                    >
                                                        <AvatarImage src={center.editor?.avatar_url || undefined} alt={center.updated_by_name} />
                                                        <AvatarFallback className="bg-stone-100 font-bold uppercase text-stone-600">
                                                            {center.updated_by_name
                                                                .split(/[\s@._-]+/)
                                                                .filter(Boolean)
                                                                .slice(0, 2)
                                                                .map(part => part[0])
                                                                .join('') || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                )
                            })}

                            {totalPages > 1 && (
                                <Pagination className="pt-2">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                aria-disabled={currentPage === 1}
                                                className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    setCurrentPage(page => Math.max(1, page - 1))
                                                }}
                                            />
                                        </PaginationItem>

                                        {paginationItems.map((item, index) => (
                                            item === 'ellipsis' ? (
                                                <PaginationItem key={`ellipsis-${index}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={item}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === item}
                                                        aria-label={`Go to page ${item}`}
                                                        onClick={(event) => {
                                                            event.preventDefault()
                                                            setCurrentPage(item)
                                                        }}
                                                    >
                                                        {item}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                aria-disabled={currentPage === totalPages}
                                                className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    setCurrentPage(page => Math.min(totalPages, page + 1))
                                                }}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Add appointment availability */}
            <Dialog open={isManualCheckOpen} onOpenChange={setIsManualCheckOpen}>
                <DialogContent className="max-w-lg rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <Plus className="h-5 w-5 text-[#8B0000]" />
                            <span>Add appointment availability</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Save the appointment date, time, status, and optional evidence in the availability schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Visa center</label>
                                <Select value={manualCheckCenter} onValueChange={setManualCheckCenter}>
                                    <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                        <SelectValue placeholder="Select a center…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {centers.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Check time</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="date" 
                                        value={manualCheckDate} 
                                        onChange={(e) => setManualCheckDate(e.target.value)}
                                        className="h-10 px-2 border border-stone-200 rounded-xl text-xs flex-1 bg-white focus:outline-none"
                                    />
                                    <input 
                                        type="text" 
                                        value={manualCheckTime} 
                                        placeholder="09:30"
                                        onChange={(e) => setManualCheckTime(e.target.value)}
                                        className="h-10 w-20 border border-stone-200 rounded-xl text-xs text-center bg-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-stone-700">Link to application <span className="font-normal text-stone-400">(optional)</span></label>
                            <Select value={manualCheckRegistration || 'none'} onValueChange={(value) => setManualCheckRegistration(value === 'none' ? '' : value)}>
                                <SelectTrigger className="h-10 rounded-xl border-stone-200 bg-white text-xs">
                                    <SelectValue placeholder="Leave unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" className="text-xs">Leave unassigned</SelectItem>
                                    {watchlist.map((registration) => (
                                        <SelectItem key={registration.id} value={registration.id} className="text-xs">
                                            {registration.case_number || registration.full_name} — {registration.center_interest}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-stone-400">The appointment will appear on the application and in its activity history.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Observed availability</label>
                                <Select value={manualCheckStatus} onValueChange={(val: any) => setManualCheckStatus(val)}>
                                    <SelectTrigger className="h-10 text-xs rounded-xl border-stone-200 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available" className="text-xs">Available</SelectItem>
                                        <SelectItem value="limited" className="text-xs">Limited</SelectItem>
                                        <SelectItem value="booked" className="text-xs">Booked</SelectItem>
                                        <SelectItem value="booking_attempted" className="text-xs">Booking attempted</SelectItem>
                                        <SelectItem value="unavailable" className="text-xs">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Screenshot proof (optional)</label>
                                <label
                                    htmlFor="screenshot-upload"
                                    className="h-10 border border-dashed border-stone-300 hover:border-[#8B0000] rounded-xl flex items-center justify-center cursor-pointer bg-stone-50 hover:bg-red-50/20 text-stone-500 hover:text-[#8B0000] transition-colors gap-2 px-3 focus-within:ring-2 focus-within:ring-[#8B0000]/35"
                                >
                                    <FileImage className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{manualCheckScreenshot ? manualCheckScreenshot.name : 'Upload screenshot'}</span>
                                    <input 
                                        type="file" 
                                        id="screenshot-upload" 
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setManualCheckScreenshot(e.target.files[0])
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-stone-700">Additional notes</label>
                            <textarea
                                value={manualCheckNotes}
                                onChange={(e) => setManualCheckNotes(e.target.value)}
                                placeholder="Add appointment details, for example: available only to business travelers or professional proof required…"
                                className="w-full text-xs p-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#8B0000] min-h-[70px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t border-stone-100 pt-3 flex gap-2 justify-end">
                        <Button 
                            onClick={handleManualCheckSubmit}
                            className="bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-xl h-10 px-5 font-semibold text-xs"
                        >
                            Save manual check
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsManualCheckOpen(false)}
                            className="text-stone-500 rounded-xl h-10 px-4 text-xs hover:bg-stone-55"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Notify Registration Officer */}
            <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                            <span>Notify Registration Officer</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Send an immediate alert to a registration officer so they can begin booking the available appointment on the portal.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 text-xs">
                        {notifySlotDetails && (
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-blue-700 font-bold">
                                <span>Center: {notifySlotDetails.centerName}</span>
                                <span>Date: {notifySlotDetails.date}</span>
                                <span>Time: {notifySlotDetails.time.substring(0, 5)}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-700">Registration officer</label>
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
                            <label className="font-bold text-stone-700">Link to watchlist request</label>
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
                            <label className="font-bold text-stone-700">Alert message</label>
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
                            <span>Send alert</span>
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

            {/* Modal: View Screenshot Proof */}
            <Dialog open={isScreenshotViewOpen} onOpenChange={setIsScreenshotViewOpen}>
                <DialogContent className="max-w-xl rounded-2xl bg-white border border-stone-200 shadow-2xl p-6 font-sans" dir="ltr">
                    <DialogHeader className="border-b border-stone-100 pb-3">
                        <DialogTitle className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                            <FileImage className="h-5 w-5 text-[#8B0000]" />
                            <span>Appointment Screenshot Proof</span>
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-xs">
                            Screenshot attached as evidence of appointment availability at the center.
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
                            <p className="text-xs text-stone-400 py-8">No proof has been uploaded.</p>
                        )}
                    </div>

                    <DialogFooter className="pt-2 flex justify-end">
                        <Button 
                            variant="outline"
                            onClick={() => setIsScreenshotViewOpen(false)}
                            className="border-stone-200 hover:bg-stone-50 rounded-xl h-10 px-5 text-xs text-stone-600"
                        >
                            Close preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
