'use client';

import { useMemo, useState } from 'react';
import { ProductType } from '@/app/actions/products';
import { Navbar } from '@/components/layout/Navbar';
import { MinimalFooter } from '@/components/layout/MinimalFooter';
import { ResellerFilters } from './ResellerFilters';
import { ResellerProductGrid } from './ResellerProductGrid';
import { MarginCalculator } from './MarginCalculator';
import { AlertTriangle, Copy, Menu, PackageCheck, Share2, Sparkles, TrendingUp, Globe, Settings, X, Crown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ResellerCatalogBuilder } from './ResellerCatalogBuilder';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    products: ProductType[];
    categories: string[];
}

export function ResellerCatalog({ products, categories }: Props) {
    const { isAuthenticated, role } = useAuth();
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isMarketingOpen, setIsMarketingOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock'>('name');
    const [sizeFilter, setSizeFilter] = useState('all');
    const [showCalc, setShowCalc] = useState(false);
    const [calcProduct, setCalcProduct] = useState<ProductType | null>(null);
    const [copiedAction, setCopiedAction] = useState<string | null>(null);

    const isEligibleReseller = isAuthenticated && (role === 'reseller' || role === 'admin');

    const handleOpenBuilder = () => {
        if (isEligibleReseller) {
            setIsBuilderOpen(true);
        } else {
            setIsMarketingOpen(true);
        }
    };

    const allSizes = useMemo(() => {
        const sizeSet = new Set<string>();
        products.forEach((product) => {
            Object.keys(product.stock_by_size || {}).forEach((size) => sizeSet.add(size));
        });
        return Array.from(sizeSet);
    }, [products]);

    const sizeStockMap = useMemo(() => {
        const map: Record<string, number> = {};
        allSizes.forEach((size) => {
            map[size] = products.filter((product) => Number(product.stock_by_size?.[size] || 0) > 0).length;
        });
        return map;
    }, [products, allSizes]);

    const catalogStats = useMemo(() => {
        return products.reduce(
            (acc, product) => {
                const total = Object.values(product.stock_by_size || {}).reduce((sum, qty) => Number(sum) + Number(qty), 0);
                acc.totalStock += total;
                if (total > 0) acc.available += 1;
                if (total > 0 && total <= 5) acc.lowStock += 1;
                return acc;
            },
            { totalStock: 0, available: 0, lowStock: 0 }
        );
    }, [products]);

    const filtered = useMemo(() => {
        let list = [...products];
        const normalizedSearch = search.trim().toLowerCase();

        if (normalizedSearch) {
            list = list.filter((product) => {
                const haystack = `${product.name} ${product.category || ''}`.toLowerCase();
                return haystack.includes(normalizedSearch);
            });
        }

        if (category !== 'Todos') list = list.filter((product) => product.category === category);

        if (sizeFilter !== 'all') {
            list = list.filter((product) => Number(product.stock_by_size?.[sizeFilter] || 0) > 0);
        }

        if (stockFilter === 'available') {
            list = list.filter((product) => Object.values(product.stock_by_size || {}).reduce((a, b) => Number(a) + Number(b), 0) > 0);
        }

        if (stockFilter === 'low') {
            list = list.filter((product) => {
                const total = Object.values(product.stock_by_size || {}).reduce((a, b) => Number(a) + Number(b), 0);
                return total > 0 && total <= 10;
            });
        }

        if (sortBy === 'price_asc') list.sort((a, b) => a.base_price - b.base_price);
        if (sortBy === 'price_desc') list.sort((a, b) => b.base_price - a.base_price);
        if (sortBy === 'stock') {
            list.sort((a, b) => {
                const stockA = Object.values(a.stock_by_size || {}).reduce((x, y) => Number(x) + Number(y), 0);
                const stockB = Object.values(b.stock_by_size || {}).reduce((x, y) => Number(x) + Number(y), 0);
                return stockB - stockA;
            });
        }
        if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

        return list;
    }, [products, search, category, stockFilter, sortBy, sizeFilter]);

    const copyText = async (key: string, text: string, successMessage: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedAction(key);
        toast.success(successMessage);
        setTimeout(() => setCopiedAction(null), 1800);
    };

    const shareCatalog = async () => {
        const url = `${window.location.origin}/resellers`;
        const text = `Stock activo ETER: ${catalogStats.available} modelos, ${catalogStats.totalStock} pares disponibles.`;

        if (navigator.share) {
            await navigator.share({ title: 'Catalogo revendedor ETER', text, url });
            return;
        }

        await copyText('share', `${text}\n${url}`, 'Link del catalogo copiado');
    };

    const copyStockSummary = () => {
        const summary = [
            '*ETER - Resumen de stock*',
            `Modelos activos: ${catalogStats.available}`,
            `Pares disponibles: ${catalogStats.totalStock}`,
            `Ultimas unidades: ${catalogStats.lowStock}`,
            `Catalogo: ${window.location.origin}/resellers`,
        ].join('\n');

        copyText('summary', summary, 'Resumen listo para WhatsApp');
    };

    return (
        <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#050505]">
            <Navbar />

            <div className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 overflow-x-hidden px-3 pb-28 pt-20 sm:px-5 sm:pt-24 md:px-10 md:pb-32 md:pt-28">
                <section className="mb-3 max-w-full overflow-hidden rounded-b-[1.35rem] border-x border-b border-white/[0.06] bg-[radial-gradient(circle_at_18%_0%,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] px-3 pb-3 pt-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:hidden">
                    <div className="flex max-w-full items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="mb-1 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.22em] text-[#00E5FF]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                                Live stock
                            </p>
                            <h1 className="text-[18px] font-black uppercase leading-[0.95] text-white min-[380px]:text-[21px]">
                                Catalogo <span className="text-tri-gradient">revendedor</span>
                            </h1>
                            <p className="mt-1 line-clamp-1 text-[10px] font-bold text-white/42">
                                Stock real, talles visibles y venta rapida.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <span className="max-w-[74px] truncate rounded-full border border-white/[0.08] bg-black/35 px-2 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-white/50 min-[380px]:max-w-none min-[380px]:px-2.5 min-[380px]:tracking-[0.12em]">
                                {filtered.length} items
                            </span>
                            <button
                                type="button"
                                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/72"
                                aria-label="Ir a modelos"
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid min-w-0 grid-cols-3 gap-1.5">
                        <div className="min-w-0 rounded-xl border border-[#00E5FF]/12 bg-[#00E5FF]/[0.055] px-2 py-2 min-[380px]:px-2.5">
                            <PackageCheck size={13} className="mb-1 text-[#00E5FF]" />
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">Modelos</p>
                            <p className="truncate text-sm font-black text-white">{catalogStats.available}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-[#C6FF00]/12 bg-[#C6FF00]/[0.05] px-2 py-2 min-[380px]:px-2.5">
                            <Sparkles size={13} className="mb-1 text-[#C6FF00]" />
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">Pares</p>
                            <p className="truncate text-sm font-black text-white">{catalogStats.totalStock}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-[#7A00FF]/15 bg-[#7A00FF]/[0.07] px-2 py-2 min-[380px]:px-2.5">
                            <AlertTriangle size={13} className="mb-1 text-[#9B5CFF]" />
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">Ultimas</p>
                            <p className="truncate text-sm font-black text-white">{catalogStats.lowStock}</p>
                        </div>
                    </div>
                </section>

                <ResellerFilters
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                    stockFilter={stockFilter}
                    setStockFilter={setStockFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sizeFilter={sizeFilter}
                    setSizeFilter={setSizeFilter}
                    allSizes={allSizes}
                    sizeStockMap={sizeStockMap}
                    resultCount={filtered.length}
                />

                <section className="mt-3 grid max-w-full min-w-0 gap-2.5 sm:mt-4 sm:gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div className="hidden grid-cols-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:grid">
                        <div className="flex items-center gap-2 border-r border-white/[0.06] px-2.5 py-3 sm:gap-3 sm:px-4">
                            <PackageCheck size={16} className="hidden shrink-0 text-[#00E5FF] min-[380px]:block" />
                            <div className="min-w-0">
                                <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">Modelos</p>
                                <p className="text-sm font-black text-white sm:text-lg">{catalogStats.available}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border-r border-white/[0.06] px-2.5 py-3 sm:gap-3 sm:px-4">
                            <TrendingUp size={16} className="hidden shrink-0 text-[#C6FF00] min-[380px]:block" />
                            <div className="min-w-0">
                                <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">Pares</p>
                                <p className="text-sm font-black text-white sm:text-lg">{catalogStats.totalStock}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-3 sm:gap-3 sm:px-4">
                            <AlertTriangle size={16} className="hidden shrink-0 text-[#7A00FF] min-[380px]:block" />
                            <div className="min-w-0">
                                <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">Ultimas</p>
                                <p className="text-sm font-black text-white sm:text-lg">{catalogStats.lowStock}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-2 gap-2 md:flex md:items-center">
                        <button
                            onClick={shareCatalog}
                            className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-2 text-[9px] font-black uppercase tracking-[0.06em] text-[#00E5FF] transition-all hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/15 min-[380px]:gap-2 min-[380px]:px-3 min-[380px]:text-[10px] sm:px-4 sm:tracking-[0.14em]"
                        >
                            <Share2 size={14} />
                            Compartir
                        </button>
                        <button
                            onClick={copyStockSummary}
                            className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.035] px-2 text-[9px] font-black uppercase tracking-[0.06em] text-white/55 transition-all hover:border-white/20 hover:text-white min-[380px]:gap-2 min-[380px]:px-3 min-[380px]:text-[10px] sm:px-4 sm:tracking-[0.14em]"
                        >
                            <Copy size={14} />
                            {copiedAction === 'summary' ? 'Copiado' : 'Stock'}
                        </button>
                        <button
                            onClick={handleOpenBuilder}
                            className="col-span-2 md:col-span-1 inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF007A] via-[#8F00FF] to-[#00E5FF] px-3 text-[9px] font-black uppercase tracking-[0.06em] text-black hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,229,255,0.35)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] min-[380px]:gap-2 min-[380px]:px-3.5 min-[380px]:text-[10px] sm:px-5 sm:tracking-[0.14em] animate-pulse"
                        >
                            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                            Mi Tienda
                        </button>
                    </div>
                </section>

                <ResellerProductGrid
                    products={filtered}
                    onCalculate={(product) => {
                        setCalcProduct(product);
                        setShowCalc(true);
                    }}
                />
            </div>

            {showCalc && calcProduct && (
                <MarginCalculator product={calcProduct} onClose={() => setShowCalc(false)} />
            )}

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 z-40 sm:hidden">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOpenBuilder}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF007A] via-[#8F00FF] to-[#00E5FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,229,255,0.5)] border border-white/20 animate-bounce"
                    style={{ animationDuration: '3s' }}
                >
                    <Settings className="animate-spin" style={{ animationDuration: '8s' }} size={24} />
                </motion.button>
            </div>

            {/* Premium Overlay for Reseller Catalog Builder */}
            <AnimatePresence>
                {isBuilderOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="w-full max-w-[1100px] h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <ResellerCatalogBuilder onClose={() => setIsBuilderOpen(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Marketing & Onboarding Modal for Guests */}
            <AnimatePresence>
                {isMarketingOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl shadow-cyan-500/5 p-8 relative text-white"
                        >
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/10 blur-[80px] rounded-full" />

                            <button
                                onClick={() => setIsMarketingOpen(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg">
                                    <Crown className="text-[#00E5FF]" size={28} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight italic">
                                        Tu Tienda Digital <span className="text-[#00E5FF]">ÉTER</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Red de Revendedores Exclusivos</p>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                                    Multiplica tus ventas compartiendo tu propio catálogo con precios personalizados, stock en vivo y recepción de pedidos directamente en tu WhatsApp.
                                </p>

                                {/* Value Propositions */}
                                <div className="space-y-3 text-left bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs">
                                    <div className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                                        <p className="text-[11px] text-slate-300 font-semibold"><strong>Margen a tu Medida:</strong> Define tu propia ganancia por calzado vendido.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                                        <p className="text-[11px] text-slate-300 font-semibold"><strong>Stock 100% en Vivo:</strong> Tus clientes solo verán lo que está disponible en depósito.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                                        <p className="text-[11px] text-slate-300 font-semibold"><strong>Pedidos Directos:</strong> Los clientes te compran por la web y te llega por WhatsApp.</p>
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="space-y-3 pt-2">
                                    <a
                                        href="/reseller/login"
                                        className="w-full bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/10"
                                    >
                                        Ingresar a Mi Tienda
                                        <ArrowRight size={14} />
                                    </a>
                                    <a
                                        href="/reseller/register"
                                        className="w-full bg-slate-900 border border-white/10 text-slate-300 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                    >
                                        Quiero ser Revendedor
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MinimalFooter />
        </main>
    );
}
