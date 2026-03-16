import { requireRole } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type ClassRow = Database['public']['Tables']['classes']['Row']
type Tx = Database['public']['Tables']['point_transactions']['Row']
type Rule = Database['public']['Tables']['point_rules']['Row']

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

  // Recent transactions by this teacher
  const { data: awardsRaw } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('awarded_by', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const awardsList: Tx[] = (awardsRaw as Tx[]) || []

  // Enrich with student names and rule info
  const rulesMap = new Map(rules.map((r) => [r.id, r]))

  const recentAwards = awardsList.map((award) => {
    const student = students.find((s) => s.id === award.user_id)
    const rule = award.rule_id ? rulesMap.get(award.rule_id) || null : null
    return { ...award, student: student || null, rule }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">Painel do Professor</h1>
        <p className="text-sm text-dox-muted mt-1">
          {classes.length} turma(s) · {students.length} aluno(s)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <div className="bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Seus Alunos</h2>
          </div>
          <div className="divide-y divide-dox-border max-h-96 overflow-y-auto">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-dox-white">{student.name}</p>
                    <p className="text-xs text-dox-muted">{student.dox_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-dox-red">{student.total_points} pts</p>
                    <p className="text-xs text-dox-muted capitalize">{student.level}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-dox-muted text-sm">
                Nenhum aluno vinculado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Point Rules */}
        <div className="bg-dox-surface rounded-xl border border-dox-border">
          <div className="p-4 border-b border-dox-border">
            <h2 className="font-semibold text-dox-white">Regras de Pontos</h2>
          </div>
          <div className="divide-y divide-dox-border max-h-96 overflow-y-auto">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{rule.icon}</span>
                  <div>
                    <p className="text-sm text-dox-white">{rule.action_name}</p>
                    <p className="text-xs text-dox-muted capitalize">{rule.category}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-400">+{rule.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Awards */}
      <div className="bg-dox-surface rounded-xl border border-dox-border">
        <div className="p-4 border-b border-dox-border">
          <h2 className="font-semibold text-dox-white">Pontos Recentes Atribuidos</h2>
        </div>
        <div className="divide-y divide-dox-border">
          {recentAwards.length > 0 ? (
            recentAwards.map((award) => (
              <div key={award.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{award.rule?.icon || '+'}</span>
                  <div>
                    <p className="text-sm text-dox-white">
                      {award.student?.name || 'Aluno'} — {award.rule?.action_name || 'Pontos'}
                    </p>
                    <p className="text-xs text-dox-muted">
                      {new Date(award.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-400">
                  +{award.points_awarded}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-dox-muted text-sm">
              Nenhum ponto atribuido ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
