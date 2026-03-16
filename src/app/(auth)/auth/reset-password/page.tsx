import { Logo } from '@/components/auth/logo'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = {
  title: 'Redefinir Senha - DoxMiles',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black bg-dots px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-dox-red/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <h1 className="text-xl font-black text-gradient-red">Redefinir Senha</h1>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
