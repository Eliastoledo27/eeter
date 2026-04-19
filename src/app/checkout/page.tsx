'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository'
import { validateCoupon } from '@/app/actions/coupons'
import { Loader2, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OneStepCheckout } from '@/components/checkout/OneStepCheckout'

function CheckoutHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addItem, clearCart, applyCoupon, getSubtotal, items } = useCartStore()
    const [status, setStatus] = useState('Sincronizando con Meta...')
    const [error, setError] = useState<string | null>(null)
    const [processed, setProcessed] = useState(false)

    const productsParam = searchParams.get('products')
    const creditsParam = searchParams.get('credits')
    const isCreditPurchase = !productsParam && creditsParam
    const isMetaSync = !!productsParam

    useEffect(() => {
        // Only run once
        if (processed) return;

        const syncWithMeta = async () => {
            if (!productsParam && !creditsParam) {
                // If no sync params, check if we have items in cart. 
                // If we do, we might just be in the general checkout flow.
                const currentItems = useCartStore.getState().items;
                if (currentItems.length > 0) {
                    setStatus('Cargando resumen de pedido...')
                    setTimeout(() => setProcessed(true), 500)
                    return
                }

                // If totally empty and no params, go back to catalog
                router.push('/catalog')
                return
            }

            const couponParam = searchParams.get('coupon')

            try {
                // ONLY CLEAR IF WE ARE REPLACING WITH SYNCED PRODUCTS OR CREDITS
                clearCart()

                if (isCreditPurchase) {
                    setStatus('Configurando compra de CRÉDITOS ÉTER...')

                    // VIRTUAL PRODUCT FOR CREDITS
                    const creditProduct: any = {
                        id: 'eter-credit-pack',
                        name: 'ÉTER PROTOCOL / CRÉDITO DIGITAL',
                        description: 'Carga de saldo preventivo para futuras adquisiciones en el ecosistema Éter. Protocolo de Sincronización Meta Pay activado.',
                        category: 'Credits',
                        basePrice: parseInt(creditsParam || '50000'),
                        images: ['/images/eter-coin.png'],
                        stockBySize: { 'U': 999 },
                        totalStock: 999,
                        status: 'active',
                        createdAt: new Date()
                    }

                    setStatus('Sincronizando saldo preventivo...')
                    addItem(creditProduct, 'U', 1)

                    setStatus('¡Sincronización de créditos lista!')
                    setTimeout(() => setProcessed(true), 1000)
                    return
                }

                setStatus('Analizando productos...')

                // Format: ID:QTY,ID:QTY
                const productEntries = productsParam ? productsParam.split(',') : [];
                const requestedItems: { fullId: string, realId: string, size: string, qty: number }[] = []

                productEntries.forEach(entry => {
                    if (!entry) return;
                    const [fullId, qtyStr] = entry.split(':')
                    const qty = parseInt(qtyStr) || 1

                    let realId = fullId
                    let size = 'U'

                    // Meta often uses _ for size, or - at the end of a non-UUID string
                    if (fullId.includes('_')) {
                        const lastUnderscore = fullId.lastIndexOf('_');
                        realId = fullId.substring(0, lastUnderscore);
                        size = fullId.substring(lastUnderscore + 1);
                    } else if (fullId.includes('-')) {
                        // Check if it looks like a UUID (8-4-4-4-12)
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        if (!uuidRegex.test(fullId)) {
                            // If it's not a UUID, the last part after dash is probably the size
                            const parts = fullId.split('-')
                            size = parts.pop() || 'U'
                            realId = parts.join('-')
                        } else {
                            // It is a pure UUID, no size provided
                            realId = fullId
                            size = 'U'
                        }
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
                if (productsParam) {
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
                }

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
                setTimeout(() => setProcessed(true), 1500)

            } catch (err: any) {
                console.error('Checkout sync error:', err)
                setError(err.message || 'Error al procesar el checkout')
                setTimeout(() => router.push('/catalog'), 3000)
            }
        }

        syncWithMeta()
    }, [searchParams, router, addItem, clearCart, applyCoupon, getSubtotal, processed])

    if (processed && !error && items.length > 0) {
        return <OneStepCheckout />
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-cyan-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/[0.03] border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
                    {/* Decorative Corner */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/30 transition-colors" />

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
                            ) : (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-6 bg-cyan-500/10 rounded-3xl mb-8 relative flex items-center justify-center overflow-hidden"
                                >
                                    {isCreditPurchase ? (
                                        <motion.img
                                            initial={{ rotateY: 0 }}
                                            animate={{ rotateY: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            src="/images/eter-coin.png"
                                            alt="Éter Protocol Coin"
                                            className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(200,138,4,0.5)]"
                                        />
                                    ) : isMetaSync ? (
                                        <div className="relative">
                                            <ShoppingBag size={64} className="text-cyan-500" />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                                        </div>
                                    ) : (
                                        <ShoppingBag size={64} className="text-cyan-500" />
                                    )}
                                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-3xl animate-[ping_2s_infinite]" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase italic">
                            Éter <span className="text-cyan-500">{isCreditPurchase ? 'PROTOCOL' : isMetaSync ? 'Meta Sync' : 'Checkout'}</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-mono tracking-[0.4em] uppercase mb-8">
                            {isCreditPurchase ? 'ADQUISICIÓN DE SALDO PREVENTIVO' : isMetaSync ? 'Protocolo de Sincronización Meta' : 'Procesando Pedido...'}
                        </p>

                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-6">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: processed ? "100%" : "70%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className={`h-full ${error ? 'bg-red-500' : 'bg-cyan-500'}`}
                            />
                        </div>

                        <div className={`flex items-center gap-3 font-bold text-sm tracking-widest uppercase ${error ? 'text-red-400' : 'text-cyan-500/80'}`}>
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
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-cyan-500 font-mono tracking-widest uppercase gap-4">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
                <div className="animate-pulse">Iniciando Protocolo Éter...</div>
            </div>
        }>
            <CheckoutHandler />
        </Suspense>
    )
}
