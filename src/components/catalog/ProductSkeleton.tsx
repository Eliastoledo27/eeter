'use client';

import { motion } from 'framer-motion';

export function ProductSkeleton() {
    return (
        <div className="bg-[#050505] rounded-[2.5rem] border border-white/5 overflow-hidden h-full flex flex-col relative p-3">
            <div className="aspect-[4/5] bg-white/[0.02] relative overflow-hidden rounded-[2rem] mb-6">
                <motion.div
                    animate={{
                        x: ['-100%', '200%'],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent skew-x-12"
                />
            </div>
            
            <div className="px-3 space-y-5 flex-1 flex flex-col">
                <div className="space-y-2">
                    <div className="h-2 w-1/3 bg-white/5 rounded-full" />
                    <div className="h-6 w-full bg-white/5 rounded-xl" />
                </div>
                
                <div className="mt-2 space-y-4">
                    <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="aspect-square rounded-xl bg-white/5" />
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 flex justify-between items-end border-t border-white/5">
                    <div className="space-y-2">
                        <div className="h-2 w-10 bg-white/5 rounded-full" />
                        <div className="h-8 w-24 bg-white/5 rounded-xl" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5" />
                </div>
            </div>
        </div>
    );
}

export function CatalogSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
