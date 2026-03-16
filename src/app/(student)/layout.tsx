'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Logo } from '@/components/auth/logo'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/loja', label: 'Loja', icon: '🏪' },
  { href: '/historico', label: 'Historico', icon: '📊' },
  { href: '/vouchers', label: 'Vouchers', icon: '🎟️' },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-dox-black bg-dots">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Logo size="sm" showText={false} />
              <span className="text-sm font-bold text-gradient-red hidden sm:block">DoxMiles</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-dox-red/10 text-white border border-dox-red/20 glow-red'
                        : 'text-dox-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <SignOutButton size="sm" />
        </div>
        {/* Mobile nav */}
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-dox-red/10 text-white border border-dox-red/20'
                    : 'text-dox-muted hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
