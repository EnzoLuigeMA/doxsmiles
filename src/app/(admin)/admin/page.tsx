import { requireRole } from '@/lib/auth/helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

export const metadata = {
  title: 'Admin - DOXSmiles',
}

export default async function AdminPage() {
  await requireRole('admin')
  const supabase = createAdminClient()

  // Fetch all data with admin client (bypasses RLS)
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const users: User[] = allUsers || []
  const totalStudents = users.filter((u) => u.role === 'student').length
  const totalTeachers = users.filter((u) => u.role === 'teacher').length
  const recentUsers = users.slice(0, 10)

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

  // Recent transactions
  type Tx = Database['public']['Tables']['point_transactions']['Row']
  type Rule = Database['public']['Tables']['point_rules']['Row']
  const { data: recentTxRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const txList: Tx[] = recentTxRaw || []

  // Fetch all rules once
  const { data: allRules } = await supabase.from('point_rules').select('*')
  const rulesMap = new Map((allRules as Rule[] || []).map((r) => [r.id, r]))

  // Enrich transactions
  const recentTx = await Promise.all(
    txList.map(async (tx) => {
      const matchedUser = users.find((u) => u.id === tx.user_id)
      const rule = tx.rule_id ? rulesMap.get(tx.rule_id) || null : null
      return { ...tx, user: matchedUser || null, rule }
    })
  )

  const stats = [
    { label: 'Total Usuarios', value: users.length },
    { label: 'Alunos', value: totalStudents },
    { label: 'Professores', value: totalTeachers },
    { label: 'Transacoes', value: totalTransactions || 0 },
    { label: 'Vouchers', value: totalVouchers || 0 },
    { label: 'Produtos Ativos', value: totalProducts || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">Painel Administrativo</h1>
        <p className="text-sm text-dox-muted mt-1">Visao geral da plataforma DOXSmiles</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Usuarios Recentes</h2>
          </div>
          <div className="divide-y divide-dox-border max-h-96 overflow-y-auto">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-dox-white">{u.name}</p>
                  <p className="text-xs text-dox-muted">{u.dox_id} · {u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-dox-surface-2 text-dox-muted px-2 py-0.5 rounded capitalize">
                    {u.role}
                  </span>
                  <p className="text-xs text-dox-muted mt-1">{u.total_points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Transacoes Recentes</h2>
          </div>
          <div className="divide-y divide-dox-border max-h-96 overflow-y-auto">
            {recentTx.length > 0 ? (
              recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tx.rule?.icon || '+'}</span>
                    <div>
                      <p className="text-sm text-dox-white">
                        {tx.user?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-dox-muted">
                        {tx.rule?.action_name || 'Pontos'} · {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">
                    +{tx.points_awarded}
                  </span>
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
    </div>
  )
}
