import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

export const metadata = {
  title: 'Historico - DoxMiles',
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  classroom: { label: 'Sala de Aula', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  financial: { label: 'Financeiro', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  social: { label: 'Social', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  bonus: { label: 'Bonus', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
}

export default async function HistoricoPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: txRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const txList: Tx[] = (txRaw as Tx[]) || []

  const { data: rulesRaw } = await supabase.from('point_rules').select('*')
  const rulesMap = new Map((rulesRaw as Rule[] || []).map((r) => [r.id, r]))

  const transactions = txList.map((tx) => ({
    ...tx,
    rule: tx.rule_id ? rulesMap.get(tx.rule_id) || null : null,
  }))

  // Calculate total earned
  const totalEarned = transactions.reduce((sum, tx) => sum + tx.points_awarded + tx.bonus_points, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-sm text-dox-muted mb-1">Suas conquistas</p>
          <h1 className="text-3xl font-bold text-white">Historico</h1>
        </div>
        <div className="flex gap-3">
          <div className="glass-card rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-dox-muted">Total ganho</p>
            <p className="text-lg font-bold text-green-400">+{totalEarned.toLocaleString('pt-BR')}</p>
          </div>
          <div className="glass-card rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-dox-muted">Atividades</p>
            <p className="text-lg font-bold text-white">{transactions.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
        <div className="divide-y divide-white/5">
          {transactions.length > 0 ? (
            transactions.map((tx, i) => {
              const cat = tx.rule?.category ? categoryConfig[tx.rule.category] : null
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors animate-slide-in-right"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl">
                      {tx.rule?.icon || '⭐'}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{tx.rule?.action_name || 'Pontos'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-dox-muted">
                          {new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {cat && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color}`}>
                            {cat.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                      +{tx.points_awarded}
                    </span>
                    {tx.bonus_points > 0 && (
                      <p className="text-xs text-yellow-400 mt-1 font-medium">+{tx.bonus_points} bonus</p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-16 text-center">
              <span className="text-5xl block mb-4">📊</span>
              <p className="text-dox-muted text-sm">Nenhuma atividade registrada ainda.</p>
              <p className="text-dox-muted text-xs mt-1">Participe das aulas para comecar a ganhar pontos!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
