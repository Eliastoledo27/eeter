'use client';

import * as React from 'react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck, Lock, Truck, ShoppingBag, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { validateCoupon } from '@/app/actions/coupons';
import { toast } from 'sonner';

export default function CartPage() {
    const {
        items,
        updateQuantity,
        removeItem,
        getTotal,
        getSubtotal,
        getDiscountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        clearCart,
    } = useCartStore();

    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const total = getTotal();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const isEmpty = items.length === 0;

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;

        setCouponLoading(true);
        try {
            const res = await validateCoupon(couponCode.trim().toUpperCase(), subtotal);
            if (res.valid && res.coupon) {
                applyCoupon(res.coupon);
                toast.success(`Cupón ${res.coupon.code} aplicado (${res.coupon.discount_percent}% OFF)`);
                setCouponCode('');
            } else {
                toast.error(res.error || 'Cupón inválido o expirado');
            }
        } catch {
            toast.error('Error validando cupón');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleWhatsAppCheckout = () => {
        const lines = items.map(
            (i) => `• ${i.quantity}x ${i.name} (Talle ${i.selectedSize}) - $${(i.basePrice * i.quantity).toLocaleString('es-AR')}`
        );
        const text = `Hola ÉTER, quiero confirmar mi pedido:\n\n${lines.join('\n')}\n\nTotal: $${total.toLocaleString('es-AR')}\n\n¿Cómo coordinamos el envío?`;
        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black">
            
            {/* Lateral Neon Green Lines */}
            <div className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14] z-40 pointer-events-none" />

            {/* Fixed Header */}
            <PreviewHeader />

            <main className="pt-28 sm:pt-36 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
                
                {/* Back to Catalog & Breadcrumb */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/60 hover:text-[#39FF14] transition-colors"
                    >
                        <ArrowLeft size={15} /> VOLVER AL CATÁLOGO
                    </Link>

                    {!isEmpty && (
                        <button
                            onClick={clearCart}
                            className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                        >
                            VACIAR CARRITO
                        </button>
                    )}
                </div>

                {/* Section Title */}
                <div className="mb-10">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#39FF14] mb-2 flex items-center gap-2">
                        <span>RESUMEN DE ADQUISICIÓN</span>
                        <span className="text-white/20">|</span>
                        <span className="text-white/50">{itemCount} {itemCount === 1 ? 'PAR SELECCIONADO' : 'PARES SELECCIONADOS'}</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white">
                        TU CARRITO<span className="text-[#39FF14]">.</span>
                    </h1>
                </div>

                {isEmpty ? (
                    // Empty Cart State
                    <div className="rounded-3xl bg-[#090909] border border-white/10 p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-white/40">
                            <ShoppingBag size={36} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">Tu carrito está vacío</h2>
                            <p className="text-xs sm:text-sm text-white/60 max-w-md">
                                Explorá nuestro catálogo de calzado urbano importado y elegí el modelo y talle que mejor te quede.
                            </p>
                        </div>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-8 py-4 text-xs font-mono font-black uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_0_25px_rgba(57,255,20,0.3)]"
                        >
                            EXPLORAR CATÁLOGO <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    // Active Cart Grid
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* LEFT COLUMN: ITEMS LIST (7 cols) */}
                        <div className="lg:col-span-7 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={`${item.id}-${item.selectedSize}`}
                                    className="rounded-3xl bg-[#090909] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 hover:border-white/20 transition-all"
                                >
                                    {/* Sneaker Thumbnail */}
                                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-2xl bg-[#0e0e0e] border border-white/5 p-2 overflow-hidden flex items-center justify-center">
                                        <Image
                                            src={item.images?.[0] || '/hero.webp'}
                                            alt={item.name}
                                            fill
                                            unoptimized
                                            sizes="112px"
                                            className="object-contain p-1 drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)]"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-grow min-w-0 space-y-1.5 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                                                {item.brand || 'ÉTER'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-[#39FF14]/10 border border-[#39FF14]/30 text-[9px] font-mono font-bold text-[#39FF14]">
                                                TALLE {item.selectedSize}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black uppercase text-white tracking-tight line-clamp-1">
                                            {item.name}
                                        </h3>

                                        <div className="text-base font-black font-mono text-white">
                                            ${(item.basePrice * item.quantity).toLocaleString('es-AR')}
                                            {item.quantity > 1 && (
                                                <span className="text-[10px] font-normal text-white/40 ml-2">
                                                    (${item.basePrice.toLocaleString('es-AR')} c/u)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity Controls & Remove */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center rounded-xl bg-[#121212] border border-white/10 p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus size={13} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-mono font-bold text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus size={13} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id, item.selectedSize)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            aria-label="Eliminar producto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Trust Pill */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between text-[10px] font-mono uppercase text-white/60">
                                <div className="flex items-center gap-2 text-[#39FF14]">
                                    <Truck size={14} />
                                    <span>DESPACHOS DIARIOS CON ANDREANI</span>
                                </div>
                                <span>CAMBIO POR TALLE ASEGURADO</span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT (5 cols) */}
                        <div className="lg:col-span-5 rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-6 sticky top-28 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                            <h2 className="text-xl font-black uppercase italic text-white border-b border-white/10 pb-4">
                                Resumen del Pedido
                            </h2>

                            {/* Breakdown */}
                            <div className="space-y-3 text-xs font-mono">
                                <div className="flex justify-between text-white/60">
                                    <span>Subtotal ({itemCount} pares):</span>
                                    <span className="text-white">${subtotal.toLocaleString('es-AR')}</span>
                                </div>

                                {appliedCoupon && (
                                    <div className="flex justify-between text-[#39FF14]">
                                        <span className="flex items-center gap-1">
                                            Cupón {appliedCoupon.code} ({appliedCoupon.discount_percent}%):
                                            <button
                                                onClick={removeCoupon}
                                                className="text-red-400 hover:text-red-300 ml-1"
                                                title="Remover cupón"
                                            >
                                                ×
                                            </button>
                                        </span>
                                        <span>-${discount.toLocaleString('es-AR')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-white/60">
                                    <span>Envío Nacional:</span>
                                    <span className="text-[#39FF14] font-bold">A CALCULAR EN CHECKOUT</span>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-black uppercase text-white">Total Estimado</span>
                                        <div className="text-[9px] text-white/40">IVA incluido</div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#39FF14]">
                                        ${total.toLocaleString('es-AR')}
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2">
                                <input
                                    type="text"
                                    placeholder="CUPÓN DE DESCUENTO..."
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="w-full rounded-xl bg-[#121212] border border-white/10 px-3.5 py-2.5 text-xs font-mono uppercase text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={couponLoading}
                                    className="px-4 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase text-white hover:bg-white hover:text-black transition-all"
                                >
                                    {couponLoading ? '...' : 'APLICAR'}
                                </button>
                            </form>

                            {/* Primary & Secondary Dual CTAs */}
                            <div className="space-y-3 pt-2">
                                <Link
                                    href="/checkout"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-6 py-4 text-xs font-mono font-black uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_0_25px_rgba(57,255,20,0.3)] hover:scale-[1.02]"
                                >
                                    INICIAR CHECKOUT <ArrowRight size={14} />
                                </Link>

                                <button
                                    onClick={handleWhatsAppCheckout}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-white hover:border-[#39FF14] hover:text-[#39FF14] transition-all"
                                >
                                    <MessageCircle size={15} /> PEDIR DIRECTO POR WHATSAPP
                                </button>
                            </div>

                            {/* Security Note */}
                            <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-white/40 pt-2">
                                <Lock size={12} className="text-[#39FF14]" />
                                <span>PAGOS Y DATOS ENCRIPTADOS CON SSL 256-BIT</span>
                            </div>
                        </div>

                    </div>
                )}

            </main>

            {/* Footer & WhatsApp Floating */}
            <PreviewFooter />
            <WhatsAppFloatingButton />
        </div>
    );
}
