'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkUpdateProducts, bulkDeleteProducts, ProductType } from '@/app/actions/products';
import { Loader2, Save, Check, Trash2, Download, Type, Ruler, Sparkles, Cpu } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEditToolbarProps {
    selectedIds: string[];
    products: ProductType[];
    onClearSelection: () => void;
    onSuccess: () => void;
    onRename: () => void;
    onStockEdit: () => void;
    onAIEdit: () => void;
}

export function BulkEditToolbar({ selectedIds, products, onClearSelection, onSuccess, onRename, onStockEdit, onAIEdit }: BulkEditToolbarProps) {
    const [actionType, setActionType] = useState<'price' | 'stock' | 'category' | 'description' | 'status'>('price');
    const [value, setValue] = useState('');
    const [modificationType, setModificationType] = useState<'fixed' | 'percent_inc' | 'percent_dec' | 'add' | 'set' | 'append'>('fixed');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} productos? Esta acción no se puede deshacer.`)) return;

        setIsProcessing(true);
        try {
            const result = await bulkDeleteProducts(selectedIds);
            if (result.success) {
                toast.success(`${result.count} productos eliminados.`);
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
        toast.success('EXP_COMPLETADA');
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

                    if (modificationType === 'set') {
                        data.stock_by_size = { [firstKey]: val };
                    } else if (modificationType === 'add') {
                        const currentVal = Number(currentStock[firstKey] || 0);
                        data.stock_by_size = { ...currentStock, [firstKey]: currentVal + val };
                    }
                }

                if (actionType === 'category') {
                    data.category = value;
                }

                if (actionType === 'description') {
                    if (modificationType === 'set') {
                        data.description = value;
                    } else if (modificationType === 'append') {
                        data.description = (product.description || '') + ' ' + value;
                    }
                }

                if (actionType === 'status') {
                    data.is_active = value === 'active';
                }

                return { id, data };
            });

            const result = await bulkUpdateProducts(updates);

            if (result.success) {
                toast.success(`${result.successCount} PRODUCTOS_SINCRONIZADOS.`);
                onSuccess();
                onClearSelection();
            } else {
                toast.error('FALLO_EN_LA_CADENA_DE_SINCRONIZACIÓN.');
            }

        } catch {
            toast.error('ERROR_SISTÉMICO_DE_UPDATE.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-3xl border border-[#00E5FF]/20 shadow-[0_0_80px_-20px_rgba(0,229,255,0.3)] rounded-[3rem] p-8 flex flex-col xl:flex-row items-center gap-8 animate-in slide-in-from-bottom-32 fade-in duration-1000 w-[95%] max-w-7xl">

            <div className="flex items-center gap-8 border-b xl:border-b-0 xl:border-r border-white/10 pb-6 xl:pb-0 xl:pr-8 w-full xl:w-auto">
                <div className="bg-[#00E5FF]/10 text-[#00E5FF] px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.4em] border border-[#00E5FF]/20 flex items-center gap-4 uppercase whitespace-nowrap shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                    <div className="w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,229,255,1)]" />
                    {selectedIds.length} NODOS_ACTIVOS
                </div>
                <button onClick={onClearSelection} className="text-white/20 hover:text-white text-[9px] font-black tracking-[0.4em] uppercase transition-all duration-500 ml-auto xl:ml-0">
                    DESACTIVAR_SELECCIÓN
                </button>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-5 w-full">
                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] whitespace-nowrap">MODO_EJECUCIÓN:</span>

                <Select value={actionType} onValueChange={(v) => setActionType(v as 'price' | 'stock' | 'category' | 'description' | 'status')}>
                    <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/5 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl h-14 hover:border-[#00E5FF]/40 transition-all">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white min-w-[180px]">
                        <SelectItem value="price" className="text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF]/10 transition-colors">Inv_Monetaria</SelectItem>
                        <SelectItem value="category" className="text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF]/10 transition-colors">Sector_ID</SelectItem>
                        <SelectItem value="stock" className="text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF]/10 transition-colors">Capa_Stock</SelectItem>
                        <SelectItem value="description" className="text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF]/10 transition-colors">Metadatos_Desc</SelectItem>
                        <SelectItem value="status" className="text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF]/10 transition-colors">Estado_Red</SelectItem>
                    </SelectContent>
                </Select>

                {actionType === 'price' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'fixed' | 'percent_inc' | 'percent_dec')}>
                            <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/5 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl h-14">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10">
                                <SelectItem value="fixed" className="text-[10px] font-black tracking-[0.3em] uppercase">Set_Fijo ($)</SelectItem>
                                <SelectItem value="percent_inc" className="text-[10px] font-black tracking-[0.3em] uppercase">Delta_Pos %</SelectItem>
                                <SelectItem value="percent_dec" className="text-[10px] font-black tracking-[0.3em] uppercase">Delta_Neg %</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="VALOR_X"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-[140px] bg-white/[0.03] border-white/5 text-white font-black placeholder:text-white/10 rounded-2xl h-14"
                        />
                    </>
                )}

                {actionType === 'stock' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'add')}>
                            <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/5 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl h-14">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10">
                                <SelectItem value="set" className="text-[10px] font-black tracking-[0.3em] uppercase">Reescribir</SelectItem>
                                <SelectItem value="add" className="text-[10px] font-black tracking-[0.3em] uppercase">Acumular (+)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="CANT_Y"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-[140px] bg-white/[0.03] border-white/5 text-white font-black placeholder:text-white/10 rounded-2xl h-14"
                        />
                    </>
                )}

                {actionType === 'category' && (
                    <Input
                        type="text"
                        placeholder="ASIGNACIÓN_NUEVA_CATEGORÍA..."
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="flex-1 min-w-[250px] bg-white/[0.03] border-white/5 text-white font-black placeholder:text-white/10 rounded-2xl h-14 uppercase"
                    />
                )}

                {actionType === 'description' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'append')}>
                            <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/5 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl h-14">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10">
                                <SelectItem value="set" className="text-[10px] font-black tracking-[0.3em] uppercase">Sobrescribir</SelectItem>
                                <SelectItem value="append" className="text-[10px] font-black tracking-[0.3em] uppercase">Anexar</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="text"
                            placeholder="NUEVO_BLOQUE_DESCRIPTIVO..."
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="flex-1 min-w-[250px] bg-white/[0.03] border-white/5 text-white font-black placeholder:text-white/10 rounded-2xl h-14"
                        />
                    </>
                )}

                {actionType === 'status' && (
                    <Select value={value} onValueChange={setValue}>
                        <SelectTrigger className="w-[240px] bg-white/[0.03] border-white/5 text-white font-black text-[10px] tracking-[0.3em] uppercase rounded-2xl h-14">
                            <SelectValue placeholder="MODO_ESTADO" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-white">
                            <SelectItem value="active" className="text-[10px] font-black tracking-[0.3em] uppercase">Online_Sinc</SelectItem>
                            <SelectItem value="inactive" className="text-[10px] font-black tracking-[0.3em] uppercase">Offline_Hide</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-t-0 xl:border-l border-white/10 xl:pl-8">
                <Button
                    onClick={handleApply}
                    disabled={isProcessing || !value}
                    className="flex-1 xl:flex-none bg-white text-black hover:bg-[#00E5FF] font-black text-[10px] tracking-[0.4em] uppercase rounded-2xl h-14 px-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all active:scale-95"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={16} className="mr-3" />}
                    EJECUTAR
                </Button>

                <div className="hidden xl:block w-px h-10 bg-white/10 mx-2" />

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onAIEdit}
                        disabled={isProcessing}
                        title="AI_OPTIMIZE (Gemini)"
                        className="bg-white/5 border-white/5 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black rounded-2xl h-14 w-14 transition-all active:scale-90"
                    >
                        <Sparkles size={20} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        disabled={isProcessing}
                        title="DUMP_REGISTRY (CSV)"
                        className="bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl h-14 w-14 transition-all active:scale-90"
                    >
                        <Download size={20} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRename}
                        disabled={isProcessing}
                        title="BULK_RENAME"
                        className="bg-white/5 border-white/5 text-[#00E5FF]/60 hover:text-black hover:bg-[#00E5FF] rounded-2xl h-14 w-14 transition-all active:scale-90"
                    >
                        <Type size={20} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onStockEdit}
                        disabled={isProcessing}
                        title="STOCK_MATRIX"
                        className="bg-white/5 border-white/5 text-[#00E5FF]/60 hover:text-black hover:bg-[#00E5FF] rounded-2xl h-14 w-14 transition-all active:scale-90"
                    >
                        <Ruler size={20} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isProcessing}
                        title="PURGE_SYSTEM"
                        className="bg-rose-600/10 border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl h-14 w-14 transition-all active:scale-90 shadow-[0_0_30px_rgba(225,29,72,0.1)]"
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
