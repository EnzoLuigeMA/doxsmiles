export type UserRole = 'student' | 'teacher' | 'admin'
export type UserLevel = 'bronze' | 'prata' | 'ouro' | 'elite'

export interface UserProfile {
  id: string
  dox_id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
  level: UserLevel
  total_points: number
  lifetime_points: number
  streak_weeks: number
  streak_last_date: string | null
  class_id: string | null
  created_at: string
}
