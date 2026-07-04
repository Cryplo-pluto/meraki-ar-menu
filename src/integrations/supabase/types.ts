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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string
          created_at: string
          hours: Json
          id: string
          lat: number | null
          lng: number | null
          map_embed: string | null
          name: string
          phone: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          hours?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          map_embed?: string | null
          name: string
          phone: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          hours?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          map_embed?: string | null
          name?: string
          phone?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cake_builder_options: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price_modifier: number
          sort_order: number
          step: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price_modifier?: number
          sort_order?: number
          step: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price_modifier?: number
          sort_order?: number
          step?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          allergens: string[]
          available_branches: string[]
          category: string
          created_at: string
          depth_cm: number | null
          description: string
          dimensions_label: string
          glb_url: string | null
          height_cm: number | null
          id: string
          image_alt: string
          image_url: string
          is_available: boolean
          is_signature: boolean
          name: string
          price_kwacha: number
          size_class_id: string | null
          slug: string
          sort_order: number
          updated_at: string
          usdz_url: string | null
          width_cm: number | null
        }
        Insert: {
          allergens?: string[]
          available_branches?: string[]
          category: string
          created_at?: string
          depth_cm?: number | null
          description?: string
          dimensions_label?: string
          glb_url?: string | null
          height_cm?: number | null
          id?: string
          image_alt?: string
          image_url?: string
          is_available?: boolean
          is_signature?: boolean
          name: string
          price_kwacha?: number
          size_class_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          usdz_url?: string | null
          width_cm?: number | null
        }
        Update: {
          allergens?: string[]
          available_branches?: string[]
          category?: string
          created_at?: string
          depth_cm?: number | null
          description?: string
          dimensions_label?: string
          glb_url?: string | null
          height_cm?: number | null
          id?: string
          image_alt?: string
          image_url?: string
          is_available?: boolean
          is_signature?: boolean
          name?: string
          price_kwacha?: number
          size_class_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          usdz_url?: string | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_size_class_id_fkey"
            columns: ["size_class_id"]
            isOneToOne: false
            referencedRelation: "size_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          menu_item_slug: string
          name: string
          notes: string | null
          order_id: string
          quantity: number
          unit_price_kwacha: number
        }
        Insert: {
          id?: string
          menu_item_slug: string
          name: string
          notes?: string | null
          order_id: string
          quantity?: number
          unit_price_kwacha: number
        }
        Update: {
          id?: string
          menu_item_slug?: string
          name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          unit_price_kwacha?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_slug: string
          channel: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          fulfillment: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          status: string
          subtotal_kwacha: number
          updated_at: string
        }
        Insert: {
          branch_slug: string
          channel?: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          fulfillment?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          status?: string
          subtotal_kwacha?: number
          updated_at?: string
        }
        Update: {
          branch_slug?: string
          channel?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          fulfillment?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          status?: string
          subtotal_kwacha?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      size_classes: {
        Row: {
          created_at: string
          depth_cm: number | null
          dimensions_label: string
          height_cm: number | null
          id: string
          name: string
          reference_glb_url: string
          reference_usdz_url: string | null
          width_cm: number | null
        }
        Insert: {
          created_at?: string
          depth_cm?: number | null
          dimensions_label: string
          height_cm?: number | null
          id?: string
          name: string
          reference_glb_url: string
          reference_usdz_url?: string | null
          width_cm?: number | null
        }
        Update: {
          created_at?: string
          depth_cm?: number | null
          dimensions_label?: string
          height_cm?: number | null
          id?: string
          name?: string
          reference_glb_url?: string
          reference_usdz_url?: string | null
          width_cm?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
    Enums: {
      app_role: ["admin", "staff"],
    },
  },
} as const
