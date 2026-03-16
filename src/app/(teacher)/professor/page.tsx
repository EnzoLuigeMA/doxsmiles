import { requireRole } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type ClassRow = Database['public']['Tables']['classes']['Row']
type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

const levelConfig: Record<string, { icon: string; color: string }> = {
  bronze: { icon: '🥉', color: 'text-amber-400' },
  prata: { icon: '🥈', color: 'text-gray-300' },
  ouro: { icon: '🥇', color: 'text-yellow-400' },
  elite: { icon: '💎', color: 'text-red-400' },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  classroom: { label: 'Sala de Aula', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  financial: { label: 'Financeiro', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  social: { label: 'Social', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  bonus: { label: 'Bonus', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
}

export const metadata = {
  title: 'Professor - DoxMiles',
}

export default async function ProfessorPage() {
  const user = await requireRole('teacher')
  const supabase = await createClient()

  const { data: classesRaw } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user.id)
    .eq('active', true)

  const classes: ClassRow[] = (classesRaw as ClassRow[]) || []
  const classIds = classes.map((c) => c.id)

  let students: UserRow[] = []
  if (classIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('class_id', classIds)
      .eq('role', 'student')
      .order('name')
    students = (data as UserRow[]) || []
  }

  const { data: rulesRaw } = await supabase
    .from('point_rules')
    .select('*')
    .eq('active', true)
    .order('category')

  const rules: Rule[] = (rulesRaw as Rule[]) || []

  const { data: awardsRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('awarded_by', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const awardsList: Tx[] = (awardsRaw as Tx[]) || []

  const rulesMap = new Map(rules.map((r) => [r.id, r]))

  const recentAwards = awardsList.map((award) => {
    const student = students.find((s) => s.id === award.user_id)
    const rule = award.rule_id ? rulesMap.get(award.rule_id) || null : null
    return { ...award, student: student || null, rule }
  })

  const totalPointsGiven = awardsList.reduce((sum, a) => sum + a.points_awarded, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <p className="text-sm text-dox-muted mb-1">Bem-vindo, Professor</p>
        <h1 className="text-3xl font-bold text-white">
          <span className="text-gradient-red">{user.name.split(' ')[0]}</span>
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="glass-card rounded-2xl p-5 text-center bg-gradient-to-br from-blue-500/10 to-blue-900/5 hover-lift">
          <p className="text-3xl font-black text-white">{classes.length}</p>
          <p className="text-xs text-dox-muted mt-1">Turmas</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center bg-gradient-to-br from-green-500/10 to-green-900/5 hover-lift">
          <p className="text-3xl font-black text-white">{students.length}</p>
          <p className="text-xs text-dox-muted mt-1">Alunos</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center bg-gradient-to-br from-yellow-500/10 to-yellow-900/5 hover-lift">
          <p className="text-3xl font-black text-green-400">+{totalPointsGiven}</p>
          <p className="text-xs text-dox-muted mt-1">Pontos dados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white">Seus Alunos</h2>
            <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">{students.length}</span>
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {students.length > 0 ? (
              students.map((student, i) => {
                const lvl = levelConfig[student.level] || levelConfig.bronze
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors animate-slide-in-right"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-white">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{student.name}</p>
                        <p className="text-xs text-dox-muted">{student.dox_id}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-gradient-red">{student.total_points} pts</p>
                        <p className={`text-xs ${lvl.color} capitalize`}>{lvl.icon} {student.level}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center">
                <span className="text-4xl block mb-3">🎓</span>
                <p className="text-dox-muted text-sm">Nenhum aluno vinculado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Point Rules */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-3">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white">Regras de Pontos</h2>
            <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">{rules.length} regras</span>
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {rules.map((rule, i) => {
              const cat = categoryConfig[rule.category] || null
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors animate-slide-in-right"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg">
                      {rule.icon}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{rule.action_name}</p>
                      {cat && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color}`}>
                          {cat.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    +{rule.points}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Awards */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up stagger-4">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-white">Pontos Recentes Atribuidos</h2>
          <span className="text-xs text-dox-muted bg-white/5 px-3 py-1 rounded-full">Ultimos 10</span>
        </div>
        <div className="divide-y divide-white/5">
          {recentAwards.length > 0 ? (
            recentAwards.map((award, i) => (
              <div
                key={award.id}
                className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors animate-slide-in-right"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dox-red/20 to-dox-red/5 flex items-center justify-center text-lg">
                    {award.rule?.icon || '⭐'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {award.student?.name || 'Aluno'}
                    </p>
                    <p className="text-xs text-dox-muted">
                      {award.rule?.action_name || 'Pontos'} · {new Date(award.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                  +{award.points_awarded}
                </span>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <span className="text-4xl block mb-3">📊</span>
              <p className="text-dox-muted text-sm">Nenhum ponto atribuido ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
