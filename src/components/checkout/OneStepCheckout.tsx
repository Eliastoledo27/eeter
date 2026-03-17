'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    CreditCard, Truck, MapPin, User, Mail, ShieldCheck,
    Lock, ArrowRight, CheckCircle2, Building2, Smartphone, Wallet, ShoppingBag
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'

const checkoutSchema = z.object({
    email: z.string().email('Email inválido'),
    firstName: z.string().min(2, 'Nombre muy corto'),
    lastName: z.string().min(2, 'Apellido muy corto'),
    phone: z.string().min(10, 'Teléfono inválido (ej: 2235000000)'),
    address: z.string().min(5, 'Dirección inválida'),
    city: z.string().min(2, 'Ciudad inválida'),
    postalCode: z.string().min(4, 'Código postal inválido'),
    province: z.string().min(2, 'Provincia requerida'),
    paymentMethod: z.enum(['stripe']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function OneStepCheckout() {
    const { items, getTotal, getSubtotal, appliedCoupon, clearCart } = useCartStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'stripe'
        }
    })

    const paymentMethod = watch('paymentMethod')
    const total = getTotal()

    const onSubmit = async (data: CheckoutFormData) => {
        setIsProcessing(true)

        if (data.paymentMethod === 'stripe') {
            try {
                const response = await fetch('/api/checkout/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: items.map(i => ({
                            id: i.id,
                            name: i.name,
                            price: i.basePrice,
                            size: i.selectedSize,
                            quantity: i.quantity,
                            images: i.images
                        })),
                        payer: data
                    })
                });

                const result = await response.json();

                if (result.success && result.init_point) {
                    window.location.href = result.init_point;
                    return;
                } else {
                    console.error("Payment error:", result.error);
                    alert(`Hubo un error al iniciar el pago con Stripe: ` + result.error);
                }
            } catch (error) {
                console.error("Payment error:", error);
                alert("Error de red al intentar contactar a la pasarela.");
            }
            setIsProcessing(false);
            return;
        }

        setIsProcessing(false)
        setSuccess(true)

        // Redirect or show success
        setTimeout(() => {
            clearCart()
            window.location.href = '/catalog'
        }, 4000)
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-8"
                >
                    <CheckCircle2 className="text-green-500" size={48} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">¡Pago Exitoso!</h1>
                <p className="text-gray-400 max-w-md mx-auto mb-8 font-mono text-sm">
                    Tu transacción ha sido procesada mediante cifrado SSL de 256-bits. Te enviamos el comprobante por email.
                </p>
                <div className="animate-pulse text-yellow-500 text-xs font-black tracking-widest uppercase">
                    Redirigiendo al catálogo...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 selection:bg-yellow-500 selection:text-black">
            <div className="container mx-auto max-w-6xl px-4 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                        CHECKOUT <span className="text-yellow-500">SEGURO</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-black tracking-widest uppercase text-gray-500">
                        <span className="flex items-center gap-1"><Lock size={12} /> ENCRIPTACIÓN 256-BIT</span>
                        <span>•</span>
                        <span>PCI DSS COMPLIANT</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                            {/* 1. Contact Info */}
                            <section className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem]">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm">1</span>
                                    Información de Contacto
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                {...register('email')}
                                                type="email"
                                                placeholder="tu@email.com"
                                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nombre</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                {...register('firstName')}
                                                type="text"
                                                placeholder="Juan"
                                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                            />
                                        </div>
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Apellido</label>
                                        <input
                                            {...register('lastName')}
                                            type="text"
                                            placeholder="Pérez"
                                            className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                        />
                                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Teléfono (WhatsApp)</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                {...register('phone')}
                                                type="tel"
                                                placeholder="+54 9 223 500 0000"
                                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* 2. Shipping Info */}
                            <section className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem]">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm">2</span>
                                    Envío a Domicilio
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Dirección con autocompletado inteligente</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                {...register('address')}
                                                type="text"
                                                placeholder="Calle y Número"
                                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                            />
                                        </div>
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Ciudad</label>
                                        <input
                                            {...register('city')}
                                            type="text"
                                            placeholder="Mar del Plata"
                                            className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Código Postal</label>
                                        <input
                                            {...register('postalCode')}
                                            type="text"
                                            placeholder="7600"
                                            className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-sm focus:border-yellow-500 transition-colors outline-none"
                                        />
                                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Provincia</label>
                                        <select
                                            {...register('province')}
                                            className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-sm focus:border-yellow-500 transition-colors outline-none appearance-none text-white"
                                        >
                                            <option value="">Selecciona tu provincia</option>
                                            <option value="BA">Buenos Aires</option>
                                            <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                                            <option value="CBA">Córdoba</option>
                                            <option value="SFE">Santa Fe</option>
                                        </select>
                                        {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* 3. Payment Method */}
                            <section className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem]">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm">3</span>
                                    Método de Pago
                                </h2>

                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setValue('paymentMethod', 'stripe')}
                                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'stripe' ? 'border-[#FFD200] bg-[#FFD200]/10 text-[#FFD200]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <Wallet size={32} />
                                        <span className="text-xs font-black uppercase tracking-widest text-center">Tarjeta de Crédito / Débito (Stripe)</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {paymentMethod === 'stripe' && (
                                        <motion.div
                                            key="stripe"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-[#FFD200]/10 border border-[#FFD200]/20 p-6 rounded-2xl text-[#FFD200]"
                                        >
                                            <h4 className="font-black uppercase tracking-tight mb-2 italic">Pago Seguro con Stripe</h4>
                                            <p className="text-sm text-gray-300">Serás redirigido a la plataforma segura de Stripe para completar tu compra. Aceptamos todas las tarjetas.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </section>

                            {/* Mobile Proceed Button (hidden on desktop, summary is right sidebar) */}
                            <div className="lg:hidden">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase tracking-widest h-16 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-50"
                                >
                                    {isProcessing ? 'Procesando Pago Segurizado...' : 'Finalizar Pedido'}
                                    {!isProcessing && <ArrowRight size={20} />}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Summary Sidebar Column */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-28 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem]">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                Resumen de Compra
                            </h3>

                            <div className="space-y-6">
                                {/* Items preview */}
                                <div className="space-y-4 max-h-[30vh] overflow-y-auto no-scrollbar pr-2">
                                    {items.map(item => (
                                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden shrink-0">
                                                {item.images?.[0] && (
                                                    <Image src={item.images[0]} fill alt={item.name} className="object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm tracking-tight leading-tight uppercase">{item.name}</h4>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Talle {item.selectedSize} <span className="mx-1">•</span> QTY: {item.quantity}</div>
                                                <div className="text-sm font-black text-yellow-500 mt-1">${(item.basePrice * item.quantity).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-3 font-mono text-sm tracking-widest">
                                    <div className="flex justify-between text-gray-400">
                                        <span>SUBTOTAL</span>
                                        <span>${getSubtotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>ENVÍO</span>
                                        <span className="text-green-500 block">CALCULADO EN SIGUENTE PASO</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>IMPUESTOS</span>
                                        <span>$0</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black uppercase tracking-widest">Total a Pagar</span>
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                            ${total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isProcessing}
                                    className="hidden lg:flex w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase tracking-widest h-16 rounded-2xl items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-50 mt-8 shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                                >
                                    {isProcessing ? 'Procesando Pago Seguro...' : 'Confirmar Pedido'}
                                    {!isProcessing && <ArrowRight size={20} />}
                                </button>

                                <div className="mt-8 flex justify-center gap-4 text-gray-600">
                                    <ShieldCheck size={24} />
                                    <Lock size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
