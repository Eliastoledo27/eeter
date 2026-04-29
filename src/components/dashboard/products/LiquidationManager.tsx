'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProductType } from '@/app/actions/products';
import { applyLiquidationBatch, getLiquidationProducts, type LiquidationSort } from '@/app/actions/liquidation-actions';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Eye, Search, Tag } from 'lucide-react';

interface Props {
  products: ProductType[];
  onUpdated: () => void;
}

export function LiquidationManager({ products, onUpdated }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<LiquidationSort>('liquidated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'liquidated'>('all');

  const desktop = typeof window === 'undefined' ? true : window.innerWidth >= 1025;
  const selectable = useMemo(
    () =>
      products.filter((p) => {
        const totalStock = Object.values(p.stock_by_size || {}).reduce((acc, qty) => acc + Number(qty || 0), 0);
        const liq = p as ProductType & { liquidation_active?: boolean };
        const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'pending' && !liq.liquidation_active) ||
          (statusFilter === 'liquidated' && !!liq.liquidation_active);
        return p.is_active && totalStock > 0 && matchesSearch && matchesStatus;
      }),
    [products, query, statusFilter]
  );

  const selectedCount = Object.keys(selected).filter((k) => selected[k] !== undefined).length;

  const loadGrid = async (nextPage = page, nextSort = sortBy, nextOrder = sortOrder) => {
    const res = await getLiquidationProducts({ page: nextPage, pageSize: 12, sortBy: nextSort, sortOrder: nextOrder });
    if (res.error) return toast.error(res.error);
    setRows(res.data as Array<Record<string, unknown>>);
    setTotal(res.total);
  };
  useEffect(() => { loadGrid(1); }, []);

  const toggleAll = () => {
    if (selectedCount === selectable.length) return setSelected({});
    const map: Record<string, number> = {};
    selectable.forEach((p) => (map[p.id] = 20));
    setSelected(map);
  };

  const confirmLiquidation = async () => {
    if (!selectedCount) return;
    const confirmed = window.confirm(`Confirmar liquidacion de ${selectedCount} productos?`);
    if (!confirmed) return;
    setBusy(true);
    const payload = Object.entries(selected)
      .filter(([, discount]) => discount !== undefined)
      .map(([productId, discountPercent]) => ({ productId, discountPercent }));
    const res = await applyLiquidationBatch(payload);
    setBusy(false);
    if (!res.success) return toast.error(res.error || 'No se pudo liquidar');
    toast.success(`Liquidacion aplicada en ${res.count} productos`);
    setSelected({});
    onUpdated();
    loadGrid(1);
  };

  if (!desktop) {
    return <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">La gestion de liquidacion esta disponible solo en desktop (&gt;= 1025px).</div>;
  }

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black uppercase tracking-wider text-white">Liquidacion sin cambio</h3>
          <p className="text-xs text-white/55">Seleccion, descuento y control visual de estado en una sola vista.</p>
        </div>
        <button onClick={toggleAll} className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-white/90">{selectedCount === selectable.length ? 'Limpiar seleccion' : 'Seleccionar todos'}</button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 text-white/40" size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto para liquidar..." className="w-full rounded-xl border border-white/15 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/35" />
        </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white">
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="liquidated">Ya liquidados</option>
        </select>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {selectable.slice(0, 30).map((p) => {
          const liq = p as ProductType & { liquidation_active?: boolean };
          return (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 p-3">
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={selected[p.id] !== undefined} onChange={(e) => {
                  if (!e.target.checked) {
                    setSelected((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
                  } else {
                    setSelected((prev) => ({ ...prev, [p.id]: prev[p.id] ?? 20 }));
                  }
                }} />
                <span className="line-clamp-1">{p.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${liq.liquidation_active ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{liq.liquidation_active ? 'LIQUIDADO' : 'PENDIENTE'}</span>
              </label>
              <input type="number" min={1} max={95} step={1} value={selected[p.id] ?? 20} onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: Math.max(1, Math.min(95, Number(e.target.value || 1))) }))} className="w-20 rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-right text-sm text-white" />
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-white/70">Seleccionados: {selectedCount}</span>
        <button onClick={confirmLiquidation} disabled={busy || !selectedCount} className="rounded-xl bg-[#00E5FF] px-4 py-2 text-sm font-bold text-black disabled:opacity-50">{busy ? 'Procesando...' : 'Confirmar liquidacion'}</button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select value={sortBy} onChange={(e) => { const v = e.target.value as LiquidationSort; setSortBy(v); loadGrid(page, v, sortOrder); }} className="rounded-lg bg-black/40 px-2 py-1 text-sm text-white">
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
          <option value="discount">Descuento</option>
          <option value="liquidated_at">Fecha</option>
        </select>
        <select value={sortOrder} onChange={(e) => { const v = e.target.value as 'asc' | 'desc'; setSortOrder(v); loadGrid(page, sortBy, v); }} className="rounded-lg bg-black/40 px-2 py-1 text-sm text-white">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button onClick={() => loadGrid(page)} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/80">Actualizar</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((r) => {
          const id = String(r.id);
          const src = !imgErrors[id] && (r.images as string[] | undefined)?.[0] ? String((r.images as string[])[0]) : null;
          return (
            <article key={id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <Link href={`/catalog/${id}`} className="group/liq relative mb-2 block h-36 w-full overflow-hidden rounded-xl bg-white/[0.02]">
                {src ? <img src={src} onError={() => setImgErrors((p) => ({ ...p, [id]: true }))} alt={String(r.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/liq:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-xs text-white/50">Sin imagen</div>}
                <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 transition-opacity group-hover/liq:opacity-100">
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white"><Eye size={12} /> Vista previa</span>
                </div>
              </Link>
              <h4 className="line-clamp-2 min-h-10 text-sm font-semibold text-white">{String(r.name)}</h4>
              <p className="text-xs text-white/60 line-through">${Number(r.price || 0).toLocaleString('es-AR')}</p>
              <p className="text-lg font-black text-[#00E5FF]">${Number(r.liquidation_price || 0).toLocaleString('es-AR')}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-300"><Tag size={12} /> -{Number(r.liquidation_discount_percent || 0)}%</span>
                <Link href={`/catalog/${id}`} className="inline-flex items-center gap-1 rounded-lg bg-[#00E5FF] px-2.5 py-1.5 text-[11px] font-black text-black"><Eye size={12} /> Vista previa</Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/60">Resultados: {total}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => { const n = page - 1; setPage(n); loadGrid(n); }} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white disabled:opacity-40">Anterior</button>
          <button disabled={page * 12 >= total} onClick={() => { const n = page + 1; setPage(n); loadGrid(n); }} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#050505] text-white">
          {preview && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-80 w-full rounded-2xl bg-white/[0.03]" />
              <div>
                <DialogTitle className="mb-2 text-2xl font-black">{String(preview.name)}</DialogTitle>
                <p className="mb-4 text-sm text-white/60">Estado actual: En liquidacion</p>
                <p className="text-sm line-through text-white/50">${Number(preview.price || 0).toLocaleString('es-AR')}</p>
                <p className="text-2xl font-black text-[#00E5FF]">${Number(preview.liquidation_price || 0).toLocaleString('es-AR')}</p>
                <p className="mb-3 text-sm text-rose-300">-{Number(preview.liquidation_discount_percent || 0)}%</p>
                <Link href={`/catalog/${String(preview.id)}`} className="inline-flex items-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-2 text-xs font-black text-black"><Eye size={13} /> Ir a vista previa</Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
