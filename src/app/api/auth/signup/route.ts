import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST: Register a new student account
export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Todos os campos sao obrigatorios.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'student' },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Este email ja esta cadastrado.' }, { status: 400 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Create user profile as student
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    name: name.trim(),
    email,
    role: 'student',
    level: 'bronze',
    total_points: 0,
    lifetime_points: 0,
    streak_weeks: 0,
  } as never)

  if (profileError) {
    // Cleanup auth user on failure
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
