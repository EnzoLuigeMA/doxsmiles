'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, type ButtonProps } from '@/components/ui/button'

type SignOutButtonProps = Omit<ButtonProps, 'onClick'>

export function SignOutButton({ children = 'Sair', ...props }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} {...props}>
      {children}
    </Button>
  )
}
