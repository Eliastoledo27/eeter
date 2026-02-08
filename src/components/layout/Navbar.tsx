'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cart-store'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Menu, X, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CartSidebar } from '@/components/cart/CartSidebar'

export function Navbar() {
  const { user, loading: isLoading } = useAuth()
  const { items, toggleCart } = useCartStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-rose rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              É
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight transition-colors",
              isScrolled ? "text-gray-900" : "text-gray-900" // Always dark for readability on light bg (Hero will be light too)
            )}>
              ÉTER STORE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Nosotros
            </Link>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ShoppingCart className="text-gray-700 group-hover:text-primary transition-colors" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full" />
            ) : user ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-900/20"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </motion.button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-primary transition-colors px-4 py-2">
                  Ingresar
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
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
              onClick={toggleCart}
              className="relative p-2"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="text-gray-800" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="relative z-50 text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
              onClick={() => {
                try {
                  setIsMobileMenuOpen(prev => !prev);
                } catch (error) {
                  console.error("Error toggling mobile menu:", error);
                }
              }}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl overflow-hidden z-40"
            >
              <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50">
                Catálogo
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50">
                Nosotros
              </Link>

              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10">
                      <LayoutDashboard size={18} /> Ir al Dashboard
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <button className="w-full bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Ingresar
                      </button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <button className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30">
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
      <CartSidebar />
    </>
  )
}
