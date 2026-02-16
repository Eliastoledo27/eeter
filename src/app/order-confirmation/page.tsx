'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Package, Home, MessageCircle } from 'lucide-react'
import { Suspense } from 'react'

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    // const orderId = searchParams?.get('orderId') // Unused variable removed
    const referenceCode = searchParams?.get('ref')

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-20">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Success Icon */}
                <div className="inline-flex p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-4 border-green-500 rounded-full animate-in zoom-in-95 duration-500">
                    <Check className="text-green-500" size={80} />
                </div>

                {/* Title */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
                    <h1 className="text-6xl md:text-7xl font-black">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                            ¡PEDIDO CONFIRMADO!
                        </span>
                    </h1>
                    <p className="text-2xl text-gray-300">
                        Tu pedido ha sido recibido y está siendo procesado
                    </p>
                </div>

                {/* Order Details */}
                {referenceCode && (
                    <div className="backdrop-blur-2xl bg-white/5 rounded-[3rem] p-8 border-2 border-white/10 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                            Código de Referencia
                        </p>
                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                            {referenceCode}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">
                            Guardá este código para hacer seguimiento de tu pedido
                        </p>
                    </div>
                )}

                {/* Next Steps */}
                <div className="backdrop-blur-2xl bg-white/5 rounded-[3rem] p-8 border-2 border-white/10 space-y-4 text-left animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '600ms' }}>
                    <h2 className="text-2xl font-black mb-6">¿Qué sigue ahora?</h2>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="text-yellow-500 font-black">1</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Confirmación</h3>
                                <p className="text-sm text-gray-400">Recibirás un mensaje de WhatsApp con los detalles de tu pedido</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="text-yellow-500 font-black">2</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Preparación</h3>
                                <p className="text-sm text-gray-400">Prepararemos tu pedido en 24-48hs</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="text-yellow-500 font-black">3</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Entrega</h3>
                                <p className="text-sm text-gray-400">Te avisaremos cuando tu pedido esté listo para entregar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '800ms' }}>
                    <Link
                        href="/"
                        className="py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <Home size={24} />
                        VOLVER AL INICIO
                    </Link>

                    <Link
                        href="/catalog"
                        className="py-5 border-4 border-yellow-500 text-white font-black text-lg rounded-2xl hover:bg-yellow-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <Package size={24} />
                        SEGUIR COMPRANDO
                    </Link>
                </div>

                {/* Support */}
                <div className="pt-8 border-t border-white/10 animate-in fade-in duration-700" style={{ animationDelay: '1000ms' }}>
                    <p className="text-gray-400 mb-4">¿Necesitás ayuda con tu pedido?</p>
                    <a
                        href="https://wa.me/5492235025196"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-green-500/20 border-2 border-green-500 text-green-500 font-bold rounded-2xl hover:bg-green-500 hover:text-white transition-all"
                    >
                        <MessageCircle size={20} />
                        CONTACTAR POR WHATSAPP
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-500" />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}
