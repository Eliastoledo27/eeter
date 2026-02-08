'use client';

import { Catalog } from '@/types/catalog';
import { FileText, Trash2, Calendar, Eye } from 'lucide-react';
import { deleteCatalog } from '@/app/actions/catalog';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const CatalogCard = ({ catalog, onDelete }: { catalog: Catalog, onDelete: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Custom confirm toast or modal would be better, but native confirm is ok for now
    if (!confirm('¿Estás seguro de eliminar este catálogo?')) return;
    
    setIsDeleting(true);
    const res = await deleteCatalog(catalog.id, catalog.file_url);
    if (res.error) {
        toast.error(res.error);
        setIsDeleting(false);
    } else {
        toast.success('Catálogo eliminado');
        onDelete();
    }
  };

  const isImage = catalog.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
  const fileTypeLabel = isImage ? 'Imagen' : 'PDF';
  const accentClass = isImage ? 'text-teal-200 bg-teal-400/10 border-teal-400/20' : 'text-amber-200 bg-amber-400/10 border-amber-400/20';
  const formattedDate = new Date(catalog.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="relative group aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-950 border border-white/10 shadow-2xl shadow-black/50"
    >
      <div className="absolute inset-0 z-0">
        {isImage ? (
          <Image
            src={catalog.file_url}
            alt={catalog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-500">
            <FileText size={64} className="mb-4 opacity-60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Documento PDF</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-lg ${accentClass}`}>
          {fileTypeLabel}
        </span>
        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          {catalog.category || 'General'}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
        <div className="transform transition-all duration-500 group-hover:-translate-y-2">
          <h4 className="text-xl font-black text-white mb-2 leading-tight drop-shadow-md line-clamp-2">
            {catalog.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto">
            {catalog.description || 'Sin descripción disponible.'}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-4">
            <Calendar size={12} />
            {formattedDate}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <a
            href={catalog.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-3 bg-white text-slate-950 hover:bg-slate-200 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-white/10"
          >
            <Eye size={16} /> Ver catálogo
          </a>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="col-span-1 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-300 py-3 rounded-xl flex items-center justify-center transition-all backdrop-blur-md"
          >
            {isDeleting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
