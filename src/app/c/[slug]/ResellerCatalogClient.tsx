'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Search, Share2, Calculator, Eye, EyeOff, DollarSign, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

export function ResellerCatalogClient({
    initialProducts,
    resellerName,
    resellerSlug,
    resellerTheme = 'original'
}: {
    initialProducts: any[],
    resellerName: string,
    resellerSlug: string,
    resellerTheme?: string
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');

    // --- CONTROLES DE MARGEN Y VISTA DEL REVENDEDOR ---
    const [isAdminView, setIsAdminView] = useState(false); // Toggle entre vista administrativa y de cliente
    const [customMarkup, setCustomMarkup] = useState<number>(0); // Incremento extra opcional sobre el precio
    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    // Theme-based style configurations
    const activeBtnStyles: Record<string, string> = {
        original: 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] rounded-full',
        minimal: 'bg-white text-black border border-white rounded-none',
        cyber: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-none font-mono',
        warm: 'bg-[#D39E82] text-[#121110] rounded-lg font-serif',
        swiss: 'bg-[#FF3B30] text-white border-2 border-[#FF3B30] rounded-none font-black',
        kinetic: 'bg-[#FFFF00] text-black border border-[#FFFF00] rounded-none font-extrabold italic'
    };

    const inactiveBtnStyles: Record<string, string> = {
        original: 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-full',
        minimal: 'bg-transparent text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-500 rounded-none',
        cyber: 'bg-transparent text-zinc-500 border border-zinc-900 hover:text-emerald-400 hover:border-emerald-500/30 rounded-none font-mono',
        warm: 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-[#F5F2EB] rounded-lg font-serif',
        swiss: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-none font-black',
        kinetic: 'bg-transparent text-white border border-white/20 hover:border-white/50 rounded-none font-extrabold italic'
    };

    const inputStyles: Record<string, string> = {
        original: 'bg-white/5 border border-white/10 rounded-full focus:border-[#00E5FF]/50',
        minimal: 'bg-transparent border border-zinc-800 rounded-none focus:border-zinc-400',
        cyber: 'bg-transparent border border-zinc-900 rounded-none focus:border-emerald-500/50 text-emerald-400 font-mono',
        warm: 'bg-white/5 border border-white/5 rounded-lg focus:border-[#D39E82]/50 text-[#F5F2EB] font-serif',
        swiss: 'bg-transparent border-2 border-white rounded-none focus:border-[#FF3B30] text-white font-bold',
        kinetic: 'bg-transparent border border-white/20 rounded-none focus:border-[#FFFF00] text-white font-black italic'
    };

    const searchIconStyles: Record<string, string> = {
        original: 'text-gray-600',
        minimal: 'text-zinc-600',
        cyber: 'text-emerald-900',
        warm: 'text-zinc-600',
        swiss: 'text-white',
        kinetic: 'text-zinc-500'
    };

    const containerCardStyles: Record<string, string> = {
        original: 'bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl',
        minimal: 'bg-transparent border border-zinc-900 rounded-none p-6',
        cyber: 'bg-black/40 border border-zinc-900/50 rounded-none p-6 font-mono',
        warm: 'bg-white/[0.01] border border-white/5 rounded-2xl p-6 backdrop-blur-md',
        swiss: 'bg-transparent border-4 border-white rounded-none p-6',
        kinetic: 'bg-transparent border border-white/10 rounded-none p-6'
    };

    // Generar y compartir plantilla formateada para clientes del revendedor
    const handleShareProduct = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const basePrice = product.resellerPrice || product.basePrice;
        const finalPrice = basePrice + Number(customMarkup || 0);

        // Extraer talles disponibles
        const sizes = Object.entries(product.stock_by_size || {})
            .filter(([_, qty]) => Number(qty) > 0)
            .map(([size]) => size)
            .sort()
            .join(', ');

        const catalogLink = `https://eter.store/c/${resellerSlug}/${product.id}`;

        const messageText = `⚡ *${resellerName.toUpperCase()} - CALZADO PREMIUM* ⚡\n\n` +
            `👟 *Modelo:* ${product.name.toUpperCase()}\n` +
            `💵 *Precio:* $${finalPrice.toLocaleString('es-AR')}\n` +
            `📏 *Talles disponibles:* ${sizes || 'Consultar'}\n` +
            `🏷️ *Colección:* ${product.category || 'Premium'}\n\n` +
            `🔗 *Ver fotos y realizar pedido:* ${catalogLink}\n\n` +
            `💬 Contactar a ${resellerName} para reservar.`;

        // Copiar al portapapeles con toast de confirmación
        navigator.clipboard.writeText(messageText);
        setCopiedId(product.id);

        toast.success('FICHA DE PRODUCTO COPIADA', {
            description: 'Mensaje formateado listo para enviar a tus clientes por WhatsApp.',
            style: {
                background: '#050505',
                color: '#fff',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: '1.25rem'
            }
        });

        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-12 relative pb-24">

            {/* Cabecera / Controles */}
            <div className={containerCardStyles[resellerTheme]}>

                {/* Categorías y Búsqueda */}
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center w-full">
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeCategory === cat
                                        ? activeBtnStyles[resellerTheme]
                                        : inactiveBtnStyles[resellerTheme]
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 ${searchIconStyles[resellerTheme]}`} />
                        <input
                            type="text"
                            placeholder="BUSCAR PRODUCTO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest uppercase focus:outline-none transition-all text-white ${inputStyles[resellerTheme]}`}
                        />
                    </div>
                </div>

                {/* Switcher de Vista y Calculadora integrada */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-white/5 pt-6 w-full">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAdminView(!isAdminView)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                isAdminView
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white'
                            }`}
                        >
                            {isAdminView ? <Eye size={12} /> : <EyeOff size={12} />}
                            {isAdminView ? 'Vista Revendedor Activa' : 'Vista Cliente Activa'}
                        </button>

                        <p className="text-[10px] text-gray-500 font-mono hidden md:block">
                            {isAdminView
                                ? 'Mostrando precios de costo y herramientas de margen.'
                                : 'Mostrando catálogo exactamente como lo ven tus clientes.'}
                        </p>
                    </div>

                    {/* Campo de Margen Extra */}
                    <AnimatePresence>
                        {isAdminView && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full"
                            >
                                <DollarSign size={12} className="text-white/60" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Margen Sugerido:</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={customMarkup || ''}
                                    onChange={(e) => setCustomMarkup(Number(e.target.value))}
                                    className="bg-transparent text-white w-20 text-center font-black focus:outline-none text-[12px] border-b border-white/30"
                                />
                                <span className="text-[9px] text-white/80 font-mono">ARS</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Cuadrícula de Productos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, idx) => {
                        const basePrice = product.resellerPrice || product.basePrice;
                        const finalPrice = basePrice + Number(customMarkup || 0);

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative flex flex-col group/card"
                            >
                                {/* Botón de Compartido Inteligente */}
                                <button
                                    onClick={(e) => handleShareProduct(e, product)}
                                    className="absolute top-6 right-6 z-40 h-10 w-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-white border border-white/10 text-white/70 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md transition-all duration-300"
                                    title="Copiar Ficha de WhatsApp"
                                >
                                    {copiedId === product.id ? <Check size={16} /> : <Share2 size={16} />}
                                </button>

                                <ProductCard
                                    product={{
                                        ...product,
                                        basePrice: finalPrice,
                                        stockBySize: product.stock_by_size
                                    }}
                                    href={`/c/${resellerSlug}/${product.id}`}
                                    index={idx}
                                    theme={resellerTheme}
                                />

                                {/* Bloque de Margen/Administrativo (solo en modo Admin) */}
                                <AnimatePresence>
                                    {isAdminView && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 bg-[#0C0C0C] border border-white/5 rounded-2xl p-4 space-y-2 text-[10px] font-mono"
                                        >
                                            <div className="flex justify-between text-gray-500">
                                                <span>Costo de Showroom:</span>
                                                <span className="text-white">${basePrice.toLocaleString('es-AR')}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-500">
                                                <span>Tu Margen Agregado:</span>
                                                <span className="text-white/80">+${Number(customMarkup || 0).toLocaleString('es-AR')}</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-1" />
                                            <div className="flex justify-between font-black text-[11px]">
                                                <span className="text-gray-400">PVP Sugerido:</span>
                                                <span className="text-white">${finalPrice.toLocaleString('es-AR')}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Widget de Calculadora Flotante Global (Modo Admin) */}
            <AnimatePresence>
                {isAdminView && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-50 bg-[#070707]/90 border border-[#00E5FF]/20 rounded-[2rem] p-6 shadow-[0_15px_50px_rgba(0,229,255,0.15)] backdrop-blur-xl max-w-sm flex items-center gap-4"
                    >
                        <div className="h-12 w-12 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                            <Calculator size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">FÉTER MARGIN CALCULATOR</span>
                            <span className="text-[11px] text-gray-400 font-light mt-1">
                                Estás simulando una ganancia extra de <strong className="text-white">${Number(customMarkup || 0).toLocaleString('es-AR')}</strong> por par.
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
                <div className="py-40 text-center">
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">No se encontraron productos en esta categoría</p>
                </div>
            )}
        </div>
    );
}
