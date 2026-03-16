'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o usuario "${userName}"? Esta acao nao pode ser desfeita.`)) {
      return
    }

    setLoading(true)

    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao excluir usuario')
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Excluir'}
    </button>
  )
}
