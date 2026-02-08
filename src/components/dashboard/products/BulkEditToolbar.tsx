'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkUpdateProducts, bulkDeleteProducts, ProductType } from '@/app/actions/products';
import { Loader2, Save, Check, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEditToolbarProps {
  selectedIds: string[];
  products: ProductType[]; 
  onClearSelection: () => void;
  onSuccess: () => void;
}

export function BulkEditToolbar({ selectedIds, products, onClearSelection, onSuccess }: BulkEditToolbarProps) {
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 shadow-2xl shadow-orange-900/10 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300 w-[95%] max-w-4xl">
      
      <div className="flex items-center gap-4 border-r border-slate-200 pr-4">
        <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1.5">
            <Check size={12} strokeWidth={3} />
            {selectedIds.length} Seleccionados
        </div>
        <button onClick={onClearSelection} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
            Cancelar
        </button>
      </div>

      <div className="flex-1 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-700 hidden sm:inline">Acción:</span>
        
        <Select value={actionType} onValueChange={(v) => setActionType(v as 'price' | 'stock' | 'category' | 'description')}>
            <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 text-slate-900 font-medium">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="category">Categoría</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="description">Descripción</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
            </SelectContent>
        </Select>

        {actionType === 'price' && (
            <>
                <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'fixed' | 'percent_inc' | 'percent_dec')}>
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fixed">Fijo ($)</SelectItem>
                        <SelectItem value="percent_inc">Aumentar %</SelectItem>
                        <SelectItem value="percent_dec">Descontar %</SelectItem>
                    </SelectContent>
                </Select>
                <Input 
                    type="number" 
                    placeholder="Valor" 
                    value={value} 
                    onChange={e => setValue(e.target.value)}
                    className="w-[100px] bg-slate-50 border-slate-200 text-slate-900"
                />
            </>
        )}

        {actionType === 'stock' && (
             <>
                <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'add')}>
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="set">Establecer</SelectItem>
                        <SelectItem value="add">Añadir (+)</SelectItem>
                    </SelectContent>
                </Select>
                <Input 
                    type="number" 
                    placeholder="Cantidad" 
                    value={value} 
                    onChange={e => setValue(e.target.value)}
                    className="w-[100px] bg-slate-50 border-slate-200 text-slate-900"
                />
             </>
        )}

        {actionType === 'category' && (
             <Input 
                type="text" 
                placeholder="Nueva categoría..." 
                value={value} 
                onChange={e => setValue(e.target.value)}
                className="flex-1 min-w-[200px] bg-slate-50 border-slate-200 text-slate-900"
            />
        )}

        {actionType === 'description' && (
             <>
                <Select value={modificationType} onValueChange={(v) => setModificationType(v as 'set' | 'append')}>
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="set">Reemplazar</SelectItem>
                        <SelectItem value="append">Agregar al final</SelectItem>
                    </SelectContent>
                </Select>
                <Input 
                    type="text" 
                    placeholder="Texto de descripción..." 
                    value={value} 
                    onChange={e => setValue(e.target.value)}
                    className="flex-1 min-w-[200px] bg-slate-50 border-slate-200 text-slate-900"
                />
             </>
        )}

        {actionType === 'status' && (
             <Select value={value} onValueChange={setValue}>
                <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200 text-slate-900 font-medium">
                    <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
            </Select>
        )}
      </div>

      <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <Button 
            onClick={handleApply} 
            disabled={isProcessing || !value}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />}
            Aplicar
          </Button>

          <div className="w-px h-8 bg-slate-200 mx-2" />

          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            disabled={isProcessing}
            title="Exportar CSV"
            className="border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <Download size={18} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={isProcessing}
            title="Eliminar seleccionados"
            className="border-red-100 bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Trash2 size={18} />
          </Button>
      </div>
    </div>
  );
}
