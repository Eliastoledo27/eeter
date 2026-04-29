import { Package, Shield, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProducts } from '@/app/actions/products'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { FloatingCartButton } from '@/components/cart/FloatingCartButton'
import { ArchitecturalHeader } from '@/components/product/ArchitecturalHeader'

import { Metadata } from 'next'

import { SmartAuraSection } from '@/components/catalog/SmartAuraSection'

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

            <div className="grunge-overlay fixed z-0" />
            <div className="paint-splatter -left-20 top-36 hidden md:block" />
            <div className="paint-splatter -right-20 top-[42rem] hidden opacity-20 md:block" />

            <ArchitecturalHeader
                productName={product.name}
                productCategory={product.category || undefined}
            />

            {/* Main Content */}
            <section className="py-4 lg:py-6 px-4 md:px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="eter-card grid grid-cols-1 gap-8 overflow-hidden p-4 md:p-6 lg:grid-cols-12 lg:gap-12">
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

            {/* AI Smart Aura Recommendations */}
            <SmartAuraSection currentProductId={product.id} />


            {/* Trust Bar — Bold & Colorful */}
            <section className="relative z-10 border-t border-[#252525] bg-[#050505] px-6 py-16">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, label: 'Pago Seguro', desc: 'Encriptación de extremo a extremo en todas las transacciones.', color: '#00E5FF' },
                            { icon: Package, label: 'Envío Express', desc: 'Despacho prioritario en 24hs hábiles a todo el país.', color: '#00B8D9' },
                            { icon: Truck, label: '100% Original', desc: 'Garantía de autenticidad en todos nuestros productos.', color: '#00E0FF' }
                        ].map((item, idx) => (
                            <div key={idx} className="eter-card group flex items-start gap-5 p-6 transition-all hover:border-[#00E5FF]/50">
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
