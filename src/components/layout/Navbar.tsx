'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.08,
        },
    },
};

export function LogoMark({ compact = false }: { compact?: boolean }) {
    return (
        <Link href="/" className="inline-flex items-center gap-3" aria-label="ÉTER inicio">
            <div className={`relative ${compact ? 'w-[100px] h-[30px]' : 'w-[140px] h-[40px]'}`}>
                <Image 
                    src="/texto.png" 
                    alt="ÉTER" 
                    fill 
                    className="object-contain object-left" 
                    priority
                />
            </div>
        </Link>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="absolute left-0 right-0 top-0 z-50 w-full"
        >
            <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-5 md:px-10">
                <LogoMark compact />

                <div className="flex items-center gap-5">
                    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                        href="/register"
                        className="eter-outline-cta hidden px-8 py-4 text-center text-[11px] leading-tight md:block"
                    >
                        Unirme
                        <span className="block text-[10px] text-white/70">como revendedor</span>
                    </Link>
                    </motion.div>
                    <button className="text-white lg:hidden" aria-label="Abrir menú" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={30} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#050505] flex flex-col p-6 lg:hidden"
                    >
                        <div className="flex items-center justify-between">
                            <LogoMark compact />
                            <button className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={30} />
                            </button>
                        </div>
                        <nav className="mt-12 flex flex-col items-center gap-8">

                            <Link
                                href="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="eter-outline-cta mt-4 px-8 py-4 text-center text-[11px]"
                            >
                                Unirme como revendedor
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
