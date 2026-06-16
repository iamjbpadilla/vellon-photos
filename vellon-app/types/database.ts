export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_views: {
        Row: {
          created_at: string
          event_id: string
          id: string
          ip_hash: string
          view_date: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          ip_hash: string
          view_date?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          ip_hash?: string
          view_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_views_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          event_code: string
          expires_at: string | null
          host_id: string
          id: string
          photo_count: number
          status: "trial" | "pending" | "active" | "archived"
          title: string
          updated_at: string
          view_count: number
          voucher_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_code: string
          expires_at?: string | null
          host_id: string
          id?: string
          photo_count?: number
          status?: "trial" | "pending" | "active" | "archived"
          title?: string
          updated_at?: string
          view_count?: number
          voucher_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          event_code?: string
          expires_at?: string | null
          host_id?: string
          id?: string
          photo_count?: number
          status?: "trial" | "pending" | "active" | "archived"
          title?: string
          updated_at?: string
          view_count?: number
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_proofs: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          event_id: string
          id: string
          ref_number: string
          screenshot_path: string | null
          screenshot_url: string | null
          status: "pending" | "verified" | "rejected"
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          event_id: string
          id?: string
          ref_number: string
          screenshot_path?: string | null
          screenshot_url?: string | null
          status?: "pending" | "verified" | "rejected"
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          event_id?: string
          id?: string
          ref_number?: string
          screenshot_path?: string | null
          screenshot_url?: string | null
          status?: "pending" | "verified" | "rejected"
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          file_size: number | null
          id: string
          mime_type: string | null
          storage_path: string
          storage_url: string
          uploader_email: string | null
          uploader_name: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_path: string
          storage_url: string
          uploader_email?: string | null
          uploader_name?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string
          storage_url?: string
          uploader_email?: string | null
          uploader_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          onboarding_completed: boolean
          role: "user" | "admin"
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          onboarding_completed?: boolean
          role?: "user" | "admin"
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          onboarding_completed?: boolean
          role?: "user" | "admin"
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          discount_type: "fixed" | "percentage"
          discount_value: number
          id: string
          max_uses: number
          status: "active" | "inactive"
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          discount_type?: "fixed" | "percentage"
          discount_value?: number
          id?: string
          max_uses?: number
          status?: "active" | "inactive"
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: "fixed" | "percentage"
          discount_value?: number
          id?: string
          max_uses?: number
          status?: "active" | "inactive"
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]?: never
    }
    Functions: {
      generate_event_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      redeem_voucher: {
        Args: { p_voucher_id: string }
        Returns: undefined
      }
      run_lifecycle: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          event_id: string
          event_title: string
        }[]
      }
      sync_event_view_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_event_view: {
        Args: { p_event_id: string; p_ip_hash: string }
        Returns: undefined
      }
      validate_voucher: {
        Args: { p_code: string; p_base_amount?: number }
        Returns: {
          valid: boolean
          voucher_id: string | null
          final_amount: number
          message: string
        }[]
      }
    }
    Enums: {
      [_ in never]?: never
    }
    CompositeTypes: {
      [_ in never]?: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type PaymentProof =
  Database["public"]["Tables"]["payment_proofs"]["Row"];
export type Voucher = Database["public"]["Tables"]["vouchers"]["Row"];
export type EventView = Database["public"]["Tables"]["event_views"]["Row"];

export type EventStatus = Event["status"];
export type PaymentStatus = PaymentProof["status"];
