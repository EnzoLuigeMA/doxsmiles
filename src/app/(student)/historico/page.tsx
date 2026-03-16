import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

export const metadata = {
  title: 'Historico - DOXSmiles',
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

  const categoryLabels: Record<string, string> = {
    classroom: 'Sala de Aula',
    financial: 'Financeiro',
    social: 'Social',
    bonus: 'Bonus',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">Historico de Pontos</h1>
        <p className="text-sm text-dox-muted mt-1">Todas as suas conquistas</p>
      </div>

      <div className="bg-dox-surface rounded-xl border border-dox-border">
        <div className="divide-y divide-dox-border">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dox-surface-2 flex items-center justify-center text-lg">
                    {tx.rule?.icon || '+'}
                  </div>
                  <div>
                    <p className="text-sm text-dox-white">{tx.rule?.action_name || 'Pontos'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-dox-muted">
                        {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {tx.rule?.category && (
                        <>
                          <span className="text-dox-border">·</span>
                          <span className="text-xs text-dox-muted">
                            {categoryLabels[tx.rule.category] || tx.rule.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-green-400">+{tx.points_awarded}</span>
                  {tx.bonus_points > 0 && (
                    <p className="text-xs text-yellow-400">+{tx.bonus_points} bonus</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-dox-muted text-sm">
              Nenhuma transacao encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
