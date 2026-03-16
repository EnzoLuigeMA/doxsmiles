import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

const levelConfig = {
  bronze: { color: 'from-amber-700 to-amber-900', text: 'text-amber-400', glow: 'shadow-amber-900/30', next: 1000, label: 'Bronze', icon: '🥉' },
  prata: { color: 'from-gray-300 to-gray-500', text: 'text-gray-300', glow: 'shadow-gray-500/30', next: 3000, label: 'Prata', icon: '🥈' },
  ouro: { color: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/30', next: 5000, label: 'Ouro', icon: '🥇' },
  elite: { color: 'from-red-500 to-red-800', text: 'text-red-400', glow: 'shadow-red-500/30', next: 99999, label: 'Elite', icon: '💎' },
} as const

export const metadata = {
  title: 'Dashboard - DoxMiles',
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: txRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const txList: Tx[] = (txRaw as Tx[]) || []

  const { data: rulesRaw } = await supabase.from('point_rules').select('*')
  const rulesMap = new Map((rulesRaw as Rule[] || []).map((r) => [r.id, r]))

  const transactions = txList.map((tx) => ({
    ...tx,
    rule: tx.rule_id ? rulesMap.get(tx.rule_id) || null : null,
  }))

  const level = levelConfig[user.level]
  const progress = user.level === 'elite'
    ? 100
    : Math.min(100, Math.round((user.lifetime_points / level.next) * 100))

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="animate-fade-in-up">
        <p className="text-sm text-dox-muted mb-1">Bem-vindo de volta</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Ola, <span className="text-gradient-red">{user.name.split(' ')[0]}</span>!
        </h1>
      </div>

      {/* Points Hero Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up stagger-1 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-dox-red/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-dox-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Points */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-dox-muted uppercase tracking-widest mb-2">Seus Pontos</p>
            <p className="text-4xl sm:text-5xl font-black text-gradient-red animate-count-up">
              {user.total_points.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-dox-muted mt-1">pontos disponiveis</p>
          </div>

          {/* Level */}
          <div>
            <p className="text-xs text-dox-muted uppercase tracking-widest mb-2">Nivel</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-float">{level.icon}</span>
              <span className={`text-2xl font-black ${level.text}`}>{level.label}</span>
            </div>
          </div>

          {/* Streak */}
          <div>
            <p className="text-xs text-dox-muted uppercase tracking-widest mb-2">Streak</p>
            <p className="text-3xl font-black text-white">{user.streak_weeks}</p>
            <p className="text-xs text-dox-muted">semanas seguidas</p>
          </div>

          {/* Lifetime */}
          <div>
            <p className="text-xs text-dox-muted uppercase tracking-widest mb-2">Total Ganho</p>
            <p className="text-3xl font-black text-white">{user.lifetime_points.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-dox-muted">pontos na carreira</p>
          </div>
        </div>

        {/* Level Progress */}
        {user.level !== 'elite' ? (
          <div className="relative mt-8 pt-6 border-t border-white/5">
            <div className="flex justify-between text-sm mb-3">
              <span className={`font-semibold ${level.text}`}>{level.icon} {level.label}</span>
              <span className="text-dox-muted">
                <span className="text-white font-semibold">{user.lifetime_points.toLocaleString('pt-BR')}</span> / {level.next.toLocaleString('pt-BR')} pts
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${level.color} progress-bar-animated transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-dox-muted mt-2">
              Faltam <span className="text-white font-medium">{(level.next - user.lifetime_points).toLocaleString('pt-BR')}</span> pontos para o proximo nivel
            </p>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-dox-muted">
              Voce atingiu o nivel maximo! <span className="text-red-400 font-semibold">Elite</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up stagger-2">
        <div className="glass-card rounded-2xl p-4 text-center hover-lift">
          <p className="text-2xl font-bold text-white">{user.dox_id}</p>
          <p className="text-xs text-dox-muted mt-1">Seu ID</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center hover-lift">
          <p className="text-2xl font-bold text-green-400">{transactions.length}</p>
          <p className="text-xs text-dox-muted mt-1">Atividades recentes</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center hover-lift">
          <p className="text-2xl font-bold text-yellow-400">{user.streak_weeks > 0 ? '🔥' : '❄️'}</p>
          <p className="text-xs text-dox-muted mt-1">{user.streak_weeks > 0 ? 'Em sequencia!' : 'Inicie sua streak'}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-3">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Atividade Recente</h2>
          <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">Ultimas 5</span>
        </div>
        <div className="divide-y divide-white/5">
          {transactions.length > 0 ? (
            transactions.map((tx, i) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors animate-slide-in-right`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dox-red/20 to-dox-red/5 flex items-center justify-center text-xl">
                    {tx.rule?.icon || '⭐'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tx.rule?.action_name || 'Pontos'}</p>
                    <p className="text-xs text-dox-muted">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
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
              <span className="text-4xl block mb-3">🚀</span>
              <p className="text-dox-muted text-sm">Nenhuma atividade ainda.</p>
              <p className="text-dox-muted text-xs mt-1">Continue participando das aulas para ganhar pontos!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
