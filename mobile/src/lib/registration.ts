/**
 * طبقة بيانات التسجيل الشامل بالفعالية — نموذج متعدد الخطوات + خدمات مدفوعة + وثائق.
 * يكتب على نفس جدول registrations في قاعدة بيانات الموقع (additional_data لحقول النموذج
 * الديناميكية، selected_services/total_amount/documents/current_step للخطوات الإضافية).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from './supabase';
import { useAuth } from './auth';
import type { EventRow, RegistrationRow } from './events';
import type { Json } from './database.types';

export type FormFieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';

export type FormField = {
  id: string;
  type: FormFieldType;
  label_ar: string;
  label_en: string;
  required: boolean;
  options?: string[];
  options_ar?: string[];
  placeholder_ar?: string;
};

/** يقرأ حقول التسجيل من registration_config، وإن كانت فاضية يجرّب conference_config.
 * إذا لم يجد أي حقول يرجّع مجموعة افتراضية حتى لا يواجه المستخدم برسالة "لا توجد حقول". */
export function getRegistrationFields(event: EventRow): FormField[] {
  // 1) registration_config مباشرة (مصفوفة حقول)
  const fromDirect = Array.isArray(event.registration_config) ? (event.registration_config as unknown as FormField[]) : [];
  if (fromDirect.length > 0) return fromDirect;

  // 2) conference_config → قسم registration → form_fields
  const conf = event.conference_config as Record<string, { form_fields?: FormField[] }> | null;
  if (conf) {
    // جرّب قسم registration أولاً
    const regFields = conf.registration?.form_fields;
    if (Array.isArray(regFields) && regFields.length > 0) return regFields;

    // لو ما في قسم registration، جرّب أي قسم فيه form_fields
    for (const section of Object.values(conf)) {
      if (Array.isArray(section?.form_fields) && section.form_fields.length > 0) {
        return section.form_fields;
      }
    }
  }

  // 3) حقول افتراضية — حتى لا يرى المستخدم رسالة "لا توجد حقول تسجيل"
  return DEFAULT_REGISTRATION_FIELDS;
}

const DEFAULT_REGISTRATION_FIELDS: FormField[] = [
  { id: 'full_name', type: 'text', label_ar: 'الاسم الكامل', label_en: 'Full Name', required: true, placeholder_ar: 'أدخل اسمك الكامل' },
  { id: 'email', type: 'email', label_ar: 'البريد الإلكتروني', label_en: 'Email', required: true, placeholder_ar: 'example@email.com' },
  { id: 'phone', type: 'text', label_ar: 'رقم الهاتف', label_en: 'Phone', required: true, placeholder_ar: '07XX XXX XXXX' },
  { id: 'company', type: 'text', label_ar: 'الشركة', label_en: 'Company', required: false, placeholder_ar: 'اسم الشركة' },
  { id: 'position', type: 'text', label_ar: 'المسمى الوظيفي', label_en: 'Position', required: false, placeholder_ar: 'المسمى الوظيفي' },
  { id: 'country', type: 'text', label_ar: 'الدولة', label_en: 'Country', required: false, placeholder_ar: 'الدولة' },
];

/**
 * أسعار الخدمات المساندة — مؤقتة وثابتة حتى تتوفّر بوّابة دفع حقيقية وجدول أسعار تأمين لكل دولة.
 * TODO: استبدال insuranceFee بجدول أسعار حسب الدولة، وربط بوّابة دفع فعلية بدل هذه القيم الثابتة.
 */
export const SERVICE_PRICING = {
  insurance: 75000,
  applicationHelp: 50000,
  appointmentBooking: 40000,
};

export type ServiceKey = 'ticket' | 'insurance' | 'applicationHelp' | 'appointmentBooking';

export type SelectedService = {
  key: ServiceKey;
  label: string;
  amount: number;
  meta?: Record<string, string>;
};

export type UploadedDocument = {
  name: string;
  path: string;
  uploadedAt: string;
};

async function fetchMyRegistration(userId: string, eventId: string): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useMyRegistration(eventId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['registration', eventId, user?.id],
    queryFn: () => fetchMyRegistration(user!.id, eventId),
    enabled: !!user?.id && !!eventId,
  });
}

type SaveStepInput = {
  registrationId?: string;
  eventId: string;
  step: number;
  fullName?: string;
  email?: string;
  additionalData?: Record<string, string>;
  selectedServices?: SelectedService[];
  totalAmount?: number;
  documents?: UploadedDocument[];
  status?: string;
  paymentStatus?: string;
};

export function useSaveRegistrationStep() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveStepInput): Promise<RegistrationRow> => {
      if (!user?.id) throw new Error('لا يوجد مستخدم مسجّل الدخول');

      const payload: Record<string, unknown> = { current_step: input.step };
      if (input.fullName !== undefined) payload.full_name = input.fullName;
      if (input.email !== undefined) payload.email = input.email;
      if (input.additionalData !== undefined) payload.additional_data = input.additionalData as Json;
      if (input.selectedServices !== undefined) payload.selected_services = input.selectedServices as unknown as Json;
      if (input.totalAmount !== undefined) payload.total_amount = input.totalAmount;
      if (input.documents !== undefined) payload.documents = input.documents as unknown as Json;
      if (input.status !== undefined) payload.status = input.status;
      if (input.paymentStatus !== undefined) payload.payment_status = input.paymentStatus;

      if (input.registrationId) {
        const { data, error } = await supabase
          .from('registrations')
          .update(payload)
          .eq('id', input.registrationId)
          .select('*')
          .single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('registrations')
        .insert({ ...payload, event_id: input.eventId, user_id: user.id, status: input.status ?? 'pending' })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registration', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
  });
}

export function useUploadDocument() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ eventId, asset }: { eventId: string; asset: ImagePicker.ImagePickerAsset }): Promise<UploadedDocument> => {
      if (!user?.id) throw new Error('لا يوجد مستخدم مسجّل الدخول');

      const ext = asset.fileName?.split('.').pop() || 'jpg';
      const path = `${user.id}/${eventId}/${Date.now()}.${ext}`;
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage.from('registration-documents').upload(path, blob, {
        contentType: asset.mimeType ?? 'image/jpeg',
        upsert: true,
      });
      if (error) throw error;

      return { name: asset.fileName ?? path.split('/').pop()!, path, uploadedAt: new Date().toISOString() };
    },
  });
}

export async function pickDocumentImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
}
