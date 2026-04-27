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
        }
        Relationships: [
          {
            foreignKeyName: "events_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
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
      registrations: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          email: string | null
          event_id: string
          form_data: Json | null
          full_name: string | null
          id: string
          notes: string | null
          status: string | null
          ticket_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          email?: string | null
          event_id: string
          form_data?: Json | null
          full_name?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          ticket_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          email?: string | null
          event_id?: string
          form_data?: Json | null
          full_name?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          ticket_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
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
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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

// --- Custom Type Aliases ---
export type Event = Database['public']['Tables']['events']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Sector = Database['public']['Tables']['sectors']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type LinkItem = Database['public']['Tables']['links']['Row']
export type LinkCategory = Database['public']['Tables']['link_categories']['Row']
export type PartnerOpportunity = Database['public']['Tables']['partner_opportunities']['Row']
export type PartnerCategory = Database['public']['Tables']['partner_categories']['Row']
export type Training = Database['public']['Tables']['trainings']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
