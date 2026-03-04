'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository'
import { validateCoupon } from '@/app/actions/coupons'
import { Loader2, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function CheckoutHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addItem, clearCart, applyCoupon, getSubtotal } = useCartStore()
    const [status, setStatus] = useState('Sincronizando con Meta...')
    const [error, setError] = useState<string | null>(null)
    const [processed, setProcessed] = useState(false)
    const isCreditPurchase = !searchParams.get('products')

    useEffect(() => {
        // Only run once
        if (processed) return;

        const syncWithMeta = async () => {
            const productsParam = searchParams.get('products')
            const couponParam = searchParams.get('coupon')

            try {
                // CLEAR PREVIOUS ATTEMPTS TO ENSURE CLEAN STATE
                clearCart()

                if (!productsParam) {
                    setStatus('Configurando compra de CRÉDITOS ÉTER...')

                    // VIRTUAL PRODUCT FOR CREDITS
                    const creditProduct: any = {
                        id: 'eter-credit-pack',
                        name: 'ÉTER PROTOCOL / CRÉDITO DIGITAL',
                        description: 'Carga de saldo preventivo para futuras adquisiciones en el ecosistema Éter. Protocolo de Sincronización Meta Pay activado.',
                        category: 'Credits',
                        basePrice: parseInt(searchParams.get('credits') || '50000'), // Customizable pack price
                        images: ['/images/credit-token.png'],
                        stockBySize: { 'U': 999 },
                        totalStock: 999,
                        status: 'active',
                        createdAt: new Date()
                    }

                    setStatus('Sincronizando saldo preventivo...')
                    addItem(creditProduct, 'U', 1)

                    setStatus('¡Sincronización de créditos lista!')
                    setProcessed(true)

                    setTimeout(() => {
                        router.push('/cart')
                    }, 1500)
                    return
                }

                setStatus('Analizando productos...')

                // Format: ID:QTY,ID:QTY
                const productEntries = productsParam.split(',')
                const requestedItems: { fullId: string, realId: string, size: string, qty: number }[] = []

                productEntries.forEach(entry => {
                    const [fullId, qtyStr] = entry.split(':')
                    const qty = parseInt(qtyStr) || 1

                    let realId = fullId
                    let size = 'U'

                    if (fullId.includes('-')) {
                        const parts = fullId.split('-')
                        size = parts.pop() || 'U'
                        realId = parts.join('-')
                    }

                    requestedItems.push({ fullId, realId, size, qty })
                })

                setStatus('Recuperando datos del catálogo...')
                const repo = new SupabaseProductRepository()
                const uniqueProductIds = Array.from(new Set(requestedItems.map(item => item.realId)))
                const productsData = await repo.findByIds(uniqueProductIds)

                if (productsData.length === 0) {
                    throw new Error('No se encontraron los productos solicitados.')
                }

                // Add items to cart
                requestedItems.forEach(req => {
                    const product = productsData.find(p => p.id === req.realId)
                    if (product) {
                        let selectedSize = req.size
                        const availableSizes = Object.keys(product.stockBySize).filter(s => product.stockBySize[s] > 0)

                        if (!product.stockBySize[selectedSize] || product.stockBySize[selectedSize] <= 0) {
                            if (availableSizes.length > 0) {
                                selectedSize = availableSizes[0]
                            }
                        }

                        addItem(product, selectedSize, req.qty)
                    }
                })

                // Apply coupon if present
                if (couponParam) {
                    setStatus('Validando cupón...')
                    const currentTotal = getSubtotal()
                    const result = await validateCoupon(couponParam, currentTotal)
                    if (result.success && result.coupon) {
                        applyCoupon(result.coupon)
                    }
                }

                setStatus('¡Sincronización completa!')
                setProcessed(true)

                setTimeout(() => {
                    router.push('/cart')
                }, 1000)

            } catch (err: any) {
                console.error('Checkout sync error:', err)
                setError(err.message || 'Error al procesar el checkout')
                setTimeout(() => router.push('/catalog'), 3000)
            }
        }

        syncWithMeta()
    }, [searchParams, router, addItem, clearCart, applyCoupon, getSubtotal, processed])

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500 selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-yellow-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/[0.03] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
                    {/* Decorative Corner */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-500/20 blur-2xl rounded-full group-hover:bg-yellow-500/30 transition-colors" />

                    <div className="flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            {error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, rotate: -20 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    className="p-6 bg-red-500/10 rounded-3xl mb-8"
                                >
                                    <AlertCircle size={64} className="text-red-500" />
                                </motion.div>
                            ) : processed ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-green-500/10 rounded-3xl mb-8"
                                >
                                    <CheckCircle2 size={64} className="text-green-500" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-6 bg-yellow-500/10 rounded-3xl mb-8 relative flex items-center justify-center overflow-hidden"
                                >
                                    {isCreditPurchase ? (
                                        <motion.img
                                            initial={{ rotateY: 0 }}
                                            animate={{ rotateY: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            src="/images/credit-token.png"
                                            alt="Éter Protocol Coin"
                                            className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(200,138,4,0.5)]"
                                        />
                                    ) : (
                                        <ShoppingBag size={64} className="text-yellow-500" />
                                    )}
                                    <div className="absolute inset-0 border-2 border-yellow-500/30 rounded-3xl animate-[ping_2s_infinite]" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase italic">
                            Éter <span className="text-yellow-500">{isCreditPurchase ? 'PROTOCOL' : 'Checkout'}</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-mono tracking-[0.4em] uppercase mb-8">
                            {isCreditPurchase ? 'ADQUISICIÓN DE SALDO PREVENTIVO' : 'Protocolo de Sincronización Meta'}
                        </p>

                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-6">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: processed ? "100%" : "70%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className={`h-full ${error ? 'bg-red-500' : 'bg-yellow-500'}`}
                            />
                        </div>

                        <div className={`flex items-center gap-3 font-bold text-sm tracking-widest uppercase ${error ? 'text-red-400' : 'text-yellow-500/80'}`}>
                            {!processed && !error && <Loader2 className="animate-spin" size={18} />}
                            {error || status}
                        </div>

                        {error && (
                            <button
                                onClick={() => router.push('/catalog')}
                                className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                Volver al catálogo
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Quote */}
                <p className="mt-12 text-center text-[10px] text-gray-600 font-mono tracking-[0.5em] uppercase opacity-50">
                    Transmisión encriptada vía Protocolo Éter-Meta
                </p>
            </motion.div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-mono tracking-widest uppercase">
                Iniciando Protocolo...
            </div>
        }>
            <CheckoutHandler />
        </Suspense>
    )
}
