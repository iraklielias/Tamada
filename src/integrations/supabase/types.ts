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
      ai_generation_log: {
        Row: {
          created_at: string | null
          generation_type: string
          id: string
          input_params: Json
          latency_ms: number | null
          model_used: string | null
          output_text: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generation_type: string
          id?: string
          input_params: Json
          latency_ms?: number | null
          model_used?: string | null
          output_text?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          generation_type?: string
          id?: string
          input_params?: Json
          latency_ms?: number | null
          model_used?: string | null
          output_text?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_origins: string[] | null
          client_id: string
          client_name: string
          created_at: string | null
          daily_limit_per_user: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          total_daily_limit: number | null
        }
        Insert: {
          allowed_origins?: string[] | null
          client_id: string
          client_name: string
          created_at?: string | null
          daily_limit_per_user?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          total_daily_limit?: number | null
        }
        Update: {
          allowed_origins?: string[] | null
          client_id?: string
          client_name?: string
          created_at?: string | null
          daily_limit_per_user?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          total_daily_limit?: number | null
        }
        Relationships: []
      }
      custom_toasts: {
        Row: {
          ai_generation_params: Json | null
          body_en: string | null
          body_ka: string
          created_at: string | null
          id: string
          is_ai_generated: boolean | null
          occasion_type: string | null
          tags: string[] | null
          title_en: string | null
          title_ka: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generation_params?: Json | null
          body_en?: string | null
          body_ka: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          occasion_type?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_ka?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generation_params?: Json | null
          body_en?: string | null
          body_ka?: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          occasion_type?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_ka?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_toasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_chat_messages: {
        Row: {
          audio_duration_seconds: number | null
          audio_url: string | null
          content: string
          created_at: string | null
          generation_duration_ms: number | null
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          content: string
          created_at?: string | null
          generation_duration_ms?: number | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          content?: string
          created_at?: string | null
          generation_duration_ms?: number | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "external_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "external_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      external_chat_sessions: {
        Row: {
          api_key_id: string
          created_at: string | null
          external_user_id: string
          id: string
          metadata: Json | null
          preferred_language: string | null
          preferred_mode: string | null
          updated_at: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          external_user_id: string
          id?: string
          metadata?: Json | null
          preferred_language?: string | null
          preferred_mode?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          external_user_id?: string
          id?: string
          metadata?: Json | null
          preferred_language?: string | null
          preferred_mode?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_chat_sessions_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      external_usage_tracking: {
        Row: {
          api_key_id: string
          created_at: string | null
          external_user_id: string
          generation_count: number | null
          id: string
          total_audio_seconds: number | null
          total_tokens_used: number | null
          updated_at: string | null
          usage_date: string
          voice_generation_count: number | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          external_user_id: string
          generation_count?: number | null
          id?: string
          total_audio_seconds?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          usage_date?: string
          voice_generation_count?: number | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          external_user_id?: string
          generation_count?: number | null
          id?: string
          total_audio_seconds?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          usage_date?: string
          voice_generation_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "external_usage_tracking_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      feast_collaborators: {
        Row: {
          feast_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          feast_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          feast_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feast_collaborators_feast_id_fkey"
            columns: ["feast_id"]
            isOneToOne: false
            referencedRelation: "feasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feast_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feast_guests: {
        Row: {
          alaverdi_count: number | null
          created_at: string | null
          feast_id: string
          id: string
          name: string
          notes: string | null
          role: string | null
          seat_position: number | null
        }
        Insert: {
          alaverdi_count?: number | null
          created_at?: string | null
          feast_id: string
          id?: string
          name: string
          notes?: string | null
          role?: string | null
          seat_position?: number | null
        }
        Update: {
          alaverdi_count?: number | null
          created_at?: string | null
          feast_id?: string
          id?: string
          name?: string
          notes?: string | null
          role?: string | null
          seat_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feast_guests_feast_id_fkey"
            columns: ["feast_id"]
            isOneToOne: false
            referencedRelation: "feasts"
            referencedColumns: ["id"]
          },
        ]
      }
      feast_toasts: {
        Row: {
          actual_time: string | null
          alaverdi_assigned_to: string | null
          assigned_custom_toast_id: string | null
          assigned_toast_id: string | null
          created_at: string | null
          description_en: string | null
          description_ka: string | null
          duration_minutes: number | null
          feast_id: string
          id: string
          notes: string | null
          position: number
          scheduled_time_offset_minutes: number | null
          status: string | null
          title_en: string | null
          title_ka: string
          toast_type: string
        }
        Insert: {
          actual_time?: string | null
          alaverdi_assigned_to?: string | null
          assigned_custom_toast_id?: string | null
          assigned_toast_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_ka?: string | null
          duration_minutes?: number | null
          feast_id: string
          id?: string
          notes?: string | null
          position: number
          scheduled_time_offset_minutes?: number | null
          status?: string | null
          title_en?: string | null
          title_ka: string
          toast_type: string
        }
        Update: {
          actual_time?: string | null
          alaverdi_assigned_to?: string | null
          assigned_custom_toast_id?: string | null
          assigned_toast_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_ka?: string | null
          duration_minutes?: number | null
          feast_id?: string
          id?: string
          notes?: string | null
          position?: number
          scheduled_time_offset_minutes?: number | null
          status?: string | null
          title_en?: string | null
          title_ka?: string
          toast_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feast_toasts_assigned_custom_toast_id_fkey"
            columns: ["assigned_custom_toast_id"]
            isOneToOne: false
            referencedRelation: "custom_toasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feast_toasts_assigned_toast_id_fkey"
            columns: ["assigned_toast_id"]
            isOneToOne: false
            referencedRelation: "toasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feast_toasts_feast_id_fkey"
            columns: ["feast_id"]
            isOneToOne: false
            referencedRelation: "feasts"
            referencedColumns: ["id"]
          },
        ]
      }
      feasts: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string | null
          estimated_duration_minutes: number
          formality_level: string | null
          guest_count: number | null
          host_id: string
          id: string
          notes: string | null
          occasion_type: string
          region: string | null
          share_code: string | null
          status: string | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          estimated_duration_minutes: number
          formality_level?: string | null
          guest_count?: number | null
          host_id: string
          id?: string
          notes?: string | null
          occasion_type: string
          region?: string | null
          share_code?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number
          formality_level?: string | null
          guest_count?: number | null
          host_id?: string
          id?: string
          notes?: string | null
          occasion_type?: string
          region?: string | null
          share_code?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feasts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feasts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "toast_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          is_pro: boolean | null
          onboarding_completed: boolean | null
          preferred_language: string | null
          pro_expires_at: string | null
          region: string | null
          stripe_customer_id: string | null
          typical_occasions: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          is_pro?: boolean | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          pro_expires_at?: string | null
          region?: string | null
          stripe_customer_id?: string | null
          typical_occasions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          is_pro?: boolean | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          pro_expires_at?: string | null
          region?: string | null
          stripe_customer_id?: string | null
          typical_occasions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      toast_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          estimated_duration_minutes: number | null
          formality_level: string | null
          id: string
          is_system: boolean | null
          name_en: string | null
          name_ka: string
          occasion_type: string
          region: string | null
          toast_sequence: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          estimated_duration_minutes?: number | null
          formality_level?: string | null
          id?: string
          is_system?: boolean | null
          name_en?: string | null
          name_ka: string
          occasion_type: string
          region?: string | null
          toast_sequence: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          estimated_duration_minutes?: number | null
          formality_level?: string | null
          id?: string
          is_system?: boolean | null
          name_en?: string | null
          name_ka?: string
          occasion_type?: string
          region?: string | null
          toast_sequence?: Json
        }
        Relationships: [
          {
            foreignKeyName: "toast_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      toast_versions: {
        Row: {
          body_en: string | null
          body_ka: string
          created_at: string | null
          feast_toast_id: string
          id: string
          source_type: string
          style_overrides: Json | null
          user_instructions: string | null
          version_number: number
        }
        Insert: {
          body_en?: string | null
          body_ka: string
          created_at?: string | null
          feast_toast_id: string
          id?: string
          source_type?: string
          style_overrides?: Json | null
          user_instructions?: string | null
          version_number?: number
        }
        Update: {
          body_en?: string | null
          body_ka?: string
          created_at?: string | null
          feast_toast_id?: string
          id?: string
          source_type?: string
          style_overrides?: Json | null
          user_instructions?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "toast_versions_feast_toast_id_fkey"
            columns: ["feast_toast_id"]
            isOneToOne: false
            referencedRelation: "feast_toasts"
            referencedColumns: ["id"]
          },
        ]
      }
      toasts: {
        Row: {
          body_en: string | null
          body_ka: string
          created_at: string | null
          created_by: string | null
          formality_level: string | null
          id: string
          is_system: boolean | null
          occasion_type: string
          popularity_score: number | null
          region: string | null
          tags: string[] | null
          title_en: string | null
          title_ka: string
          toast_order_position: number | null
          updated_at: string | null
        }
        Insert: {
          body_en?: string | null
          body_ka: string
          created_at?: string | null
          created_by?: string | null
          formality_level?: string | null
          id?: string
          is_system?: boolean | null
          occasion_type: string
          popularity_score?: number | null
          region?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_ka: string
          toast_order_position?: number | null
          updated_at?: string | null
        }
        Update: {
          body_en?: string | null
          body_ka?: string
          created_at?: string | null
          created_by?: string | null
          formality_level?: string | null
          id?: string
          is_system?: boolean | null
          occasion_type?: string
          popularity_score?: number | null
          region?: string | null
          tags?: string[] | null
          title_en?: string | null
          title_ka?: string
          toast_order_position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_knowledge: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          knowledge_key: string
          knowledge_type: string
          knowledge_value: Json
          last_reinforced_at: string | null
          signal_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_key: string
          knowledge_type: string
          knowledge_value: Json
          last_reinforced_at?: string | null
          signal_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_key?: string
          knowledge_type?: string
          knowledge_value?: Json
          last_reinforced_at?: string | null
          signal_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_knowledge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          custom_toast_id: string | null
          id: string
          notes: string | null
          toast_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_toast_id?: string | null
          id?: string
          notes?: string | null
          toast_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_toast_id?: string | null
          id?: string
          notes?: string | null
          toast_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_custom_toast_id_fkey"
            columns: ["custom_toast_id"]
            isOneToOne: false
            referencedRelation: "custom_toasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_toast_id_fkey"
            columns: ["toast_id"]
            isOneToOne: false
            referencedRelation: "toasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_ai_count: { Args: { p_user_id: string }; Returns: number }
      increment_alaverdi: { Args: { p_guest_id: string }; Returns: undefined }
      is_feast_collaborator: {
        Args: { p_feast_id: string; p_user_id: string }
        Returns: boolean
      }
      is_feast_host: {
        Args: { p_feast_id: string; p_user_id: string }
        Returns: boolean
      }
      upsert_ai_knowledge: {
        Args: {
          p_key: string
          p_signal_weight?: number
          p_type: string
          p_user_id: string
          p_value: Json
        }
        Returns: undefined
      }
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
