'use client';

import { useState, useMemo } from 'react';
import { ProductType } from '@/app/actions/products';
import { Navbar } from '@/components/layout/Navbar';
import { MinimalFooter } from '@/components/layout/MinimalFooter';
import { ResellerFilters } from './ResellerFilters';
import { ResellerProductGrid } from './ResellerProductGrid';
import { MarginCalculator } from './MarginCalculator';

interface Props {
    products: ProductType[];
    categories: string[];
}

export function ResellerCatalog({ products, categories }: Props) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock'>('name');
    const [sizeFilter, setSizeFilter] = useState('all');
    const [showCalc, setShowCalc] = useState(false);
    const [calcProduct, setCalcProduct] = useState<ProductType | null>(null);

    // Extract all unique sizes from all products
    const allSizes = useMemo(() => {
        const sizeSet = new Set<string>();
        products.forEach(p => {
            if (p.stock_by_size) {
                Object.keys(p.stock_by_size).forEach(size => sizeSet.add(size));
            }
        });
        return Array.from(sizeSet);
    }, [products]);

    // For each size, count how many products have stock > 0 in that size
    const sizeStockMap = useMemo(() => {
        const map: Record<string, number> = {};
        allSizes.forEach(size => {
            map[size] = products.filter(p =>
                p.stock_by_size && Number(p.stock_by_size[size] || 0) > 0
            ).length;
        });
        return map;
    }, [products, allSizes]);

    const filtered = useMemo(() => {
        let list = [...products];

        // Text search
        if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

        // Category
        if (category !== 'Todos') list = list.filter(p => p.category === category);

        // Size filter — show only products that have stock > 0 for the selected size
        if (sizeFilter !== 'all') {
            list = list.filter(p =>
                p.stock_by_size && Number(p.stock_by_size[sizeFilter] || 0) > 0
            );
        }

        // Stock filter
        if (stockFilter === 'available') list = list.filter(p => {
            const total = Object.values(p.stock_by_size || {}).reduce((a, b) => Number(a) + Number(b), 0);
            return total > 0;
        });
        if (stockFilter === 'low') list = list.filter(p => {
            const total = Object.values(p.stock_by_size || {}).reduce((a, b) => Number(a) + Number(b), 0);
            return total > 0 && total <= 10;
        });

        // Sorting
        if (sortBy === 'price_asc') list.sort((a, b) => a.base_price - b.base_price);
        if (sortBy === 'price_desc') list.sort((a, b) => b.base_price - a.base_price);
        if (sortBy === 'stock') list.sort((a, b) => {
            const sa = Object.values(a.stock_by_size || {}).reduce((x, y) => Number(x) + Number(y), 0);
            const sb = Object.values(b.stock_by_size || {}).reduce((x, y) => Number(x) + Number(y), 0);
            return sb - sa;
        });
        if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

        return list;
    }, [products, search, category, stockFilter, sortBy, sizeFilter]);

    return (
        <main className="min-h-screen bg-[#050505] flex flex-col">
            <Navbar />
            
            <div className="flex-1 max-w-[1440px] mx-auto px-5 md:px-10 pb-32 pt-28">
                <ResellerFilters
                    search={search} setSearch={setSearch}
                    category={category} setCategory={setCategory}
                    categories={categories}
                    stockFilter={stockFilter} setStockFilter={setStockFilter}
                    sortBy={sortBy} setSortBy={setSortBy}
                    sizeFilter={sizeFilter} setSizeFilter={setSizeFilter}
                    allSizes={allSizes}
                    sizeStockMap={sizeStockMap}
                    resultCount={filtered.length}
                />
                <ResellerProductGrid
                    products={filtered}
                    onCalculate={(p) => { setCalcProduct(p); setShowCalc(true); }}
                />
            </div>
            
            {showCalc && calcProduct && (
                <MarginCalculator product={calcProduct} onClose={() => setShowCalc(false)} />
            )}
            <MinimalFooter />
        </main>
    );
}
