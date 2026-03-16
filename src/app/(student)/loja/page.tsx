import { requireAuth } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export const metadata = {
  title: 'Loja - DOXSmiles',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dox-white">Loja de Recompensas</h1>
          <p className="text-sm text-dox-muted mt-1">Troque seus pontos por premios</p>
        </div>
        <div className="bg-dox-surface rounded-lg border border-dox-border px-4 py-2">
          <p className="text-xs text-dox-muted">Seus pontos</p>
          <p className="text-lg font-bold text-dox-red">{user.total_points.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const canAfford = user.total_points >= product.points_price
          const outOfStock = product.stock === 0

          return (
            <div
              key={product.id}
              className="bg-dox-surface rounded-xl border border-dox-border overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-dox-surface-2 flex items-center justify-center">
                <span className="text-4xl opacity-30">
                  {product.category === 'papelaria' && '✏️'}
                  {product.category === 'acessorios' && '🎁'}
                  {product.category === 'vestuario' && '👕'}
                  {product.category === 'premium' && '⭐'}
                  {product.category === 'kits' && '📦'}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-dox-white text-sm">{product.name}</h3>
                    <span className="text-xs bg-dox-surface-2 text-dox-muted px-2 py-0.5 rounded whitespace-nowrap">
                      {product.category}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-dox-muted mt-2">{product.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-dox-border">
                  <span className="text-sm font-bold text-dox-red">
                    {product.points_price.toLocaleString('pt-BR')} pts
                  </span>
                  {outOfStock ? (
                    <span className="text-xs text-dox-muted">Esgotado</span>
                  ) : (
                    <span className={`text-xs ${canAfford ? 'text-green-400' : 'text-dox-muted'}`}>
                      {canAfford ? 'Disponivel' : 'Pontos insuficientes'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
