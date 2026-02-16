'use client';

import { useCart } from '@/hooks/useCart';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function FloatingCartButton() {
    const { totals, openCart } = useCart();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling down a bit
            setIsVisible(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (totals.itemCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={openCart}
                className={cn(
                    "fixed bottom-6 right-6 z-50 p-4 bg-[#ffd900] text-black rounded-full shadow-[0_0_20px_rgba(255,217,0,0.4)] hover:scale-110 transition-transform active:scale-95 group",
                    !isVisible && "hidden md:flex" // Always show on desktop if items exist, or only scroll logic? Let's show always for now or based on scroll.
                    // actually, let's just make it always visible if items > 0
                )}
            >
                <div className="relative">
                    <ShoppingBag size={24} className="fill-black/10" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-[#ffd900] text-xs font-bold flex items-center justify-center rounded-full border border-[#ffd900]">
                        {totals.itemCount}
                    </span>
                </div>
            </motion.button>
        </AnimatePresence>
    );
}
