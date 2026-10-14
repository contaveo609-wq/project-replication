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
      addon_groups: {
        Row: {
          id: string
          is_required: boolean
          max_select: number
          min_select: number
          product_id: string
          sort_order: number
          title: string
        }
        Insert: {
          id?: string
          is_required?: boolean
          max_select?: number
          min_select?: number
          product_id: string
          sort_order?: number
          title: string
        }
        Update: {
          id?: string
          is_required?: boolean
          max_select?: number
          min_select?: number
          product_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          label: string | null
          neighborhood: string
          number: string
          reference: string | null
          state: string
          street: string
          user_id: string
        }
        Insert: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          label?: string | null
          neighborhood: string
          number: string
          reference?: string | null
          state?: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          label?: string | null
          neighborhood?: string
          number?: string
          reference?: string | null
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          bot_name: string
          fallback_message: string
          faqs: Json
          id: boolean
          is_enabled: boolean
          updated_at: string
          welcome_message: string
          whatsapp: string
        }
        Insert: {
          bot_name?: string
          fallback_message?: string
          faqs?: Json
          id?: boolean
          is_enabled?: boolean
          updated_at?: string
          welcome_message?: string
          whatsapp?: string
        }
        Update: {
          bot_name?: string
          fallback_message?: string
          faqs?: Json
          id?: boolean
          is_enabled?: boolean
          updated_at?: string
          welcome_message?: string
          whatsapp?: string
        }
        Relationships: []
      }
      order_item_addons: {
        Row: {
          addon_id: string | null
          id: string
          name: string
          order_item_id: string
          price: number
          quantity: number
        }
        Insert: {
          addon_id?: string | null
          id?: string
          name: string
          order_item_id: string
          price: number
          quantity?: number
        }
        Update: {
          addon_id?: string | null
          id?: string
          name?: string
          order_item_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "product_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_addons_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total: number
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          line_total: number
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          line_total?: number
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          change_for: number | null
          city: string
          complement: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_fee: number
          discount: number
          id: string
          neighborhood: string
          notes: string | null
          number: string
          order_number: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          street: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          change_for?: number | null
          city?: string
          complement?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          discount?: number
          id?: string
          neighborhood: string
          notes?: string | null
          number: string
          order_number?: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          street: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          change_for?: number | null
          city?: string
          complement?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          discount?: number
          id?: string
          neighborhood?: string
          notes?: string | null
          number?: string
          order_number?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          street?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_addons: {
        Row: {
          description: string | null
          group_id: string
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          description?: string | null
          group_id: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          description?: string | null
          group_id?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_addons_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          featured_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          is_sold_out: boolean
          name: string
          price: number
          price_from: boolean
          quantity_label: string | null
          serves: number | null
          slug: string
          sort_order: number
          weight: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_sold_out?: boolean
          name: string
          price?: number
          price_from?: boolean
          quantity_label?: string | null
          serves?: number | null
          slug: string
          sort_order?: number
          weight?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_sold_out?: boolean
          name?: string
          price?: number
          price_from?: boolean
          quantity_label?: string | null
          serves?: number | null
          slug?: string
          sort_order?: number
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          discount_percent: number | null
          ends_at: string | null
          id: string
          is_active: boolean
          product_id: string
          promo_price: number | null
          starts_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          product_id: string
          promo_price?: number | null
          starts_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          product_id?: string
          promo_price?: number | null
          starts_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address_line: string
          banner_url: string | null
          delivery_fee: number
          delivery_time_max: number
          delivery_time_min: number
          description: string
          id: boolean
          is_open: boolean
          logo_url: string | null
          opening_hours: string
          phone: string
          store_name: string
          tagline: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address_line?: string
          banner_url?: string | null
          delivery_fee?: number
          delivery_time_max?: number
          delivery_time_min?: number
          description?: string
          id?: boolean
          is_open?: boolean
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address_line?: string
          banner_url?: string | null
          delivery_fee?: number
          delivery_time_max?: number
          delivery_time_min?: number
          description?: string
          id?: boolean
          is_open?: boolean
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "cliente"
      order_status:
        | "recebido"
        | "confirmado"
        | "em_preparacao"
        | "saiu_entrega"
        | "entregue"
        | "cancelado"
      payment_method: "pix" | "cartao" | "dinheiro"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "cliente"],
      order_status: [
        "recebido",
        "confirmado",
        "em_preparacao",
        "saiu_entrega",
        "entregue",
        "cancelado",
      ],
      payment_method: ["pix", "cartao", "dinheiro"],
    },
  },
} as const
