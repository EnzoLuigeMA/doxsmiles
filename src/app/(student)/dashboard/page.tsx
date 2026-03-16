import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

const levelConfig = {
  bronze: { color: 'text-level-bronze', bg: 'bg-level-bronze-bg', next: 1000, label: 'Bronze' },
  prata: { color: 'text-level-prata', bg: 'bg-level-prata-bg', next: 3000, label: 'Prata' },
  ouro: { color: 'text-level-ouro', bg: 'bg-level-ouro-bg', next: 5000, label: 'Ouro' },
  elite: { color: 'text-level-elite', bg: 'bg-level-elite-bg', next: 99999, label: 'Elite' },
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

  // Fetch rules
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">
          Ola, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-dox-muted mt-1">Bem-vindo ao DoxMiles</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dox-surface rounded-xl border border-dox-border p-4">
          <p className="text-xs text-dox-muted uppercase tracking-wider">Pontos</p>
          <p className="text-2xl font-bold text-dox-red mt-1">{user.total_points.toLocaleString('pt-BR')}</p>
        </div>

        <div className={`rounded-xl border border-dox-border p-4 ${level.bg}`}>
          <p className="text-xs text-dox-muted uppercase tracking-wider">Nivel</p>
          <p className={`text-2xl font-bold mt-1 ${level.color}`}>{level.label}</p>
        </div>

        <div className="bg-dox-surface rounded-xl border border-dox-border p-4">
          <p className="text-xs text-dox-muted uppercase tracking-wider">Streak</p>
          <p className="text-2xl font-bold text-dox-white mt-1">{user.streak_weeks} sem.</p>
        </div>

        <div className="bg-dox-surface rounded-xl border border-dox-border p-4">
          <p className="text-xs text-dox-muted uppercase tracking-wider">Total Ganho</p>
          <p className="text-2xl font-bold text-dox-white mt-1">{user.lifetime_points.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {user.level !== 'elite' && (
        <div className="bg-dox-surface rounded-xl border border-dox-border p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className={level.color}>{level.label}</span>
            <span className="text-dox-muted">{user.lifetime_points} / {level.next} pts</span>
          </div>
          <div className="h-2 bg-dox-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-dox-red rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-dox-surface rounded-xl border border-dox-border">
        <div className="p-4 border-b border-dox-border">
          <h2 className="font-semibold text-dox-white">Atividade Recente</h2>
        </div>
        <div className="divide-y divide-dox-border">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tx.rule?.icon || '+'}</span>
                  <div>
                    <p className="text-sm text-dox-white">{tx.rule?.action_name || 'Pontos'}</p>
                    <p className="text-xs text-dox-muted">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-400">+{tx.points_awarded}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-dox-muted text-sm">
              Nenhuma atividade ainda. Continue participando das aulas!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
