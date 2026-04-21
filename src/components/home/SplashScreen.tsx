'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/catalog');
        }, 1800);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center overflow-hidden">
            {/* Background Glitch Ambient */}
            <div className="absolute inset-0 bg-[#00E5FF]/[0.02] blur-3xl pointer-events-none mix-blend-screen" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
            >
                <motion.h1
                    animate={{
                        textShadow: [
                            "0 0 10px rgba(0, 229, 255, 0.2)",
                            "0 0 20px rgba(0, 229, 255, 0.4)",
                            "0 0 40px rgba(0, 229, 255, 0.6)",
                            "0 0 10px rgba(0, 229, 255, 0.2)",
                        ]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="text-4xl md:text-6xl font-black text-[#00E5FF] tracking-[0.3em] uppercase"
                >
                    Éter
                </motion.h1>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }}
                    className="h-px bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent mt-4"
                />
            </motion.div>
        </div>
    );
}
