import { Logo } from '@/components/auth/logo'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata = {
  title: 'Criar Conta - DoxMiles',
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-dox-white">Criar Conta</h1>
            <p className="text-sm text-dox-muted mt-1">
              Cadastre-se como aluno no DoxMiles
            </p>
          </div>
        </div>

        <div className="bg-dox-surface rounded-xl border border-dox-border p-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
