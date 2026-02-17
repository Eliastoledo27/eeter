import { Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProducts } from '@/app/actions/products'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { FloatingCartButton } from '@/components/cart/FloatingCartButton'
import { ArchitecturalHeader } from '@/components/product/ArchitecturalHeader'

export default async function ProductDetailPage({
    params,
}: {
    params: { id: string }
}) {
    // Fetch product desde Supabase
    const allProducts = await getProducts()
    const product = allProducts.find(p => p.id === params.id)

    if (!product) {
        notFound()
    }

    // Related products (misma categoría o aleatorios)
    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && (p.category === product.category || Math.random() > 0.5))
        .slice(0, 8)

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Background Ambience & Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#CA8A04]/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#CA8A04]/5 rounded-full blur-[120px]" />

                {/* Visual Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40" />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            </div>

            <ArchitecturalHeader
                productName={product.name}
                productCategory={product.category || undefined}
            />

            {/* Main Content */}
            <section className="py-8 lg:py-20 px-4 md:px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    {/* Unified Mobile Globe */}
                    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 lg:bg-transparent lg:backdrop-blur-none lg:rounded-none lg:border-0 overflow-hidden lg:overflow-visible">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-16 xl:gap-24">
                            {/* LEFT: Product Gallery (60% / 3 cols) */}
                            <div className="lg:col-span-3">
                                <ProductGallery
                                    images={product.images.length > 0 ? product.images : ['/placeholder-shoe.png']}
                                    productName={product.name}
                                />
                            </div>

                            {/* RIGHT: Product Info (40% / 2 cols) */}
                            <div className="lg:col-span-2">
                                <ProductInfo product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="py-32 px-6 border-t border-white/5 relative z-10">
                    <div className="container mx-auto max-w-7xl">
                        <div className="mb-16">
                            <span className="text-[#CA8A04] font-mono text-sm tracking-[0.4em] uppercase mb-4 block">Sugerencias Éter</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase whitespace-pre-line">
                                TAMBIÉN TE <br /> <span className="text-[#CA8A04]">PUEDE INTERESAR</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/catalog/${item.id}`}
                                    className="group relative bg-white/5 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 border border-white/5 hover:border-[#CA8A04]/30 transition-all duration-700 overflow-hidden"
                                >
                                    <div className="aspect-square relative mb-4 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden bg-black/40">
                                        <Image
                                            src={item.images[0] || '/placeholder-shoe.png'}
                                            fill
                                            className="object-contain p-2 md:p-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-1000 ease-out"
                                            alt={item.name}
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-3">
                                        <p className="text-[8px] md:text-[10px] text-[#CA8A04] font-bold uppercase tracking-[0.3em]">{item.category || 'Sneakers'}</p>
                                        <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-[#CA8A04] transition-colors line-clamp-1 uppercase">
                                            {item.name}
                                        </h3>
                                        <p className="text-lg md:text-2xl font-light text-white tracking-tighter">
                                            ${item.base_price.toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trust Bar */}
            <section className="py-20 px-6 bg-black/40 backdrop-blur-md border-y border-white/5 relative z-10 overflow-hidden">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { icon: Shield, label: 'PAGO SEGURO', value: 'PROTOCOLOS DE ENCRIPTACIÓN' },
                            { icon: Package, label: 'ENVÍO RÁPIDO', value: 'LOGÍSTICA PREVENTIVA' },
                            { icon: Truck, label: 'GARANTÍA ÉTER', value: 'CALIDAD ASEGURADA' }
                        ].map((item, idx) => (
                            <div key={idx} className="group flex flex-col items-center">
                                <div className="h-20 w-20 flex items-center justify-center bg-[#CA8A04]/10 rounded-[1.5rem] border border-[#CA8A04]/20 mb-8 group-hover:bg-[#CA8A04] group-hover:text-black transition-all duration-500">
                                    <item.icon size={32} />
                                </div>
                                <h4 className="text-xl font-black tracking-tighter text-white mb-2 uppercase">
                                    {item.label}
                                </h4>
                                <p className="text-gray-500 text-xs font-mono tracking-widest">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Floating Cart Button */}
            <FloatingCartButton />
        </div>
    )
}
