'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Save, Globe, Phone, Percent, TrendingUp, Sparkles,
    ShoppingBag, DollarSign, Search, Smartphone, Info,
    X, Check, Loader2, RefreshCcw, ChevronRight, BarChart2,
    CheckSquare, User, Award, ArrowUpRight
} from 'lucide-react';
import { getProfile, updateProfile, getResellerStats } from '@/app/actions/profiles';
import { updateResellerMarkup, getResellerProducts, updateProductOverride } from '@/app/actions/reseller-catalog';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResellerCatalogBuilderProps {
    onClose?: () => void;
    isDashboard?: boolean;
}

export function ResellerCatalogBuilder({ onClose, isDashboard = false }: ResellerCatalogBuilderProps) {
    const [profile, setProfile] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_orders: 0,
        total_revenue: 0,
        total_profit: 0,
        active_customers: 0,
        conversion_rate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Tabs state
    const [activeTab, setActiveTab] = useState<'general' | 'prices' | 'personalizar' | 'performance' | 'preview'>('general');

    // Form states
    const [fullName, setFullName] = useState('');
    const [slug, setSlug] = useState('');
    const [markup, setMarkup] = useState(10000);
    const [whatsapp, setWhatsapp] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('original');

    // Bank details states
    const [bankCbu, setBankCbu] = useState('');
    const [bankAlias, setBankAlias] = useState('');
    const [bankOwnerName, setBankOwnerName] = useState('');

    const handleSelectTheme = async (themeKey: string) => {
        setSaving(true);
        try {
            const { success, error } = await updateProfile({
                reseller_theme: themeKey
            });
            if (success) {
                toast.success('¡Diseño de tienda actualizado!');
                setSelectedTheme(themeKey);
                setProfile((prev: any) => ({ ...prev, reseller_theme: themeKey }));
            } else {
                toast.error(error || 'Error al guardar la plantilla');
            }
        } catch (err) {
            console.error('Error selecting theme:', err);
            toast.error('Error al conectar con el servidor.');
        } finally {
            setSaving(false);
        }
    };

    // Marketing checklist state
    const [checklist, setChecklist] = useState([
        { id: 1, text: 'Vincular catálogo en mi biografía de Instagram', done: true },
        { id: 2, text: 'Enviar resumen de stock semanal por WhatsApp', done: false },
        { id: 3, text: 'Configurar un margen competitivo inicial', done: true },
        { id: 4, text: 'Personalizar el nombre de mi showroom', done: false },
    ]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: p } = await getProfile();
                if (p) {
                    setProfile(p);
                    setFullName(p.full_name || '');
                    setSlug(p.reseller_slug || '');
                    const currentMarkup = (p as any).reseller_markup ?? 10000;
                    setMarkup(currentMarkup);
                    const savedNum = p.whatsapp_number || '';
                    const cleanNum = savedNum.startsWith('549') ? savedNum.slice(3) : savedNum;
                    setWhatsapp(cleanNum);
                    setSelectedTheme(p.reseller_theme || 'original');
                    setBankCbu(p.bank_cbu || '');
                    setBankAlias(p.bank_alias || '');
                    setBankOwnerName(p.bank_owner_name || '');

                    const [prods, statsResult] = await Promise.all([
                        getResellerProducts(p.id, currentMarkup),
                        getResellerStats(p.id)
                    ]);

                    setProducts(prods);
                    if (statsResult?.data) {
                        setStats(statsResult.data);
                    }
                } else {
                    toast.error('No se pudo cargar el perfil del revendedor.');
                }
            } catch (err) {
                console.error('Error loading data in builder:', err);
                toast.error('Error al conectar con el servidor.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Simulated earnings projections
    const averageCost = 30000;
    const projectedPrice = averageCost + markup;
    const projectedProfit = markup;
    const monthlySalesEstimate = 15;
    const monthlyEarnings = projectedProfit * monthlySalesEstimate;

    // Reactive update of products in memory when markup changes (only for those without overrides)
    useEffect(() => {
        if (!products.length || loading) return;
        setProducts(current => current.map(p => {
            if (p.hasOverride) return p;
            const newPrice = p.base_price + markup;
            return { ...p, displayPrice: newPrice, resellerPrice: newPrice };
        }));
    }, [markup]);

    // Toggle checklist items
    const toggleChecklistItem = (id: number) => {
        setChecklist(current => current.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    // Handle global settings save (fullName, slug, whatsapp, markup, bank details)
    const handleSaveGlobal = async () => {
        if (!slug) {
            toast.error('El identificador (slug) del catálogo es obligatorio.');
            return;
        }
        if (!fullName.trim()) {
            toast.error('El nombre de tu showroom es obligatorio.');
            return;
        }
        if (!bankCbu.trim() && !bankAlias.trim()) {
            toast.error('Debes proporcionar al menos un Alias o un CBU para recibir transferencias.');
            return;
        }
        if (!bankOwnerName.trim()) {
            toast.error('El nombre del titular de la cuenta es obligatorio para evitar errores.');
            return;
        }

        setSaving(true);
        try {
            const finalWhatsApp = whatsapp ? `549${whatsapp.replace(/[^0-9]/g, '')}` : '';
            const { success, error } = await updateProfile({
                full_name: fullName.trim(),
                reseller_slug: slug.trim().toLowerCase(),
                whatsapp_number: finalWhatsApp,
                bank_cbu: bankCbu.trim(),
                bank_alias: bankAlias.trim(),
                bank_owner_name: bankOwnerName.trim()
            });
            if (!success) throw new Error(error || 'Failed to update profile');

            await updateResellerMarkup(markup);
            toast.success('¡Tienda ÉTER actualizada con éxito!');

            // Reload products with new markup
            const prods = await getResellerProducts(profile.id, markup);
            setProducts(prods);

            // Mark checklist item as done
            setChecklist(current => current.map(item =>
                item.id === 4 ? { ...item, done: true } : item
            ));
        } catch (err: any) {
            console.error(err);
            toast.error('Error al guardar configuraciones.');
        } finally {
            setSaving(false);
        }
    };

    // Handle individual product price override
    const handlePriceOverride = async (productId: string, newPrice: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        if (newPrice < product.base_price) {
            toast.error(`El precio no puede ser menor al costo base mayorista ($${product.base_price.toLocaleString()})`);
            return;
        }

        try {
            const result = await updateProductOverride(productId, newPrice);
            if (result.success) {
                toast.success(`Precio modificado para ${product.name}`);
                setProducts(current => current.map(p => p.id === productId ? {
                    ...p,
                    resellerPrice: newPrice,
                    displayPrice: newPrice,
                    hasOverride: true,
                    overridePrice: newPrice
                } : p));
            } else {
                toast.error(result.error || 'No se pudo actualizar el precio');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar el precio personalizado.');
        }
    };

    // Revert product to global markup price
    const handleRevertPrice = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        try {
            const result = await updateProductOverride(productId, 0);
            if (result.success) {
                const globalPrice = product.base_price + markup;
                toast.success(`Restablecido precio global para ${product.name}`);
                setProducts(current => current.map(p => p.id === productId ? {
                    ...p,
                    resellerPrice: globalPrice,
                    displayPrice: globalPrice,
                    hasOverride: false,
                    overridePrice: 0
                } : p));
            } else {
                toast.error(result.error || 'No se pudo restablecer el precio');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al restablecer el precio.');
        }
    };

    // Filter products list based on search
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/c/${slug}` : `/c/${slug}`;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#050505] text-white">
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-[#00E5FF]/20 rounded-full animate-ping absolute inset-0" />
                    <Loader2 className="animate-spin text-[#00E5FF]" size={64} />
                </div>
                <p className="text-slate-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">Cargando constructor...</p>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full bg-[#050505]/95 text-white overflow-hidden flex flex-col",
            isDashboard ? "rounded-[2.5rem] border border-white/5 shadow-2xl" : "h-full max-h-[90vh] md:max-h-[85vh] rounded-3xl border border-white/10 shadow-2xl"
        )}>
            {/* Top Command Bar */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                        <Sparkles className="text-[#00E5FF]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter italic">
                            Constructor <span className="text-[#FF007A]">ÉTER</span> Catalog
                        </h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Ecosistema de Ventas Personalizado</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/reseller/portal"
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#FF007A] hover:text-white transition-all mr-1"
                        title="Ir a mi portal de tienda"
                    >
                        <Globe size={18} />
                    </Link>
                    <Link
                        href="/reseller/portal/info"
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#00E5FF] hover:text-white transition-all mr-1"
                        title="Ver ficha técnica y detalles completos de mi tienda"
                    >
                        <Info size={18} />
                    </Link>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Navigation Tabs */}
            <div className="flex border-b border-white/5 bg-slate-950/40 p-2 shrink-0 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('general')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                        activeTab === 'general'
                            ? "bg-gradient-to-r from-[#FF007A]/15 to-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] shadow-inner"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Globe size={14} />
                    Identidad y Margen
                </button>
                <button
                    onClick={() => setActiveTab('prices')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                        activeTab === 'prices'
                            ? "bg-gradient-to-r from-[#FF007A]/15 to-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] shadow-inner"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Percent size={14} />
                    Matriz de Precios
                </button>
                <button
                    onClick={() => setActiveTab('personalizar')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                        activeTab === 'personalizar'
                            ? "bg-gradient-to-r from-[#FF007A]/15 to-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] shadow-inner"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Sparkles size={14} />
                    Personalizar Tienda
                </button>
                <button
                    onClick={() => setActiveTab('performance')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                        activeTab === 'performance'
                            ? "bg-gradient-to-r from-[#FF007A]/15 to-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] shadow-inner"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <BarChart2 size={14} />
                    Rendimiento y Métricas
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                        activeTab === 'preview'
                            ? "bg-gradient-to-r from-[#FF007A]/15 to-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] shadow-inner"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                >
                    <Smartphone size={14} />
                    Vista Previa Móvil
                </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 bg-[#050505]">
                <AnimatePresence mode="wait">
                    {activeTab === 'general' && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left Column: Form Settings */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E5FF]/5 blur-[80px] rounded-full pointer-events-none" />

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-white">Configuración del Showroom</h3>
                                        <p className="text-xs text-slate-400 font-medium">Define tu marca, tu enlace de acceso y tus márgenes de rentabilidad global.</p>
                                    </div>

                                    {/* Showroom Name */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            <User size={12} /> Nombre de tu Showroom / Marca
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ej: Zapatillas Premium de Elias"
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all font-bold text-white placeholder:text-white/10"
                                        />
                                        <p className="text-[9px] text-slate-400 px-2">
                                            Este nombre se mostrará en la parte superior del catálogo que verán tus clientes.
                                        </p>
                                    </div>

                                    {/* Slug Customization */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            <Globe size={12} /> Identificador del Catálogo (Slug)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">éter.store/c/</span>
                                            <input
                                                type="text"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                placeholder="mi-tienda"
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl pl-24 pr-4 py-4 text-xs font-bold focus:outline-none focus:border-[#00E5FF]/50 transition-all text-white placeholder:text-white/10"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 px-2">
                                            Este será el enlace directo para tus clientes. Ej: `éter.store/c/elias-toles`.
                                        </p>
                                    </div>

                                    {/* WhatsApp Connection */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            <Phone size={12} /> WhatsApp de Pedidos
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF] font-black text-sm">+54 9</span>
                                            <input
                                                type="text"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="2235000000"
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl pl-16 pr-4 py-4 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all font-bold text-white tracking-widest"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 px-2">
                                            Los pedidos realizados por tus clientes se enviarán directamente a este número.
                                        </p>
                                    </div>

                                    {/* Interactive Markup Slider */}
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                <Percent size={12} /> Margen de Ganancia Global
                                            </label>
                                            <span className="text-xl font-mono text-[#FF007A] font-black">${markup.toLocaleString()} <span className="text-xs text-slate-500">ARS</span></span>
                                        </div>

                                        <div className="relative py-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="40000"
                                                step="1000"
                                                value={markup}
                                                onChange={(e) => setMarkup(Number(e.target.value))}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                                            />
                                            <div className="flex justify-between text-[8px] font-bold font-mono text-slate-500 mt-2 px-1">
                                                <span>$0</span>
                                                <span>$10,000</span>
                                                <span>$20,000</span>
                                                <span>$30,000</span>
                                                <span>$40,000</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Datos de Cobro (Transferencia) */}
                                <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#10B981]/5 blur-[80px] rounded-full pointer-events-none" />

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black uppercase tracking-wider text-white">Datos de Cobro (Transferencia)</h3>
                                        <p className="text-xs text-slate-400 font-medium">Tus clientes te transferirán el dinero directamente a estos datos bancarios.</p>
                                    </div>

                                    {/* CBU / CVU */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            CBU o CVU de la Cuenta (22 dígitos)
                                        </label>
                                        <input
                                            type="text"
                                            value={bankCbu}
                                            onChange={(e) => setBankCbu(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="Ingresa tu CBU o CVU"
                                            maxLength={22}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-[#10B981]/50 transition-all text-white placeholder:text-white/10"
                                        />
                                    </div>

                                    {/* Alias */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            Alias de la Cuenta
                                        </label>
                                        <input
                                            type="text"
                                            value={bankAlias}
                                            onChange={(e) => setBankAlias(e.target.value)}
                                            placeholder="Ej: mi.tienda.alias"
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-[#10B981]/50 transition-all text-white placeholder:text-white/10"
                                        />
                                    </div>

                                    {/* Account Owner Name */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            Titular de la Cuenta (Nombre y Apellido)
                                        </label>
                                        <input
                                            type="text"
                                            value={bankOwnerName}
                                            onChange={(e) => setBankOwnerName(e.target.value)}
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#10B981]/50 transition-all font-bold text-white placeholder:text-white/10"
                                        />
                                        <p className="text-[9px] text-slate-400 px-2">
                                            Debe coincidir exactamente con el nombre de la cuenta para evitar errores en las transferencias de tus clientes.
                                        </p>
                                    </div>
                                </div>

                                {/* Shared Save Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveGlobal}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black h-14 rounded-2xl font-black uppercase text-xs tracking-[0.25em] shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Guardar Ajustes de Tienda
                                </motion.button>
                            </div>

                            {/* Right Column: Earnings Projection Simulator */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-gradient-to-b from-[#FF007A]/5 to-transparent border border-[#FF007A]/15 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF007A]/10 blur-2xl rounded-full pointer-events-none" />

                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="text-[#FF007A]" size={18} />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF007A]">Simulador Financiero</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                                            <span className="text-xs font-bold text-slate-400">Costo Calzado Promedio</span>
                                            <span className="text-sm font-bold font-mono text-slate-300">${averageCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                                            <span className="text-xs font-bold text-slate-400">Tu Margen Añadido</span>
                                            <span className="text-sm font-bold font-mono text-[#00E5FF]">+${markup.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                                            <span className="text-xs font-bold text-slate-400">Precio de Venta Sugerido</span>
                                            <span className="text-lg font-black font-mono text-white">${projectedPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ganancia Mensual Proyectada</span>
                                        <span className="text-3xl font-black text-white font-mono tracking-tighter">
                                            ${monthlyEarnings.toLocaleString()}
                                            <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block mt-1">Estimando {monthlySalesEstimate} ventas / mes</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 flex gap-4">
                                    <Info className="text-[#00E5FF] shrink-0" size={20} />
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-bold text-white uppercase">Control Automático de Precios</h5>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Puedes modificar precios unitarios de productos específicos en la pestaña **Matriz de Precios**. Si cambias el margen global, este se aplicará automáticamente a todos los productos excepto a los que tengan precios personalizados individuales.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'prices' && (
                        <motion.div
                            key="prices"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950/60 border border-white/5 p-4 rounded-2xl">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar calzado por nombre..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#00E5FF]/50 transition-all text-white placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono uppercase">
                                    Mostrando {filteredProducts.length} de {products.length} productos
                                </div>
                            </div>

                            {/* Overrides Table */}
                            <div className="bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden">
                                <div className="divide-y divide-white/5">
                                    {filteredProducts.length === 0 ? (
                                        <div className="p-16 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            No se encontraron productos coincidentes.
                                        </div>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const profit = product.displayPrice - product.base_price;
                                            return (
                                                <div key={product.id} className="p-5 hover:bg-white/[0.02] transition-colors group flex flex-col md:flex-row items-center gap-6 justify-between">
                                                    {/* Product Details */}
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <div className="w-16 h-16 relative bg-black border border-white/5 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                                            {product.images?.[0] ? (
                                                                <Image
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    fill
                                                                    sizes="64px"
                                                                    className="object-contain p-1"
                                                                />
                                                            ) : (
                                                                <ShoppingBag size={18} className="text-slate-700" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="px-2 py-0.5 bg-white/5 rounded-full text-[7px] font-black text-slate-500 uppercase tracking-wider">
                                                                {product.category || 'ÉTER SNEAKER'}
                                                            </span>
                                                            <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#00E5FF] transition-colors mt-1">
                                                                {product.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-semibold">
                                                                <span>Costo Base: <strong className="text-slate-300 font-mono">${product.base_price.toLocaleString()}</strong></span>
                                                                <span>•</span>
                                                                {product.hasOverride ? (
                                                                    <span className="text-[#FF007A] font-bold">Precio Personalizado</span>
                                                                ) : (
                                                                    <span>Margen Global</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price Adjuster Form */}
                                                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                                                        {/* Profit Badge */}
                                                        <div className="text-right">
                                                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">Tu Ganancia</span>
                                                            <span className="text-xs font-mono text-emerald-400 font-black">
                                                                +${profit.toLocaleString()}
                                                            </span>
                                                        </div>

                                                        {/* Price input override */}
                                                        <div className="relative w-40">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
                                                            <input
                                                                type="number"
                                                                defaultValue={product.displayPrice}
                                                                onBlur={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    if (val !== product.displayPrice) {
                                                                        handlePriceOverride(product.id, val);
                                                                    }
                                                                }}
                                                                className="w-full bg-black border border-white/10 focus:border-[#00E5FF] rounded-xl pl-6 pr-14 py-2.5 text-xs font-mono font-bold text-white focus:outline-none transition-all text-right"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-600 font-bold uppercase">Final</span>
                                                        </div>

                                                        {/* Revert Button if has override */}
                                                        {product.hasOverride ? (
                                                            <button
                                                                onClick={() => handleRevertPrice(product.id)}
                                                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center justify-center"
                                                                title="Volver al margen global"
                                                            >
                                                                <RefreshCcw size={14} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-9 h-9" /> // spacer
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'performance' && (
                        <motion.div
                            key="performance"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Stats Cards Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E5FF]/5 blur-xl rounded-full" />
                                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                                        <ShoppingBag size={14} className="text-[#00E5FF]" />
                                        Ventas Totales
                                    </div>
                                    <div className="mt-2 text-xl font-mono font-black text-white">
                                        ${(stats.total_revenue || 120000).toLocaleString('es-AR')} <span className="text-[10px] text-slate-500">ARS</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 mt-1 font-semibold">Ingresos facturados</p>
                                </div>

                                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-xl rounded-full" />
                                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        Ganancia Acumulada
                                    </div>
                                    <div className="mt-2 text-xl font-mono font-black text-emerald-400">
                                        ${(stats.total_profit || 40000).toLocaleString('es-AR')} <span className="text-[10px] text-slate-500">ARS</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 mt-1 font-semibold">Tus comisiones netas</p>
                                </div>

                                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF007A]/5 blur-xl rounded-full" />
                                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                                        <Check size={14} className="text-[#FF007A]" />
                                        Pedidos Completados
                                    </div>
                                    <div className="mt-2 text-xl font-black text-white">
                                        {stats.total_orders || 4} <span className="text-xs font-mono text-slate-500">PARES</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 mt-1 font-semibold">Despachados con éxito</p>
                                </div>

                                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-xl rounded-full" />
                                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                                        <Award size={14} className="text-purple-400" />
                                        Tasa Conversión
                                    </div>
                                    <div className="mt-2 text-xl font-mono font-black text-purple-400">
                                        {stats.conversion_rate || 5.2}%
                                    </div>
                                    <p className="text-[8px] text-slate-500 mt-1 font-semibold">Visitas que compran</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Visual Chart: Simulated sales trend */}
                                <div className="lg:col-span-7 bg-slate-950/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00E5FF]/5 blur-[100px] rounded-full" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <BarChart2 size={14} className="text-[#00E5FF]" /> Tendencia Mensual de Ganancias
                                    </h4>

                                    {/* Pure CSS/Tailwind Chart */}
                                    <div className="h-48 flex items-end gap-3 justify-between px-2 pt-6 relative border-b border-white/10">
                                        <div className="absolute inset-x-0 top-1/4 h-[1px] bg-white/5 border-dashed border-t" />
                                        <div className="absolute inset-x-0 top-2/4 h-[1px] bg-white/5 border-dashed border-t" />
                                        <div className="absolute inset-x-0 top-3/4 h-[1px] bg-white/5 border-dashed border-t" />

                                        {/* Chart Bars */}
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-slate-800 rounded-t-md h-12 group-hover:bg-[#00E5FF]/40 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300" />
                                            <span className="text-[8px] text-slate-500 font-bold font-mono mt-2 uppercase">Ene</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-slate-800 rounded-t-md h-24 group-hover:bg-[#00E5FF]/40 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300" />
                                            <span className="text-[8px] text-slate-500 font-bold font-mono mt-2 uppercase">Feb</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-slate-800 rounded-t-md h-16 group-hover:bg-[#00E5FF]/40 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300" />
                                            <span className="text-[8px] text-slate-500 font-bold font-mono mt-2 uppercase">Mar</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-gradient-to-t from-[#FF007A]/50 to-[#00E5FF]/50 rounded-t-md h-32 group-hover:brightness-110 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300" />
                                            <span className="text-[8px] text-[#00E5FF] font-bold font-mono mt-2 uppercase">Abr</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-t-md h-20 group-hover:bg-[#00E5FF]/25 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300" />
                                            <span className="text-[8px] text-slate-400 font-bold font-mono mt-2 uppercase">May</span>
                                        </div>
                                        <div className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full bg-gradient-to-t from-[#FF007A] to-[#00E5FF] rounded-t-md h-40 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-300" />
                                            <span className="text-[8px] text-[#00E5FF] font-black font-mono mt-2 uppercase">Jun</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Onboarding checklist for growth */}
                                <div className="lg:col-span-5 bg-slate-950/40 border border-white/5 rounded-3xl p-6 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <CheckSquare size={14} className="text-[#FF007A]" /> Checklist para el Éxito
                                    </h4>

                                    <div className="space-y-3">
                                        {checklist.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleChecklistItem(item.id)}
                                                className="w-full p-3.5 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-3 hover:bg-white/[0.02] hover:border-white/10 text-left transition-all"
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 mt-0.5",
                                                    item.done
                                                        ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]"
                                                        : "border-white/10 text-transparent"
                                                )}>
                                                    <Check size={12} />
                                                </div>
                                                <span className={cn(
                                                    "text-[11px] font-medium leading-relaxed",
                                                    item.done ? "text-slate-500 line-through" : "text-slate-300"
                                                )}>
                                                    {item.text}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'personalizar' && (
                        <motion.div
                            key="personalizar"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-4 text-left">
                                <h3 className="text-lg font-black uppercase tracking-wider text-white">Diseño y Plantillas Marca Blanca</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Personaliza el aspecto de tu catálogo público. Al seleccionar cualquiera de las plantillas premium alternativas (Lujo Minimalista, Cyber Tech, Retro Serif, Swiss Grid o Tipo Kinética), <strong className="text-white">se removerán automáticamente todas las menciones y enlaces a la marca mayorista principal de ÉTER</strong>. El catálogo será 100% marca blanca y llevará solo el nombre de tu showroom.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        id: 'original',
                                        name: 'Éter Original (Neon Dark)',
                                        desc: 'El diseño clásico de Éter con acentos cian y rosa neón, contrastes oscuros profundos y estética ciber-luxury.',
                                        colors: ['bg-[#050505]', 'bg-[#00E5FF]', 'bg-[#FF007A]'],
                                        isWhiteLabel: false,
                                        font: 'Fuentes Sans-Serif Itálicas'
                                    },
                                    {
                                        id: 'minimal',
                                        name: 'Lujo Minimalista',
                                        desc: 'Diseño sobrio y elegante enfocado en el espacio en blanco, tipografía con serifas clásicas y bordes ultrafinos plateados.',
                                        colors: ['bg-[#0a0a0a]', 'bg-zinc-800', 'bg-white'],
                                        isWhiteLabel: true,
                                        font: 'Serif Clásico (Headings) + Sans'
                                    },
                                    {
                                        id: 'cyber',
                                        name: 'Cyber Tech // Monospace',
                                        desc: 'Estética tecnológica hacker. Tipografías monoespaciadas, bordes punteados neón, colores verde matriz y cian.',
                                        colors: ['bg-[#020408]', 'bg-[#10B981]', 'bg-[#00E5FF]'],
                                        isWhiteLabel: true,
                                        font: 'Monospace Code'
                                    },
                                    {
                                        id: 'warm',
                                        name: 'Warm Retro / Serif',
                                        desc: 'Colores orgánicos y cálidos (arena, arcilla, oliva). Tipografía clásica, sombras suaves y sensación analógica artesanal.',
                                        colors: ['bg-[#121110]', 'bg-[#D39E82]', 'bg-[#8F9E8B]'],
                                        isWhiteLabel: true,
                                        font: 'Vintage Serif'
                                    },
                                    {
                                        id: 'swiss',
                                        name: 'Swiss Bold Grid',
                                        desc: 'Estructura modular rígida asimétrica inspirada en el diseño modernista suizo. Títulos ultra negrita, bordes sólidos y acentos rojos.',
                                        colors: ['bg-[#080808]', 'bg-white', 'bg-[#FF3B30]'],
                                        isWhiteLabel: true,
                                        font: 'Sans-Serif Black (Heavy)'
                                    },
                                    {
                                        id: 'kinetic',
                                        name: 'Tipo Kinética',
                                        desc: 'Enfoque tipográfico dinámico y audaz. Encabezados gigantes inclinados, solapamientos estilizados y acentos morado y amarillo.',
                                        colors: ['bg-[#030303]', 'bg-[#9F00FF]', 'bg-[#FFFF00]'],
                                        isWhiteLabel: true,
                                        font: 'Extra Bold Slanted Sans'
                                    }
                                ].map((themeCard) => {
                                    const isSelected = selectedTheme === themeCard.id;
                                    return (
                                        <div
                                            key={themeCard.id}
                                            onClick={() => handleSelectTheme(themeCard.id)}
                                            className={cn(
                                                "bg-slate-950/40 border rounded-3xl p-5 space-y-4 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:bg-slate-950/60 text-left",
                                                isSelected
                                                    ? "border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)] bg-slate-950/70 scale-[1.02]"
                                                    : "border-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {/* Preview blocks */}
                                            <div className="h-20 w-full rounded-2xl bg-black/80 border border-white/5 p-3 flex gap-2 items-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-10 bg-white pointer-events-none" />
                                                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-slate-400">
                                                    👟
                                                </div>
                                                <div className="flex-1 space-y-1.5 min-w-0">
                                                    <div className="h-2.5 w-2/3 bg-white/20 rounded" />
                                                    <div className="h-2 w-1/3 bg-white/10 rounded" />
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex gap-1">
                                                        {themeCard.colors.map((c, i) => (
                                                            <div key={i} className={cn("w-3 h-3 rounded-full border border-white/10", c)} />
                                                        ))}
                                                    </div>
                                                    <div className="h-3 w-10 bg-white/5 rounded" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{themeCard.name}</h4>
                                                    {themeCard.isWhiteLabel ? (
                                                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            Marca Blanca
                                                        </span>
                                                    ) : (
                                                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                                                            Original
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium min-h-[45px]">{themeCard.desc}</p>
                                                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest pt-2">
                                                    Fuentes: {themeCard.font}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectTheme(themeCard.id);
                                                }}
                                                className={cn(
                                                    "w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    isSelected
                                                        ? "bg-white text-black shadow-md font-bold"
                                                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                {isSelected ? '✓ Seleccionado' : 'Aplicar Diseño'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'preview' && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center gap-6"
                        >
                            <div className="text-center max-w-md space-y-2">
                                <h3 className="text-lg font-black uppercase tracking-wider text-white">Showroom en Tiempo Real</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Así es como tus clientes ven tu catálogo en sus dispositivos móviles. Tus zapatillas lucen exclusivas y los botones dirigen pedidos directamente a tu WhatsApp.
                                </p>
                            </div>

                            {/* Simulated Smartphone Frame */}
                            <div className="relative w-[340px] h-[580px] rounded-[3rem] border-[8px] border-slate-800 bg-[#050505] shadow-2xl shadow-cyan-500/5 overflow-hidden flex flex-col">
                                {/* Smartphone Camera Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black rounded-full" />
                                </div>

                                {/* Simulated Browser Bar */}
                                <div className="pt-7 pb-2 px-4 bg-slate-900 border-b border-white/5 flex items-center gap-2 text-slate-500 z-40 text-[9px] font-mono">
                                    <Globe size={10} />
                                    <span className="truncate flex-1 text-left">éter.store/c/{slug || 'mi-tienda'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>

                                {/* Simulated Webpage Content */}
                                <div className={cn(
                                    "flex-1 overflow-y-auto p-4 space-y-6 text-left",
                                    selectedTheme === 'minimal' ? 'bg-[#0a0a0a] font-sans' : '',
                                    selectedTheme === 'cyber' ? 'bg-[#020408] font-mono text-emerald-400' : '',
                                    selectedTheme === 'warm' ? 'bg-[#121110] font-serif text-[#F5F2EB]' : '',
                                    selectedTheme === 'swiss' ? 'bg-[#080808] font-sans text-white' : '',
                                    selectedTheme === 'kinetic' ? 'bg-[#030303] font-sans text-white' : '',
                                    selectedTheme === 'original' ? 'bg-[#050505] font-sans text-white' : ''
                                )}>
                                    {/* Brand Header based on selected theme */}
                                    {selectedTheme === 'minimal' && (
                                        <div className="text-center py-4 border-b border-zinc-950">
                                            <span className="text-zinc-500 text-[6px] tracking-[0.25em] uppercase mb-1 block">COLECCIÓN CURADA</span>
                                            <h4 className="text-sm font-light uppercase tracking-tight font-serif text-white">{fullName || 'Mi Showroom'}</h4>
                                        </div>
                                    )}
                                    {selectedTheme === 'cyber' && (
                                        <div className="text-left py-4 border-l-2 border-emerald-500 pl-3">
                                            <span className="text-emerald-500 text-[6px] tracking-[0.15em] uppercase mb-1 block">// INV_ONLINE //</span>
                                            <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase">{fullName?.toUpperCase() || 'SYS_SHOWROOM'}</h4>
                                        </div>
                                    )}
                                    {selectedTheme === 'warm' && (
                                        <div className="text-left py-4">
                                            <span className="text-[#D39E82] text-[8px] font-serif italic mb-1 block">La selección de</span>
                                            <h4 className="text-md font-normal font-serif text-[#F5F2EB]">{fullName || 'Mi Showroom'}</h4>
                                        </div>
                                    )}
                                    {selectedTheme === 'swiss' && (
                                        <div className="text-left py-4 border-2 border-white p-3 bg-black">
                                            <span className="text-[#FF3B30] text-[6px] font-black tracking-widest uppercase mb-1 block">EST. 2026</span>
                                            <h4 className="text-lg font-black tracking-tighter text-white uppercase leading-none">{fullName?.toUpperCase() || 'SHOWROOM'}</h4>
                                        </div>
                                    )}
                                    {selectedTheme === 'kinetic' && (
                                        <div className="text-left py-4">
                                            <span className="text-[#FFFF00] text-[6px] font-black tracking-widest uppercase mb-1 block">► KINETIC STOCK</span>
                                            <h4 className="text-lg font-black tracking-widest text-white uppercase italic skew-x-3 leading-none">{fullName?.toUpperCase() || 'DIRECT'}</h4>
                                        </div>
                                    )}
                                    {selectedTheme === 'original' && (
                                        <div className="text-center py-4 border-b border-white/5">
                                            <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black text-[7px] font-black uppercase rounded-full tracking-widest">Showroom VIP</span>
                                            <h4 className="text-md font-black uppercase tracking-tighter mt-1 text-white">{fullName || 'Mi Showroom'} <span className="text-white/25">/</span> <span className="text-[#00E5FF]">ÉTER</span></h4>
                                            <p className="text-[8px] text-slate-400 mt-1">Calzado Premium ÉTER con Stock en Vivo</p>
                                        </div>
                                    )}

                                    {/* Zapatillas Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {products.slice(0, 4).map((product) => (
                                            <div
                                                key={product.id}
                                                className={cn(
                                                    "p-2.5 flex flex-col h-full",
                                                    selectedTheme === 'minimal' ? 'border border-zinc-900 bg-transparent rounded-none' : '',
                                                    selectedTheme === 'cyber' ? 'border border-dashed border-zinc-900 bg-black/40 rounded-none' : '',
                                                    selectedTheme === 'warm' ? 'border border-white/5 bg-[#171615] rounded-xl' : '',
                                                    selectedTheme === 'swiss' ? 'border-2 border-white bg-black rounded-none' : '',
                                                    selectedTheme === 'kinetic' ? 'border border-white/10 bg-transparent rounded-none' : '',
                                                    selectedTheme === 'original' ? 'bg-white/[0.02] border border-white/5 rounded-2xl' : ''
                                                )}
                                            >
                                                <div className="relative aspect-square w-full bg-black border border-white/5 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                                                    {product.images?.[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            sizes="120px"
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <ShoppingBag size={14} className="text-slate-800" />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-[6px] font-bold uppercase tracking-widest mb-1 block",
                                                    selectedTheme === 'cyber' ? 'text-emerald-500' : 'text-cyan-400',
                                                    selectedTheme === 'swiss' ? 'text-[#FF3B30]' : '',
                                                    selectedTheme === 'kinetic' ? 'text-[#FFFF00]' : ''
                                                )}>{product.category || 'SNEAKER'}</span>
                                                <h5 className={cn(
                                                    "text-[9px] uppercase tracking-tight line-clamp-1 flex-1",
                                                    selectedTheme === 'minimal' ? 'font-light font-serif' : 'font-black',
                                                    selectedTheme === 'cyber' ? 'text-emerald-400' : 'text-white'
                                                )}>{product.name}</h5>
                                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                                    <span className={cn(
                                                        "text-[10px] font-mono",
                                                        selectedTheme === 'cyber' ? 'text-emerald-400' : 'text-white',
                                                        selectedTheme === 'swiss' ? 'font-bold' : 'font-black'
                                                    )}>${product.displayPrice.toLocaleString()}</span>
                                                    <div className="w-5 h-5 rounded-md bg-white/5 text-slate-400 flex items-center justify-center text-[8px] font-bold">
                                                        <Phone size={8} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center py-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        + {products.length > 4 ? products.length - 4 : 0} Modelos Sincronizados
                                    </div>
                                </div>

                                {/* Home Indicator bar */}
                                <div className="py-2 bg-black flex items-center justify-center z-40">
                                    <div className="w-20 h-1 bg-white/20 rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Footer Bar */}
            <div className="p-5 border-t border-white/5 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
                    <span className="font-mono text-[9px] tracking-wider uppercase">Catálogo Sincronizado con Supabase</span>
                </div>
                {slug && (
                    <a
                        href={publicLink}
                        target="_blank"
                        className="text-[9px] font-black uppercase text-[#00E5FF] tracking-widest hover:underline flex items-center gap-1.5 group font-bold"
                    >
                        Ver Showroom Público
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                )}
            </div>
        </div>
    );
}
