import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Voucher = Database['public']['Tables']['vouchers']['Row']
type Product = Database['public']['Tables']['products']['Row']

export const metadata = {
  title: 'Vouchers - DOXSmiles',
}

const statusConfig = {
  active: { label: 'Ativo', color: 'text-green-400 bg-green-900/30 border-green-800' },
  used: { label: 'Usado', color: 'text-dox-muted bg-dox-surface-2 border-dox-border' },
  expired: { label: 'Expirado', color: 'text-red-400 bg-red-900/30 border-red-800' },
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

  // Fetch products for enrichment
  const { data: productsRaw } = await supabase.from('products').select('*')
  const productsMap = new Map((productsRaw as Product[] || []).map((p) => [p.id, p]))

  const vouchers = voucherList.map((v) => ({
    ...v,
    product: productsMap.get(v.product_id) || null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dox-white">Meus Vouchers</h1>
        <p className="text-sm text-dox-muted mt-1">Seus premios resgatados</p>
      </div>

      {vouchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vouchers.map((voucher) => {
            const status = statusConfig[voucher.status]

            return (
              <div
                key={voucher.id}
                className="bg-dox-surface rounded-xl border border-dox-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-dox-white text-sm">
                      {voucher.product?.name || 'Produto'}
                    </h3>
                    <p className="text-xs text-dox-muted mt-0.5">
                      {voucher.product?.category}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="bg-dox-surface-2 rounded-lg p-3 text-center">
                  <p className="text-xs text-dox-muted mb-1">Codigo do voucher</p>
                  <p className="font-mono text-lg text-dox-white tracking-wider">{voucher.code}</p>
                </div>

                <div className="flex justify-between text-xs text-dox-muted">
                  <span>{voucher.points_spent} pts</span>
                  <span>
                    Expira: {voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-dox-surface rounded-xl border border-dox-border p-12 text-center">
          <p className="text-dox-muted text-sm">
            Voce ainda nao resgatou nenhum voucher.
          </p>
          <p className="text-dox-muted text-xs mt-1">
            Visite a Loja para trocar seus pontos por premios!
          </p>
        </div>
      )}
    </div>
  )
}
