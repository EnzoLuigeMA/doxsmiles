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
    <div className="min-h-screen bg-dox-black">
      <header className="sticky top-0 z-50 border-b border-dox-border bg-dox-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <Logo size="sm" showText={false} />
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm text-dox-white font-medium"
            >
              Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dox-muted">{user.name}</span>
            <SignOutButton size="sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
