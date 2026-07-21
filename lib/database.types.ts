export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_application_reviews: {
        Row: {
          created_at: string
          created_by: string | null
          file_names: Json
          id: string
          registration_id: string
          review: Json
          score: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_names?: Json
          id?: string
          registration_id: string
          review: Json
          score?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_names?: Json
          id?: string
          registration_id?: string
          review?: Json
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_application_reviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_application_reviews_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          path: string
          session_id: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          path: string
          session_id: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          path?: string
          session_id?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          doc_type: string
          file_url: string
          id: string
          label: string | null
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          doc_type: string
          file_url: string
          id?: string
          label?: string | null
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          doc_type?: string
          file_url?: string
          id?: string
          label?: string | null
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          action: string
          case_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
          performed_by_name: string | null
        }
        Insert: {
          action: string
          case_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Update: {
          action?: string
          case_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_events_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_invitations: {
        Row: {
          case_id: string
          created_at: string
          id: string
          invitation_number: string | null
          invitation_required: boolean | null
          invitation_type: string | null
          issue_date: string | null
          notes: string | null
          organizer_contact: string | null
          pdf_url: string | null
          request_date: string | null
          requested_from: string | null
          status: string | null
          travel_end_date: string | null
          travel_start_date: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          invitation_number?: string | null
          invitation_required?: boolean | null
          invitation_type?: string | null
          issue_date?: string | null
          notes?: string | null
          organizer_contact?: string | null
          pdf_url?: string | null
          request_date?: string | null
          requested_from?: string | null
          status?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          invitation_number?: string | null
          invitation_required?: boolean | null
          invitation_type?: string | null
          issue_date?: string | null
          notes?: string | null
          organizer_contact?: string | null
          pdf_url?: string | null
          request_date?: string | null
          requested_from?: string | null
          status?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_invitations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_payments: {
        Row: {
          amount_paid: number | null
          case_id: string
          created_at: string
          currency: string | null
          discount_amount: number | null
          discount_approved_by: string | null
          discount_reason: string | null
          final_price: number | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          receipt_number: string | null
          receipt_url: string | null
          received_by: string | null
          service_price: number | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          case_id: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          final_price?: number | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          received_by?: string | null
          service_price?: number | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          case_id?: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          final_price?: number | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          received_by?: string | null
          service_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_payments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_payments_discount_approved_by_fkey"
            columns: ["discount_approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_registrations: {
        Row: {
          account_email: string | null
          badge_name: string | null
          badge_number: string | null
          badge_pdf_url: string | null
          case_id: string
          company_name_used: string | null
          confirmation_email: string | null
          confirmation_number: string | null
          created_at: string
          id: string
          job_title_used: string | null
          notes: string | null
          registration_date: string | null
          registration_reference: string | null
          registration_type: string | null
          registration_website: string | null
          screenshot_url: string | null
          status: string | null
          updated_at: string
          visitor_category: string | null
        }
        Insert: {
          account_email?: string | null
          badge_name?: string | null
          badge_number?: string | null
          badge_pdf_url?: string | null
          case_id: string
          company_name_used?: string | null
          confirmation_email?: string | null
          confirmation_number?: string | null
          created_at?: string
          id?: string
          job_title_used?: string | null
          notes?: string | null
          registration_date?: string | null
          registration_reference?: string | null
          registration_type?: string | null
          registration_website?: string | null
          screenshot_url?: string | null
          status?: string | null
          updated_at?: string
          visitor_category?: string | null
        }
        Update: {
          account_email?: string | null
          badge_name?: string | null
          badge_number?: string | null
          badge_pdf_url?: string | null
          case_id?: string
          company_name_used?: string | null
          confirmation_email?: string | null
          confirmation_number?: string | null
          created_at?: string
          id?: string
          job_title_used?: string | null
          notes?: string | null
          registration_date?: string | null
          registration_reference?: string | null
          registration_type?: string | null
          registration_website?: string | null
          screenshot_url?: string | null
          status?: string | null
          updated_at?: string
          visitor_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_registrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_visas: {
        Row: {
          account_setup_complete: boolean | null
          application_start_date: string | null
          application_status: string | null
          appointment_booked: boolean | null
          appointment_pdf_url: string | null
          appointment_reference: string | null
          case_id: string
          created_at: string
          destination_country: string | null
          france_visas_account_status: string | null
          france_visas_number: string | null
          id: string
          insurance_amount: number | null
          insurance_company: string | null
          insurance_coverage_end: string | null
          insurance_coverage_start: string | null
          insurance_pdf_url: string | null
          insurance_policy_number: string | null
          notes: string | null
          tls_account_status: string | null
          tls_appointment_date: string | null
          tls_center: string | null
          updated_at: string
          visa_approved: boolean | null
          visa_decision_date: string | null
        }
        Insert: {
          account_setup_complete?: boolean | null
          application_start_date?: string | null
          application_status?: string | null
          appointment_booked?: boolean | null
          appointment_pdf_url?: string | null
          appointment_reference?: string | null
          case_id: string
          created_at?: string
          destination_country?: string | null
          france_visas_account_status?: string | null
          france_visas_number?: string | null
          id?: string
          insurance_amount?: number | null
          insurance_company?: string | null
          insurance_coverage_end?: string | null
          insurance_coverage_start?: string | null
          insurance_pdf_url?: string | null
          insurance_policy_number?: string | null
          notes?: string | null
          tls_account_status?: string | null
          tls_appointment_date?: string | null
          tls_center?: string | null
          updated_at?: string
          visa_approved?: boolean | null
          visa_decision_date?: string | null
        }
        Update: {
          account_setup_complete?: boolean | null
          application_start_date?: string | null
          application_status?: string | null
          appointment_booked?: boolean | null
          appointment_pdf_url?: string | null
          appointment_reference?: string | null
          case_id?: string
          created_at?: string
          destination_country?: string | null
          france_visas_account_status?: string | null
          france_visas_number?: string | null
          id?: string
          insurance_amount?: number | null
          insurance_company?: string | null
          insurance_coverage_end?: string | null
          insurance_coverage_start?: string | null
          insurance_pdf_url?: string | null
          insurance_policy_number?: string | null
          notes?: string | null
          tls_account_status?: string | null
          tls_appointment_date?: string | null
          tls_center?: string | null
          updated_at?: string
          visa_approved?: boolean | null
          visa_decision_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_visas_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "participation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          alt_phone: string | null
          city: string | null
          company_website: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          department: string | null
          email: string | null
          employer_name: string | null
          first_name: string | null
          follow_up_date: string | null
          full_address: string | null
          full_name_as_passport: string
          id: string
          imported_employee_name: string | null
          imported_source_date: string | null
          inquiry_reason: string | null
          jaz_sector: string | null
          job_title: string | null
          last_name: string | null
          linked_user_id: string | null
          marital_status: string | null
          national_id: string | null
          nationality: string | null
          notes: string | null
          other_residence_permit: Json | null
          passport_copy_url: string | null
          passport_expiry_date: string | null
          passport_history: Json | null
          passport_issue_date: string | null
          passport_number: string | null
          passport_place_of_issue: string | null
          passport_type: string | null
          phone: string | null
          place_of_birth: string | null
          preferred_contact_method: string | null
          previous_schengen_visa: boolean | null
          professional_specialty: string | null
          referred_by: string | null
          residence_country: string | null
          schengen_visas_last_5y: Json | null
          sex: string | null
          source_event_name: string | null
          source_note: string | null
          title_salutation: string | null
          updated_at: string
          whatsapp_number: string | null
          work_address: string | null
          work_city: string | null
          work_email: string | null
          work_governorate: string | null
          work_phone: string | null
          workplace_type: string | null
        }
        Insert: {
          alt_phone?: string | null
          city?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employer_name?: string | null
          first_name?: string | null
          follow_up_date?: string | null
          full_address?: string | null
          full_name_as_passport: string
          id?: string
          imported_employee_name?: string | null
          imported_source_date?: string | null
          inquiry_reason?: string | null
          jaz_sector?: string | null
          job_title?: string | null
          last_name?: string | null
          linked_user_id?: string | null
          marital_status?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          other_residence_permit?: Json | null
          passport_copy_url?: string | null
          passport_expiry_date?: string | null
          passport_history?: Json | null
          passport_issue_date?: string | null
          passport_number?: string | null
          passport_place_of_issue?: string | null
          passport_type?: string | null
          phone?: string | null
          place_of_birth?: string | null
          preferred_contact_method?: string | null
          previous_schengen_visa?: boolean | null
          professional_specialty?: string | null
          referred_by?: string | null
          residence_country?: string | null
          schengen_visas_last_5y?: Json | null
          sex?: string | null
          source_event_name?: string | null
          source_note?: string | null
          title_salutation?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          work_address?: string | null
          work_city?: string | null
          work_email?: string | null
          work_governorate?: string | null
          work_phone?: string | null
          workplace_type?: string | null
        }
        Update: {
          alt_phone?: string | null
          city?: string | null
          company_website?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employer_name?: string | null
          first_name?: string | null
          follow_up_date?: string | null
          full_address?: string | null
          full_name_as_passport?: string
          id?: string
          imported_employee_name?: string | null
          imported_source_date?: string | null
          inquiry_reason?: string | null
          jaz_sector?: string | null
          job_title?: string | null
          last_name?: string | null
          linked_user_id?: string | null
          marital_status?: string | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          other_residence_permit?: Json | null
          passport_copy_url?: string | null
          passport_expiry_date?: string | null
          passport_history?: Json | null
          passport_issue_date?: string | null
          passport_number?: string | null
          passport_place_of_issue?: string | null
          passport_type?: string | null
          phone?: string | null
          place_of_birth?: string | null
          preferred_contact_method?: string | null
          previous_schengen_visa?: boolean | null
          professional_specialty?: string | null
          referred_by?: string | null
          residence_country?: string | null
          schengen_visas_last_5y?: Json | null
          sex?: string | null
          source_event_name?: string | null
          source_note?: string | null
          title_salutation?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          work_address?: string | null
          work_city?: string | null
          work_email?: string | null
          work_governorate?: string | null
          work_phone?: string | null
          workplace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_sections: {
        Row: {
          color: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          event_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          registration_config: Json | null
          slug: string
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          event_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          registration_config?: Json | null
          slug: string
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          event_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          registration_config?: Json | null
          slug?: string
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conference_sections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      conference_submissions: {
        Row: {
          created_at: string | null
          data: Json | null
          event_id: string
          id: string
          section_id: string | null
          section_slug: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_id: string
          id?: string
          section_id?: string | null
          section_slug?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_id?: string
          id?: string
          section_id?: string | null
          section_slug?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conference_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conference_submissions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "conference_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conference_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          category: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          related_id: string | null
          related_title: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          related_id?: string | null
          related_title?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          related_id?: string | null
          related_title?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          region: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          region?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          region?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          created_at: string | null
          goal_id: string | null
          id: string
          user_input: string | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          user_input?: string | null
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          user_input?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      drift_events: {
        Row: {
          conference_config: Json | null
          country: string | null
          country_ar: string | null
          created_at: string | null
          date: string
          end_date: string | null
          event_type: string | null
          events_id: string | null
          id: string
          is_active: boolean | null
          location: string | null
          location_ar: string | null
          registration_config: Json | null
          sector: string | null
          sector_id: string | null
          sort_order: number | null
          status: string | null
          sub_sector: string | null
          sub_sector_ar: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conference_config?: Json | null
          country?: string | null
          country_ar?: string | null
          created_at?: string | null
          date: string
          end_date?: string | null
          event_type?: string | null
          events_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          location_ar?: string | null
          registration_config?: Json | null
          sector?: string | null
          sector_id?: string | null
          sort_order?: number | null
          status?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conference_config?: Json | null
          country?: string | null
          country_ar?: string | null
          created_at?: string | null
          date?: string
          end_date?: string | null
          event_type?: string | null
          events_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          location_ar?: string | null
          registration_config?: Json | null
          sector?: string | null
          sector_id?: string | null
          sort_order?: number | null
          status?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drift_events_events_id_fkey"
            columns: ["events_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drift_events_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drift_events_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_cache: {
        Row: {
          ai_relevance_score: number | null
          ai_sector: string | null
          ai_summary: string | null
          clean_text_for_ai: string | null
          created_at: string | null
          description: string | null
          duplicate_of: string | null
          event_id: string | null
          extracted_date: string | null
          extracted_email: string | null
          fingerprint: string | null
          fingerprint_source: string | null
          has_clear_organizer: boolean | null
          has_contact_info: boolean | null
          id: string
          official_url: string | null
          organizer_name: string | null
          recommended_action: string | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          search_session_id: number | null
          status: string | null
          title: string | null
        }
        Insert: {
          ai_relevance_score?: number | null
          ai_sector?: string | null
          ai_summary?: string | null
          clean_text_for_ai?: string | null
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          event_id?: string | null
          extracted_date?: string | null
          extracted_email?: string | null
          fingerprint?: string | null
          fingerprint_source?: string | null
          has_clear_organizer?: boolean | null
          has_contact_info?: boolean | null
          id?: string
          official_url?: string | null
          organizer_name?: string | null
          recommended_action?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_session_id?: number | null
          status?: string | null
          title?: string | null
        }
        Update: {
          ai_relevance_score?: number | null
          ai_sector?: string | null
          ai_summary?: string | null
          clean_text_for_ai?: string | null
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          event_id?: string | null
          extracted_date?: string | null
          extracted_email?: string | null
          fingerprint?: string | null
          fingerprint_source?: string | null
          has_clear_organizer?: boolean | null
          has_contact_info?: boolean | null
          id?: string
          official_url?: string | null
          organizer_name?: string | null
          recommended_action?: string | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          search_session_id?: number | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_cache_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_cache_search_session_id_fkey"
            columns: ["search_session_id"]
            isOneToOne: false
            referencedRelation: "search_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          awards: Json | null
          capacity: number | null
          conference_config: Json | null
          coordinators: Json | null
          country: string | null
          country_ar: string | null
          created_at: string | null
          date: string
          description: string | null
          description_ar: string | null
          end_date: string | null
          event_type: string | null
          featured: boolean | null
          format: Json | null
          html_content: string | null
          html_content_url: string | null
          id: string
          image_url: string | null
          location: string
          location_ar: string | null
          mentorship: string | null
          mentorship_ar: string | null
          price: number | null
          registration_config: Json | null
          sector: string | null
          sector_id: string | null
          show_price: boolean | null
          status: string | null
          sub_sector: string | null
          sub_sector_ar: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          awards?: Json | null
          capacity?: number | null
          conference_config?: Json | null
          coordinators?: Json | null
          country?: string | null
          country_ar?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          description_ar?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          format?: Json | null
          html_content?: string | null
          html_content_url?: string | null
          id?: string
          image_url?: string | null
          location: string
          location_ar?: string | null
          mentorship?: string | null
          mentorship_ar?: string | null
          price?: number | null
          registration_config?: Json | null
          sector?: string | null
          sector_id?: string | null
          show_price?: boolean | null
          status?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          awards?: Json | null
          capacity?: number | null
          conference_config?: Json | null
          coordinators?: Json | null
          country?: string | null
          country_ar?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          description_ar?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          format?: Json | null
          html_content?: string | null
          html_content_url?: string | null
          id?: string
          image_url?: string | null
          location?: string
          location_ar?: string | null
          mentorship?: string | null
          mentorship_ar?: string | null
          price?: number | null
          registration_config?: Json | null
          sector?: string | null
          sector_id?: string | null
          show_price?: boolean | null
          status?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fingerprints: {
        Row: {
          created_at: string | null
          event_id: string | null
          fingerprint: string
          fingerprint_source: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          fingerprint: string
          fingerprint_source?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          fingerprint?: string
          fingerprint_source?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          current_points: number | null
          id: string
          status: string | null
          target_points: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          current_points?: number | null
          id?: string
          status?: string | null
          target_points?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          current_points?: number | null
          id?: string
          status?: string | null
          target_points?: number | null
          title?: string
        }
        Relationships: []
      }
      imported_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          end_date: string | null
          event_name: string
          event_type: string | null
          id: string
          sector: string | null
          source_file_name: string | null
          start_date: string | null
          venue: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          end_date?: string | null
          event_name: string
          event_type?: string | null
          id?: string
          sector?: string | null
          source_file_name?: string | null
          start_date?: string | null
          venue?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          end_date?: string | null
          event_name?: string
          event_type?: string | null
          id?: string
          sector?: string | null
          source_file_name?: string | null
          start_date?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      link_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          category_id: string | null
          color: string | null
          country_id: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          home_country: string | null
          icon: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          is_verified: boolean | null
          last_checked_at: string | null
          link_type: string | null
          organization_type: string | null
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          country_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          home_country?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          link_type?: string | null
          organization_type?: string | null
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category_id?: string | null
          color?: string | null
          country_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          home_country?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          link_type?: string | null
          organization_type?: string | null
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "link_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          task_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "team_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      participation_cases: {
        Row: {
          assigned_employee_id: string | null
          branch: string | null
          campaign_name: string | null
          case_number: string
          client_id: string
          closed_at: string | null
          closure_reason: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          discount_amount: number | null
          discount_approved_by: string | null
          discount_reason: string | null
          event_id: string
          final_price: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          service_package: string | null
          service_price: number | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          branch?: string | null
          campaign_name?: string | null
          case_number: string
          client_id: string
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          event_id: string
          final_price?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          service_package?: string | null
          service_price?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          branch?: string | null
          campaign_name?: string | null
          case_number?: string
          client_id?: string
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          event_id?: string
          final_price?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          service_package?: string | null
          service_price?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participation_cases_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_cases_discount_approved_by_fkey"
            columns: ["discount_approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_cases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_categories: {
        Row: {
          color: string | null
          contact_email: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          registration_config: Json | null
          slug: string
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          contact_email?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          registration_config?: Json | null
          slug: string
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          contact_email?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          registration_config?: Json | null
          slug?: string
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_opportunities: {
        Row: {
          category_id: string | null
          color: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          registration_config: Json | null
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          registration_config?: Json | null
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          registration_config?: Json | null
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_opportunities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "partner_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_submissions: {
        Row: {
          category_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          opportunity_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          opportunity_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          opportunity_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "partner_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_submissions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "partner_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          content_ar: string | null
          created_at: string | null
          excerpt: string | null
          excerpt_ar: string | null
          featured_image_url: string | null
          id: string
          image_url: string | null
          keywords: string[] | null
          published_at: string | null
          reading_time: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          title: string
          title_ar: string | null
          type: string | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_ar?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          title: string
          title_ar?: string | null
          type?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_ar?: string | null
          created_at?: string | null
          excerpt?: string | null
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          title?: string
          title_ar?: string | null
          type?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_edits: {
        Row: {
          created_at: string
          edited_by: string
          editor_user_id: string | null
          field_key: string
          field_label: string | null
          id: string
          new_value: string | null
          old_value: string | null
          registration_id: string
        }
        Insert: {
          created_at?: string
          edited_by?: string
          editor_user_id?: string | null
          field_key: string
          field_label?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          registration_id: string
        }
        Update: {
          created_at?: string
          edited_by?: string
          editor_user_id?: string | null
          field_key?: string
          field_label?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_edits_editor_user_id_fkey"
            columns: ["editor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_edits_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_events: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
          performed_by_name: string | null
          registration_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
          registration_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_events_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_events_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          additional_data: Json | null
          assigned_employee_id: string | null
          campaign_name: string | null
          case_number: string | null
          case_source: string | null
          case_status: string | null
          client_id: string | null
          client_snapshot: Json | null
          created_at: string | null
          current_step: number
          documents: Json
          email: string | null
          embassy_application: Json | null
          event_id: string
          form_data: Json | null
          full_name: string | null
          id: string
          notes: string | null
          payment_status: string
          selected_services: Json
          status: string | null
          ticket_number: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          assigned_employee_id?: string | null
          campaign_name?: string | null
          case_number?: string | null
          case_source?: string | null
          case_status?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          created_at?: string | null
          current_step?: number
          documents?: Json
          email?: string | null
          embassy_application?: Json | null
          event_id: string
          form_data?: Json | null
          full_name?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          selected_services?: Json
          status?: string | null
          ticket_number?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          assigned_employee_id?: string | null
          campaign_name?: string | null
          case_number?: string | null
          case_source?: string | null
          case_status?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          created_at?: string | null
          current_step?: number
          documents?: Json
          email?: string | null
          embassy_application?: Json | null
          event_id?: string
          form_data?: Json | null
          full_name?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          selected_services?: Json
          status?: string | null
          ticket_number?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_actions: {
        Row: {
          action: string
          created_at: string | null
          event_cache_id: string | null
          id: string
          notes: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          event_cache_id?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          event_cache_id?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_actions_event_cache_id_fkey"
            columns: ["event_cache_id"]
            isOneToOne: false
            referencedRelation: "event_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_sessions: {
        Row: {
          country: string | null
          created_at: string | null
          created_by: string | null
          date_range_end: string | null
          date_range_start: string | null
          event_type: string | null
          id: number
          keywords: string | null
          sector: string | null
          status: string | null
          total_events_found: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          event_type?: string | null
          id?: number
          keywords?: string | null
          sector?: string | null
          status?: string | null
          total_events_found?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          event_type?: string | null
          id?: number
          keywords?: string | null
          sector?: string | null
          status?: string | null
          total_events_found?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "search_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_registrations: {
        Row: {
          created_at: string | null
          data: Json | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          sector_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_registrations_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          color: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          long_description: string | null
          long_description_ar: string | null
          name: string
          name_ar: string
          name_en: string | null
          registration_config: Json | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          long_description?: string | null
          long_description_ar?: string | null
          name: string
          name_ar: string
          name_en?: string | null
          registration_config?: Json | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          long_description?: string | null
          long_description_ar?: string | null
          name?: string
          name_ar?: string
          name_en?: string | null
          registration_config?: Json | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sub_layers: {
        Row: {
          completed_count: number | null
          created_at: string | null
          frequency: string | null
          goal_id: string | null
          id: string
          importance_weight: number | null
          task_description: string
        }
        Insert: {
          completed_count?: number | null
          created_at?: string | null
          frequency?: string | null
          goal_id?: string | null
          id?: string
          importance_weight?: number | null
          task_description: string
        }
        Update: {
          completed_count?: number | null
          created_at?: string | null
          frequency?: string | null
          goal_id?: string | null
          id?: string
          importance_weight?: number | null
          task_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_layers_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_annotation: Json | null
          image_url: string | null
          modification_type: string
          page: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_annotation?: Json | null
          image_url?: string | null
          modification_type: string
          page: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_annotation?: Json | null
          image_url?: string | null
          modification_type?: string
          page?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_tasks: {
        Row: {
          assignee: string | null
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          recurrence: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee?: string | null
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recurrence?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee?: string | null
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recurrence?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          capacity: number | null
          content: Json | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          duration: string | null
          end_date: string | null
          id: string
          image_url: string | null
          instructor: string | null
          instructor_ar: string | null
          level: string | null
          price: number | null
          start_date: string | null
          status: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          instructor_ar?: string | null
          level?: string | null
          price?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          instructor_ar?: string | null
          level?: string | null
          price?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          company_position: string | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          notified_types: string[]
          permissions: string[] | null
          phone: string | null
          preferred_sector_id: string | null
          role: string | null
          sub_sector: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          company_position?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          notified_types?: string[]
          permissions?: string[] | null
          phone?: string | null
          preferred_sector_id?: string | null
          role?: string | null
          sub_sector?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          company_position?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          notified_types?: string[]
          permissions?: string[] | null
          phone?: string | null
          preferred_sector_id?: string | null
          role?: string | null
          sub_sector?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_preferred_sector_id_fkey"
            columns: ["preferred_sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_availability_logs: {
        Row: {
          action: string
          center_id: string
          created_at: string
          id: string
          performed_by: string | null
          performed_by_name: string
          registration_id: string | null
          screenshot_url: string | null
        }
        Insert: {
          action: string
          center_id: string
          created_at?: string
          id?: string
          performed_by?: string | null
          performed_by_name: string
          registration_id?: string | null
          screenshot_url?: string | null
        }
        Update: {
          action?: string
          center_id?: string
          created_at?: string
          id?: string
          performed_by?: string | null
          performed_by_name?: string
          registration_id?: string | null
          screenshot_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_availability_logs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "visa_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_availability_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_availability_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_availability_slots: {
        Row: {
          assigned_registration_id: string | null
          center_id: string
          created_at: string
          id: string
          slot_date: string
          slot_time: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_registration_id?: string | null
          center_id: string
          created_at?: string
          id?: string
          slot_date: string
          slot_time: string
          status: string
          updated_at?: string
        }
        Update: {
          assigned_registration_id?: string | null
          center_id?: string
          created_at?: string
          id?: string
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_availability_slots_assigned_registration_id_fkey"
            columns: ["assigned_registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_availability_slots_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "visa_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_centers: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          last_updated: string
          name: string
          service: string
          updated_by: string | null
          updated_by_name: string | null
          visa_category: string
          visa_type: string
          website_url: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          last_updated?: string
          name: string
          service?: string
          updated_by?: string | null
          updated_by_name?: string | null
          visa_category: string
          visa_type: string
          website_url?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          last_updated?: string
          name?: string
          service?: string
          updated_by?: string | null
          updated_by_name?: string | null
          visa_category?: string
          visa_type?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_centers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_staff_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Helper exports for commonly used table types
export type Event = Tables<'events'>
export type Sector = Tables<'sectors'>
export type User = Tables<'users'>
export type Post = Tables<'posts'>
export type Registration = Tables<'registrations'>
