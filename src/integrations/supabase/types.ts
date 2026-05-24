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
      appeal_outcomes: {
        Row: {
          appeal_type: string
          carrier: string | null
          county: string | null
          created_at: string
          denial_reason: string | null
          estimated_savings: number | null
          id: string
          outcome: string
        }
        Insert: {
          appeal_type?: string
          carrier?: string | null
          county?: string | null
          created_at?: string
          denial_reason?: string | null
          estimated_savings?: number | null
          id?: string
          outcome?: string
        }
        Update: {
          appeal_type?: string
          carrier?: string | null
          county?: string | null
          created_at?: string
          denial_reason?: string | null
          estimated_savings?: number | null
          id?: string
          outcome?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          address: string | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          county: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          is_active: boolean | null
          is_free: boolean | null
          location_name: string
          organizer: string | null
          registration_required: boolean | null
          registration_url: string | null
          start_time: string | null
          state: string
          tags: string[] | null
          title: string
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          county: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          location_name: string
          organizer?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          start_time?: string | null
          state?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          location_name?: string
          organizer?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          start_time?: string | null
          state?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          category: string
          county: string | null
          created_at: string
          description: string
          id: string
          place_slug: string | null
          status: string
          zipcode: string | null
        }
        Insert: {
          category?: string
          county?: string | null
          created_at?: string
          description: string
          id?: string
          place_slug?: string | null
          status?: string
          zipcode?: string | null
        }
        Update: {
          category?: string
          county?: string | null
          created_at?: string
          description?: string
          id?: string
          place_slug?: string | null
          status?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      community_resources: {
        Row: {
          accepts_insurance: boolean | null
          address: string | null
          city: string
          county: string
          created_at: string
          description: string | null
          eligibility_notes: string | null
          hours: string | null
          id: string
          is_24_7: boolean | null
          is_active: boolean | null
          is_free: boolean | null
          is_open_now: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          no_id_required: boolean | null
          on_bus_line: boolean | null
          organization: string | null
          phone: string | null
          resource_name: string
          resource_type: string
          services_offered: string[] | null
          state: string
          updated_at: string
          walk_in_available: boolean | null
          website: string | null
          zip: string | null
        }
        Insert: {
          accepts_insurance?: boolean | null
          address?: string | null
          city: string
          county: string
          created_at?: string
          description?: string | null
          eligibility_notes?: string | null
          hours?: string | null
          id?: string
          is_24_7?: boolean | null
          is_active?: boolean | null
          is_free?: boolean | null
          is_open_now?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          no_id_required?: boolean | null
          on_bus_line?: boolean | null
          organization?: string | null
          phone?: string | null
          resource_name: string
          resource_type: string
          services_offered?: string[] | null
          state?: string
          updated_at?: string
          walk_in_available?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          accepts_insurance?: boolean | null
          address?: string | null
          city?: string
          county?: string
          created_at?: string
          description?: string | null
          eligibility_notes?: string | null
          hours?: string | null
          id?: string
          is_24_7?: boolean | null
          is_active?: boolean | null
          is_free?: boolean | null
          is_open_now?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          no_id_required?: boolean | null
          on_bus_line?: boolean | null
          organization?: string | null
          phone?: string | null
          resource_name?: string
          resource_type?: string
          services_offered?: string[] | null
          state?: string
          updated_at?: string
          walk_in_available?: boolean | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      dataset_registry: {
        Row: {
          cache_ttl_hours: number
          category: string | null
          column_map: Json
          created_at: string
          dataset_id: string
          description: string | null
          domain: string
          fips_column: string | null
          geographic_level: string | null
          id: string
          is_active: boolean
          layer_id: number | null
          name: string
          platform: string
          slug: string
          state_fips: string | null
          updated_at: string
        }
        Insert: {
          cache_ttl_hours?: number
          category?: string | null
          column_map?: Json
          created_at?: string
          dataset_id: string
          description?: string | null
          domain: string
          fips_column?: string | null
          geographic_level?: string | null
          id?: string
          is_active?: boolean
          layer_id?: number | null
          name: string
          platform: string
          slug: string
          state_fips?: string | null
          updated_at?: string
        }
        Update: {
          cache_ttl_hours?: number
          category?: string | null
          column_map?: Json
          created_at?: string
          dataset_id?: string
          description?: string | null
          domain?: string
          fips_column?: string | null
          geographic_level?: string | null
          id?: string
          is_active?: boolean
          layer_id?: number | null
          name?: string
          platform?: string
          slug?: string
          state_fips?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          accepting_new_patients: boolean | null
          address: string
          city: string
          county: string
          created_at: string
          digital_capabilities: Json | null
          facility_type: string
          hours: string | null
          id: string
          insurance_accepted: string[] | null
          is_blue_distinction: boolean | null
          is_magnet: boolean | null
          joint_commission: boolean | null
          languages: string[] | null
          latitude: number
          leapfrog_grade: string | null
          longitude: number
          name: string
          phone: string | null
          public_transit: boolean | null
          quality_score: number | null
          services: string[] | null
          specialties: string[] | null
          state: string
          system_affiliation: string | null
          telehealth_available: boolean | null
          updated_at: string
          walk_in: boolean | null
          website: string | null
          wheelchair_accessible: boolean | null
          zip: string
        }
        Insert: {
          accepting_new_patients?: boolean | null
          address: string
          city: string
          county: string
          created_at?: string
          digital_capabilities?: Json | null
          facility_type?: string
          hours?: string | null
          id?: string
          insurance_accepted?: string[] | null
          is_blue_distinction?: boolean | null
          is_magnet?: boolean | null
          joint_commission?: boolean | null
          languages?: string[] | null
          latitude: number
          leapfrog_grade?: string | null
          longitude: number
          name: string
          phone?: string | null
          public_transit?: boolean | null
          quality_score?: number | null
          services?: string[] | null
          specialties?: string[] | null
          state?: string
          system_affiliation?: string | null
          telehealth_available?: boolean | null
          updated_at?: string
          walk_in?: boolean | null
          website?: string | null
          wheelchair_accessible?: boolean | null
          zip: string
        }
        Update: {
          accepting_new_patients?: boolean | null
          address?: string
          city?: string
          county?: string
          created_at?: string
          digital_capabilities?: Json | null
          facility_type?: string
          hours?: string | null
          id?: string
          insurance_accepted?: string[] | null
          is_blue_distinction?: boolean | null
          is_magnet?: boolean | null
          joint_commission?: boolean | null
          languages?: string[] | null
          latitude?: number
          leapfrog_grade?: string | null
          longitude?: number
          name?: string
          phone?: string | null
          public_transit?: boolean | null
          quality_score?: number | null
          services?: string[] | null
          specialties?: string[] | null
          state?: string
          system_affiliation?: string | null
          telehealth_available?: boolean | null
          updated_at?: string
          walk_in?: boolean | null
          website?: string | null
          wheelchair_accessible?: boolean | null
          zip?: string
        }
        Relationships: []
      }
      financial_programs: {
        Row: {
          application_url: string | null
          coverage_area: string | null
          created_at: string
          description: string | null
          eligibility_criteria: Json | null
          fpl_threshold: number | null
          how_to_apply: string | null
          id: string
          is_active: boolean | null
          organization: string | null
          phone: string | null
          program_name: string
          program_type: string
          services_covered: string[] | null
        }
        Insert: {
          application_url?: string | null
          coverage_area?: string | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          fpl_threshold?: number | null
          how_to_apply?: string | null
          id?: string
          is_active?: boolean | null
          organization?: string | null
          phone?: string | null
          program_name: string
          program_type: string
          services_covered?: string[] | null
        }
        Update: {
          application_url?: string | null
          coverage_area?: string | null
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          fpl_threshold?: number | null
          how_to_apply?: string | null
          id?: string
          is_active?: boolean | null
          organization?: string | null
          phone?: string | null
          program_name?: string
          program_type?: string
          services_covered?: string[] | null
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          audience: string
          created_at: string
          geo: string
          id: string
          text: string
          topic: string
        }
        Insert: {
          audience?: string
          created_at?: string
          geo?: string
          id?: string
          text: string
          topic: string
        }
        Update: {
          audience?: string
          created_at?: string
          geo?: string
          id?: string
          text?: string
          topic?: string
        }
        Relationships: []
      }
      ingestion_cache: {
        Row: {
          data: Json
          dataset_id: string
          id: string
          ingested_at: string
          source_id: string
        }
        Insert: {
          data?: Json
          dataset_id: string
          id?: string
          ingested_at?: string
          source_id: string
        }
        Update: {
          data?: Json
          dataset_id?: string
          id?: string
          ingested_at?: string
          source_id?: string
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          dataset_id: string
          error_message: string | null
          finished_at: string | null
          id: string
          records_fetched: number | null
          records_upserted: number | null
          started_at: string
          status: string
        }
        Insert: {
          dataset_id: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          records_fetched?: number | null
          records_upserted?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          dataset_id?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          records_fetched?: number | null
          records_upserted?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          council_agenda_url: string | null
          council_minutes_url: string | null
          county: string
          created_at: string
          foia_contact_email: string | null
          foia_policy_url: string | null
          foia_portal_url: string | null
          id: string
          meeting_location: string | null
          meeting_schedule: string | null
          municipality_type: string
          name: string
          population: number | null
          property_tax_rate: number | null
          safety_response_avg: number | null
          state_avg_safety_response: number | null
          state_avg_tax_rate: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          council_agenda_url?: string | null
          council_minutes_url?: string | null
          county: string
          created_at?: string
          foia_contact_email?: string | null
          foia_policy_url?: string | null
          foia_portal_url?: string | null
          id?: string
          meeting_location?: string | null
          meeting_schedule?: string | null
          municipality_type?: string
          name: string
          population?: number | null
          property_tax_rate?: number | null
          safety_response_avg?: number | null
          state_avg_safety_response?: number | null
          state_avg_tax_rate?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          council_agenda_url?: string | null
          council_minutes_url?: string | null
          county?: string
          created_at?: string
          foia_contact_email?: string | null
          foia_policy_url?: string | null
          foia_portal_url?: string | null
          id?: string
          meeting_location?: string | null
          meeting_schedule?: string | null
          municipality_type?: string
          name?: string
          population?: number | null
          property_tax_rate?: number | null
          safety_response_avg?: number | null
          state_avg_safety_response?: number | null
          state_avg_tax_rate?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      page_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_helpful: boolean
          page_path: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful: boolean
          page_path: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful?: boolean
          page_path?: string
        }
        Relationships: []
      }
      partnership_submissions: {
        Row: {
          city: string | null
          contact_email: string
          contact_name: string
          county: string | null
          description: string
          id: string
          organization_name: string
          organization_type: string
          phone: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          services_offered: string[] | null
          status: string
          submitted_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          contact_email: string
          contact_name: string
          county?: string | null
          description: string
          id?: string
          organization_name: string
          organization_type?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          services_offered?: string[] | null
          status?: string
          submitted_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string
          contact_name?: string
          county?: string | null
          description?: string
          id?: string
          organization_name?: string
          organization_type?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          services_offered?: string[] | null
          status?: string
          submitted_at?: string
          website?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          accepting_new_patients: boolean | null
          board_certified: boolean | null
          created_at: string
          facility_id: string | null
          first_name: string
          gender: string | null
          id: string
          languages: string[] | null
          last_name: string
          medical_school: string | null
          patient_rating: number | null
          photo_url: string | null
          specialty: string
          subspecialty: string | null
          telehealth_available: boolean | null
          title: string | null
          years_experience: number | null
        }
        Insert: {
          accepting_new_patients?: boolean | null
          board_certified?: boolean | null
          created_at?: string
          facility_id?: string | null
          first_name: string
          gender?: string | null
          id?: string
          languages?: string[] | null
          last_name: string
          medical_school?: string | null
          patient_rating?: number | null
          photo_url?: string | null
          specialty: string
          subspecialty?: string | null
          telehealth_available?: boolean | null
          title?: string | null
          years_experience?: number | null
        }
        Update: {
          accepting_new_patients?: boolean | null
          board_certified?: boolean | null
          created_at?: string
          facility_id?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          languages?: string[] | null
          last_name?: string
          medical_school?: string | null
          patient_rating?: number | null
          photo_url?: string | null
          specialty?: string
          subspecialty?: string | null
          telehealth_available?: boolean | null
          title?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_metrics: {
        Row: {
          data_source: string | null
          facility_id: string
          id: string
          metric_name: string
          metric_type: string
          national_average: number | null
          period: string | null
          state_average: number | null
          unit: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          data_source?: string | null
          facility_id: string
          id?: string
          metric_name: string
          metric_type: string
          national_average?: number | null
          period?: string | null
          state_average?: number | null
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          data_source?: string | null
          facility_id?: string
          id?: string
          metric_name?: string
          metric_type?: string
          national_average?: number | null
          period?: string | null
          state_average?: number | null
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_metrics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_ratings: {
        Row: {
          comment: string | null
          county: string | null
          created_at: string
          id: string
          rating: number
          resource_id: string
          resource_type: string
        }
        Insert: {
          comment?: string | null
          county?: string | null
          created_at?: string
          id?: string
          rating: number
          resource_id: string
          resource_type?: string
        }
        Update: {
          comment?: string | null
          county?: string | null
          created_at?: string
          id?: string
          rating?: number
          resource_id?: string
          resource_type?: string
        }
        Relationships: []
      }
      resource_submissions: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string
          contact_name: string
          county: string | null
          description: string
          id: string
          is_free: boolean | null
          languages: string[] | null
          organization_name: string
          phone: string | null
          resource_type: string
          reviewed_at: string | null
          services_offered: string[] | null
          status: string
          submitted_at: string
          walk_in_available: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email: string
          contact_name: string
          county?: string | null
          description: string
          id?: string
          is_free?: boolean | null
          languages?: string[] | null
          organization_name: string
          phone?: string | null
          resource_type?: string
          reviewed_at?: string | null
          services_offered?: string[] | null
          status?: string
          submitted_at?: string
          walk_in_available?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_name?: string
          county?: string | null
          description?: string
          id?: string
          is_free?: boolean | null
          languages?: string[] | null
          organization_name?: string
          phone?: string | null
          resource_type?: string
          reviewed_at?: string | null
          services_offered?: string[] | null
          status?: string
          submitted_at?: string
          walk_in_available?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          corrected_to: string | null
          created_at: string
          had_correction: boolean | null
          id: string
          result_count: number | null
          search_source: string
          search_term: string
        }
        Insert: {
          corrected_to?: string | null
          created_at?: string
          had_correction?: boolean | null
          id?: string
          result_count?: number | null
          search_source?: string
          search_term: string
        }
        Update: {
          corrected_to?: string | null
          created_at?: string
          had_correction?: boolean | null
          id?: string
          result_count?: number | null
          search_source?: string
          search_term?: string
        }
        Relationships: []
      }
    }
    Views: {
      community_events_public: {
        Row: {
          address: string | null
          city: string | null
          county: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string | null
          event_type: string | null
          id: string | null
          is_active: boolean | null
          is_free: boolean | null
          location_name: string | null
          organizer: string | null
          registration_required: boolean | null
          registration_url: string | null
          start_time: string | null
          state: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          location_name?: string | null
          organizer?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          start_time?: string | null
          state?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          location_name?: string | null
          organizer?: string | null
          registration_required?: boolean | null
          registration_url?: string | null
          start_time?: string | null
          state?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
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
