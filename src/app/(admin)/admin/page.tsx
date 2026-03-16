import { requireRole } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'
import { CreateUserForm } from '@/components/admin/create-user-form'
import { DeleteUserButton } from '@/components/admin/delete-user-button'

type User = Database['public']['Tables']['users']['Row']

export const metadata = {
  title: 'Admin - DoxMiles',
}

export default async function AdminPage() {
  const currentUser = await requireRole('admin')
  const supabase = createAdminClient()

  // Fetch all data with admin client (bypasses RLS)
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const users: User[] = allUsers || []
  const totalStudents = users.filter((u) => u.role === 'student').length
  const totalTeachers = users.filter((u) => u.role === 'teacher').length

  const { count: totalTransactions } = await supabase
    .from('point_transactions')
    .select('*', { count: 'exact', head: true })

  const { count: totalVouchers } = await supabase
    .from('vouchers')
    .select('*', { count: 'exact', head: true })

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  type Tx = Database['public']['Tables']['point_transactions']['Row']
  type Rule = Database['public']['Tables']['point_rules']['Row']
  const { data: recentTxRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const txList: Tx[] = recentTxRaw || []

  const { data: allRules } = await supabase.from('point_rules').select('*')
  const rulesMap = new Map((allRules as Rule[] || []).map((r) => [r.id, r]))

  const recentTx = txList.map((tx) => {
    const matchedUser = users.find((u) => u.id === tx.user_id)
    const rule = tx.rule_id ? rulesMap.get(tx.rule_id) || null : null
    return { ...tx, user: matchedUser || null, rule }
  })

  const stats = [
    { label: 'Total Usuarios', value: users.length },
    { label: 'Alunos', value: totalStudents },
    { label: 'Professores', value: totalTeachers },
    { label: 'Transacoes', value: totalTransactions || 0 },
    { label: 'Vouchers', value: totalVouchers || 0 },
    { label: 'Produtos Ativos', value: totalProducts || 0 },
  ]

  const roleLabel: Record<string, string> = {
    student: 'Aluno',
    teacher: 'Professor',
    admin: 'Admin',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">Painel Administrativo</h1>
        <p className="text-sm text-dox-muted mt-1">Visao geral da plataforma DoxMiles</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-dox-surface rounded-xl border border-dox-border p-4">
            <p className="text-xs text-dox-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-dox-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create User + All Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <div className="bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Criar Usuario</h2>
            <p className="text-xs text-dox-muted mt-1">Adicione professores ou outros admins</p>
          </div>
          <div className="p-4">
            <CreateUserForm />
          </div>
        </div>

        {/* All Users List */}
        <div className="lg:col-span-2 bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Todos os Usuarios ({users.length})</h2>
          </div>
          <div className="divide-y divide-dox-border max-h-[500px] overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    u.role === 'admin' ? 'bg-dox-red' :
                    u.role === 'teacher' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-sm text-dox-white">{u.name}</p>
                    <p className="text-xs text-dox-muted">{u.dox_id} · {u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs bg-dox-surface-2 text-dox-muted px-2 py-0.5 rounded">
                      {roleLabel[u.role] || u.role}
                    </span>
                    <p className="text-xs text-dox-muted mt-1">{u.total_points} pts · {u.level}</p>
                  </div>
                  {u.id !== currentUser.id && (
                    <DeleteUserButton userId={u.id} userName={u.name} />
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-8 text-center text-dox-muted text-sm">
                Nenhum usuario cadastrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-dox-surface rounded-xl border border-dox-border">
        <div className="p-4 border-b border-dox-border">
          <h2 className="font-semibold text-dox-white">Transacoes Recentes</h2>
        </div>
        <div className="divide-y divide-dox-border">
          {recentTx.length > 0 ? (
            recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tx.rule?.icon || '+'}</span>
                  <div>
                    <p className="text-sm text-dox-white">{tx.user?.name || 'Usuario'}</p>
                    <p className="text-xs text-dox-muted">
                      {tx.rule?.action_name || 'Pontos'} · {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-400">+{tx.points_awarded}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-dox-muted text-sm">
              Nenhuma transacao ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
