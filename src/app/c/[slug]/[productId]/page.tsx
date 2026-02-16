'use server';

import { getResellerBySlug, getResellerProducts } from '@/app/actions/reseller-catalog';
import { ResellerNavbar } from '@/components/layout/reseller/ResellerNavbar';
import { ResellerFooter } from '@/components/layout/reseller/ResellerFooter';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { notFound } from 'next/navigation';
import { ArrowLeft, Shield, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import { ResellerCartInitializer } from '@/components/cart/ResellerCartInitializer';

export default async function ResellerProductDetailPage({
    params,
}: {
    params: { slug: string; productId: string }
}) {
    // 1. Fetch reseller
    const { data: reseller, error: resellerError } = await getResellerBySlug(params.slug);
    if (resellerError || !reseller) {
        return notFound();
    }

    // 2. Fetch adjusted products for this reseller
    const products = await getResellerProducts(reseller.id, (reseller as any).reseller_markup || 10000);
    const product = products.find(p => p.id === params.productId);

    if (!product) {
        return notFound();
    }

    // Map resellerPrice to base_price for the ProductInfo component
    // Also include stock_by_size and hide description as requested
    const displayProduct = {
        ...product,
        base_price: product.resellerPrice,
        stock_by_size: product.stock_by_size,
        description: null // "la descripcion NO" as requested
    };


    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <ResellerCartInitializer whatsappNumber={reseller.whatsapp_number} />
            {/* Background Ambience & Grid */}

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#CA8A04]/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#CA8A04]/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40" />
            </div>

            <ResellerNavbar
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
            />

            {/* Sticky Header with Breadcrumb */}
            <div className="sticky top-20 z-40 backdrop-blur-3xl bg-black/60 border-b border-white/5 py-6">
                <div className="container mx-auto max-w-7xl px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link
                                href={`/c/${params.slug}`}
                                className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-[#CA8A04] hover:text-black rounded-full border border-white/10 transition-all group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                            </Link>
                            <nav className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
                                <Link href={`/c/${params.slug}`} className="hover:text-[#CA8A04] transition-colors">Volver a Tienda de {reseller.full_name}</Link>
                                <span className="text-gray-800">/</span>
                                <span className="text-white truncate max-w-[200px]">{product.name}</span>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-20 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 xl:gap-24">
                        <div className="lg:col-span-3">
                            <ProductGallery
                                images={product.images.length > 0 ? product.images : ['/placeholder-shoe.png']}
                                productName={product.name}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <ProductInfo product={displayProduct} hideOutboundLinks={true} />
                        </div>
                    </div>
                </div>
            </section>

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

            <FloatingCartButton />
            <ResellerFooter
                resellerSlug={params.slug}
                resellerName={reseller.full_name || ''}
            />
        </div>
    );
}
