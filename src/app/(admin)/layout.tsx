import Link from 'next/link'
import { requireRole } from '@/lib/auth/helpers'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Logo } from '@/components/auth/logo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('admin')

  return (
    <div className="min-h-screen bg-dox-black bg-dots">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size="sm" showText={false} />
              <span className="text-sm font-black text-gradient-red">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">{user.name}</span>
            <SignOutButton size="sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
