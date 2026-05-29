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
    resellerSlug
}: {
    initialProducts: any[],
    resellerName: string,
    resellerSlug: string
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
        
        const messageText = `⚡ *FÉTER - CALZADO PREMIUM* ⚡\n\n` +
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
            <div className="flex flex-col gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                
                {/* Categorías y Búsqueda */}
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center w-full">
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="BUSCAR PRODUCTO..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#00E5FF]/50 transition-all text-white"
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
                                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' 
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
                                <DollarSign size={12} className="text-[#00E5FF]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Margen Sugerido:</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={customMarkup || ''}
                                    onChange={(e) => setCustomMarkup(Number(e.target.value))}
                                    className="bg-transparent text-white w-20 text-center font-black focus:outline-none text-[12px] border-b border-[#00E5FF]/30"
                                />
                                <span className="text-[9px] text-[#00E5FF] font-mono">ARS</span>
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
                                    className="absolute top-6 right-6 z-40 h-10 w-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-[#00E5FF] border border-white/10 text-white/70 hover:text-black hover:scale-110 shadow-lg backdrop-blur-md transition-all duration-300"
                                    title="Copiar Ficha de WhatsApp"
                                >
                                    {copiedId === product.id ? <Check size={16} /> : <Share2 size={16} />}
                                </button>

                                <Link href={`/c/${resellerSlug}/${product.id}`}>
                                    <ProductCard
                                        product={{
                                            ...product,
                                            basePrice: finalPrice,
                                            stockBySize: product.stock_by_size
                                        }}
                                        href={`/c/${resellerSlug}/${product.id}`}
                                        index={idx}
                                    />
                                </Link>

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
                                                <span className="text-[#00E5FF]">+${Number(customMarkup || 0).toLocaleString('es-AR')}</span>
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
