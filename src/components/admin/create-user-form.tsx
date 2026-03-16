'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const roleOptions = [
  { value: 'teacher' as const, label: 'Professor', icon: '📚', color: 'from-yellow-500/20 to-yellow-900/10 border-yellow-500/30 text-yellow-400' },
  { value: 'student' as const, label: 'Aluno', icon: '🎓', color: 'from-green-500/20 to-green-900/10 border-green-500/30 text-green-400' },
  { value: 'admin' as const, label: 'Admin', icon: '🛡️', color: 'from-red-500/20 to-red-900/10 border-red-500/30 text-red-400' },
]

export function CreateUserForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'teacher' | 'student' | 'admin'>('teacher')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao criar usuario')
      setLoading(false)
      return
    }

    setSuccess(`Usuario ${name} criado com sucesso!`)
    setName('')
    setEmail('')
    setPassword('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 animate-fade-in-up">
          {success}
        </div>
      )}

      <Input
        id="new-name"
        label="Nome"
        type="text"
        placeholder="Nome do usuario"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        id="new-email"
        label="Email"
        type="email"
        placeholder="email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="new-password"
        label="Senha"
        type="password"
        placeholder="Senha inicial"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div>
        <label className="block text-xs font-medium text-dox-muted uppercase tracking-wider mb-2">
          Tipo de usuario
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`px-2 py-2.5 text-xs rounded-xl border transition-all duration-300 flex flex-col items-center gap-1 ${
                role === r.value
                  ? `bg-gradient-to-br ${r.color} scale-[1.02]`
                  : 'bg-white/[0.03] border-white/8 text-dox-muted hover:bg-white/[0.05] hover:border-white/15'
              }`}
            >
              <span className="text-base">{r.icon}</span>
              <span className="font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Criar Usuario
      </Button>
    </form>
  )
}
