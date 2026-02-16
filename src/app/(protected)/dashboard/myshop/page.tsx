'use client';

import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/app/actions/profiles';
import { updateResellerMarkup, getResellerProducts, updateProductOverride } from '@/app/actions/reseller-catalog';
import {
    ExternalLink, Copy, Check, Save, TrendingUp,
    Settings, ShoppingBag, DollarSign, Info, Loader2,
    Share2, Globe, Percent, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function MyShopPage() {
    const [profile, setProfile] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // Form states
    const [slug, setSlug] = useState('');
    const [markup, setMarkup] = useState(10000);
    const [whatsapp, setWhatsapp] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const { data: p } = await getProfile();
            if (p) {
                setProfile(p);
                setSlug(p.reseller_slug || '');
                setMarkup((p as any).reseller_markup || 10000);
                const savedNum = p.whatsapp_number || '';
                const cleanNum = savedNum.startsWith('549') ? savedNum.slice(3) : savedNum;
                setWhatsapp(cleanNum);

                const prods = await getResellerProducts(p.id, (p as any).reseller_markup || 10000);
                setProducts(prods);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const copyLink = () => {
        const link = `${window.location.origin}/c/${slug}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Enlace copiado al portapapeles');
    };

    const handleSaveGlobal = async () => {
        if (!slug) {
            toast.error('El identificador (slug) es obligatorio');
            return;
        }
        setSaving(true);
        try {
            const finalWhatsApp = whatsapp ? `549${whatsapp}` : '';
            const { success, error } = await updateProfile({
                reseller_slug: slug,
                whatsapp_number: finalWhatsApp
            });
            if (!success) throw new Error(error || 'Failed to update shop');

            await updateResellerMarkup(markup);
            toast.success('Tu tienda ha sido actualizada');

            const prods = await getResellerProducts(profile.id, markup);
            setProducts(prods);
        } catch (error: any) {
            console.error(error);
            toast.error('Error: Asegúrate de que las tablas de base de datos estén configuradas.');
        } finally {
            setSaving(false);
        }
    };

    const handlePriceOverride = async (productId: string, newPrice: number) => {
        const result = await updateProductOverride(productId, newPrice);
        if (result.success) {
            toast.success('Precio individual modificado');
            setProducts(products.map(p => p.id === productId ? { ...p, resellerPrice: newPrice, displayPrice: newPrice } : p));
        } else {
            toast.error(result.error || 'No se pudo actualizar el precio');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-2 border-[#C88A04]/20 rounded-full animate-ping absolute inset-0" />
                <Loader2 className="animate-spin text-[#C88A04]" size={48} />
            </div>
            <p className="text-gray-500 font-mono text-xs tracking-widest uppercase animate-pulse">Iniciando Ecosistema...</p>
        </div>
    );

    const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${slug}`;

    return (
        <div className="max-w-[1400px] mx-auto space-y-16 pb-20">
            {/* Main Header / Command Center */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#0A0A0A] to-black border border-white/5 p-8 md:p-12 shadow-2xl">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C88A04]/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-start xl:items-center justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#C88A04]/10 border border-[#C88A04]/20 flex items-center justify-center">
                                <Globe className="text-[#C88A04]" size={20} />
                            </div>
                            <span className="text-[#C88A04] font-mono text-[10px] tracking-[0.5em] uppercase">Digital Storefront</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
                            Mi Tienda <span className="text-white/20">/</span> <span className="text-[#C88A04]">ÉTER</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl font-light text-lg">
                            Diseña tu experiencia de venta y gestiona tu rentabilidad con herramientas de grado profesional.
                        </p>
                    </div>

                    {/* Shared Link Card */}
                    <div className="w-full xl:w-auto min-w-[320px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group">
                        <div className="p-6 space-y-4">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">Tu Punto de Venta</span>
                            <div className="bg-black/40 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 border border-white/5 group-hover:border-[#C88A04]/30 transition-colors">
                                <span className="text-xs font-mono text-white/50 truncate">
                                    {slug ? `/c/${slug}` : 'Configura tu slug ->'}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={copyLink}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-[#C88A04] hover:text-black transition-all"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <a
                                        href={publicLink}
                                        target="_blank"
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-[#C88A04] hover:text-black transition-all"
                                    >
                                        <ArrowUpRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Estado de tienda</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Activa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Configuration Sidebar */}
                <div className="lg:col-span-4 space-y-8 sticky top-24">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88A04]/5 blur-[60px] rounded-full" />

                        <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tighter uppercase whitespace-pre-line group-hover:text-[#CA8A04] transition-colors">
                                CONFIGURACIÓN <br /><span className="text-[#C88A04]">ESTRATÉGICA</span>
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">Parámetros globales de tu negocio</p>
                        </div>

                        {/* Slug Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={14} className="text-[#C88A04]" />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dominio Digital (Slug)</label>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">eter.store/c/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="mi-tienda"
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-24 pr-5 py-4 text-sm focus:outline-none focus:border-[#C88A04]/50 transition-all font-bold text-white placeholder:text-white/10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={slug ? { scale: 1.05 } : {}}
                                        whileTap={slug ? { scale: 0.95 } : {}}
                                        onClick={slug ? copyLink : undefined}
                                        className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 transition-all shrink-0",
                                            slug ? "hover:border-[#C88A04]/40 hover:bg-[#C88A04] hover:text-black cursor-pointer" : "opacity-20 cursor-not-allowed"
                                        )}
                                        title="Copiar enlace"
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </motion.button>
                                    <motion.a
                                        whileHover={slug ? { scale: 1.05 } : {}}
                                        whileTap={slug ? { scale: 0.95 } : {}}
                                        href={slug ? publicLink : undefined}
                                        onClick={e => !slug && e.preventDefault()}
                                        target="_blank"
                                        className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 transition-all shrink-0",
                                            slug ? "hover:border-[#C88A04]/40 hover:bg-[#C88A04] hover:text-black cursor-pointer" : "opacity-20 cursor-not-allowed"
                                        )}
                                        title="Ir a mi tienda"
                                    >
                                        <ExternalLink size={18} />
                                    </motion.a>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Share2 size={14} className="text-[#C88A04]" />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp de Ventas</label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C88A04] font-bold text-lg whitespace-nowrap">+54 9</span>
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="2235000000"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-20 pr-5 py-4 text-sm focus:outline-none focus:border-[#C88A04]/50 transition-all font-bold text-white text-xl placeholder:text-white/10"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-[10px] uppercase">Destino Checkout</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium px-2">
                                Los pedidos realizados en tu catálogo se enviarán directamente a este número de WhatsApp.
                            </p>
                        </div>


                        {/* Global Markup Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Percent size={14} className="text-[#C88A04]" />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Margen de Ganancia Global</label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C88A04] font-bold text-lg">$</span>
                                <input
                                    type="number"
                                    value={markup}
                                    onChange={(e) => setMarkup(Number(e.target.value))}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-[#C88A04]/50 transition-all font-bold text-white text-xl"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-[10px] uppercase">ARS / Unidad</span>
                            </div>
                            <div className="p-4 bg-[#C88A04]/5 rounded-2xl border border-[#C88A04]/10 space-y-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-[#C88A04]" />
                                    <span className="text-[9px] font-black text-[#C88A04] uppercase tracking-widest">Proyección de Impacto</span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                    Todos los productos del catálogo base se incrementarán en <span className="text-white font-bold">${markup.toLocaleString()}</span> automáticamente para tus clientes.
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveGlobal}
                            disabled={saving}
                            className="w-full bg-[#C88A04] text-black h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(200,138,4,0.3)] hover:bg-[#ECA413] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                            Actualizar Tienda
                        </motion.button>

                    </div>

                    {/* Quick Tips */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                            <Info size={14} /> Tips de Experto
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <div className="w-5 h-5 rounded-full bg-[#C88A04]/10 flex items-center justify-center shrink-0">
                                    <div className="w-1 h-1 rounded-full bg-[#C88A04]" />
                                </div>
                                <p className="text-[10px] text-gray-600 font-medium leading-relaxed">Usa un <span className="text-gray-400">slug corto y memorable</span> para facilitar recordación en tus redes sociales.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="w-5 h-5 rounded-full bg-[#C88A04]/10 flex items-center justify-center shrink-0">
                                    <div className="w-1 h-1 rounded-full bg-[#C88A04]" />
                                </div>
                                <p className="text-[10px] text-gray-600 font-medium leading-relaxed">Mantén un <span className="text-gray-400">margen competitivo</span> para maximizar tu volumen de ventas.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Products Marketplace Control */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#C88A04]/10 flex items-center justify-center border border-[#C88A04]/20">
                                    <ShoppingBag className="text-[#C88A04]" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Inventario y Precios</h2>
                                    <p className="text-xs text-gray-500 font-medium">Ajustes individuales por producto</p>
                                </div>
                            </div>
                            <div className="hidden sm:block px-6 py-2 bg-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {products.length} Productos Sincronizados
                            </div>
                        </div>

                        <div className="divide-y divide-white/5 bg-black/20">
                            {products.map((product) => (
                                <div key={product.id} className="p-8 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        {/* Product Thumbnail */}
                                        <div className="w-32 h-32 relative bg-black border border-white/5 rounded-3xl overflow-hidden shrink-0 group-hover:border-[#C88A04]/30 transition-colors shadow-2xl p-4">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-800">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-0.5 bg-white/5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                                        {product.category || 'ÉTER SNEAKER'}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#C88A04] transition-colors">
                                                    {product.name}
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {Object.entries(product.stock_by_size || {})
                                                        .filter(([, stock]) => Number(stock) > 0)
                                                        .map(([size]) => (
                                                            <span key={size} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-mono text-gray-500">
                                                                {size}
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>


                                            <div className="flex flex-wrap gap-8 items-center">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block">Precio Base</span>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={14} className="text-gray-700" />
                                                        <span className="text-lg font-mono text-gray-400 font-bold">${product.base_price.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2 border border-white/5 rounded-xl bg-black/40">
                                                    <ChevronRight size={14} className="text-gray-800" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] text-[#C88A04] font-black uppercase tracking-widest block">Tu Precio</span>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={14} className="text-[#C88A04]" />
                                                        <span className="text-2xl font-mono text-white font-black">${product.displayPrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Control */}
                                        <div className="w-full md:w-auto xl:w-[240px] space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    defaultValue={product.displayPrice}
                                                    onBlur={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val !== product.displayPrice) {
                                                            handlePriceOverride(product.id, val);
                                                        }
                                                    }}
                                                    className="w-full h-16 bg-black border border-white/10 rounded-2xl px-6 text-lg font-mono font-black focus:outline-none focus:border-[#C88A04] transition-all text-white shadow-inner"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                    <div className="w-[1px] h-6 bg-white/5 mx-2" />
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Ajustar</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between px-2">
                                                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Ganancia Neta</span>
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <span className="font-mono text-xs font-black">+${(product.displayPrice - product.base_price).toLocaleString()}</span>
                                                    <TrendingUp size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#C88A04]/10 border border-[#C88A04]/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C88A04]/20 blur-3xl rounded-full" />
                        <div className="flex gap-6 items-start relative z-10">
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:rotate-6 transition-transform">
                                <Info className="text-[#C88A04]" size={28} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold uppercase text-[#C88A04]">Control de Calidad y Precios</h4>
                                <p className="text-xs text-black/60 max-w-lg font-bold uppercase tracking-wider leading-relaxed">
                                    ÉTER garantiza un piso de precio mínimo para proteger el ecosistema. Si intentas fijar un precio menor al costo base, el sistema reseteará el valor automáticamente al mínimo permitido.
                                </p>
                            </div>
                        </div>
                        <button className="h-14 px-10 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all shrink-0 relative z-10">
                            Ver Términos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
