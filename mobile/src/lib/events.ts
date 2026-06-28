/**
 * طبقة بيانات الفعاليات — تقرأ من نفس جدول events في قاعدة بيانات الموقع.
 */
import { useQuery } from '@tanstack/react-query';

import { supabase } from './supabase';
import type { Database } from './database.types';

export type EventRow = Database['public']['Tables']['events']['Row'];

async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: fetchEvents });
}

async function fetchEvent(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export function useEvent(id: string) {
  return useQuery({ queryKey: ['event', id], queryFn: () => fetchEvent(id), enabled: !!id });
}

/** العنوان والموقع بالعربية مع fallback للإنجليزية */
export function eventTitle(e: EventRow) {
  return e.title_ar || e.title;
}
export function eventLocation(e: EventRow) {
  return e.location_ar || e.location || e.country_ar || e.country || '';
}
