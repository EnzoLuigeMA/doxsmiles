import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole, UserProfile } from '@/types/auth'

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as UserProfile | null
}

export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentUser()
  if (!profile) {
    redirect('/login')
  }
  return profile
}

export async function requireRole(role: UserRole): Promise<UserProfile> {
  const profile = await requireAuth()
  if (profile.role !== role && profile.role !== 'admin') {
    const homes: Record<UserRole, string> = {
      student: '/dashboard',
      teacher: '/professor',
      admin: '/admin',
    }
    redirect(homes[profile.role])
  }
  return profile
}
