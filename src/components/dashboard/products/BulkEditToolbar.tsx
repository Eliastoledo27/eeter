'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BulkRenameModal from '@/components/dashboard/products/BulkRenameModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkUpdateProducts, bulkDeleteProducts, ProductType } from '@/app/actions/products';
import { 
    Loader2, Save, Trash2, Download, Type, Ruler, Sparkles,
    X, DollarSign, Layers, Tag, FileText, Power,
    TrendingUp, TrendingDown, Plus, Equal
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface BulkEditToolbarProps {
    selectedIds: string[];
    products: ProductType[];
    onClearSelection: () => void;
    onSuccess: () => void;
    onRename: () => void;
    onStockEdit: () => void;
    onAIEdit: () => void;
}

const ACTION_CONFIG = {
    price: { label: 'Precio', icon: DollarSign, color: '#00E5FF' },
    stock: { label: 'Stock', icon: Layers, color: '#22C55E' },
    name: { label: 'Nombre', icon: Type, color: '#00E5FF' },
    category: { label: 'Categoría', icon: Tag, color: '#F59E0B' },
    description: { label: 'Descripción', icon: FileText, color: '#A855F7' },
    status: { label: 'Estado', icon: Power, color: '#EF4444' },
} as const;

export function BulkEditToolbar({ selectedIds, products, onClearSelection, onSuccess, onRename, onStockEdit, onAIEdit }: BulkEditToolbarProps) {
    const [actionType, setActionType] = useState<keyof typeof ACTION_CONFIG>('price');
    const [value, setValue] = useState('');
    const [modificationType, setModificationType] = useState<'fixed' | 'percent_inc' | 'percent_dec' | 'add' | 'set' | 'append'>('fixed');
    const [isProcessing, setIsProcessing] = useState(false);
    // New state for bulk rename modal
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameMap, setRenameMap] = useState<Record<string, string>>({});

    const currentAction = ACTION_CONFIG[actionType];

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar ${selectedIds.length} productos? Esta acción es irreversible.`)) return;
        setIsProcessing(true);
        try {
            const result = await bulkDeleteProducts(selectedIds);
            if (result.success) {
                toast.success(`${result.count} productos eliminados correctamente.`);
                onSuccess();
                onClearSelection();
            } else {
                toast.error('Error al eliminar productos.');
            }
        } catch {
            toast.error('Error al procesar la eliminación.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = () => {
        const selectedProducts = products.filter(p => selectedIds.includes(p.id));
        if (selectedProducts.length === 0) return;

        const headers = ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Descripción'];
        const csvContent = [
            headers.join(','),
            ...selectedProducts.map(p => {
                const stock = p.stock_by_size ? Object.values(p.stock_by_size).reduce((a, b) => Number(a) + Number(b), 0) : 0;
                return [
                    p.id,
                    `"${p.name.replace(/"/g, '""')}"`,
                    p.category || '',
                    p.base_price,
                    stock,
                    p.is_active ? 'Activo' : 'Inactivo',
                    `"${(p.description || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ETER_EXPORT_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exportación CSV completada.');
    };

    const handleApply = async () => {
        if (!value && actionType !== 'status') return;

        setIsProcessing(true);
        try {
            const updates = selectedIds.map(id => {
                const product = products.find(p => p.id === id);
                if (!product) return { id, data: {} };
                const data: Partial<ProductType> = {};

                if (actionType === 'price') {
                    const currentPrice = Number(product.base_price);
                    const val = Number(value);
                    if (modificationType === 'fixed') data.base_price = val;
                    if (modificationType === 'percent_inc') data.base_price = currentPrice * (1 + val / 100);
                    if (modificationType === 'percent_dec') data.base_price = currentPrice * (1 - val / 100);
                }
                if (actionType === 'stock') {
                    const val = Number(value);
                    const currentStock = product.stock_by_size || {};
                    const firstKey = Object.keys(currentStock)[0] || 'Unique';
                    if (modificationType === 'set') data.stock_by_size = { [firstKey]: val };
                    else if (modificationType === 'add') {
                        const currentVal = Number(currentStock[firstKey] || 0);
                        data.stock_by_size = { ...currentStock, [firstKey]: currentVal + val };
                    }
                }
                if (actionType === 'name') data.name = value;
                if (actionType === 'category') data.category = value;
                if (actionType === 'description') {
                    if (modificationType === 'set') data.description = value;
                    else if (modificationType === 'append') data.description = (product.description || '') + ' ' + value;
                }
                if (actionType === 'status') data.is_active = value === 'active';

                return { id, data };
            });

            const result = await bulkUpdateProducts(updates);
            if (result.success) {
                toast.success(`${result.successCount} productos actualizados.`);
                onSuccess();
                onClearSelection();
            } else {
                toast.error('Error al aplicar cambios masivos.');
            }
        } catch {
            toast.error('Error al procesar la actualización.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="sticky top-0 left-0 w-full z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_-10px_60px_rgba(0,0,0,0.6)] overflow-hidden"
            >
                {/* Top Row — Selection Info + Quick Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[#00E5FF]/10 text-[#00E5FF] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#00E5FF]/20">
                            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_10px_#00E5FF]" />
                            {selectedIds.length} seleccionados
                        </div>
                        <button
                            onClick={onClearSelection}
                            className="text-[11px] font-semibold text-white/30 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <X size={12} />
                            Deseleccionar
                        </button>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={onAIEdit}
                            disabled={isProcessing}
                            title="Optimizar con IA"
                            className="h-8 px-3 bg-gradient-to-r from-[#00E5FF]/10 to-purple-500/10 border border-[#00E5FF]/20 text-[#00E5FF] rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:border-[#00E5FF]/50 transition-all disabled:opacity-30"
                        >
                            <Sparkles size={12} />
                            IA
                        </button>
                        <button
                            onClick={() => {
                              const map: Record<string, string> = {};
                              selectedIds.forEach(id => {
                                const p = products.find(p => p.id === id);
                                if (p) map[id] = p.name;
                              });
                              setRenameMap(map);
                              setShowRenameModal(true);
                            }}
                            disabled={isProcessing}
                            title="Renombrar masivamente"
                            className="h-8 w-8 bg-white/[0.04] border border-white/[0.08] text-white/40 rounded-lg flex items-center justify-center hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all disabled:opacity-30"
                        >
                            <Type size={14} />
                        </button>
                        <button
                            onClick={onStockEdit}
                            disabled={isProcessing}
                            title="Editar talles y stock"
                            className="h-8 w-8 bg-white/[0.04] border border-white/[0.08] text-white/40 rounded-lg flex items-center justify-center hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all disabled:opacity-30"
                        >
                            <Ruler size={14} />
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isProcessing}
                            title="Exportar CSV"
                            className="h-8 w-8 bg-white/[0.04] border border-white/[0.08] text-white/40 rounded-lg flex items-center justify-center hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
                        >
                            <Download size={14} />
                        </button>
                        <div className="w-px h-6 bg-white/[0.06] mx-1" /> 
                        <button
                            onClick={handleDelete}
                            disabled={isProcessing}
                            title="Eliminar seleccionados"
                            className="h-8 w-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Bottom Row — Action Type + Controls + Apply */}
                <div className="flex items-center gap-3 px-5 py-3">
                    {/* Action Type Tabs */}
                    <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/[0.06] p-1 gap-0.5">
                        {(Object.entries(ACTION_CONFIG) as [keyof typeof ACTION_CONFIG, typeof ACTION_CONFIG[keyof typeof ACTION_CONFIG]][]).map(([key, config]) => {
                            const Icon = config.icon;
                            const isActive = actionType === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => { setActionType(key); setValue(''); }}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        isActive
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-white/25 hover:text-white/50'
                                    }`}
                                    style={isActive ? { color: config.color } : {}}
                                >
                                    <Icon size={13} />
                                    <span className="hidden sm:inline">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Dynamic Controls */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                        {actionType === 'price' && (
                            <>
                                <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5 gap-0.5">
                                    {[
                                        { value: 'fixed', icon: Equal, label: 'Fijar' },
                                        { value: 'percent_inc', icon: TrendingUp, label: '+%' },
                                        { value: 'percent_dec', icon: TrendingDown, label: '-%' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setModificationType(opt.value as typeof modificationType)}
                                            className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                                modificationType === opt.value
                                                    ? 'bg-[#00E5FF]/15 text-[#00E5FF]'
                                                    : 'text-white/20 hover:text-white/50'
                                            }`}
                                        >
                                            <opt.icon size={11} />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    placeholder={modificationType === 'fixed' ? 'Nuevo precio...' : 'Porcentaje...'}
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    className="flex-1 min-w-[100px] max-w-[160px] bg-white/[0.03] border-white/[0.06] text-white h-9 rounded-lg text-sm placeholder:text-white/15"
                                />
                                <div className="flex gap-1">
                                    {[10, 20, 50].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => { setModificationType('percent_inc'); setValue(v.toString()); }}
                                            className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] font-bold text-[#00E5FF]/70 hover:bg-[#00E5FF] hover:text-black transition-all"
                                        >
                                            +{v}%
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {actionType === 'stock' && (
                            <>
                                <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5 gap-0.5">
                                    <button
                                        onClick={() => setModificationType('set')}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                            modificationType === 'set' ? 'bg-emerald-500/15 text-emerald-400' : 'text-white/20 hover:text-white/50'
                                        }`}
                                    >
                                        <Equal size={11} /> Fijar
                                    </button>
                                    <button
                                        onClick={() => setModificationType('add')}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                            modificationType === 'add' ? 'bg-emerald-500/15 text-emerald-400' : 'text-white/20 hover:text-white/50'
                                        }`}
                                    >
                                        <Plus size={11} /> Sumar
                                    </button>
                                </div>
                                <Input
                                    type="number"
                                    placeholder="Cantidad..."
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    className="flex-1 min-w-[100px] max-w-[140px] bg-white/[0.03] border-white/[0.06] text-white h-9 rounded-lg text-sm placeholder:text-white/15"
                                />
                                <div className="flex gap-1">
                                    {[5, 10, 50].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => { setModificationType('add'); setValue(v.toString()); }}
                                            className="px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[10px] font-bold text-emerald-400/70 hover:bg-emerald-500 hover:text-black transition-all"
                                        >
                                            +{v}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {actionType === 'name' && (
                            <Input
                                type="text"
                                placeholder="Nuevo nombre para todos..."
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                className="flex-1 bg-white/[0.03] border-white/[0.06] text-white h-9 rounded-lg text-sm placeholder:text-white/15"
                            />
                        )}
                        {actionType === 'category' && (
                            <Input
                                type="text"
                                placeholder="Nueva categoría para todos..."
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                className="flex-1 bg-white/[0.03] border-white/[0.06] text-white h-9 rounded-lg text-sm placeholder:text-white/15"
                            />
                        )}

                        {actionType === 'description' && (
                            <>
                                <div className="flex items-center bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5 gap-0.5">
                                    <button
                                        onClick={() => setModificationType('set')}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                            modificationType === 'set' ? 'bg-purple-500/15 text-purple-400' : 'text-white/20'
                                        }`}
                                    >
                                        Reemplazar
                                    </button>
                                    <button
                                        onClick={() => setModificationType('append')}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                            modificationType === 'append' ? 'bg-purple-500/15 text-purple-400' : 'text-white/20'
                                        }`}
                                    >
                                        Añadir al final
                                    </button>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Nuevo texto..."
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    className="flex-1 bg-white/[0.03] border-white/[0.06] text-white h-9 rounded-lg text-sm placeholder:text-white/15"
                                />
                            </>
                        )}

                        {actionType === 'status' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setValue('active')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                        value === 'active'
                                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    ⚡ Publicar Online
                                </button>
                                <button
                                    onClick={() => setValue('inactive')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                        value === 'inactive'
                                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                            : 'bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    🔒 Ocultar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Apply Button */}
                    <Button
                        onClick={handleApply}
                        disabled={isProcessing || (!value && actionType !== 'status')}
                        className="bg-white text-black hover:bg-[#00E5FF] font-bold text-xs uppercase tracking-wider rounded-xl h-9 px-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} className="mr-1.5" />}
                        Aplicar
                    </Button>
                </div>
            </motion.div>
            
            {/* Bulk Rename Modal */}
            {showRenameModal && (
              <BulkRenameModal
                selectedProducts={products.filter(p => selectedIds.includes(p.id))}
                renameMap={renameMap}
                setRenameMap={setRenameMap}
                onClose={() => setShowRenameModal(false)}
                onSave={async () => {
                  setIsProcessing(true);
                  const updates = Object.entries(renameMap).map(([id, name]) => ({ id, data: { name } }));
                  const result = await bulkUpdateProducts(updates);
                  if (result.success) {
                    toast.success(`${result.successCount} productos renombrados.`);
                    onSuccess();
                    onClearSelection();
                  } else {
                    toast.error('Error al renombrar productos.');
                  }
                  setIsProcessing(false);
                  setShowRenameModal(false);
                }}
                isProcessing={isProcessing}
              />
            )}
        </>
    );
}
