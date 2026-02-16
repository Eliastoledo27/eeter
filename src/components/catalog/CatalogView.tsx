'use client';

import { useState, useMemo } from 'react';
import { ProductType } from '@/app/actions/products';
import { CatalogFilters } from './CatalogFilters';
import { ProductGrid } from '@/components/home/ProductGrid';
import { motion, AnimatePresence } from 'framer-motion';

interface CatalogViewProps {
    initialProducts: ProductType[];
}

export default function CatalogView({ initialProducts }: CatalogViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Derive categories from products
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [initialProducts]);

    // Filter products
    const filteredProducts = useMemo(() => {
        const activeProducts = initialProducts.filter(p => p.is_active);
        if (!selectedCategory) return activeProducts;
        return activeProducts.filter((p) => p.category === selectedCategory);
    }, [initialProducts, selectedCategory]);

    return (
        <section className="min-h-screen container mx-auto px-4 md:px-6 py-6 md:py-12">
            <CatalogFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalCount={filteredProducts.length}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedCategory || 'all'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredProducts.length > 0 ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-xl text-gray-500 font-display">
                                No hay productos en esta categoría.
                            </p>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mt-4 text-[#ffd900] hover:underline"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
