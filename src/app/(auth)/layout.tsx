'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLogin = pathname === '/login'

    return (
        <div className="min-h-screen flex bg-[#0A0A0A] relative overflow-hidden">
            {/* ─── Left Side: Brand Panel (desktop only) ─── */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative items-center justify-center p-12">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-900/30 via-yellow-800/20 to-transparent blur-[120px]"
                        animate={{
                            x: [0, 30, -20, 0],
                            y: [0, -20, 30, 0],
                            scale: [1, 1.1, 0.9, 1],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-700/20 via-orange-900/10 to-transparent blur-[100px]"
                        animate={{
                            x: [0, -30, 20, 0],
                            y: [0, 20, -30, 0],
                            scale: [1, 0.9, 1.1, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-stone-800/20 to-transparent blur-[80px]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(200,138,4,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,138,4,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Brand content */}
                <motion.div
                    className="relative z-10 max-w-lg"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="w-14 h-14 bg-transparent border-2 border-[#CA8A04] flex items-center justify-center rounded-xl relative shadow-[0_0_25px_rgba(200,138,4,0.2)] group-hover:shadow-[0_0_35px_rgba(200,138,4,0.35)] transition-shadow duration-500">
                            <span className="text-4xl font-bold text-[#CA8A04]">É</span>
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#CA8A04] rounded-full animate-pulse" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">ÉTER STORE</span>
                    </Link>

                    {/* Heading */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login-brand' : 'register-brand'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-6">
                                {isLogin ? (
                                    <>
                                        Define tu estilo,{' '}
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                                            lidera el mercado
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Únete a la{' '}
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                                            élite del reselling
                                        </span>
                                    </>
                                )}
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed mb-8">
                                {isLogin
                                    ? 'Accede a la plataforma de dropshipping más exclusiva. Productos de alta gama, logística impecable y el respaldo que tu negocio merece.'
                                    : 'Sin inversión inicial, catálogo premium y logística resuelta. Empieza tu propio negocio de reventa hoy.'}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Trust badges */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#CA8A04]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                            </svg>
                            <span>Más de 500 revendedores</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#CA8A04]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                            </svg>
                            <span>Soporte 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ─── Right Side: Auth Form ─── */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
                {/* Mobile background orbs */}
                <div className="lg:hidden absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-900/20 to-transparent blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-amber-800/15 to-transparent blur-[80px]" />
                </div>

                {/* Auth form container */}
                <motion.div
                    className="w-full max-w-md relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-transparent border border-[#CA8A04] flex items-center justify-center rounded-lg">
                                <span className="text-2xl font-bold text-[#CA8A04]">É</span>
                            </div>
                            <span className="text-lg font-bold text-white">ÉTER STORE</span>
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}
