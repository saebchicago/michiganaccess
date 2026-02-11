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
          is_active: boolean | null
          is_free: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
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
          is_active?: boolean | null
          is_free?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
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
          is_active?: boolean | null
          is_free?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
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
