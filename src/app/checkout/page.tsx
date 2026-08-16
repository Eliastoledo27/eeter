'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { Loader2, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OneStepCheckout } from '@/components/checkout/OneStepCheckout';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import Link from 'next/link';

function CheckoutHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addItem, clearCart } = useCartStore();
    const [status, setStatus] = useState('Verificando carrito...');
    const [error, setError] = useState<string | null>(null);
    const [processed, setProcessed] = useState(false);

    const productsParam = searchParams.get('products');
    const creditsParam = searchParams.get('credits');

    useEffect(() => {
        if (processed) return;

        const syncParams = async () => {
            if (!productsParam && !creditsParam) {
                const currentItems = useCartStore.getState().items;
                if (currentItems.length > 0) {
                    setProcessed(true);
                    return;
                }
                router.push('/catalog');
                return;
            }

            try {
                clearCart();

                if (productsParam) {
                    setStatus('Sincronizando productos seleccionados...');
                    const productEntries = productsParam.split(',');
                    const repo = new SupabaseProductRepository();

                    for (const entry of productEntries) {
                        if (!entry) continue;
                        const [fullId, qtyStr] = entry.split(':');
                        const qty = parseInt(qtyStr) || 1;

                        let realId = fullId;
                        let size = 'U';

                        if (fullId.includes('_')) {
                            const lastUnderscore = fullId.lastIndexOf('_');
                            realId = fullId.substring(0, lastUnderscore);
                            size = fullId.substring(lastUnderscore + 1);
                        }

                        const p = await repo.findById(realId);
                        if (p) {
                            addItem(p, size, qty);
                        }
                    }
                }

                setProcessed(true);
            } catch (err: any) {
                setError('Error al sincronizar productos.');
                console.error(err);
            }
        };

        syncParams();
    }, [productsParam, creditsParam, processed, addItem, clearCart, router]);

    if (!processed) {
        return (
            <div className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center space-y-4 font-mono">
                <Loader2 className="animate-spin text-[#39FF14]" size={36} />
                <div className="text-xs uppercase tracking-widest text-white/60">{status}</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
                
                {/* Back to Cart & Breadcrumb */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                    >
                        <ArrowLeft size={15} /> VOLVER AL CARRITO
                    </Link>

                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#39FF14]">
                        <Lock size={12} />
                        <span>CHECKOUT SEGURO SSL 256-BIT</span>
                    </div>
                </div>

                {/* Section Title */}
                <div className="mb-10">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2 flex items-center gap-2">
                        <span>PASO FINAL DE ADQUISICIÓN</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">STOCK FÍSICO MAR DEL PLATA</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white">
                        FINALIZAR PEDIDO<span className="text-[#39FF14]">.</span>
                    </h1>
                </div>

                {/* Form & Order Breakdown */}
                <OneStepCheckout />

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050505] font-mono uppercase tracking-widest text-[#39FF14]">
                    <Loader2 className="animate-spin text-[#39FF14]" size={40} />
                    <div className="text-xs text-white/60">Cargando checkout seguro...</div>
                </div>
            }
        >
            <CheckoutHandler />
        </Suspense>
    );
}
