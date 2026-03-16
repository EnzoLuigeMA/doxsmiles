import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const categoryIcons: Record<string, string> = {
  papelaria: '✏️',
  acessorios: '🎁',
  vestuario: '👕',
  premium: '⭐',
  kits: '📦',
}

const categoryGradients: Record<string, string> = {
  papelaria: 'from-blue-500/20 to-blue-900/20',
  acessorios: 'from-purple-500/20 to-purple-900/20',
  vestuario: 'from-emerald-500/20 to-emerald-900/20',
  premium: 'from-yellow-500/20 to-amber-900/20',
  kits: 'from-red-500/20 to-red-900/20',
}

export const metadata = {
  title: 'Loja - DoxMiles',
}

export default async function LojaPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: productsRaw } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('points_price', { ascending: true })

  const products: Product[] = (productsRaw as Product[]) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-sm text-dox-muted mb-1">Recompensas</p>
          <h1 className="text-3xl font-bold text-white">Loja</h1>
        </div>
        <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 glow-red">
          <div>
            <p className="text-xs text-dox-muted">Seus pontos</p>
            <p className="text-2xl font-black text-gradient-red">{user.total_points.toLocaleString('pt-BR')}</p>
          </div>
          <div className="text-3xl animate-float">🔥</div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product, i) => {
          const canAfford = user.total_points >= product.points_price
          const outOfStock = product.stock === 0
          const gradient = categoryGradients[product.category] || 'from-gray-500/20 to-gray-900/20'

          return (
            <div
              key={product.id}
              className={`glass-card rounded-2xl overflow-hidden hover-lift animate-fade-in-up ${outOfStock ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Product visual */}
              <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                <span className="text-6xl opacity-80 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                  {categoryIcons[product.category] || '🎁'}
                </span>
                {canAfford && !outOfStock && (
                  <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-2.5 py-1 rounded-full font-medium">
                    Disponivel
                  </div>
                )}
                {outOfStock && (
                  <div className="absolute top-3 right-3 bg-white/10 text-dox-muted text-xs px-2.5 py-1 rounded-full">
                    Esgotado
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-white text-sm leading-tight">{product.name}</h3>
                  <span className="text-[10px] text-dox-muted bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                {product.description && (
                  <p className="text-xs text-dox-muted leading-relaxed mb-4">{product.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <span className="text-lg font-black text-gradient-red">
                      {product.points_price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-dox-muted ml-1">pts</span>
                  </div>
                  {!outOfStock && !canAfford && (
                    <p className="text-[11px] text-dox-muted">
                      Faltam <span className="text-white font-medium">{(product.points_price - user.total_points).toLocaleString('pt-BR')}</span> pts
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center">
          <span className="text-5xl block mb-4">🏪</span>
          <p className="text-dox-muted">Nenhum produto disponivel no momento.</p>
        </div>
      )}
    </div>
  )
}
