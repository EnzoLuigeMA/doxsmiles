import { Logo } from '@/components/auth/logo'
import { RecoverForm } from '@/components/auth/recover-form'

export const metadata = {
  title: 'Recuperar Senha - DOXSmiles',
}

export default function RecoverPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dox-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <h1 className="text-xl font-bold text-dox-white">Recuperar Senha</h1>
        </div>

        <div className="bg-dox-surface rounded-xl border border-dox-border p-6">
          <RecoverForm />
        </div>
      </div>
    </div>
  )
}
