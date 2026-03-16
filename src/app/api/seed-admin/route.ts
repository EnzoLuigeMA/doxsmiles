import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { secret, email, password, name } = await request.json()

  if (secret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Create auth user — the DB trigger handle_new_user() auto-creates the profile
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'admin' },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Update the profile to admin + elite (trigger creates as student by default metadata)
  await supabase
    .from('users')
    .update({ role: 'admin', level: 'elite' } as never)
    .eq('id', authData.user.id)

  return NextResponse.json({ success: true, userId: authData.user.id })
}
