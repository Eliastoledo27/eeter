'use client';

import { useState, useEffect } from 'react';
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    Coupon
} from '@/app/actions/coupons';
import { getCategories } from '@/app/actions/products';
import {
    Plus, Search, Loader2, Trash2, Edit3, Ticket,
    Calendar, Info, CheckCircle2, XCircle, Clock, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        applies_to: 'all',
        min_purchase_amount: 0,
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const cats = await getCategories();
        setCategories(cats as string[]);
    };

    const fetchCoupons = async () => {
        setIsLoading(true);
        const result = await getCoupons();
        if (result.success) setCoupons(result.data || []);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || formData.discount_value! <= 0) {
            toast.error('Completa los campos obligatorios');
            return;
        }

        const action = editingCoupon
            ? updateCoupon(editingCoupon.id, formData)
            : createCoupon(formData);

        const result = await action;
        if (result.success) {
            toast.success(editingCoupon ? 'Cupón actualizado' : 'Cupón creado');
            setShowForm(false);
            setEditingCoupon(null);
            fetchCoupons();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
        const result = await deleteCoupon(id);
        if (result.success) {
            toast.success('Cupón eliminado');
            fetchCoupons();
        } else {
            toast.error(result.error);
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Descuentos & Cupones</h2>
                    <p className="text-gray-500 text-sm">Gestiona estrategias de fidelización y promociones.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCoupon(null);
                        setFormData({
                            code: '',
                            discount_type: 'percentage',
                            discount_value: 0,
                            applies_to: 'all',
                            min_purchase_amount: 0,
                            is_active: true
                        });
                        setShowForm(true);
                    }}
                    className="bg-[#C88A04] hover:bg-[#ECA413] text-black font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 text-xs tracking-widest uppercase transition-all shadow-xl"
                >
                    <Plus size={16} /> Nuevo Cupón
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Total Cupones</span>
                    <span className="text-2xl font-black text-white">{coupons.length}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Activos</span>
                    <span className="text-2xl font-black text-[#C88A04]">{coupons.filter(c => c.is_active).length}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Redimidos</span>
                    <span className="text-2xl font-black text-white">{coupons.reduce((a, b) => a + b.used_count, 0)}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Inactivos</span>
                    <span className="text-2xl font-black text-gray-500">{coupons.filter(c => !c.is_active).length}</span>
                </div>
            </div>

            {/* Coupons List */}
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="BUSCAR CÓDIGO..."
                    className="w-full bg-[#111] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#C88A04]/50 transition-all uppercase font-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[#C88A04] mb-4" size={40} />
                    <p className="text-gray-600 text-[10px] font-black tracking-widest uppercase">Escaneando Criptocupones...</p>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                    <Ticket size={48} className="text-gray-700 mb-6" />
                    <p className="text-gray-500 font-bold">No se encontraron cupones.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredCoupons.map((coupon) => (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden relative group"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-4 py-2 bg-[#C88A04]/10 border border-[#C88A04]/20 rounded-xl">
                                            <span className="text-lg font-black text-[#C88A04] tracking-tighter">{coupon.code}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCoupon(coupon);
                                                    setFormData(coupon);
                                                    setShowForm(true);
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Descuento</span>
                                                <span className="text-2xl font-black text-white">
                                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value.toLocaleString()}`}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Usos (Total / Por Usuario)</span>
                                                <span className="text-xl font-black text-white">
                                                    {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' (∞)'}
                                                    <span className="text-gray-500 text-sm ml-2">
                                                        [Lím: {coupon.usage_limit_per_user || '∞'}]
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <Tag size={12} className="text-[#C88A04]" />
                                                <span className="font-bold text-gray-300 uppercase">Aplica a: {coupon.applies_to.toUpperCase()} {coupon.applies_to === 'category' ? `(${coupon.target_id})` : ''}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <Calendar size={12} className="text-[#C88A04]" />
                                                <span className="font-bold">Habilitado desde: {new Date(coupon.valid_from).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`h-1 w-full ${coupon.is_active ? 'bg-[#C88A04]' : 'bg-gray-800'}`} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {editingCoupon ? 'Editar Protocolo de Descuento' : 'Crear Nuevo Cupón'}
                                    </h3>
                                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Código del Cupón</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="EJ: ETERVIP2026"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black uppercase tracking-widest focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tipo de Descuento</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold uppercase focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.discount_type}
                                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                            >
                                                <option value="percentage" className="bg-black text-white font-bold">PORCENTAJE (%)</option>
                                                <option value="fixed" className="bg-black text-white font-bold">MONTO FIJO ($)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Valor del Descuento</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.discount_value}
                                                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Compra Mínima</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.min_purchase_amount}
                                                onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Límite Total de Usos (Opcional)</label>
                                            <input
                                                type="number"
                                                placeholder="Ej: 10"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.usage_limit || ''}
                                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : undefined })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Límite Usos por Persona (Opcional)</label>
                                            <input
                                                type="number"
                                                placeholder="Ej: 1"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.usage_limit_per_user || ''}
                                                onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value ? Number(e.target.value) : undefined })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Aplica a</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold uppercase focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.applies_to}
                                                onChange={(e) => {
                                                    const val = e.target.value as any;
                                                    setFormData({
                                                        ...formData,
                                                        applies_to: val,
                                                        target_id: val === 'category' || val === 'product' ? '' : undefined
                                                    });
                                                }}
                                            >
                                                <option value="all" className="bg-black text-white font-bold">TODO EL CATÁLOGO</option>
                                                <option value="category" className="bg-black text-white font-bold">CATEGORÍA ESPECÍFICA</option>
                                                <option value="product" className="bg-black text-white font-bold">PRODUCTO ESPECÍFICO</option>
                                                <option value="shipping" className="bg-black text-white font-bold">ENVÍO</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formData.applies_to === 'category' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Seleccionar Categoría</label>
                                            <select
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold uppercase focus:outline-none focus:border-[#C88A04] transition-all"
                                                value={formData.target_id || ''}
                                                onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                                            >
                                                <option value="" disabled className="bg-black text-white font-bold">Elegir categoría...</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat} className="bg-black text-white font-bold">{cat.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}

                                    <div className="flex items-center gap-4 pt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-white text-black font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-xl"
                                        >
                                            {editingCoupon ? 'Actualizar Protocolo' : 'Activar Cupón'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, is_active: !formData.is_active });
                                            }}
                                            className={`px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                        >
                                            {formData.is_active ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
