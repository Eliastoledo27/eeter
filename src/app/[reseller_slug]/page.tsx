import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

interface Props {
  params: { reseller_slug: string }
}

export default async function ResellerStorePage({ params }: Props) {
  const supabase = createClient()
  const { reseller_slug } = params

  // Fetch reseller profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('reseller_slug', reseller_slug)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  const commissionRate = profile.commission_rate || 0.1

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-gold to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                    {profile.full_name?.charAt(0) || 'E'}
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none">{profile.full_name}</h1>
                    <p className="text-xs text-accent-gold">Revendedor Oficial Éter</p>
                </div>
            </div>
            <a 
                href={`https://wa.me/${profile.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-green-600/30 transition-colors border border-green-600/30"
            >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contactar</span>
            </a>
        </div>
      </header>

      {/* Hero / Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-primary to-primary opacity-60" />
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Colección Exclusiva
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
                Descubre los mejores productos seleccionados especialmente para ti.
            </p>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product) => {
                const finalPrice = product.base_price * (1 + commissionRate)
                
                return (
                    <div key={product.id} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,213,141,0.1)]">
                        <div className="aspect-square relative overflow-hidden bg-white/5">
                            {/* Placeholder for image if none */}
                            {product.images && product.images[0] ? (
                                <Image
                                    src={product.images[0]} 
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ShoppingBag className="w-12 h-12 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                                {product.category || 'General'}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent-gold transition-colors">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                            
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-2xl font-bold text-white">
                                    ${finalPrice.toFixed(2)}
                                </span>
                                <a 
                                    href={`https://wa.me/${profile.whatsapp_number}?text=Hola ${profile.full_name}, me interesa el producto ${product.name} que vi en tu catálogo.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent-gold transition-colors flex items-center gap-2"
                                >
                                    Comprar <MessageCircle className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </main>
    </div>
  )
}
