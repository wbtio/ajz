'use client'

import { Plus, Trash2, X, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FormField } from '@/lib/types'
import { COUNTRIES, IRAQ_GOVERNORATES } from '@/lib/location-options'

interface RegistrationFormBuilderProps {
    fields: FormField[]
    onChange: (fields: FormField[]) => void
}

export function RegistrationFormBuilder({ fields, onChange }: RegistrationFormBuilderProps) {
    const addField = () => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            label_en: '',
            label_ar: '',
            type: 'text',
            required: true,
        }
        onChange([...fields, newField])
    }

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id))
    }

    const updateField = (id: string, updates: Partial<FormField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Registration Form Fields</h3>
                <Button type="button" onClick={addField} size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                </Button>
            </div>

            <div className="space-y-3">
                {fields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-gray-500">No custom fields. The default name and email fields will be used.</p>
                    </div>
                ) : (
                    fields.map((field, index) => (
                        <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                <div className="md:col-span-1 flex items-center justify-center pt-2 text-gray-400">
                                    <span className="text-xs font-bold bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">{index + 1}</span>
                                </div>

                                <div className="md:col-span-7 space-y-2">
                                    <Label className="text-xs text-gray-500">Field Label</Label>
                                    <Input
                                        placeholder="e.g. Full Name"
                                        value={field.label_en}
                                        onChange={e => updateField(field.id, { label_en: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-2">
                                    <Label className="text-xs text-gray-500">Type and Properties</Label>
                                    <div className="flex gap-2">
                                        <select
                                            value={field.type}
                                            onChange={e => updateField(field.id, { type: e.target.value as FormField['type'] })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="text">Text</option>
                                            <option value="textarea">Long Text</option>
                                            <option value="number">Number</option>
                                            <option value="email">Email</option>
                                            <option value="date">Date</option>
                                            <option value="select">Dropdown</option>
                                        </select>

                                        <div className="flex items-center gap-1 px-2 border border-gray-300 rounded-lg">
                                            <input
                                                type="checkbox"
                                                id={`req_${field.id}`}
                                                checked={field.required}
                                                onChange={e => updateField(field.id, { required: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <Label htmlFor={`req_${field.id}`} className="text-[10px] cursor-pointer">Required</Label>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={() => removeField(field.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Options editor for select type */}
                            {field.type === 'select' && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                                            <ListPlus className="w-3.5 h-3.5" />
                                            Dropdown Options
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => updateField(field.id, { options: [...IRAQ_GOVERNORATES] })}
                                            className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors font-medium"
                                        >
                                            Iraq Governorates
                                        </button>
                                        <button type="button" onClick={() => updateField(field.id, { options: [...COUNTRIES] })} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium">
                                            Countries
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {(field.options || []).map((opt, optIdx) => (
                                            <span key={optIdx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                                {opt}
                                                <button type="button" onClick={() => {
                                                    const newOpts = [...(field.options || [])]
                                                    newOpts.splice(optIdx, 1)
                                                    updateField(field.id, { options: newOpts })
                                                }} className="text-blue-400 hover:text-red-500 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add an option..."
                                            dir="ltr"
                                            className="text-sm h-9"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    const val = (e.target as HTMLInputElement).value.trim()
                                                    if (val) {
                                                        updateField(field.id, { options: [...(field.options || []), val] });
                                                        (e.target as HTMLInputElement).value = ''
                                                    }
                                                }
                                            }}
                                        />
                                        <Button type="button" size="sm" variant="outline" className="h-9 text-xs shrink-0" onClick={(e) => {
                                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                                            const val = input?.value?.trim()
                                            if (val) {
                                                updateField(field.id, { options: [...(field.options || []), val] })
                                                input.value = ''
                                            }
                                        }}>
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
