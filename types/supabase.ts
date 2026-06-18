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
      abandoned_carts: {
        Row: {
          cart_data: Json
          created_at: string
          email: string
          email_sent_at: string | null
          id: string
          recovered_at: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          cart_data?: Json
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: string
          recovered_at?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          cart_data?: Json
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: string
          recovered_at?: string | null
          session_id?: string
          updated_at?: string
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
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      sample_requests: {
        Row: {
          address: string | null
          business_name: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          monthly_usage: string
          name: string
          phone: string
          product_id: string | null
          product_name: string
          product_slug: string | null
          sample_price: number | null
          status: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          monthly_usage: string
          name: string
          phone: string
          product_id?: string | null
          product_name: string
          product_slug?: string | null
          sample_price?: number | null
          status?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          monthly_usage?: string
          name?: string
          phone?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string | null
          sample_price?: number | null
          status?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          /** created_at has DEFAULT NOW() — never null on new rows */
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string
          country: string
          /** created_at has DEFAULT NOW() — never null on rows produced by the app */
          created_at: string
          /** discount is NOT NULL DEFAULT 0 in 001_orders.sql */
          discount: number
          email: string
          first_name: string
          id: string
          items: Json
          last_name: string
          notes: string | null
          payment_method: string | null
          phone: string | null
          postcode: string
          promo_code: string | null
          shipping: number
          shipping_method: string | null
          /** status is NOT NULL DEFAULT 'pending' in 001_orders.sql */
          status: string
          subtotal: number
          total: number
          tracking_carrier: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          country: string
          created_at?: string
          /** Optional on insert — DB defaults to 0 */
          discount?: number
          email: string
          first_name: string
          id?: string
          items: Json
          last_name: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          postcode: string
          promo_code?: string | null
          shipping: number
          shipping_method?: string | null
          /** Optional on insert — DB defaults to 'pending' */
          status?: string
          subtotal: number
          total: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string
          discount?: number
          email?: string
          first_name?: string
          id?: string
          items?: Json
          last_name?: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          postcode?: string
          promo_code?: string | null
          shipping?: number
          shipping_method?: string | null
          status?: string
          subtotal?: number
          total?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          product_id: string
          reserved: number
        }
        Insert: {
          product_id: string
          reserved?: number
        }
        Update: {
          product_id?: string
          reserved?: number
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          label: string
          price: number
          product_id: string
          sku: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          price: number
          product_id: string
          sku: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          price?: number
          product_id?: string
          sku?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_slug: string
          created_at: string
          description: string
          featured: boolean
          how_to_use: string
          id: string
          images: Json
          in_stock: boolean
          name: string
          price: number
          rating: number
          reviews: number
          sample_price: number | null
          slug: string
          sort_order: number
          specs: Json
          stock: number | null
          tagline: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category_slug: string
          created_at?: string
          description: string
          featured?: boolean
          how_to_use: string
          id: string
          images?: Json
          in_stock?: boolean
          name: string
          price: number
          rating?: number
          reviews?: number
          sample_price?: number | null
          slug: string
          sort_order?: number
          specs?: Json
          stock?: number | null
          tagline: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category_slug?: string
          created_at?: string
          description?: string
          featured?: boolean
          how_to_use?: string
          id?: string
          images?: Json
          in_stock?: boolean
          name?: string
          price?: number
          rating?: number
          reviews?: number
          sample_price?: number | null
          slug?: string
          sort_order?: number
          specs?: Json
          stock?: number | null
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string | null
          discount: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_spend: number
          updated_at: string | null
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string | null
          discount: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_spend?: number
          updated_at?: string | null
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string | null
          discount?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_spend?: number
          updated_at?: string | null
          uses?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          body: string
          created_at: string
          id: string
          product_id: string
          rating: number
          title: string
          user_email: string
          user_name: string
          verified: boolean
        }
        Insert: {
          approved?: boolean
          body: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          title: string
          user_email: string
          user_name: string
          verified?: boolean
        }
        Update: {
          approved?: boolean
          body?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          title?: string
          user_email?: string
          user_name?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          password_hash: string
          role: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          password_hash: string
          role?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          role?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          admin_user_id: string | null
          admin_via: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          admin_via?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          admin_via?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          key: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          key: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          key?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          full_name: string | null
          id: string
          phone: string | null
          postcode: string | null
          province: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          postcode?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          postcode?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      customer_summary: {
        Row: {
          average_order_value: number | null
          city: string | null
          email: string | null
          first_name: string | null
          first_order_at: string | null
          last_name: string | null
          last_order_at: string | null
          order_count: number | null
          phone: string | null
          total_spend: number | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          email: string | null
          full_name: string | null
          phone: string | null
          postcode: string | null
          province: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_promo_uses: { Args: { promo_id: string }; Returns: undefined }
      reserve_stock: {
        Args: { p_product_id: string; qty: number }
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
