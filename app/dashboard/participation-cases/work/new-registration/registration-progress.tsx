import { AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const REGISTRATION_STEPS = [
    { id: 1, label: 'Event', description: 'Choose the event' },
    { id: 2, label: 'Client', description: 'Find or create profile' },
    { id: 3, label: 'Application', description: 'Review client details' },
    { id: 4, label: 'Visa', description: 'Visa and appointment' },
    { id: 5, label: 'Documents', description: 'Upload and assemble' },
    { id: 6, label: 'Payment', description: 'Fees and receipt' },
    { id: 7, label: 'Delivery', description: 'Close and deliver' },
] as const

export function RegistrationProgress({
    activeStep,
    canOpenAll,
    stepStatus,
    onStepChange,
}: {
    activeStep: number
    canOpenAll: boolean
    stepStatus?: Partial<Record<number, 'complete' | 'warning'>>
    onStepChange: (step: number) => void
}) {
    return (
        <nav className="w-full overflow-x-auto jaz-no-scrollbar" aria-label="Application progress">
            <ol className="grid min-w-[560px] grid-cols-7 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                {REGISTRATION_STEPS.map((item) => {
                    const isCompleted = activeStep > item.id
                    const isActive = activeStep === item.id
                    const isAvailable = canOpenAll || isCompleted || isActive
                    const status = stepStatus?.[item.id] ?? (isCompleted ? 'complete' : 'warning')
                    // The list and the wizard both use current_step as the
                    // workflow source of truth. A previous step is complete
                    // even when its detailed validation status is warning.
                    const isStatusComplete = isCompleted || status === 'complete'

                    return (
                        <li key={item.id} className="border-r border-slate-200 last:border-r-0">
                            <button
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => isAvailable && onStepChange(item.id)}
                                aria-current={isActive ? 'step' : undefined}
                                className={cn(
                                    'flex h-10 w-full items-center justify-center gap-1.5 px-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B0000]/35 sm:gap-2 sm:px-2',
                                    isStatusComplete && !isActive && 'bg-emerald-50/60 hover:bg-emerald-50',
                                    !isStatusComplete && !isActive && isAvailable && 'bg-amber-50/70 hover:bg-amber-50',
                                    isActive && 'bg-[#8B0000] text-white',
                                    isAvailable && !isActive && !isCompleted && 'cursor-pointer hover:bg-slate-50',
                                    !isAvailable && 'cursor-not-allowed bg-white text-slate-400',
                                )}
                            >
                                <span className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold',
                                    isStatusComplete && !isActive && 'border-emerald-600 bg-emerald-600 text-white',
                                    !isStatusComplete && !isActive && isAvailable && 'border-amber-500 bg-amber-100 text-amber-700',
                                    isActive && 'border-white/35 bg-white text-[#8B0000]',
                                    !isActive && !isCompleted && isAvailable && 'border-slate-300 bg-white text-slate-700',
                                    !isAvailable && 'border-slate-200 bg-slate-50 text-slate-400',
                                )}>
                                    {isStatusComplete ? <Check className="size-3" strokeWidth={3} /> : <AlertTriangle className="size-3" strokeWidth={2.5} />}
                                </span>
                                <span className="min-w-0 truncate">
                                    <span title={item.description} className={cn('block truncate text-[10px] font-bold sm:text-[11px]', isStatusComplete && !isActive && 'text-emerald-800', !isStatusComplete && !isActive && isAvailable && 'text-amber-800', isActive && 'text-white')}>{item.label}</span>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
