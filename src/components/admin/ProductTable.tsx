'use client';

import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ProductTable({ products, onEdit, onDelete, isLoading }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-white/5 rounded-lg border border-white/10">
        No hay productos en el inventario.
      </div>
    );
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (stock < 10) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-green-500/20 text-green-400 border-green-500/50';
  };

  return (
    <div className="rounded-md border border-white/10 overflow-hidden bg-black/20 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/5 text-gray-400">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
               const totalStock = product.totalStock || Object.values(product.stockBySize || {}).reduce((a, b) => a + b, 0);
               return (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-800 shrink-0 border border-white/10">
                      <Image 
                        src={product.images[0] || '/placeholder-shoe.png'} 
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[200px]">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{product.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-accent-gold">
                    ${(product.basePrice || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStockColor(totalStock)}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este producto?')) {
                            onDelete(product.id);
                          }
                        }}
                        className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
