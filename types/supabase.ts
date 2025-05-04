export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          display_name: string | null
          role: "user" | "admin" | "agent" | null
          voice_settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          display_name?: string | null
          role?: "user" | "admin" | "agent" | null
          voice_settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          display_name?: string | null
          role?: "user" | "admin" | "agent" | null
          voice_settings?: Json | null
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          content: string
          role: "user" | "assistant"
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          content: string
          role: "user" | "assistant"
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          content?: string
          role?: "user" | "assistant"
        }
      }
      commands: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          pattern: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          pattern: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          pattern?: string
        }
      }
      agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          address: string
          location: Json
          status: "pending" | "approved" | "rejected"
          additional_info: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          address: string
          location: Json
          status?: "pending" | "approved" | "rejected"
          additional_info?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          location?: Json
          status?: "pending" | "approved" | "rejected"
          additional_info?: string | null
          user_id?: string | null
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
  }
}
