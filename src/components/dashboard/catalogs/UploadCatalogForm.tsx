'use client';

import { useState } from 'react';
import { Upload, Loader2, FileText } from 'lucide-react';
import { uploadCatalog } from '@/app/actions/catalog';
import { toast } from 'sonner';
import Image from 'next/image';
import { Catalog } from '@/types/catalog';

export const UploadCatalogForm = ({ onSuccess }: { onSuccess: (newCatalog?: Catalog) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (Máx 10MB)');
      return;
    }

    // Validate type (Images, PDF)
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      toast.error('Formato no soportado. Usa PDF o Imágenes.');
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null); // PDF icon handled in UI
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadCatalog(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Catálogo subido correctamente');
        setFile(null);
        setPreview(null);
        // Pass the new catalog (if any) back to parent
        onSuccess(res.catalog);
      }
    } catch {
      toast.error('Error inesperado al subir');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form action={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Nuevo catálogo</p>
          <h3 className="text-2xl font-black text-white mt-2">Subí material premium</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Cargá PDFs o imágenes con descripción para que tus clientes reciban un catálogo profesional.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
          Tip: agregá portada clara
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Título</label>
              <input
                name="title"
                required
                placeholder="Ej: Colección Verano 2025"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-200/30 focus:border-amber-200/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Categoría</label>
              <select
                name="category"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-200/30 focus:border-amber-200/30 outline-none"
              >
                <option value="General">General</option>
                <option value="Sneakers">Sneakers</option>
                <option value="Apparel">Indumentaria</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Descripción</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Breve descripción del contenido..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-200/30 focus:border-amber-200/30 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 hover:from-amber-200 hover:via-orange-200 hover:to-rose-200 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-950 font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-200/10"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
            {isUploading ? 'Subiendo...' : 'Publicar catálogo'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:bg-white/5 transition-colors relative group">
            <input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {file ? (
              <div className="flex flex-col items-center">
                {preview ? (
                  <div className="relative h-40 w-full mb-3">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <FileText size={48} className="text-amber-300 mb-2" />
                )}
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                  className="mt-2 text-xs text-rose-300 hover:text-rose-200 z-20 relative"
                >
                  Remover archivo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 group-hover:text-slate-300">
                <Upload size={32} className="mb-2" />
                <p className="text-sm font-bold">Arrastra tu archivo aquí o haz clic</p>
                <p className="text-xs mt-1">PDF, JPG, PNG (Máx 10MB)</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Checklist</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Portada clara y legible.</li>
              <li>Precios actualizados.</li>
              <li>Descripción corta y precisa.</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};
