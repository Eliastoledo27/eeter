'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Tag, 
    Search, 
    Filter, 
    ArrowLeft, 
    Activity, 
    Eye, 
    Trash2, 
    Loader2, 
    CheckCircle2,
    PackageOpen,
    ArrowRight,
    TrendingDown,
    Zap,
    LayoutGrid,
    List,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, ProductType } from '@/app/actions/products';
import { applyLiquidationBatch, getLiquidationProducts, type LiquidationSort } from '@/app/actions/liquidation-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LiquidationPage() {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [liquidatedRows, setLiquidatedRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'liquidated'>('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<LiquidationSort>('liquidated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const allProducts = await getProducts('', undefined, 'active');
            setProducts(allProducts || []);
            
            const res = await getLiquidationProducts({ 
                page, 
                pageSize: 12, 
                sortBy, 
                sortOrder 
            });
            if (res.error) toast.error(res.error);
            setLiquidatedRows(res.data || []);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, sortBy, sortOrder]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const selectable = useMemo(() => {
        return products.filter((p) => {
            const totalStock = Object.values(p.stock_by_size || {}).reduce((acc, qty) => acc + Number(qty || 0), 0);
            const liq = p as any;
            const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'pending' && !liq.liquidation_active) ||
                (statusFilter === 'liquidated' && !!liq.liquidation_active);
            return p.is_active && totalStock > 0 && matchesSearch && matchesStatus;
        });
    }, [products, query, statusFilter]);

    const handleApplyLiquidation = async () => {
        const selectedIds = Object.keys(selected);

        setIsProcessing(true);
        try {
            const payload = selectedIds.map(id => ({
                productId: id,
                discountPercent: 20
            }));
            const res = await applyLiquidationBatch(payload);
            if (res.success) {
                toast.success(`Protocolo de liquidación aplicado a ${res.count} nodos.`);
                setSelected({});
                fetchAll();
            } else {
                toast.error(res.error || 'Fallo en la operación.');
            }
        } catch (err) {
            toast.error('Error crítico en el despliegue.');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleAll = () => {
        if (Object.keys(selected).length === selectable.length) {
            setSelected({});
        } else {
            const newSelected: Record<string, boolean> = {};
            selectable.forEach(p => newSelected[p.id] = true);
            setSelected(newSelected);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-[#00E5FF] selection:text-black">
            <Navbar />
            
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00E5FF]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7A00FF]/5 blur-[100px] rounded-full" />
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[80px] rounded-full" />
            </div>

            <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-6">
                        <Link 
                            href="/dashboard/inventory" 
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-[#00E5FF] transition-all group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Regresar a Inventario
                        </Link>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_#F43F5E]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/50">Operación: Liquidación Final</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                STOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-[#00E5FF] to-[#7A00FF]">OUT</span>
                            </h1>
                            <p className="text-white/30 text-lg font-medium uppercase tracking-widest text-[11px] max-w-xl">
                                Protocolo de liquidación sin cambio. Selección de nodos con <span className="text-white">ROI acelerado</span> y rotación agresiva.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl p-6 rounded-[2rem] min-w-[180px]">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest block mb-2">Liquidaciones Activas</span>
                            <span className="text-3xl font-black tabular-nums text-[#00E5FF]">{total}</span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl p-6 rounded-[2rem] min-w-[180px]">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest block mb-2">Seleccionados</span>
                            <span className="text-3xl font-black tabular-nums text-rose-500">{Object.keys(selected).length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Hub */}
                <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
                    {/* Selection Panel */}
                    <div className="space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 backdrop-blur-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingDown size={120} strokeWidth={1} />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00E5FF] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar por nombre de ítem..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-sm font-medium text-white placeholder:text-white/10 focus:bg-white/5 focus:border-[#00E5FF]/30 outline-none transition-all"
                                    />
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="appearance-none bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-8 text-[10px] font-black text-white/60 tracking-widest focus:bg-white/5 outline-none cursor-pointer transition-all uppercase"
                                >
                                    <option value="all" className="bg-[#0A0A0A]">Todos los Estados</option>
                                    <option value="pending" className="bg-[#0A0A0A]">Pendientes</option>
                                    <option value="liquidated" className="bg-[#0A0A0A]">Ya Liquidados</option>
                                </select>
                                <button 
                                    onClick={toggleAll}
                                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                                >
                                    {Object.keys(selected).length === selectable.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                                {selectable.map((p) => {
                                    const isSelected = selected[p.id] !== undefined;
                                    const liq = p as any;
                                    return (
                                        <div 
                                            key={p.id}
                                            className={cn(
                                                "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
                                                isSelected 
                                                    ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 shadow-[0_0_30px_rgba(0,229,255,0.05)]" 
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            const n = { ...selected };
                                                            delete n[p.id];
                                                            setSelected(n);
                                                        } else {
                                                            setSelected(prev => ({ ...prev, [p.id]: true }));
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-500",
                                                        isSelected ? "bg-[#00E5FF] border-[#00E5FF]" : "border-white/10 group-hover:border-white/20"
                                                    )}
                                                >
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-[#00E5FF] transition-colors truncate max-w-[200px]">
                                                        {p.name}
                                                    </h3>
                                                    <span className={cn(
                                                        "text-[8px] font-black px-2 py-0.5 rounded-full",
                                                        liq.liquidation_active ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                                                    )}>
                                                        {liq.liquidation_active ? 'YA LIQUIDADO' : 'PENDIENTE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-[#00E5FF]/80 uppercase tracking-wider">
                                                Precio final = actual
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Deployment Sidebar */}
                    <div className="sticky top-32 space-y-8">
                        <div className="bg-gradient-to-br from-rose-500/20 via-rose-600/5 to-transparent border border-rose-500/20 rounded-[3rem] p-8 backdrop-blur-3xl">
                            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Despliegue</h3>
                            <p className="text-xs text-white/40 mb-8 font-medium">Control maestro: solo los seleccionados quedan en liquidación en todo el sitio.</p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nodos Afectados</span>
                                    <span className="text-xl font-black">{Object.keys(selected).length}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tipo de Acción</span>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Liquidación Directa</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleApplyLiquidation}
                                disabled={isProcessing}
                                className="w-full bg-rose-500 text-black py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(244,63,94,0.3)] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                                {Object.keys(selected).length === 0 ? 'DESACTIVAR TODAS' : 'SINCRONIZAR LIQUIDACIONES'}
                            </button>
                        </div>

                        {/* Visual Quality Note */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
                            <div className="flex items-start gap-4">
                                <Activity className="text-[#00E5FF]" size={20} />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Impacto en Catálogo</h4>
                                    <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-wider">
                                        Los productos aparecerán con etiqueta "LIQUIDACIÓN" y precio rebajado en todo el ecosistema ÉTER.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Liquidations List */}
                <div className="mt-24 space-y-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black uppercase tracking-tight">Archivo de <span className="text-[#00E5FF]">Liquidaciones</span></h2>
                        <div className="flex items-center gap-3">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white/[0.02] border border-white/5 rounded-xl py-3 px-6 text-[10px] font-black text-white/40 tracking-widest outline-none"
                            >
                                <option value="liquidated_at">Fecha</option>
                                <option value="name">Nombre</option>
                                <option value="discount">Descuento</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {liquidatedRows.map((row) => (
                            <motion.article 
                                key={row.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#00E5FF]/20 transition-all duration-500"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-black">
                                    {row.images?.[0] ? (
                                        <Image 
                                            src={row.images[0]} 
                                            alt={row.name} 
                                            fill 
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/5">
                                            <PackageOpen size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-rose-500 text-black text-[10px] font-black px-4 py-2 rounded-full shadow-2xl">
                                            -{row.liquidation_discount_percent}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-8 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-black uppercase text-white group-hover:text-[#00E5FF] transition-colors truncate">
                                            {row.name}
                                        </h3>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">
                                            Liquidado el {new Date(row.liquidation_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div className="space-y-1">
                                            <span className="block text-[10px] font-black text-white/20 line-through tracking-tighter">
                                                ${Math.round(Number(row.price || 0) * 1.2).toLocaleString('es-AR')}
                                            </span>
                                            <span className="block text-2xl font-black text-[#00E5FF] tracking-tighter">
                                                ${Number(row.liquidation_price || row.price || 0).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                        <Link 
                                            href={`/catalog/${row.id}`}
                                            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:bg-[#00E5FF] hover:text-black transition-all"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Pagination */}
                    {total > 12 && (
                        <div className="flex items-center justify-center gap-4 pt-12">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                PÁGINA {page} DE {Math.ceil(total / 12)}
                            </span>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * 12 >= total}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl disabled:opacity-20 hover:bg-white/10 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
