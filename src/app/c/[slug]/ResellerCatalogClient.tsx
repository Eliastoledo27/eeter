'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function ResellerCatalogClient({
    initialProducts,
    resellerName,
    resellerSlug
}: {
    initialProducts: any[],
    resellerName: string,
    resellerSlug: string
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');

    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
        return ['Todos', ...Array.from(cats)].sort();
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [initialProducts, searchQuery, activeCategory]);

    return (
        <div className="space-y-12">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                                ? 'bg-[#C88A04] text-black shadow-[0_0_20px_rgba(200,138,4,0.3)]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        placeholder="BUSCAR PRODUCTO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#C88A04]/50 transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link href={`/c/${resellerSlug}/${product.id}`}>
                                {/* We map resellerPrice to basePrice for the ProductCard component */}
                                <ProductCard
                                    product={{
                                        ...product,
                                        basePrice: product.resellerPrice || product.basePrice,
                                        stockBySize: product.stock_by_size // Map snake_case to camelCase
                                    }}
                                    href={`/c/${resellerSlug}/${product.id}`}
                                />

                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-40 text-center">
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">No se encontraron productos en esta categoría</p>
                </div>
            )}
        </div>
    );
}
