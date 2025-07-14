export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          role: 'admin' | 'caller'
          status: 'pending' | 'active' | 'inactive'
          created_at: string
          updated_at: string | null
          avatar: string | null
          login_status: 'online' | 'offline' | null
          created_by: string | null
          updated_by: string | null
          approved_by: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          role: 'admin' | 'caller'
          status?: 'pending' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string | null
          avatar?: string | null
          login_status?: 'online' | 'offline' | null
          created_by?: string | null
          updated_by?: string | null
          approved_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          role?: 'admin' | 'caller'
          status?: 'pending' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string | null
          avatar?: string | null
          login_status?: 'online' | 'offline' | null
          created_by?: string | null
          updated_by?: string | null
          approved_by?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          phone: string
          gender: 'Male' | 'Female' | 'Other'
          school: string
          locality: string
          district: string
          created_at: string
          updated_at: string | null
          campaigns: string[] | null
          custom_fields: Json | null
          imported_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          gender: 'Male' | 'Female' | 'Other'
          school: string
          locality: string
          district: string
          created_at?: string
          updated_at?: string | null
          campaigns?: string[] | null
          custom_fields?: Json | null
          imported_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          gender?: 'Male' | 'Female' | 'Other'
          school?: string
          locality?: string
          district?: string
          created_at?: string
          updated_at?: string | null
          campaigns?: string[] | null
          custom_fields?: Json | null
          imported_by?: string | null
          updated_by?: string | null
        }
      }
      assignments: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          user_name: string
          assigned_time: string
          disposition: 'New' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Callback' | 'Not Reachable' | null
          disposition_time: string | null
          sub_disposition: 'Ringing' | 'Switched Off' | 'Call Back Later' | 'Not Answering' | 'Wrong Number' | 'Language Barrier' | 'High Price' | 'Not Interested Now' | 'Will Join Later' | 'Admission Done' | null
          sub_disposition_time: string | null
          remark: string | null
          follow_up_date: string | null
          schedule_date: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          user_name: string
          assigned_time: string
          disposition?: 'New' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Callback' | 'Not Reachable' | null
          disposition_time?: string | null
          sub_disposition?: 'Ringing' | 'Switched Off' | 'Call Back Later' | 'Not Answering' | 'Wrong Number' | 'Language Barrier' | 'High Price' | 'Not Interested Now' | 'Will Join Later' | 'Admission Done' | null
          sub_disposition_time?: string | null
          remark?: string | null
          follow_up_date?: string | null
          schedule_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          user_name?: string
          assigned_time?: string
          disposition?: 'New' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Callback' | 'Not Reachable' | null
          disposition_time?: string | null
          sub_disposition?: 'Ringing' | 'Switched Off' | 'Call Back Later' | 'Not Answering' | 'Wrong Number' | 'Language Barrier' | 'High Price' | 'Not Interested Now' | 'Will Join Later' | 'Admission Done' | null
          sub_disposition_time?: string | null
          remark?: string | null
          follow_up_date?: string | null
          schedule_date?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      login_activity: {
        Row: {
          id: string
          user_id: string
          user_name: string
          timestamp: string
          activity: 'login' | 'logout'
          ip_address: string
          device: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          timestamp: string
          activity: 'login' | 'logout'
          ip_address: string
          device: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          timestamp?: string
          activity?: 'login' | 'logout'
          ip_address?: string
          device?: string
          created_at?: string
        }
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