'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkUpdateProducts, bulkDeleteProducts, ProductType } from '@/app/actions/products';
import { Loader2, Save, Check, Trash2, Download, Type, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEditToolbarProps {
    selectedIds: string[];
    products: ProductType[];
    onClearSelection: () => void;
    onSuccess: () => void;
    onRename: () => void;
    onStockEdit: () => void;
}

export function BulkEditToolbar({ selectedIds, products, onClearSelection, onSuccess, onRename, onStockEdit }: BulkEditToolbarProps) {
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
        link.setAttribute('download', `productos_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exportación completada');
    };

    const handleApply = async () => {
        if (!value && actionType !== 'status') return; // Status might not use 'value' string state directly if boolean, but we can use 'value' as 'true'/'false' string

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
                toast.success(`${result.successCount} productos actualizados.`);
                onSuccess();
                onClearSelection();
            } else {
                toast.error('Hubo errores al actualizar algunos productos.');
            }

        } catch {
            toast.error('Error al procesar la edición masiva.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_-20px_rgba(200,138,4,0.3)] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-20 fade-in duration-700 w-[95%] max-w-5xl">

            <div className="flex items-center gap-6 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6 w-full md:w-auto">
                <div className="bg-[#C88A04]/10 text-[#C88A04] px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-[0.2em] border border-[#C88A04]/20 flex items-center gap-3 uppercase whitespace-nowrap">
                    <div className="w-2 h-2 bg-[#C88A04] rounded-full animate-pulse" />
                    {selectedIds.length} Seleccionados
                </div>
                <button onClick={onClearSelection} className="text-gray-500 hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors ml-auto md:ml-0">
                    Cancelar
                </button>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-4 w-full">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Acción:</span>

                <Select value={actionType} onValueChange={(v) => setActionType(v as 'price' | 'stock' | 'category' | 'description' | 'status')}>
                    <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                        <SelectItem value="price" className="text-[10px] font-black tracking-widest uppercase hover:bg-white/5">Precio</SelectItem>
                        <SelectItem value="category" className="text-[10px] font-black tracking-widest uppercase hover:bg-white/5">Categoría</SelectItem>
                        <SelectItem value="stock" className="text-[10px] font-black tracking-widest uppercase hover:bg-white/5">Stock</SelectItem>
                        <SelectItem value="description" className="text-[10px] font-black tracking-widest uppercase hover:bg-white/5">Descripción</SelectItem>
                        <SelectItem value="status" className="text-[10px] font-black tracking-widest uppercase hover:bg-white/5">Estado</SelectItem>
                    </SelectContent>
                </Select>

                {actionType === 'price' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'fixed' | 'percent_inc' | 'percent_dec')}>
                            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10">
                                <SelectItem value="fixed" className="text-[10px] font-black tracking-widest uppercase">Fijo ($)</SelectItem>
                                <SelectItem value="percent_inc" className="text-[10px] font-black tracking-widest uppercase">Aumentar %</SelectItem>
                                <SelectItem value="percent_dec" className="text-[10px] font-black tracking-widest uppercase">Descontar %</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="VALOR"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-[120px] bg-white/5 border-white/10 text-white font-black placeholder:text-gray-700 rounded-xl h-12"
                        />
                    </>
                )}

                {actionType === 'stock' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'add')}>
                            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10">
                                <SelectItem value="set" className="text-[10px] font-black tracking-widest uppercase">Establecer</SelectItem>
                                <SelectItem value="add" className="text-[10px] font-black tracking-widest uppercase">Añadir (+)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder="CANT"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-[120px] bg-white/5 border-white/10 text-white font-black placeholder:text-gray-700 rounded-xl h-12"
                        />
                    </>
                )}

                {actionType === 'category' && (
                    <Input
                        type="text"
                        placeholder="NUEVA CATEGORÍA EXCLUSIVA..."
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="flex-1 min-w-[200px] bg-white/5 border-white/10 text-white font-black placeholder:text-gray-700 rounded-xl h-12"
                    />
                )}

                {actionType === 'description' && (
                    <>
                        <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'append')}>
                            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-white/10">
                                <SelectItem value="set" className="text-[10px] font-black tracking-widest uppercase">Reemplazar</SelectItem>
                                <SelectItem value="append" className="text-[10px] font-black tracking-widest uppercase">Agregar final</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="text"
                            placeholder="NUEVA DESCRIPCIÓN..."
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="flex-1 min-w-[200px] bg-white/5 border-white/10 text-white font-black placeholder:text-gray-700 rounded-xl h-12"
                        />
                    </>
                )}

                {actionType === 'status' && (
                    <Select value={value} onValueChange={setValue}>
                        <SelectTrigger className="w-[220px] bg-white/5 border-white/10 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                            <SelectValue placeholder="ESTADO" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white">
                            <SelectItem value="active" className="text-[10px] font-black tracking-widest uppercase">Activo</SelectItem>
                            <SelectItem value="inactive" className="text-[10px] font-black tracking-widest uppercase">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                <Button
                    onClick={handleApply}
                    disabled={isProcessing || !value}
                    className="flex-1 md:flex-none bg-[#C88A04] hover:bg-[#ECA413] text-black font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8 shadow-[0_0_30px_-5px_rgba(200,138,4,0.4)]"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={16} className="mr-2" />}
                    Aplicar
                </Button>

                <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        disabled={isProcessing}
                        title="Exportar CSV"
                        className="bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12"
                    >
                        <Download size={18} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRename}
                        disabled={isProcessing}
                        title="Renombrar en masa"
                        className="bg-[#C88A04]/10 border-[#C88A04]/20 text-[#C88A04] hover:bg-[#C88A04]/20 rounded-xl h-12 w-12"
                    >
                        <Type size={18} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onStockEdit}
                        disabled={isProcessing}
                        title="Editar stock masivo"
                        className="bg-[#C88A04]/10 border-[#C88A04]/20 text-[#C88A04] hover:bg-[#C88A04]/20 rounded-xl h-12 w-12"
                    >
                        <Ruler size={18} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isProcessing}
                        title="Eliminar seleccionados"
                        className="bg-red-600/10 border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl h-12 w-12"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
