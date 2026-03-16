import { Logo } from '@/components/auth/logo'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Login - DoxMiles',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black bg-dots px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dox-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-dox-red/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-float">
            <Logo size="lg" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-gradient-red">DoxMiles</h1>
            <p className="text-sm text-dox-muted mt-1">
              Sua plataforma de recompensas
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 glow-red">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
