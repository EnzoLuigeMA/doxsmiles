import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Voucher = Database['public']['Tables']['vouchers']['Row']
type Product = Database['public']['Tables']['products']['Row']

export const metadata = {
  title: 'Vouchers - DoxMiles',
}

const statusConfig = {
  active: { label: 'Ativo', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '✅' },
  used: { label: 'Usado', color: 'bg-white/5 text-dox-muted border-white/10', icon: '✓' },
  expired: { label: 'Expirado', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '⏰' },
} as const

export default async function VouchersPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: vouchersRaw } = await supabase
    .from('vouchers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const voucherList: Voucher[] = (vouchersRaw as Voucher[]) || []

  const { data: productsRaw } = await supabase.from('products').select('*')
  const productsMap = new Map((productsRaw as Product[] || []).map((p) => [p.id, p]))

  const vouchers = voucherList.map((v) => ({
    ...v,
    product: productsMap.get(v.product_id) || null,
  }))

  const activeCount = vouchers.filter((v) => v.status === 'active').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-sm text-dox-muted mb-1">Seus premios</p>
          <h1 className="text-3xl font-bold text-white">Vouchers</h1>
        </div>
        {activeCount > 0 && (
          <div className="glass-card rounded-xl px-4 py-2 glow-red">
            <p className="text-xs text-dox-muted">Vouchers ativos</p>
            <p className="text-lg font-bold text-green-400">{activeCount}</p>
          </div>
        )}
      </div>

      {vouchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {vouchers.map((voucher, i) => {
            const status = statusConfig[voucher.status]
            const isActive = voucher.status === 'active'

            return (
              <div
                key={voucher.id}
                className={`glass-card rounded-2xl overflow-hidden animate-fade-in-up ${isActive ? 'glow-red' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Ticket top */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {voucher.product?.name || 'Produto'}
                      </h3>
                      <p className="text-xs text-dox-muted mt-0.5 capitalize">
                        {voucher.product?.category}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                </div>

                {/* Ticket divider (dashed) */}
                <div className="relative px-5">
                  <div className="border-t border-dashed border-white/10" />
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-dox-black rounded-full" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-dox-black rounded-full" />
                </div>

                {/* Ticket bottom */}
                <div className="p-5 pt-4">
                  <div className="bg-white/[0.03] rounded-xl p-4 text-center mb-3">
                    <p className="text-[10px] text-dox-muted uppercase tracking-widest mb-1">Codigo</p>
                    <p className="font-mono text-xl text-white tracking-[0.2em] font-bold">{voucher.code}</p>
                  </div>

                  <div className="flex justify-between text-xs text-dox-muted">
                    <span>{voucher.points_spent.toLocaleString('pt-BR')} pts</span>
                    <span>
                      Expira: {voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 text-center animate-fade-in-up">
          <span className="text-5xl block mb-4">🎟️</span>
          <p className="text-white font-medium">Voce ainda nao resgatou nenhum voucher.</p>
          <p className="text-dox-muted text-sm mt-2">
            Visite a <span className="text-gradient-red font-semibold">Loja</span> para trocar seus pontos por premios!
          </p>
        </div>
      )}
    </div>
  )
}
