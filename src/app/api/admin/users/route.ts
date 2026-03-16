import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST: Create a new user (teacher/admin) - admin only
export async function POST(request: Request) {
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

  const { email, password, name, role } = await request.json()

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Campos obrigatorios: email, password, name, role' }, { status: 400 })
  }

  if (!['student', 'teacher', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Role invalido' }, { status: 400 })
  }

  // Create auth user — DB trigger auto-creates profile with role from metadata
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
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

  if (userId === user.id) {
    return NextResponse.json({ error: 'Nao pode deletar a si mesmo' }, { status: 400 })
  }

  // Delete profile first (cascade from auth will also work)
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
