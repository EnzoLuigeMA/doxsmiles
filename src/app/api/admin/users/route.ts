import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']

// POST: Create a new user (teacher) - admin only
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  // Check if requesting user is admin
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role
  if (!userRole || userRole !== 'admin') {
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
  }

  const { email, password, name, role, class_id } = await request.json()

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Campos obrigatorios: email, password, name, role' }, { status: 400 })
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
  }

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Create user profile
  const insertData: UserInsert = {
    id: authData.user.id,
    name,
    email,
    role,
    level: 'bronze',
    total_points: 0,
    lifetime_points: 0,
    streak_weeks: 0,
    class_id: class_id || null,
  }
  const { error: profileError } = await admin.from('users').insert(insertData as never)

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, userId: authData.user.id })
}

// DELETE: Delete a user - admin only
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (profile as { role: string } | null)?.role
  if (!userRole || userRole !== 'admin') {
    return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
  }

  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId obrigatorio' }, { status: 400 })
  }

  // Don't allow deleting yourself
  if (userId === user.id) {
    return NextResponse.json({ error: 'Nao pode deletar a si mesmo' }, { status: 400 })
  }

  // Delete profile first, then auth user
  await (admin.from('users').delete() as never as { eq: (col: string, val: string) => Promise<unknown> }).eq('id', userId)
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
