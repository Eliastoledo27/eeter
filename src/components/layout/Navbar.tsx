'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Menu, X, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, loading: isLoading } = useAuth()
  const { totals, openCart } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const cartCount = totals.itemCount

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
          isScrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-500">
              É
            </div>
            <span className={cn(
              "font-bold font-heading text-xl tracking-tighter transition-colors",
              "text-white"
            )}>
              ÉTER STORE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
              Catálogo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>

            <button
              onClick={openCart}
              className="relative p-2 rounded-full transition-colors group hover:bg-white/10"
            >
              <ShoppingCart className="text-zinc-400 group-hover:text-accent transition-colors" size={20} />
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-accent text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in shadow-glow">
                  {cartCount}
                </div>
              )}
            </button>

            {isLoading ? (
              <div className="w-24 h-8 bg-zinc-800 animate-pulse rounded-full" />
            ) : user ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg bg-white text-black hover:bg-zinc-200 border border-white/20"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </motion.button>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-white hover:text-accent transition-colors">
                  Ingresar
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-accent text-black px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-glow flex items-center gap-2"
                  >
                    Registrarse
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={openCart}
              className="relative p-2 rounded-full transition-colors text-white hover:bg-white/10"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-glow">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="relative z-50 p-2 rounded-full transition-all active:scale-95 text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "100vh" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden absolute top-0 left-0 right-0 bg-black/95 backdrop-blur-3xl p-6 flex flex-col gap-6 shadow-2xl z-40 pt-32 h-screen"
            >
              <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold font-heading text-white py-4 border-b border-white/10 hover:text-accent transition-colors">
                Catálogo
              </Link>

              <div className="mt-auto pb-12 flex flex-col gap-4">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg text-lg">
                      <LayoutDashboard size={20} /> Dashboard
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <button className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold border border-white/10 hover:bg-zinc-800 transition-colors text-lg">
                        Ingresar
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <button className="w-full bg-accent text-black py-5 rounded-2xl font-bold shadow-glow text-lg hover:brightness-110">
                        Crear Cuenta
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
