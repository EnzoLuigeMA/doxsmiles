import { Logo } from '@/components/auth/logo'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata = {
  title: 'Criar Conta - DoxMiles',
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black bg-dots px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dox-red/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-float">
            <Logo size="lg" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-gradient-red">Criar Conta</h1>
            <p className="text-sm text-dox-muted mt-1">
              Cadastre-se como aluno no DoxMiles
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 glow-red">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
