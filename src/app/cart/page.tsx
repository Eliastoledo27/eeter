'use client'

import { useCartStore } from '@/store/cart-store'
import { ArrowLeft, Minus, Plus, Trash2, Shield, Lock, Truck, ShoppingBag, Tag, CreditCard, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
    const [promoCode, setPromoCode] = useState('')
    const [promoApplied, setPromoApplied] = useState(false)

    const total = getTotal()
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const handleApplyPromo = () => {
        if (promoCode.toLowerCase() === 'eter10') {
            setPromoApplied(true)
        }
    }

    const isEmpty = items.length === 0

    return (
        <div className="min-h-screen bg-black text-white pt-20">
            {/* Header */}
            <section className="border-b border-white/10 py-8 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/catalog"
                                className="p-3 hover:bg-yellow-500/10 rounded-xl transition-colors group"
                            >
                                <ArrowLeft className="text-gray-400 group-hover:text-yellow-500 transition-colors" size={24} />
                            </Link>
                            <div>
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">CARRITO</span>
                                </h1>
                                <p className="text-gray-400 mt-2">
                                    {items.length === 0 ? 'Tu carrito está vacío' : `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'} en tu carrito`}
                                </p>
                            </div>
                        </div>

                        {!isEmpty && (
                            <button
                                onClick={clearCart}
                                className="px-6 py-3 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all text-sm"
                            >
                                Vaciar Carrito
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="container mx-auto max-w-7xl px-6 py-12">
                {isEmpty ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-12 bg-gradient-to-br from-white/5 to-white/0 rounded-[3rem] mb-8 border-4 border-white/10">
                            <ShoppingBag className="text-gray-600 mx-auto" size={120} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Tu carrito está vacío
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-md">
                            Explorá nuestro catálogo premium y encontrá las zapatillas perfectas para vos
                        </p>
                        <Link
                            href="/catalog"
                            className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,215,0,0.3)] flex items-center gap-3"
                        >
                            <Package size={24} />
                            EXPLORAR CATÁLOGO
                        </Link>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
                            {[
                                { label: '+500 Modelos', value: 'Disponibles' },
                                { label: 'Envío Gratis', value: 'En 24/48hs' },
                                { label: '0% Inversión', value: 'Sin riesgos' }
                            ].map((stat, idx) => (
                                <div key={idx} className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                        {stat.label}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-2">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Cart Content
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Cart Items (2 columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black">Productos</h2>
                                <span className="text-gray-400">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                            </div>

                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={`${item.id}-${item.selectedSize}`}
                                        className="backdrop-blur-2xl bg-white/5 rounded-3xl p-6 border-2 border-white/10 hover:border-white/20 transition-all duration-300"
                                    >
                                        <div className="flex gap-6">
                                            {/* Image */}
                                            <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                                {item.images && item.images[0] && (
                                                    <Image
                                                        src={item.images[0]}
                                                        fill
                                                        className="object-cover"
                                                        alt={item.name}
                                                    />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">{item.category}</p>
                                                            <h3 className="font-bold text-xl text-white truncate">{item.name}</h3>
                                                            <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                                <span>Talle {item.selectedSize}</span>
                                                            </div>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removeItem(item.id, item.selectedSize)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group ml-4"
                                                        >
                                                            <Trash2 className="text-gray-400 group-hover:text-red-500 transition-colors" size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Price & Quantity */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                                        ${item.basePrice.toLocaleString()}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-400">Cantidad:</span>
                                                        <div className="flex items-center gap-3 backdrop-blur-xl bg-white/5 rounded-xl p-2 border-2 border-white/10">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                                className="w-10 h-10 hover:bg-yellow-500 hover:text-black rounded-lg transition-all duration-300 flex items-center justify-center font-bold"
                                                            >
                                                                <Minus size={18} />
                                                            </button>
                                                            <span className="w-12 text-center font-black text-xl">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                                className="w-10 h-10 hover:bg-yellow-500 hover:text-black rounded-lg transition-all duration-300 flex items-center justify-center font-bold"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <Link
                                href="/catalog"
                                className="flex items-center justify-center gap-3 py-5 backdrop-blur-xl bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-yellow-500/50 rounded-2xl font-bold transition-all duration-300 text-lg group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                                Seguir Comprando
                            </Link>
                        </div>

                        {/* RIGHT: Summary (1 column, sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Summary Card */}
                                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-[3rem] p-8 border-4 border-white/10 space-y-6">
                                    <h2 className="text-2xl font-black">Resumen del Pedido</h2>

                                    {/* Promo Code */}
                                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border-2 border-white/10">
                                        <label className="text-sm font-bold text-gray-400 mb-2 block flex items-center gap-2">
                                            <Tag size={16} />
                                            Código de descuento
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder="ETER10"
                                                className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 focus:border-yellow-500 rounded-xl outline-none text-white placeholder-gray-500 transition-colors"
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={promoApplied}
                                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {promoApplied ? '✓' : 'APLICAR'}
                                            </button>
                                        </div>
                                        {promoApplied && (
                                            <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                                                ✓ Código aplicado exitosamente
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    {/* Totals */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-lg">
                                            <span className="text-gray-300">Subtotal</span>
                                            <span className="font-bold">${total.toLocaleString()}</span>
                                        </div>

                                        {promoApplied && (
                                            <div className="flex justify-between text-lg text-green-400">
                                                <span>Descuento</span>
                                                <span className="font-bold">-${(total * 0.1).toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-lg text-green-400">
                                            <span>Envío</span>
                                            <span className="font-bold">GRATIS</span>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

                                        <div className="flex justify-between items-baseline">
                                            <span className="text-2xl font-bold">Total</span>
                                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                                ${(promoApplied ? total * 0.9 : total).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/10">
                                        {[
                                            { icon: Shield, label: 'Pago seguro' },
                                            { icon: Lock, label: 'Encriptado' },
                                            { icon: Truck, label: '24/48hs' }
                                        ].map((badge, idx) => (
                                            <div key={idx} className="text-center space-y-2">
                                                <badge.icon className="mx-auto text-yellow-500" size={24} />
                                                <p className="text-xs text-gray-400">{badge.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href="/checkout"
                                        className="w-full py-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,215,0,0.3)] flex items-center justify-center gap-3"
                                    >
                                        <CreditCard size={24} />
                                        FINALIZAR COMPRA
                                    </Link>

                                    <p className="text-center text-xs text-gray-400">
                                        Al continuar, aceptás nuestros <Link href="/terms" className="text-yellow-500 hover:underline">Términos y Condiciones</Link>
                                    </p>
                                </div>

                                {/* Benefits */}
                                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border-2 border-white/10 space-y-4">
                                    <h3 className="font-black text-lg mb-4">Beneficios de tu compra</h3>
                                    {[
                                        { icon: Package, text: 'Envío express en 24/48hs' },
                                        { icon: Shield, text: 'Garantía de 30 días' },
                                        { icon: CreditCard, text: 'Pago 100% seguro' },
                                        { icon: Truck, text: 'Seguimiento en tiempo real' }
                                    ].map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                                <benefit.icon className="text-yellow-500" size={18} />
                                            </div>
                                            {benefit.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Trust Bar */}
            {!isEmpty && (
                <section className="py-12 px-6 bg-black border-t border-yellow-500/20 mt-20">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {[
                                { icon: Shield, label: 'COMPRA PROTEGIDA', value: 'Certificado SSL' },
                                { icon: Package, label: 'ENVÍO RASTREADO', value: 'Seguimiento 24/7' },
                                { icon: CreditCard, label: 'PAGO SEGURO', value: 'Todas las tarjetas' }
                            ].map((item, idx) => (
                                <div key={idx} className="group">
                                    <div className="inline-block p-4 bg-yellow-500/10 rounded-2xl mb-3 group-hover:bg-yellow-500/20 transition-colors">
                                        <item.icon className="text-yellow-500" size={32} />
                                    </div>
                                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                                        {item.label}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
