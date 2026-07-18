export type Customer = {
  id: string
  full_name_as_passport: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  whatsapp_number?: string | null
  employer_name?: string | null
  job_title?: string | null
  department?: string | null
  workplace_type?: string | null
  work_address?: string | null
  work_city?: string | null
  work_governorate?: string | null
  work_phone?: string | null
  work_email?: string | null
  nationality?: string | null
  city?: string | null
  passport_number?: string | null
  passport_expiry_date?: string | null
  avatar_url?: string | null
  updated_at: string
  registrations?: CustomerRegistration[]
}

export type CustomerRegistration = {
  id: string
  case_number?: string | null
  current_step: number
  case_status?: string | null
  status?: string | null
  payment_status: string
  documents?: unknown
  additional_data?: Record<string, unknown> | null
  total_amount?: number
  updated_at?: string | null
  created_at?: string | null
  events?: { id: string; title?: string | null; title_ar?: string | null; date?: string | null; location?: string | null } | null
  assigned_employee?: { id: string; full_name?: string | null; avatar_url?: string | null } | null
}

export type CustomerEdit = {
  id: string
  registration_id: string
  field_label?: string | null
  new_value?: string | null
  edited_by?: string | null
  editor_user_id?: string | null
  created_at: string
}

export type CustomerAppointment = {
  id: string
  slot_date: string
  slot_time: string
  status: string
  updated_at: string
  assigned_registration_id: string | null
}
