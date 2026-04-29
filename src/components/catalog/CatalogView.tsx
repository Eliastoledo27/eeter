'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductType } from '@/app/actions/products';
import { CatalogFilters } from './CatalogFilters';
import { ProductGrid } from '@/components/home/ProductGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuraStore } from '@/hooks/useAuraStore';
import { Sparkles, Zap, Layers } from 'lucide-react';

interface CatalogViewProps {
    initialProducts: ProductType[];
}

export default function CatalogView({ initialProducts }: CatalogViewProps) {
    const { profile, hasCompletedQuiz } = useAuraStore();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sessionSeed, setSessionSeed] = useState(0);

    useEffect(() => {
        setSessionSeed(Math.random());
    }, []);

    // Derive categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [initialProducts]);

    // Personalization Algorithm
    const personalizedProducts = useMemo(() => {
        let pool = [...initialProducts].filter(p => p.is_active);
        
        if (sessionSeed === 0) return pool;

        // 1. Calculate Aura Affinity Score if quiz is completed
        const scoredPool = pool.map(product => {
            let score = 0;
            
            if (hasCompletedQuiz && profile) {
                // Occasion matching
                if (product.description?.toLowerCase().includes(profile.occasion.toLowerCase())) score += 30;
                
                // Brand affinity
                if (product.name.toLowerCase().includes(profile.brand.toLowerCase())) score += 40;
                
                // Style matching (heuristic based on keywords)
                const styleKeywords: Record<string, string[]> = {
                    minimal: ['minimalist', 'clean', 'simple', 'white', 'blanc'],
                    bold: ['vibrant', 'color', 'neon', 'bright'],
                    retro: ['classic', 'vintage', 'retro', 'og', 'remaster'],
                    urban: ['dark', 'black', 'noir', 'street', 'cargo']
                };
                const keywords = styleKeywords[profile.style] || [];
                if (keywords.some(k => product.description?.toLowerCase().includes(k) || product.name.toLowerCase().includes(k))) {
                    score += 25;
                }

                // Generational Boost (Heuristics)
                if (profile.ageRange === 'genz' && (profile.style === 'bold' || profile.style === 'urban')) score += 15;
                if (profile.ageRange === 'millennial' && (profile.style === 'retro' || profile.style === 'minimal')) score += 15;

                // Regional Boost (Heuristics)
                if (profile.region === 'amba' && profile.style === 'urban') score += 10;
                if (profile.region === 'interior' && product.category?.toLowerCase() === 'zapatillas') score += 5;

                // Budget adjustment
                const price = Number(product.base_price);
                if (profile.budget === 'low' && price < 90000) score += 20;
                if (profile.budget === 'mid' && price >= 90000 && price < 160000) score += 20;
                if (profile.budget === 'high' && price >= 160000) score += 20;
            }

            // 2. Add Session Entropy (Randomness based on sessionSeed to prevent "always same")
            // This ensures that two users with NO profile see different orders, 
            // and users WITH profiles see variations of their best matches.
            const entropy = Math.sin(Number(product.id.substring(0, 8)) * sessionSeed) * 15;
            
            return {
                ...product,
                auraScore: score + entropy
            };
        });

        // 3. Sort by total score
        return scoredPool.sort((a, b) => (b.auraScore || 0) - (a.auraScore || 0));
    }, [initialProducts, profile, hasCompletedQuiz, sessionSeed]);

    // Apply category filter on top of personalized sort
    const filteredProducts = useMemo(() => {
        if (!selectedCategory) return personalizedProducts;
        return personalizedProducts.filter((p) => p.category === selectedCategory);
    }, [personalizedProducts, selectedCategory]);

    return (
        <section className="min-h-screen container mx-auto px-4 md:px-6 py-6 md:py-12">
            {/* Personaization Indicator */}
            {hasCompletedQuiz && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between p-4 rounded-2xl bg-[#00E5FF]/5 border border-[#00E5FF]/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center">
                            <Sparkles size={20} className="text-[#00E5FF]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Algoritmo Aura Activado</h3>
                            <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest">Sugerencias sincronizadas con tu DNA de estilo</p>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-2">
                        {['Prioridad: ' + (profile?.priority || 'Balance'), 'Budget: ' + (profile?.budget || 'Cualquiera')].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-black text-white/40 uppercase border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

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
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                >
                    {filteredProducts.length > 0 ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
                            <Layers size={48} className="text-white/10 mb-6" />
                            <p className="text-xl text-white/30 font-display uppercase tracking-widest font-black">
                                El ecosistema está vacío aquí.
                            </p>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="mt-8 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#00E5FF] transition-all rounded-full"
                            >
                                Reestablecer Filtros
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* AI Floating Badge */}
            <div className="fixed bottom-8 left-8 z-[60] hidden xl:flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gradient-to-br from-[#00E5FF] to-blue-600" />
                    ))}
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">+1200 agentes analizando</span>
                <Zap size={12} className="text-[#00E5FF] fill-[#00E5FF]" />
            </div>
        </section>
    );
}
