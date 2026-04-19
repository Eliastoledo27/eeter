'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '/catalog', label: 'Hombres' },
    { href: '/catalog', label: 'Mujeres' },
    { href: '/catalog', label: 'Colecciones' },
    { href: '/catalog', label: 'Sale', isHighlight: true },
];

export function CatalogNavbar() {
    const { profile, loading: isLoading } = useAuth();
    const { totals, setIsOpen: setIsCartOpen } = useCartStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const cartCount = totals()?.itemCount || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
                    isScrolled
                        ? 'bg-[#020202]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl'
                        : 'bg-transparent border-b border-transparent'
                )}
            >
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <span
                                className={cn(
                                    'font-display font-black text-2xl tracking-tighter transition-all duration-300',
                                    'text-white group-hover:text-[#00E5FF]'
                                )}
                            >
                                ÉTER
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-10">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={cn(
                                        'text-[11px] font-black tracking-widest uppercase transition-colors relative group',
                                        link.isHighlight
                                            ? 'text-[#00E5FF] hover:text-white'
                                            : 'text-gray-400 hover:text-white'
                                    )}
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00E5FF] transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Search */}
                            <button className="p-2.5 rounded-xl text-gray-400 hover:text-[#00E5FF] hover:bg-white/5 transition-all">
                                <Search size={18} />
                            </button>

                            {/* Favorites */}
                            <button className="p-2.5 rounded-xl text-gray-400 hover:text-[#00E5FF] hover:bg-white/5 transition-all">
                                <Heart size={18} />
                            </button>

                            {/* Cart */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2.5 rounded-xl text-gray-400 hover:text-[#00E5FF] hover:bg-white/5 transition-all"
                            >
                                <ShoppingBag size={18} />
                                {cartCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 bg-[#00E5FF] text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(0,229,255,0.4)]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* User / Auth */}
                            {isLoading ? (
                                <div className="w-16 h-8 bg-white/5 animate-pulse rounded-full" />
                            ) : profile ? (
                                <Link href="/dashboard">
                                    <button className="ml-2 px-6 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase bg-white text-black hover:bg-[#00E5FF] transition-all duration-500 shadow-xl shadow-black/20">
                                        Boarding
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <button className="ml-2 p-2.5 rounded-xl text-gray-400 hover:text-[#00E5FF] hover:bg-white/5 transition-all">
                                        <User size={18} />
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-[#00E5FF] text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            <button
                                className="relative z-50 p-2 rounded-xl text-white hover:bg-white/10 transition-all active:scale-95"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="md:hidden fixed inset-0 bg-[#020202] z-40 flex flex-col pt-28 px-8"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 blur-[100px] pointer-events-none" />

                            <div className="space-y-6">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            'block text-4xl font-black uppercase tracking-tighter transition-all',
                                            link.isHighlight
                                                ? 'text-[#00E5FF]'
                                                : 'text-white hover:text-[#00E5FF]'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto pb-12 flex flex-col gap-4">
                                {profile ? (
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full bg-[#00E5FF] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#00E5FF]/20">
                                            Ir al Dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                                Ingresar
                                            </button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                                                Empieza Ahora
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
    );
}
