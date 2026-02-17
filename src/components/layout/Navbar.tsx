'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { LayoutDashboard, Menu, X, ShoppingCart, ArrowUpRight, Instagram, MessageCircle, Search, Globe } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalog' },
  { name: 'Nosotros', href: '/about' },
  { name: 'Soporte', href: '/support' },
]

export function Navbar() {
  const { user, loading: isLoading } = useAuth()
  const { totals, openCart } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)

  const cartCount = totals.itemCount

  // Handle scroll behavior (hide on scroll down, show on scroll up)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest - lastScrollY.current
    if (latest > 100 && direction > 0) {
      setIsHidden(true)
    } else {
      setIsHidden(false)
    }
    setIsScrolled(latest > 50)
    lastScrollY.current = latest
  })

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-700",
          isScrolled ? "py-3 px-4 md:px-10" : "py-6 px-6 md:px-12"
        )}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">

          {/* 1. Left Section: Logo & Status */}
          <div className="flex items-center gap-8 relative z-[110]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover:bg-[#C88A04] group-hover:shadow-[0_0_40px_rgba(200,138,4,0.4)] transition-all duration-500 ease-out">
                  É
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-lg md:text-2xl tracking-tight text-white leading-none">ÉTER</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Live Drop</span>
                </div>
              </div>
            </Link>
          </div>

          {/* 2. Center Section: Floating Pill Navigation */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-2 rounded-[2rem] border transition-all duration-700",
              isScrolled
                ? "bg-black/60 backdrop-blur-3xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                : "bg-white/[0.03] border-white/5"
            )}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all relative group"
                >
                  <span className="relative z-10">{link.name}</span>
                  <motion.div
                    className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="navHover"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C88A04] rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Right Section: Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4 relative z-[110]">
            <button className="hidden sm:flex p-3 text-zinc-400 hover:text-white transition-colors">
              <Search size={18} />
            </button>

            <div className="h-4 w-px bg-white/10 hidden sm:block mx-2" />

            <button
              onClick={openCart}
              className="relative p-3 rounded-2xl group transition-all"
            >
              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/10" />
              <ShoppingCart size={20} className="text-zinc-400 group-hover:text-white relative z-10" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoading ? (
              <div className="w-10 h-10 bg-white/5 animate-pulse rounded-2xl" />
            ) : user ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 md:w-auto md:px-6 bg-[#C88A04] hover:bg-[#ECA413] text-black rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden md:block">Dashboard</span>
                </motion.button>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-white hover:text-[#C88A04] px-4 font-black text-[10px] tracking-widest uppercase transition-colors"
                  >
                    Ingresar
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-white text-black px-6 h-12 rounded-2xl font-black text-[10px] tracking-widest uppercase"
                  >
                    Regístrate
                  </motion.button>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white transition-all active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* --- FULL SCREEN OVERLAY MENU --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="lg:hidden fixed inset-0 bg-[#0A0A0A] z-[90] flex flex-col pt-32 p-8"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-[100vw] h-[100vh] bg-radial-gradient from-[#C88A04]/10 to-transparent blur-[120px] pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <span className="text-[10px] font-black text-[#C88A04] tracking-[0.5em] uppercase px-4">Menu de Navegación</span>
                <div className="flex flex-col">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center justify-between py-5 px-4 rounded-3xl hover:bg-white/[0.03] transition-all"
                      >
                        <span className="text-5xl font-black text-white tracking-tighter uppercase group-hover:text-[#C88A04] transition-colors">{link.name}</span>
                        <ArrowUpRight className="text-gray-700 group-hover:text-[#C88A04] transition-all group-hover:translate-x-2 group-hover:-translate-y-2" size={32} />
                      </Link>
                    </motion.div>
                  ))}

                  {/* Mobile Mobile Auth Actions */}
                  {!user && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-8 flex flex-col gap-4 px-4"
                    >
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full py-5 rounded-3xl border border-white/10 text-white font-black text-xs tracking-widest uppercase hover:bg-white/5 transition-all">
                          Ingresar
                        </button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full py-5 rounded-3xl bg-[#C88A04] text-black font-black text-xs tracking-widest uppercase hover:bg-[#ECA413] transition-all shadow-[0_10px_30px_rgba(200,138,4,0.3)]">
                          Regístrate
                        </button>
                      </Link>
                    </motion.div>
                  )}

                  {user && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="mt-8 px-4"
                    >
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full py-5 rounded-3xl bg-[#C88A04] text-black font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3">
                          <LayoutDashboard size={18} />
                          Panel de Control
                        </button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mt-auto relative z-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-4 pb-10">
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Social</span>
                  <div className="flex gap-4">
                    <Link href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-[#C88A04] hover:text-black transition-all border border-white/5">
                      <Instagram size={20} />
                    </Link>
                    <Link href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-[#C88A04] hover:text-black transition-all border border-white/5">
                      <MessageCircle size={20} />
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Región</span>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white px-4 h-12 rounded-2xl border border-white/5 bg-white/5">
                    <Globe size={14} className="text-[#C88A04]" />
                    ARG / ES
                  </button>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 text-[15vw] font-black text-white/[0.01] pointer-events-none select-none leading-none">
                ÉTER
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
