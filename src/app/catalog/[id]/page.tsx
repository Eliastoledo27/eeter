import { Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProducts } from '@/app/actions/products'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { FloatingCartButton } from '@/components/cart/FloatingCartButton'
import { ArchitecturalHeader } from '@/components/product/ArchitecturalHeader'
import { FloatingShapes } from '@/components/product/FloatingShapes'

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const products = await getProducts()
    const product = products.find(p => p.id === params.id)
    
    if (!product) {
        return {
            title: 'Producto no encontrado | ÉTER Store'
        }
    }

    return {
        title: product.name,
        description: `Adquiere ${product.name} en ÉTER Store. Catálogo premium y logística de primer nivel.`,
        openGraph: {
            title: `${product.name} | ÉTER Store`,
            description: `Descubre ${product.name}. Calzado luxury en stock. Envío express.`,
            images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
            type: 'website'
        }
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: { id: string }
}) {
    const allProducts = await getProducts()
    const product = allProducts.find(p => p.id === params.id)

    if (!product) {
        notFound()
    }

    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && (p.category === product.category || Math.random() > 0.5))
        .slice(0, 8)

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.images,
                        "description": `Adquiere ${product.name} en ÉTER Store. Calzado premium importado con calidad G5/OG.`,
                        "brand": {
                            "@type": "Brand",
                            "name": "ÉTER"
                        },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "ARS",
                            "price": product.base_price,
                            "availability": "https://schema.org/InStock",
                            "url": `https://eter-store.vercel.app/catalog/${product.id}`,
                            "priceValidUntil": "2026-12-31"
                        }
                    })
                }}
            />

            {/* Floating Geometric Shapes with Parallax */}
            <FloatingShapes />

            {/* Background texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #00E5FF 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            <ArchitecturalHeader
                productName={product.name}
                productCategory={product.category || undefined}
            />

            {/* Main Content */}
            <section className="py-4 lg:py-6 px-4 md:px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
                        {/* LEFT: Product Gallery */}
                        <div className="lg:col-span-7">
                            <ProductGallery
                                images={product.images.length > 0 ? product.images : ['/placeholder-shoe.png']}
                                productName={product.name}
                            />
                        </div>

                        {/* RIGHT: Product Info */}
                        <div className="lg:col-span-5">
                            <ProductInfo product={product} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products — Flyer Card Style */}
            {relatedProducts.length > 0 && (
                <section className="py-24 px-6 relative z-10">
                    {/* Section divider with accent */}
                    <div className="container mx-auto max-w-7xl mb-16">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-1 bg-[#00E5FF] rounded-full shadow-[0_0_15px_#00E5FF80]" />
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">
                                TAMBIÉN TE <span className="text-[#00E5FF] drop-shadow-[0_0_10px_#00E5FF40]">INTERESA</span>
                            </h2>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-white/40 text-sm font-light ml-[88px]">
                                Selección curada para tu colección.
                            </p>
                            <Link href="/catalog" className="text-xs font-black uppercase tracking-widest text-[#00E5FF]/70 hover:text-[#00E5FF] transition-colors hover:drop-shadow-[0_0_8px_#00E5FF80]">
                                Ver Todo →
                            </Link>
                        </div>
                    </div>

                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {relatedProducts.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/catalog/${item.id}`}
                                    className="group relative flex flex-col overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-500 hover:shadow-[0_0_20px_#00E5FF20]"
                                >
                                    {/* Diagonal accent slash */}
                                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-20 pointer-events-none">
                                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#00E5FF] rotate-45 group-hover:bg-[#00B3FF] transition-colors shadow-[0_0_10px_#00E5FF80]" />
                                    </div>

                                    <div className="aspect-square relative bg-gradient-to-br from-[#111] to-[#0A0A0A] overflow-hidden">
                                        {/* Subtle triangle behind product */}
                                        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] opacity-10 pointer-events-none">
                                            <svg viewBox="0 0 100 100" fill="#00E5FF" className="w-full h-full drop-shadow-[0_0_10px_#00E5FF40]">
                                                <polygon points="100,100 100,0 0,100" />
                                            </svg>
                                        </div>
                                        <Image
                                            src={item.images[0] || '/placeholder-shoe.png'}
                                            fill
                                            className="object-contain p-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 ease-out drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                                            alt={item.name}
                                        />
                                    </div>

                                    <div className="p-4 space-y-2">
                                        <p className="text-[9px] text-[#00E5FF]/60 font-black uppercase tracking-widest">{item.category || 'Sneakers'}</p>
                                        <h3 className="text-sm font-black text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1 uppercase tracking-wider group-hover:drop-shadow-[0_0_5px_#00E5FF60]">
                                            {item.name}
                                        </h3>
                                        <p className="text-lg font-black text-white tracking-tight">
                                            $ {item.base_price.toLocaleString('es-AR')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trust Bar — Bold & Colorful */}
            <section className="py-20 px-6 relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-[#00E5FF]/[0.02]">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, label: 'Pago Seguro', desc: 'Encriptación de extremo a extremo en todas las transacciones.', color: '#00E5FF' },
                            { icon: Package, label: 'Envío Express', desc: 'Despacho prioritario en 24hs hábiles a todo el país.', color: '#00B3FF' },
                            { icon: Truck, label: '100% Original', desc: 'Garantía de autenticidad en todos nuestros productos.', color: '#0088FF' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-5 p-6 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                <div 
                                    className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 transition-all group-hover:scale-110"
                                    style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30`, borderWidth: 1 }}
                                >
                                    <item.icon size={22} style={{ color: item.color }} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black tracking-wider text-white mb-1 uppercase">
                                        {item.label}
                                    </h4>
                                    <p className="text-white/40 text-xs leading-relaxed font-light">
                                        {item.desc}
                                    </p>
                                </div>
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
