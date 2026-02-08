'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Catalog } from '@/types/catalog';
import { getCatalogs } from '@/app/actions/catalog';
import { CatalogCard } from './CatalogCard';
import { UploadCatalogForm } from './UploadCatalogForm';
import { Plus, Search, Loader2, FolderOpen, Filter, Files, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CatalogManager = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const isImageFile = (url: string) => /\.(jpe?g|png|gif|webp)$/i.test(url);
    const isPdfFile = (url: string) => /\.pdf$/i.test(url);
    const total = catalogs.length;
    const images = catalogs.filter((catalog) => isImageFile(catalog.file_url)).length;
    const pdfs = catalogs.filter((catalog) => isPdfFile(catalog.file_url)).length;
    const recent = catalogs.filter((catalog) => {
      const createdAt = new Date(catalog.created_at).getTime();
      return Date.now() - createdAt < 1000 * 60 * 60 * 24 * 30;
    }).length;
    return { total, images, pdfs, recent };
  }, [catalogs]);

  const fetchCatalogs = useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await getCatalogs(search);
        setCatalogs(data || []);
    } catch (err) {
        console.error('Fetch catalogs error:', err);
    } finally {
        setIsLoading(false);
    }
  }, [search]);

  const handleUploadSuccess = () => {
      setShowUpload(false);
      fetchCatalogs();
  };

  const handleDeleteSuccess = () => {
      fetchCatalogs();
  };

  useEffect(() => {
    const timer = setTimeout(fetchCatalogs, 500);
    return () => clearTimeout(timer);
  }, [fetchCatalogs]);

  return (
    <div className="space-y-10 pb-20">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40">
        <div className="absolute -top-32 right-[-10%] h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 left-[-6%] h-56 w-56 rounded-full bg-gradient-to-br from-teal-400/20 via-sky-500/10 to-transparent blur-3xl" />
        <div className="relative p-8 md:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
                <Sparkles size={14} className="text-amber-300" />
                Gestión de Catálogo
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                Control total de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">materiales de venta</span>
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl">
                Centraliza PDFs e imágenes en un solo lugar. Compartí tu catálogo con estética premium y actualizaciones rápidas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`px-7 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl ${
                  showUpload
                    ? 'bg-slate-900 text-slate-300 border border-white/10'
                    : 'bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 text-slate-950 hover:shadow-amber-200/20'
                }`}
              >
                {showUpload ? 'Cancelar carga' : <><Plus size={20} /> Subir catálogo</>}
              </button>
              <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
                <span className="font-bold text-white">Formatos</span>
                <span className="text-slate-400">PDF, JPG, PNG</span>
                <span className="h-4 w-[1px] bg-white/10" />
                <span className="font-bold text-white">Max</span>
                <span className="text-slate-400">10MB</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <Files size={18} className="text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Total</span>
              </div>
              <div className="mt-3 text-3xl font-black text-white">{stats.total}</div>
              <p className="text-xs text-slate-400">Catálogos activos</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <ImageIcon size={18} className="text-teal-300" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Imágenes</span>
              </div>
              <div className="mt-3 text-3xl font-black text-white">{stats.images}</div>
              <p className="text-xs text-slate-400">Catálogos visuales</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <FolderOpen size={18} className="text-sky-300" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">PDFs</span>
              </div>
              <div className="mt-3 text-3xl font-black text-white">{stats.pdfs}</div>
              <p className="text-xs text-slate-400">Documentos listos</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-slate-300">
                <Sparkles size={18} className="text-rose-300" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Nuevos</span>
              </div>
              <div className="mt-3 text-3xl font-black text-white">{stats.recent}</div>
              <p className="text-xs text-slate-400">Cargados este mes</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
            <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }} 
                animate={{ opacity: 1, height: 'auto', scale: 1 }} 
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="overflow-hidden origin-top"
            >
                <div className="glass p-1 rounded-[2rem]">
                    <UploadCatalogForm onSuccess={handleUploadSuccess} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-4 z-30 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl shadow-black/30">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por título, categoría o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-slate-500 focus:border-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-200/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition-colors hover:text-white">
              <Filter size={18} />
              Filtrar
            </button>
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Orden: Recientes
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border border-white/5 bg-slate-950/60">
          <Loader2 className="mb-4 animate-spin text-amber-300" size={48} />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Cargando catálogos...</p>
        </div>
      ) : catalogs.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-slate-950/40"
        >
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
            <FolderOpen className="text-slate-500" size={36} />
          </div>
          <h3 className="text-2xl font-black text-white">Tu colección está vacía</h3>
          <p className="text-slate-400 max-w-md">
            Sube tu primer catálogo en PDF o imagen para empezar a compartir tu oferta con clientes.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-200 transition hover:bg-amber-200/20"
          >
            Comenzar ahora
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode='popLayout'>
                {catalogs.map((catalog, index) => (
                    <motion.div
                        key={catalog.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <CatalogCard catalog={catalog} onDelete={handleDeleteSuccess} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      )}
    </div>
  );
};
