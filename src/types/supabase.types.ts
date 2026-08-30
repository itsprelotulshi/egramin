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
      csmp_audit_logs: {
        Row: {
          action: string
          actor_id: string
          actor_name: string
          actor_role: string
          details: string | null
          id: string
          ip_address: string | null
          target_id: string
          target_type: string
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_name: string
          actor_role: string
          details?: string | null
          id: string
          ip_address?: string | null
          target_id: string
          target_type: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_name?: string
          actor_role?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          target_id?: string
          target_type?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      csmp_notifications: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          request_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          id: string
          is_read?: boolean | null
          message: string
          request_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          request_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      csmp_requests: {
        Row: {
          amount: number | null
          assigned_operator_id: string | null
          assigned_operator_name: string | null
          attachments: Json | null
          authorized_amount: number | null
          bank_ifsc: string | null
          bank_name: string | null
          beneficiary_account_name: string | null
          beneficiary_account_number: string | null
          branch_code: string | null
          browser_info: string | null
          category: string | null
          client_company: string | null
          client_email: string
          client_id: string
          client_name: string
          cma_status: Json | null
          comments: Json | null
          created_at: string | null
          currency: string | null
          delete_requested: boolean | null
          delete_requested_at: string | null
          delete_requested_by: string | null
          delete_requested_by_id: string | null
          delete_requested_reason: string | null
          deposit_date: string | null
          deposit_method: string | null
          description: string | null
          id: string
          kiosk_id: string | null
          priority: string
          reason: string | null
          remote_id: string | null
          resolved_at: string | null
          sender_account_name: string | null
          status: string
          ticket_number: string
          title: string
          transaction_reference_id: string | null
          transfer_receipt_ref: string | null
          type: string
          updated_at: string | null
          verified_transaction_id: string | null
          withdraw_method: string | null
        }
        Insert: {
          amount?: number | null
          assigned_operator_id?: string | null
          assigned_operator_name?: string | null
          attachments?: Json | null
          authorized_amount?: number | null
          bank_ifsc?: string | null
          bank_name?: string | null
          beneficiary_account_name?: string | null
          beneficiary_account_number?: string | null
          branch_code?: string | null
          browser_info?: string | null
          category?: string | null
          client_company?: string | null
          client_email: string
          client_id: string
          client_name: string
          cma_status?: Json | null
          comments?: Json | null
          created_at?: string | null
          currency?: string | null
          delete_requested?: boolean | null
          delete_requested_at?: string | null
          delete_requested_by?: string | null
          delete_requested_by_id?: string | null
          delete_requested_reason?: string | null
          deposit_date?: string | null
          deposit_method?: string | null
          description?: string | null
          id: string
          kiosk_id?: string | null
          priority?: string
          reason?: string | null
          remote_id?: string | null
          resolved_at?: string | null
          sender_account_name?: string | null
          status?: string
          ticket_number: string
          title: string
          transaction_reference_id?: string | null
          transfer_receipt_ref?: string | null
          type: string
          updated_at?: string | null
          verified_transaction_id?: string | null
          withdraw_method?: string | null
        }
        Update: {
          amount?: number | null
          assigned_operator_id?: string | null
          assigned_operator_name?: string | null
          attachments?: Json | null
          authorized_amount?: number | null
          bank_ifsc?: string | null
          bank_name?: string | null
          beneficiary_account_name?: string | null
          beneficiary_account_number?: string | null
          branch_code?: string | null
          browser_info?: string | null
          category?: string | null
          client_company?: string | null
          client_email?: string
          client_id?: string
          client_name?: string
          cma_status?: Json | null
          comments?: Json | null
          created_at?: string | null
          currency?: string | null
          delete_requested?: boolean | null
          delete_requested_at?: string | null
          delete_requested_by?: string | null
          delete_requested_by_id?: string | null
          delete_requested_reason?: string | null
          deposit_date?: string | null
          deposit_method?: string | null
          description?: string | null
          id?: string
          kiosk_id?: string | null
          priority?: string
          reason?: string | null
          remote_id?: string | null
          resolved_at?: string | null
          sender_account_name?: string | null
          status?: string
          ticket_number?: string
          title?: string
          transaction_reference_id?: string | null
          transfer_receipt_ref?: string | null
          type?: string
          updated_at?: string | null
          verified_transaction_id?: string | null
          withdraw_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csmp_requests_assigned_operator_id_fkey"
            columns: ["assigned_operator_id"]
            isOneToOne: false
            referencedRelation: "csmp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "csmp_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "csmp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      csmp_role_permissions: {
        Row: {
          allowed_pages: Json
          can_add_internal_notes: boolean | null
          can_assign_operator: boolean | null
          can_change_status: boolean | null
          can_create_request: boolean | null
          can_export_reports: boolean | null
          can_manage_roles: boolean | null
          can_view_all_clients: boolean | null
          can_view_audit_logs: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          allowed_pages: Json
          can_add_internal_notes?: boolean | null
          can_assign_operator?: boolean | null
          can_change_status?: boolean | null
          can_create_request?: boolean | null
          can_export_reports?: boolean | null
          can_manage_roles?: boolean | null
          can_view_all_clients?: boolean | null
          can_view_audit_logs?: boolean | null
          role: string
          updated_at?: string | null
        }
        Update: {
          allowed_pages?: Json
          can_add_internal_notes?: boolean | null
          can_assign_operator?: boolean | null
          can_change_status?: boolean | null
          can_create_request?: boolean | null
          can_export_reports?: boolean | null
          can_manage_roles?: boolean | null
          can_view_all_clients?: boolean | null
          can_view_audit_logs?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      csmp_users: {
        Row: {
          account: string | null
          auth_user_id: string | null
          avatar_url: string | null
          bank: string | null
          company_name: string | null
          created_at: string | null
          currency: string | null
          email: string
          estimated_holding_balance: number | null
          id: string
          ifsc: string | null
          kiosk_id: string | null
          name: string
          phone_number: string | null
          role: string
          status: string | null
        }
        Insert: {
          account?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bank?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          email: string
          estimated_holding_balance?: number | null
          id: string
          ifsc?: string | null
          kiosk_id?: string | null
          name: string
          phone_number?: string | null
          role: string
          status?: string | null
        }
        Update: {
          account?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bank?: string | null
          company_name?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string
          estimated_holding_balance?: number | null
          id?: string
          ifsc?: string | null
          kiosk_id?: string | null
          name?: string
          phone_number?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_role: { Args: never; Returns: string }
      get_auth_user_id: { Args: never; Returns: string }
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
