export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          dox_id: string
          name: string
          email: string
          phone: string | null
          role: 'student' | 'teacher' | 'admin'
          level: 'bronze' | 'prata' | 'ouro' | 'elite'
          total_points: number
          lifetime_points: number
          streak_weeks: number
          streak_last_date: string | null
          class_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dox_id?: string
          name: string
          email: string
          phone?: string | null
          role?: 'student' | 'teacher' | 'admin'
          level?: 'bronze' | 'prata' | 'ouro' | 'elite'
          total_points?: number
          lifetime_points?: number
          streak_weeks?: number
          streak_last_date?: string | null
          class_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dox_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'student' | 'teacher' | 'admin'
          level?: 'bronze' | 'prata' | 'ouro' | 'elite'
          total_points?: number
          lifetime_points?: number
          streak_weeks?: number
          streak_last_date?: string | null
          class_id?: string | null
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          teacher_id: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          teacher_id?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          teacher_id?: string | null
          active?: boolean
          created_at?: string
        }
      }
      point_rules: {
        Row: {
          id: string
          action_name: string
          points: number
          category: 'classroom' | 'financial' | 'social' | 'bonus'
          icon: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          action_name: string
          points: number
          category: 'classroom' | 'financial' | 'social' | 'bonus'
          icon?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          action_name?: string
          points?: number
          category?: 'classroom' | 'financial' | 'social' | 'bonus'
          icon?: string | null
          active?: boolean
          created_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          rule_id: string | null
          points_awarded: number
          multiplier: number
          bonus_points: number
          awarded_by: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rule_id?: string | null
          points_awarded: number
          multiplier?: number
          bonus_points?: number
          awarded_by?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string | null
          points_awarded?: number
          multiplier?: number
          bonus_points?: number
          awarded_by?: string | null
          note?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          points_price: number
          category: 'acessorios' | 'vestuario' | 'papelaria' | 'premium' | 'kits'
          stock: number
          image_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          points_price: number
          category: 'acessorios' | 'vestuario' | 'papelaria' | 'premium' | 'kits'
          stock?: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          points_price?: number
          category?: 'acessorios' | 'vestuario' | 'papelaria' | 'premium' | 'kits'
          stock?: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      vouchers: {
        Row: {
          id: string
          user_id: string
          product_id: string
          code: string
          points_spent: number
          status: 'active' | 'used' | 'expired'
          expires_at: string | null
          used_at: string | null
          validated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          code: string
          points_spent: number
          status?: 'active' | 'used' | 'expired'
          expires_at?: string | null
          used_at?: string | null
          validated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          code?: string
          points_spent?: number
          status?: 'active' | 'used' | 'expired'
          expires_at?: string | null
          used_at?: string | null
          validated_by?: string | null
          created_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          user_id: string | null
          channel: 'email' | 'whatsapp'
          type: 'points' | 'level_up' | 'streak' | 'voucher' | 'voucher_expiring'
          status: 'sent' | 'failed'
          payload: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          channel: 'email' | 'whatsapp'
          type: 'points' | 'level_up' | 'streak' | 'voucher' | 'voucher_expiring'
          status?: 'sent' | 'failed'
          payload?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          channel?: 'email' | 'whatsapp'
          type?: 'points' | 'level_up' | 'streak' | 'voucher' | 'voucher_expiring'
          status?: 'sent' | 'failed'
          payload?: Record<string, unknown> | null
          created_at?: string
        }
      }
    }
  }
}
