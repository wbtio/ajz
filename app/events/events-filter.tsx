'use client'

import { useI18n } from '@/lib/i18n'
import type { Sector } from '@/lib/database.types'

interface EventsFilterProps {
  sectors: Sector[]
  uniqueCountries: string[]
  selectedSector: string
  setSelectedSector: (val: string) => void
  selectedCountry: string
  setSelectedCountry: (val: string) => void
  selectedMonth: string
  setSelectedMonth: (val: string) => void
  participationTypes: string[]
  setParticipationTypes: (types: string[]) => void
  onClear: () => void
}

export function EventsFilter({
  sectors,
  uniqueCountries,
  selectedSector,
  setSelectedSector,
  selectedCountry,
  setSelectedCountry,
  selectedMonth,
  setSelectedMonth,
  participationTypes,
  setParticipationTypes,
  onClear,
}: EventsFilterProps) {
  const { locale, dir } = useI18n()
  const isRTL = locale === 'ar'

  // Localized texts
  const labels = isRTL
    ? {
        filterTitle: 'تصفية الفعاليات',
        sectorLabel: 'القطاع الاستراتيجي',
        countryLabel: 'البلد / المنطقة',
        monthLabel: 'الشهر',
        participationLabel: 'نوع المشاركة',
        clearBtn: 'مسح الفلاتر',
        allSectors: 'كل القطاعات',
        allCountries: 'كل البلدان',
        allMonths: 'كل الأشهر',
        participationTypes: [
          { value: 'participation', label: 'مشاركة' },
          { value: 'speaker', label: 'متحدث' },
          { value: 'exhibitor', label: 'عارض' },
          { value: 'visitor', label: 'زائر' },
        ],
        months: [
          { value: '0', label: 'يناير' },
          { value: '1', label: 'فبراير' },
          { value: '2', label: 'مارس' },
          { value: '3', label: 'أبريل' },
          { value: '4', label: 'مايو' },
          { value: '5', label: 'يونيو' },
          { value: '6', label: 'يوليو' },
          { value: '7', label: 'أغسطس' },
          { value: '8', label: 'سبتمبر' },
          { value: '9', label: 'أكتوبر' },
          { value: '10', label: 'نوفمبر' },
          { value: '11', label: 'ديسمبر' },
        ],
      }
    : {
        filterTitle: 'Filter Events',
        sectorLabel: 'Strategic Sector',
        countryLabel: 'Country / Region',
        monthLabel: 'Month',
        participationLabel: 'Participation Type',
        clearBtn: 'Clear Filters',
        allSectors: 'All Sectors',
        allCountries: 'All Countries',
        allMonths: 'All Months',
        participationTypes: [
          { value: 'participation', label: 'Participation' },
          { value: 'speaker', label: 'Speaker' },
          { value: 'exhibitor', label: 'Exhibitor' },
          { value: 'visitor', label: 'Visitor' },
        ],
        months: [
          { value: '0', label: 'January' },
          { value: '1', label: 'February' },
          { value: '2', label: 'March' },
          { value: '3', label: 'April' },
          { value: '4', label: 'May' },
          { value: '5', label: 'June' },
          { value: '6', label: 'July' },
          { value: '7', label: 'August' },
          { value: '8', label: 'September' },
          { value: '9', label: 'October' },
          { value: '10', label: 'November' },
          { value: '11', label: 'December' },
        ],
      }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setParticipationTypes([...participationTypes, value])
    } else {
      setParticipationTypes(participationTypes.filter((t) => t !== value))
    }
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white" dir={dir}>
      <h2 className="font-bold text-lg mb-6 border-b border-gray-100 pb-3">
        {labels.filterTitle}
      </h2>

      {/* Sector Select */}
      <div className="mb-6">
        <label className="block font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">
          {labels.sectorLabel}
        </label>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="w-full border border-gray-300 rounded-[4px] py-2 px-3 text-sm text-gray-800 bg-white focus:border-[#001a33] focus:ring-0 focus:outline-none"
        >
          <option value="">{labels.allSectors}</option>
          {sectors.map((sec) => (
            <option key={sec.id} value={sec.slug}>
              {isRTL ? sec.name_ar || sec.name : sec.name || sec.name_ar}
            </option>
          ))}
        </select>
      </div>

      {/* Country Select */}
      <div className="mb-6">
        <label className="block font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">
          {labels.countryLabel}
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full border border-gray-300 rounded-[4px] py-2 px-3 text-sm text-gray-800 bg-white focus:border-[#001a33] focus:ring-0 focus:outline-none"
        >
          <option value="">{labels.allCountries}</option>
          {uniqueCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Month Select */}
      <div className="mb-6">
        <label className="block font-semibold text-xs text-gray-700 mb-2 uppercase tracking-wider">
          {labels.monthLabel}
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full border border-gray-300 rounded-[4px] py-2 px-3 text-sm text-gray-800 bg-white focus:border-[#001a33] focus:ring-0 focus:outline-none"
        >
          <option value="">{labels.allMonths}</option>
          {labels.months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Participation Type */}
      <div className="mb-8">
        <label className="block font-semibold text-xs text-gray-700 mb-4 uppercase tracking-wider">
          {labels.participationLabel}
        </label>
        <div className="space-y-3">
          {labels.participationTypes.map((type) => {
            const isChecked = participationTypes.includes(type.value)
            return (
              <label key={type.value} className="flex items-center text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(type.value, e.target.checked)}
                  className="rounded border-gray-300 text-[#001a33] focus:ring-0 focus:ring-offset-0 mr-3 rtl:mr-0 rtl:ml-3 h-4 w-4"
                />
                <span>{type.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        type="button"
        onClick={onClear}
        className="w-full text-xs text-gray-500 border border-gray-300 py-2 rounded-[4px] hover:bg-gray-50 transition-colors font-medium"
      >
        {labels.clearBtn}
      </button>
    </aside>
  )
}
