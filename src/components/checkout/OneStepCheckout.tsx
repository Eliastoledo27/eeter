'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    CreditCard, Truck, MapPin, User, Mail, ShieldCheck,
    Lock, ArrowRight, CheckCircle2, Building2, Smartphone, Wallet, ShoppingBag, MessageCircle, Copy, Check
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import Link from 'next/link';

const BANK_DATA = {
    titular: 'Elias Francesco Calderon Toledo',
    alias: 'eterstore / etershop',
    banco: 'Naranja X',
};

const PROVINCIAS = [
    'Buenos Aires',
    'Capital Federal (CABA)',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
];

const checkoutSchema = z.object({
    email: z.string().email('Email inválido'),
    firstName: z.string().min(2, 'Nombre requerido'),
    lastName: z.string().min(2, 'Apellido requerido'),
    phone: z.string().min(8, 'Teléfono requerido (ej: 2235000000)'),
    address: z.string().min(5, 'Dirección requerida'),
    city: z.string().min(2, 'Ciudad requerida'),
    postalCode: z.string().min(4, 'Código postal requerido'),
    province: z.string().min(2, 'Provincia requerida'),
    paymentMethod: z.enum(['mercadopago', 'transferencia', 'whatsapp']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function OneStepCheckout() {
    const { items, getTotal, getSubtotal, appliedCoupon, clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [copiedAlias, setCopiedAlias] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            province: 'Buenos Aires',
            paymentMethod: 'mercadopago',
        },
    });

    const paymentMethod = watch('paymentMethod');
    const total = getTotal();
    const subtotal = getSubtotal();

    const handleCopyAlias = () => {
        navigator.clipboard.writeText(BANK_DATA.alias);
        setCopiedAlias(true);
        setTimeout(() => setCopiedAlias(false), 2500);
    };

    const onSubmit = async (data: CheckoutFormData) => {
        setIsProcessing(true);

        if (data.paymentMethod === 'mercadopago') {
            try {
                const response = await fetch('/api/checkout/mercadopago', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: items.map((i) => ({
                            id: i.id,
                            name: i.name,
                            price: i.basePrice,
                            size: i.selectedSize,
                            quantity: i.quantity,
                            images: i.images,
                        })),
                        payer: data,
                    }),
                });

                const result = await response.json();

                if (result.success && result.init_point) {
                    window.location.href = result.init_point;
                    return;
                } else {
                    alert('Error iniciando Mercado Pago. Podés abonar por Transferencia o WhatsApp.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Error al conectar con la pasarela. Te redirigimos a WhatsApp para coordinar.');
            }
            setIsProcessing(false);
            return;
        }

        // Transferencia o WhatsApp
        const lines = items.map(
            (i) => `• ${i.quantity}x ${i.name} (Talle ${i.selectedSize}) - $${(i.basePrice * i.quantity).toLocaleString('es-AR')}`
        );
        const orderSummary = `*NUEVO PEDIDO ÉTER STORE*\n\n*Cliente:* ${data.firstName} ${data.lastName}\n*Tel:* ${data.phone}\n*Email:* ${data.email}\n*Dirección:* ${data.address}, ${data.city}, ${data.province} (CP ${data.postalCode})\n*Método:* ${data.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Coordinación WhatsApp'}\n\n*Productos:*\n${lines.join('\n')}\n\n*Total a Abonar:* $${total.toLocaleString('es-AR')}`;

        window.open(`https://wa.me/5492236204002?text=${encodeURIComponent(orderSummary)}`, '_blank');
        setIsProcessing(false);
    };

    if (items.length === 0) {
        return (
            <div className="rounded-3xl bg-[#090909] border border-white/10 p-12 text-center flex flex-col items-center justify-center space-y-6">
                <ShoppingBag size={48} className="text-white/30" />
                <h2 className="text-2xl font-black uppercase text-white">No tenés productos en el carrito</h2>
                <p className="text-xs text-white/60">Seleccioná un par en nuestro catálogo para continuar.</p>
                <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#39FF14] px-6 py-3 text-xs font-mono font-black uppercase tracking-widest text-black hover:bg-white transition-all"
                >
                    IR AL CATÁLOGO
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: FORM SECTIONS (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Datos Personales & Envío */}
                <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#39FF14] text-black font-mono font-black text-xs">
                                01
                            </span>
                            <h2 className="text-lg font-black uppercase italic text-white">
                                Datos de Envío & Destinatario
                            </h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#39FF14]">
                            <Truck size={14} />
                            <span>ANDREANI 24/48HS</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Nombre *</label>
                            <input
                                {...register('firstName')}
                                placeholder="Ej. Juan"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.firstName && <span className="text-[10px] text-red-400">{errors.firstName.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Apellido *</label>
                            <input
                                {...register('lastName')}
                                placeholder="Ej. Pérez"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.lastName && <span className="text-[10px] text-red-400">{errors.lastName.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Teléfono / WhatsApp *</label>
                            <input
                                {...register('phone')}
                                placeholder="Ej. 2235123456"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.phone && <span className="text-[10px] text-red-400">{errors.phone.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Email de Contacto *</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.email && <span className="text-[10px] text-red-400">{errors.email.message}</span>}
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Dirección y Altura (Calle, Número, Depto) *</label>
                            <input
                                {...register('address')}
                                placeholder="Ej. Av. Colón 1234 Piso 4 B"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.address && <span className="text-[10px] text-red-400">{errors.address.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Ciudad / Localidad *</label>
                            <input
                                {...register('city')}
                                placeholder="Ej. Mar del Plata"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.city && <span className="text-[10px] text-red-400">{errors.city.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Código Postal *</label>
                            <input
                                {...register('postalCode')}
                                placeholder="Ej. 7600"
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            />
                            {errors.postalCode && <span className="text-[10px] text-red-400">{errors.postalCode.message}</span>}
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Provincia *</label>
                            <select
                                {...register('province')}
                                className="w-full rounded-xl bg-[#121212] border border-white/10 px-4 py-3 text-xs font-mono text-white focus:border-[#39FF14] focus:outline-none"
                            >
                                {PROVINCIAS.map((prov) => (
                                    <option key={prov} value={prov} className="bg-[#090909] text-white">
                                        {prov}
                                    </option>
                                ))}
                            </select>
                            {errors.province && <span className="text-[10px] text-red-400">{errors.province.message}</span>}
                        </div>
                    </div>
                </div>

                {/* 2. Método de Pago */}
                <div className="rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#39FF14] text-black font-mono font-black text-xs">
                            02
                        </span>
                        <h2 className="text-lg font-black uppercase italic text-white">
                            Método de Pago
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {/* Mercado Pago */}
                        <label
                            className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                                paymentMethod === 'mercadopago'
                                    ? 'bg-[#0c0c0c] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                                    : 'bg-[#121212] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <input
                                type="radio"
                                value="mercadopago"
                                {...register('paymentMethod')}
                                className="mt-1 accent-[#39FF14]"
                            />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={18} className="text-[#00E5FF]" />
                                    <span className="text-sm font-bold text-white">Mercado Pago / Tarjetas de Crédito & Débito</span>
                                </div>
                                <p className="text-xs text-white/60">
                                    Aboná de forma segura con dinero en cuenta, tarjetas o efectivo en puntos de cobro.
                                </p>
                            </div>
                        </label>

                        {/* Transferencia Bancaria */}
                        <label
                            className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                                paymentMethod === 'transferencia'
                                    ? 'bg-[#0c0c0c] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                                    : 'bg-[#121212] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <input
                                type="radio"
                                value="transferencia"
                                {...register('paymentMethod')}
                                className="mt-1 accent-[#39FF14]"
                            />
                            <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={18} className="text-[#39FF14]" />
                                        <span className="text-sm font-bold text-white">Transferencia Bancaria Inmediata</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-[#39FF14]/10 text-[9px] font-mono text-[#39FF14] font-bold">
                                        SIN COMISIÓN
                                    </span>
                                </div>
                                <p className="text-xs text-white/60">
                                    Transferí directo a nuestra cuenta oficial y enviás el comprobante por WhatsApp.
                                </p>

                                {paymentMethod === 'transferencia' && (
                                    <div className="mt-3 p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2 text-xs font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Titular:</span>
                                            <span className="text-white font-bold">{BANK_DATA.titular}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Banco:</span>
                                            <span className="text-white font-bold">{BANK_DATA.banco}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1 border-t border-white/10">
                                            <span className="text-white/50">Alias:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#39FF14] font-black">{BANK_DATA.alias}</span>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyAlias}
                                                    className="p-1 rounded bg-white/10 text-white hover:bg-white hover:text-black transition-colors"
                                                    title="Copiar Alias"
                                                >
                                                    {copiedAlias ? <Check size={12} /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Coordinar por WhatsApp */}
                        <label
                            className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                                paymentMethod === 'whatsapp'
                                    ? 'bg-[#0c0c0c] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                                    : 'bg-[#121212] border-white/10 hover:border-white/20'
                            }`}
                        >
                            <input
                                type="radio"
                                value="whatsapp"
                                {...register('paymentMethod')}
                                className="mt-1 accent-[#39FF14]"
                            />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={18} className="text-[#25D366]" />
                                    <span className="text-sm font-bold text-white">Coordinar y Pagar por WhatsApp</span>
                                </div>
                                <p className="text-xs text-white/60">
                                    Atención humana directa para resolver dudas, confirmar talles y coordinar el pago.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: RESUMEN LATERAL (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-[#090909] border border-white/10 p-6 sm:p-8 space-y-6 sticky top-28 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <h2 className="text-xl font-black uppercase italic text-white border-b border-white/10 pb-4">
                    Resumen de Compra
                </h2>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {items.map((i) => (
                        <div key={`${i.id}-${i.selectedSize}`} className="flex items-center gap-3 text-xs">
                            <div className="relative h-12 w-12 rounded-lg bg-[#0e0e0e] border border-white/5 flex-shrink-0 flex items-center justify-center p-1">
                                <Image
                                    src={i.images?.[0] || '/hero.webp'}
                                    alt={i.name}
                                    fill
                                    unoptimized
                                    sizes="48px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="font-bold text-white uppercase line-clamp-1">{i.name}</div>
                                <div className="text-[10px] font-mono text-white/40">
                                    Talle {i.selectedSize} · Cant: {i.quantity}
                                </div>
                            </div>
                            <div className="font-mono font-bold text-white flex-shrink-0">
                                ${(i.basePrice * i.quantity).toLocaleString('es-AR')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs font-mono pt-4 border-t border-white/10">
                    <div className="flex justify-between text-white/60">
                        <span>Subtotal:</span>
                        <span className="text-white">${subtotal.toLocaleString('es-AR')}</span>
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between text-[#39FF14]">
                            <span>Cupón {appliedCoupon.code}:</span>
                            <span>-{appliedCoupon.discount_percent}%</span>
                        </div>
                    )}

                    <div className="flex justify-between text-white/60">
                        <span>Envío Nacional Andreani:</span>
                        <span className="text-[#39FF14] font-bold">A COORDINAR / BONIFICADO</span>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <span className="text-sm font-black uppercase text-white">Total a Pagar</span>
                            <div className="text-[9px] text-white/40">Garantía física en mano</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-[#39FF14]">
                            ${total.toLocaleString('es-AR')}
                        </div>
                    </div>
                </div>

                {/* Submit CTA Button */}
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#39FF14] px-6 py-4 text-xs font-mono font-black uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_0_25px_rgba(57,255,20,0.3)] hover:scale-[1.02] disabled:opacity-50"
                >
                    {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR Y FINALIZAR PEDIDO'}
                    <ArrowRight size={14} />
                </button>

                {/* Security Guarantee */}
                <div className="space-y-2 pt-2 text-[10px] font-mono text-white/50">
                    <div className="flex items-center gap-2 text-[#39FF14]">
                        <CheckCircle2 size={13} />
                        <span>STOCK FÍSICO REAL EN MAR DEL PLATA</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                        <Lock size={13} />
                        <span>TRANSACCIÓN SEGURA Y CONFIRMACIÓN INMEDIATA</span>
                    </div>
                </div>

            </div>

        </form>
    );
}
