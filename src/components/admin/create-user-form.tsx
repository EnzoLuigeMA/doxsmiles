'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
        <div className="rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-900/30 border border-green-800 px-4 py-3 text-sm text-green-400">
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
        <label className="block text-sm font-medium text-dox-white mb-1.5">
          Tipo de usuario
        </label>
        <div className="flex gap-2">
          {(['teacher', 'student', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                role === r
                  ? 'bg-dox-red border-dox-red text-white'
                  : 'bg-dox-surface-2 border-dox-border text-dox-muted hover:text-dox-white'
              }`}
            >
              {r === 'teacher' ? 'Professor' : r === 'student' ? 'Aluno' : 'Admin'}
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
