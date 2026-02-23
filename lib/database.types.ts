export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          subject: string | null
          category: string | null
          related_id: string | null
          related_title: string | null
          message: string
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          subject?: string | null
          category?: string | null
          related_id?: string | null
          related_title?: string | null
          message: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          category?: string | null
          related_id?: string | null
          related_title?: string | null
          message?: string
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          code: string
          flag_emoji: string | null
          region: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          code: string
          flag_emoji?: string | null
          region?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          code?: string
          flag_emoji?: string | null
          region?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string | null
          date: string
          description: string | null
          description_ar: string | null
          end_date: string | null
          event_type: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          location: string
          location_ar: string | null
          price: number | null
          show_price: boolean | null
          sector: string | null
          sector_id: string | null
          status: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          registration_config: Json | null
          format: Json | null
          awards: Json | null
          mentorship: string | null
          mentorship_ar: string | null
          coordinators: Json | null
          conference_config: Json | null
          country: string | null
          country_ar: string | null
          sub_sector: string | null
          sub_sector_ar: string | null
          html_content_url: string | null
          html_content: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          description_ar?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          location: string
          location_ar?: string | null
          price?: number | null
          show_price?: boolean | null
          sector?: string | null
          sector_id?: string | null
          status?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          registration_config?: Json | null
          format?: Json | null
          awards?: Json | null
          mentorship?: string | null
          mentorship_ar?: string | null
          coordinators?: Json | null
          conference_config?: Json | null
          country?: string | null
          country_ar?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          html_content_url?: string | null
          html_content?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          description_ar?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          location?: string
          location_ar?: string | null
          price?: number | null
          show_price?: boolean | null
          sector?: string | null
          sector_id?: string | null
          status?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          registration_config?: Json | null
          format?: Json | null
          awards?: Json | null
          mentorship?: string | null
          mentorship_ar?: string | null
          coordinators?: Json | null
          conference_config?: Json | null
          country?: string | null
          country_ar?: string | null
          sub_sector?: string | null
          sub_sector_ar?: string | null
          html_content_url?: string | null
          html_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          }
        ]
      }
      conference_submissions: {
        Row: {
          id: string
          event_id: string
          section_id: string | null
          section_slug: string
          user_id: string | null
          data: Json | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          section_id?: string | null
          section_slug?: string
          user_id?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          section_id?: string | null
          section_slug?: string
          user_id?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
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
            foreignKeyName: "conference_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      link_categories: {
        Row: {
          id: string
          title_ar: string
          title_en: string
          description_ar: string | null
          description_en: string | null
          icon: string | null
          color: string | null
          slug: string
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_ar: string
          title_en: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          slug: string
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_ar?: string
          title_en?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          slug?: string
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          id: string
          category_id: string | null
          country_id: string | null
          title_ar: string
          title_en: string
          description_ar: string | null
          description_en: string | null
          url: string
          link_type: string | null
          organization_type: string | null
          industry: string | null
          home_country: string | null
          icon: string | null
          color: string | null
          sort_order: number | null
          is_active: boolean | null
          is_verified: boolean | null
          last_checked_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          country_id?: string | null
          title_ar: string
          title_en: string
          description_ar?: string | null
          description_en?: string | null
          url: string
          link_type?: string | null
          organization_type?: string | null
          industry?: string | null
          home_country?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          country_id?: string | null
          title_ar?: string
          title_en?: string
          description_ar?: string | null
          description_en?: string | null
          url?: string
          link_type?: string | null
          organization_type?: string | null
          industry?: string | null
          home_country?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          }
        ]
      }
      partner_categories: {
        Row: {
          id: string
          title_ar: string
          title_en: string
          description_ar: string | null
          description_en: string | null
          icon: string | null
          color: string | null
          slug: string
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_ar: string
          title_en: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          slug: string
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_ar?: string
          title_en?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          slug?: string
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_opportunities: {
        Row: {
          id: string
          category_id: string
          title_ar: string
          title_en: string
          description_ar: string | null
          description_en: string | null
          icon: string | null
          color: string | null
          registration_config: Json | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          category_id: string
          title_ar: string
          title_en: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          registration_config?: Json | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          title_ar?: string
          title_en?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          color?: string | null
          registration_config?: Json | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_opportunities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "partner_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      partner_submissions: {
        Row: {
          id: string
          opportunity_id: string
          user_id: string | null
          data: Json | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          opportunity_id: string
          user_id?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          opportunity_id?: string
          user_id?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          }
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
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          status: string | null
          ticket_number: string | null
          additional_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          status?: string | null
          ticket_number?: string | null
          additional_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          ticket_number?: string | null
          additional_data?: Json | null
          updated_at?: string | null
          user_id?: string
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
      sector_registrations: {
        Row: {
          id: string
          sector_id: string
          user_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          data: Json | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sector_id: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sector_id?: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          data?: Json | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          }
        ]
      }
      sectors: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          long_description: string | null
          long_description_ar: string | null
          icon: string | null
          id: string
          image_url: string | null
          cover_image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          name_ar: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          registration_config: Json | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          long_description?: string | null
          long_description_ar?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          cover_image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          name_ar: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          long_description?: string | null
          long_description_ar?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          cover_image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          name_ar?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Event = Tables<"events">
export type Post = Tables<"posts">
export type Registration = Tables<"registrations">
export type Sector = Tables<"sectors">
export type Training = Tables<"trainings">
export type User = Tables<"users">
