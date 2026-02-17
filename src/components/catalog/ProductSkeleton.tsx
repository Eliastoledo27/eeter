'use client';

import { motion } from 'framer-motion';

export function ProductSkeleton() {
    return (
        <div className="bg-gradient-to-b from-[#0F0F0F] to-[#050505] rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden h-[400px] md:h-[600px] flex flex-col">
            <div className="aspect-square bg-white/[0.02] relative overflow-hidden">
                <motion.div
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                />
            </div>
            <div className="p-6 md:p-10 space-y-6 flex-1">
                <div className="h-2 w-20 bg-white/5 rounded" />
                <div className="h-8 w-full bg-white/5 rounded-lg" />
                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="h-2 w-12 bg-white/5 rounded" />
                            <div className="h-10 w-32 bg-white/5 rounded-lg" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5" />
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 w-8 rounded-lg bg-white/5" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CatalogSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
