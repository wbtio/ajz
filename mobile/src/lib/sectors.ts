/**
 * طبقة بيانات التخصصات (القطاعات) والملف الشخصي — تقرأ/تكتب على نفس جداول الموقع.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';
import { useAuth } from './auth';
import type { Database } from './database.types';

export type SectorRow = Database['public']['Tables']['sectors']['Row'];
export type UserRow = Database['public']['Tables']['users']['Row'];

async function fetchSectors(): Promise<SectorRow[]> {
  const { data, error } = await supabase
    .from('sectors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function useSectors() {
  return useQuery({ queryKey: ['sectors'], queryFn: fetchSectors });
}

async function fetchProfile(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
  });
}

export type CompanyPosition = 'owner' | 'authorized_manager' | 'employee' | 'other';

export const COMPANY_POSITIONS: { value: CompanyPosition; label: string }[] = [
  { value: 'owner', label: 'مالك' },
  { value: 'authorized_manager', label: 'مدير مفوض' },
  { value: 'employee', label: 'موظف' },
  { value: 'other', label: 'آخر' },
];

export type ProfileFormData = {
  preferredSectorId: string;
  subSector: string;
  companyName: string;
  companyPosition: CompanyPosition;
  city: string;
  country: string;
};

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: ProfileFormData) => {
      if (!user?.id) throw new Error('لا يوجد مستخدم مسجّل الدخول');
      const { error } = await supabase
        .from('users')
        .update({
          preferred_sector_id: form.preferredSectorId,
          sub_sector: form.subSector,
          company_name: form.companyName,
          company_position: form.companyPosition,
          city: form.city,
          country: form.country,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function sectorName(s: SectorRow) {
  return s.name_ar || s.name_en || s.name;
}

/** الموقع يخزّن اسم أيقونة Lucide (مثل "Heart"، "Cpu") — نحوّلها لأقرب أيقونة Feather في التطبيق. */
const ICON_MAP: Record<string, string> = {
  Heart: 'heart',
  Cpu: 'cpu',
  Building2: 'briefcase',
  GraduationCap: 'book',
};

export function sectorIcon(s: SectorRow): string {
  return ICON_MAP[s.icon ?? ''] ?? 'grid';
}
