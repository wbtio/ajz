import type { Tables } from '@/lib/database.types'

type EventRow = Tables<'events'>

const HIDDEN_EVENT_TITLES = ['JEC World 2026']

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

export function isHiddenEvent(event: Pick<EventRow, 'title' | 'title_ar'> | null | undefined) {
  if (!event) return false

  const title = normalize(event.title)
  const titleAr = normalize(event.title_ar)

  return HIDDEN_EVENT_TITLES.some((hiddenTitle) => {
    const normalizedHiddenTitle = normalize(hiddenTitle)
    return title === normalizedHiddenTitle || titleAr === normalizedHiddenTitle
  })
}

export function filterVisibleEvents<T extends Pick<EventRow, 'title' | 'title_ar'>>(events: T[] | null | undefined) {
  return (events || []).filter((event) => !isHiddenEvent(event))
}
