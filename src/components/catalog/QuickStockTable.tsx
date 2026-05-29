'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { PackageSearch } from 'lucide-react';
import type { Product } from '@/types';
import { getAvailableSizes, getTotalStock } from '@/lib/catalog-ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EterCard } from '@/components/eter/EterCard';

interface QuickStockTableProps {
  products: Product[];
  limit?: number;
}

export function QuickStockTable({ products, limit = 6 }: QuickStockTableProps) {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Modelo',
        cell: ({ row }) => (
          <div>
            <p className="line-clamp-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">
              {row.original.name}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
              {row.original.category}
            </p>
          </div>
        ),
      },
      {
        id: 'sizes',
        header: 'Talles',
        cell: ({ row }) => (
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#00E0FF]">
            {getAvailableSizes(row.original).map(([size]) => size).slice(0, 7).join(' / ') || 'Sin stock'}
          </span>
        ),
      },
      {
        id: 'price',
        header: 'Precio',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] font-black text-white">
            ${row.original.basePrice.toLocaleString('es-AR')}
          </span>
        ),
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className="rounded-md border border-[#39FF14]/25 bg-[#39FF14]/10 px-2 py-1 text-[10px] font-black text-[#39FF14]">
            {getTotalStock(row.original)}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products.slice(0, limit),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <EterCard className="mb-8">
      <div className="flex flex-col gap-2 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PackageSearch size={18} className="text-[#39FF14]" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Resumen de stock</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Talles, precio y stock para decidir en segundos</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00E0FF]">{products.length} resultados</span>
      </div>
      <Table className="min-w-[640px]">
        <TableHeader className="bg-white/[0.03]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-10 text-[9px] font-black uppercase tracking-[0.22em] text-white/40">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.035]">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </EterCard>
  );
}
