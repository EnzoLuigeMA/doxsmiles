'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RecoverForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="space-y-5 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
          <span className="text-3xl">✉️</span>
        </div>
        <div>
          <p className="text-sm text-white font-medium">Link enviado!</p>
          <p className="text-xs text-dox-muted mt-1">Verifique seu email para redefinir a senha.</p>
        </div>
        <Link
          href="/login"
          className="text-xs text-dox-muted hover:text-white transition-colors"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs text-dox-muted text-center">
        Digite seu email para receber um link de recuperacao.
      </p>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
          {error}
        </div>
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
      >
        Enviar link
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs text-dox-muted hover:text-white transition-colors"
        >
          Voltar ao login
        </Link>
      </div>
    </form>
  )
}
