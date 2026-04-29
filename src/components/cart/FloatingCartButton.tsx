'use client';

import { useCartStore } from '@/store/cart-store';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function FloatingCartButton() {
    const { items, toggleCart } = useCartStore();
    const [isVisible, setIsVisible] = useState(false);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling down a bit
            setIsVisible(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (itemCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCart}
                className={cn(
                    "fixed bottom-8 right-8 z-[100] w-16 h-16 bg-white text-black rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center group overflow-hidden transition-all duration-300",
                    "hover:shadow-[0_20px_60px_rgba(0,229,255,0.3)] hover:bg-[#00E5FF]"
                )}
            >
                {/* Magnetic / Glowing Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <ShoppingBag size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-[10px] font-black mt-0.5 tracking-tighter leading-none italic">{itemCount}</span>
                </div>

                {/* Cyber Accents */}
                <div className="absolute top-0 right-0 w-4 h-1 bg-[#00E5FF] group-hover:bg-black transition-colors" />
                <div className="absolute bottom-0 left-0 w-1 h-4 bg-[#00E5FF] group-hover:bg-black transition-colors" />
            </motion.button>
        </AnimatePresence>
    );
}
