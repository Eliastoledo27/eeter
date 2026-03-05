'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    CreditCard, Truck, MapPin, User, Mail, ShieldCheck,
    Lock, ArrowRight, CheckCircle2, Building2, Smartphone
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
    paymentMethod: z.enum(['card', 'transfer', 'paypal', 'apple_pay', 'google_pay']),
    // Card details (mocked validation for UI)
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function OneStepCheckout() {
    const { items, getTotal, getSubtotal, appliedCoupon, clearCart } = useCartStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'card'
        }
    })

    const paymentMethod = watch('paymentMethod')
    const total = getTotal()

    const onSubmit = async (data: CheckoutFormData) => {
        setIsProcessing(true)

        // Simulate API Call / Processing
        await new Promise(resolve => setTimeout(resolve, 2500))

        // In a real scenario, here we interact with Stripe / PayPal APIs

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

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setValue('paymentMethod', 'card')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <CreditCard size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center mt-2">Tarjeta</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('paymentMethod', 'transfer')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'transfer' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <Building2 size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center mt-2">CVU / CBU</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('paymentMethod', 'paypal')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'border-[#0070BA] bg-[#0070BA]/10 text-[#0070BA]' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 6.007 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106a.64.64 0 0 1-.632.53z" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center mt-2">PayPal</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('paymentMethod', 'apple_pay')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'apple_pay' ? 'border-white bg-white/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
                                    >
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center mt-2">Pay</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {paymentMethod === 'card' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-black border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <CreditCard size={100} />
                                                </div>
                                                <div className="relative space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Número de Tarjeta</label>
                                                        <input
                                                            {...register('cardNumber')}
                                                            type="text"
                                                            placeholder="0000 0000 0000 0000"
                                                            className="w-full bg-transparent border-b border-white/20 pb-2 text-xl tracking-widest font-mono focus:border-yellow-500 transition-colors outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Vencimiento</label>
                                                            <input
                                                                {...register('cardExpiry')}
                                                                type="text"
                                                                placeholder="MM/YY"
                                                                className="w-full bg-transparent border-b border-white/20 pb-2 text-lg tracking-widest font-mono focus:border-yellow-500 transition-colors outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">CVC</label>
                                                            <input
                                                                {...register('cardCvc')}
                                                                type="text"
                                                                placeholder="123"
                                                                className="w-full bg-transparent border-b border-white/20 pb-2 text-lg tracking-widest font-mono focus:border-yellow-500 transition-colors outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nombre en Tarjeta</label>
                                                        <input
                                                            {...register('cardName')}
                                                            type="text"
                                                            placeholder="JUAN PEREZ"
                                                            className="w-full bg-transparent border-b border-white/20 pb-2 text-lg tracking-widest font-mono uppercase focus:border-yellow-500 transition-colors outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {paymentMethod === 'transfer' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl text-yellow-500"
                                        >
                                            <h4 className="font-black uppercase tracking-tight mb-2">Transferencia Bancaria (Descuento extra)</h4>
                                            <p className="text-sm">Al confirmar tu pedido, te mostraremos los datos bancarios para realizar la transferencia. Tu pedido se procesará una vez verificado el pago.</p>
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
