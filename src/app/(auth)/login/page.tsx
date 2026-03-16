import { Logo } from '@/components/auth/logo'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Login - DOXSmiles',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-dox-white">DOXSmiles</h1>
            <p className="text-sm text-dox-muted mt-1">
              Sua plataforma de recompensas
            </p>
          </div>
        </div>

        <div className="bg-dox-surface rounded-xl border border-dox-border p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
