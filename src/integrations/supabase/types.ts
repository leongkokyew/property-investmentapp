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
      n3_credit_note_cache: {
        Row: {
          customer_code: string | null
          customer_name: string | null
          doc_code: string | null
          doc_date: string | null
          id: string
          is_cancelled: boolean | null
          n3_project_code: string | null
          net_total_amount: number | null
          outstanding_amount: number | null
          refund_amount: number | null
          status: string | null
          synced_at: string | null
          tenant_code: string
        }
        Insert: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          id: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          refund_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code: string
        }
        Update: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          id?: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          refund_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code?: string
        }
        Relationships: []
      }
      n3_debit_note_cache: {
        Row: {
          customer_code: string | null
          customer_name: string | null
          doc_code: string | null
          doc_date: string | null
          due_date: string | null
          id: string
          is_cancelled: boolean | null
          n3_project_code: string | null
          net_total_amount: number | null
          outstanding_amount: number | null
          status: string | null
          synced_at: string | null
          tenant_code: string
        }
        Insert: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          due_date?: string | null
          id: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code: string
        }
        Update: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          due_date?: string | null
          id?: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code?: string
        }
        Relationships: []
      }
      n3_invoice_cache: {
        Row: {
          customer_code: string | null
          customer_id: number | null
          customer_name: string | null
          doc_code: string | null
          doc_date: string | null
          due_date: string | null
          e_invoice_status: string | null
          id: string
          is_cancelled: boolean | null
          n3_project_code: string | null
          net_total_amount: number | null
          outstanding_amount: number | null
          status: string | null
          synced_at: string | null
          tenant_code: string
        }
        Insert: {
          customer_code?: string | null
          customer_id?: number | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          due_date?: string | null
          e_invoice_status?: string | null
          id: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code: string
        }
        Update: {
          customer_code?: string | null
          customer_id?: number | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          due_date?: string | null
          e_invoice_status?: string | null
          id?: string
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code?: string
        }
        Relationships: []
      }
      n3_receipt_cache: {
        Row: {
          customer_code: string | null
          customer_name: string | null
          doc_code: string | null
          doc_date: string | null
          id: string
          is_bounced_cheque: boolean | null
          is_cancelled: boolean | null
          n3_project_code: string | null
          net_total_amount: number | null
          outstanding_amount: number | null
          refund_amount: number | null
          status: string | null
          synced_at: string | null
          tenant_code: string
        }
        Insert: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          id: string
          is_bounced_cheque?: boolean | null
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          refund_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code: string
        }
        Update: {
          customer_code?: string | null
          customer_name?: string | null
          doc_code?: string | null
          doc_date?: string | null
          id?: string
          is_bounced_cheque?: boolean | null
          is_cancelled?: boolean | null
          n3_project_code?: string | null
          net_total_amount?: number | null
          outstanding_amount?: number | null
          refund_amount?: number | null
          status?: string | null
          synced_at?: string | null
          tenant_code?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: string | null
          created_at: string | null
          id: string
          n3_parent_project_code: string | null
          n3_project_code: string | null
          name: string
          notes: string | null
          property_type: string
          purchase_date: string
          purchase_price: number
          state: string | null
          status: string
          tenant_code: string
          updated_at: string | null
        }
        Insert: {
          address: string
          area?: string | null
          created_at?: string | null
          id?: string
          n3_parent_project_code?: string | null
          n3_project_code?: string | null
          name: string
          notes?: string | null
          property_type: string
          purchase_date: string
          purchase_price: number
          state?: string | null
          status: string
          tenant_code: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          area?: string | null
          created_at?: string | null
          id?: string
          n3_parent_project_code?: string | null
          n3_project_code?: string | null
          name?: string
          notes?: string | null
          property_type?: string
          purchase_date?: string
          purchase_price?: number
          state?: string | null
          status?: string
          tenant_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenancies: {
        Row: {
          created_at: string | null
          einvoice_status: string
          id: string
          invoice_status: string
          monthly_rent: number
          notes: string | null
          payment_status: string
          property_id: string
          tenancy_end: string
          tenancy_start: string
          tenancy_status: string
          tenant_code: string
          tenant_ic_or_reg: string | null
          tenant_name: string
          tenant_type: string | null
        }
        Insert: {
          created_at?: string | null
          einvoice_status: string
          id?: string
          invoice_status: string
          monthly_rent: number
          notes?: string | null
          payment_status: string
          property_id: string
          tenancy_end: string
          tenancy_start: string
          tenancy_status: string
          tenant_code: string
          tenant_ic_or_reg?: string | null
          tenant_name: string
          tenant_type?: string | null
        }
        Update: {
          created_at?: string | null
          einvoice_status?: string
          id?: string
          invoice_status?: string
          monthly_rent?: number
          notes?: string | null
          payment_status?: string
          property_id?: string
          tenancy_end?: string
          tenancy_start?: string
          tenancy_status?: string
          tenant_code?: string
          tenant_ic_or_reg?: string | null
          tenant_name?: string
          tenant_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
