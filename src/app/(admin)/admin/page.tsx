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
    { label: 'Usuarios', value: users.length, icon: '👥', color: 'from-blue-500/20 to-blue-900/10' },
    { label: 'Alunos', value: totalStudents, icon: '🎓', color: 'from-green-500/20 to-green-900/10' },
    { label: 'Professores', value: totalTeachers, icon: '📚', color: 'from-yellow-500/20 to-yellow-900/10' },
    { label: 'Transacoes', value: totalTransactions || 0, icon: '💰', color: 'from-emerald-500/20 to-emerald-900/10' },
    { label: 'Vouchers', value: totalVouchers || 0, icon: '🎟️', color: 'from-purple-500/20 to-purple-900/10' },
    { label: 'Produtos', value: totalProducts || 0, icon: '🏪', color: 'from-red-500/20 to-red-900/10' },
  ]

  const roleConfig: Record<string, { label: string; dot: string; badge: string }> = {
    admin: { label: 'Admin', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
    teacher: { label: 'Professor', dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    student: { label: 'Aluno', dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <p className="text-sm text-dox-muted mb-1">Painel de controle</p>
        <h1 className="text-3xl font-bold text-white">Administracao</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up stagger-1">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card rounded-2xl p-4 bg-gradient-to-br ${stat.color} hover-lift`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-dox-muted uppercase tracking-widest">{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create User + All Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-white">Criar Usuario</h2>
            <p className="text-xs text-dox-muted mt-1">Adicione professores ou admins</p>
          </div>
          <div className="p-5">
            <CreateUserForm />
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-3">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white">Todos os Usuarios</h2>
            <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">{users.length} total</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {users.map((u) => {
              const rc = roleConfig[u.role] || roleConfig.student
              return (
                <div key={u.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${rc.dot}`} />
                    <div>
                      <p className="text-sm text-white font-medium">{u.name}</p>
                      <p className="text-xs text-dox-muted">{u.dox_id} · {u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${rc.badge}`}>
                        {rc.label}
                      </span>
                      <p className="text-xs text-dox-muted mt-1">{u.total_points} pts · {u.level}</p>
                    </div>
                    {u.id !== currentUser.id && (
                      <DeleteUserButton userId={u.id} userName={u.name} />
                    )}
                  </div>
                </div>
              )
            })}
            {users.length === 0 && (
              <div className="p-12 text-center text-dox-muted text-sm">
                Nenhum usuario cadastrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-4">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-bold text-white">Transacoes Recentes</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentTx.length > 0 ? (
            recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg">
                    {tx.rule?.icon || '⭐'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tx.user?.name || 'Usuario'}</p>
                    <p className="text-xs text-dox-muted">
                      {tx.rule?.action_name || 'Pontos'} · {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                  +{tx.points_awarded}
                </span>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <span className="text-4xl block mb-3">📊</span>
              <p className="text-dox-muted text-sm">Nenhuma transacao ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
