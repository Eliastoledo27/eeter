'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
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
    const { user, loading: isLoading } = useAuth();
    const { totals, openCart } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const cartCount = totals.itemCount;

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
                        ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl'
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
                                    'text-white group-hover:text-[#ffd900]'
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
                                        'text-sm font-display font-semibold tracking-wider uppercase transition-colors relative group',
                                        link.isHighlight
                                            ? 'text-[#ffd900] hover:text-[#ffe033]'
                                            : 'text-gray-300 hover:text-white'
                                    )}
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#ffd900] transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Search */}
                            <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                <Search size={18} />
                            </button>

                            {/* Favorites */}
                            <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                <Heart size={18} />
                            </button>

                            {/* Cart */}
                            <button
                                onClick={openCart}
                                className="relative p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <ShoppingBag size={18} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#ffd900] text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* User / Auth */}
                            {isLoading ? (
                                <div className="w-16 h-8 bg-white/5 animate-pulse rounded-full" />
                            ) : user ? (
                                <Link href="/dashboard">
                                    <button className="ml-2 px-5 py-2 rounded-full font-display font-bold text-xs tracking-wider uppercase bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                                        Mi Cuenta
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <button className="ml-2 p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                        <User size={18} />
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={openCart}
                                className="relative p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                            >
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#ffd900] text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            <button
                                className="relative z-50 p-2 rounded-full text-white hover:bg-white/10 transition-all active:scale-95"
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
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: '100vh' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="md:hidden fixed inset-0 bg-[#0a0a0a]/98 backdrop-blur-3xl z-40 flex flex-col pt-28 px-8"
                        >
                            <div className="space-y-2">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            'block text-3xl font-display font-bold py-4 border-b border-white/5 transition-colors',
                                            link.isHighlight
                                                ? 'text-[#ffd900] hover:text-[#ffe033]'
                                                : 'text-white hover:text-[#ffd900]'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto pb-12 flex flex-col gap-3">
                                {user ? (
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full bg-[#ffd900] text-black py-4 rounded-full font-display font-bold uppercase tracking-wider text-sm">
                                            Mi Cuenta
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-full font-display font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors">
                                                Ingresar
                                            </button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full bg-[#ffd900] text-black py-4 rounded-full font-display font-bold uppercase tracking-wider text-sm">
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
    );
}
