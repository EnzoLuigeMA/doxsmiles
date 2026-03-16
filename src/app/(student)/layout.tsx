import Link from 'next/link'
import { requireAuth } from '@/lib/auth/helpers'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Logo } from '@/components/auth/logo'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/loja', label: 'Loja' },
  { href: '/historico', label: 'Historico' },
  { href: '/vouchers', label: 'Vouchers' },
]

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-dox-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-dox-border bg-dox-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <Logo size="sm" showText={false} />
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-dox-muted hover:text-dox-white rounded-md hover:bg-dox-surface-2 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dox-muted hidden sm:block">{user.dox_id}</span>
            <SignOutButton size="sm" />
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-xs text-dox-muted hover:text-dox-white rounded-md hover:bg-dox-surface-2 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
