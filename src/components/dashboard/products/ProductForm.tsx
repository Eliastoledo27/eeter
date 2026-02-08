'use client';

import { useState } from 'react';
import { createProduct, updateProduct, ProductType } from '@/app/actions/products';
import { X, Loader2, Sparkles, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settings-store';

interface ProductFormProps {
  product?: ProductType;
  onSuccess: (product: ProductType) => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'Sneakers');
  const [price, setPrice] = useState(product?.base_price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] || '');
  
  // Stock State (Simplified key-value pairs)
  const [stock, setStock] = useState<Record<string, number>>(product?.stock_by_size || {});
  
  // Helper for stock inputs
  const sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  const { geminiApiKey } = useSettingsStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleStockChange = (size: string, qty: string) => {
      const val = parseInt(qty);
      if (isNaN(val)) {
          const newStock = { ...stock };
          delete newStock[size];
          setStock(newStock);
      } else {
          setStock({ ...stock, [size]: val });
      }
  };

  const handleGenerateDescription = async () => {
    if (!geminiApiKey) {
        toast.error('Configura tu API Key de Gemini primero.');
        return;
    }
    
    if (!name || !category) {
      toast.error('Completa el nombre y la categoría para generar la descripción.');
      return;
    }

    setGeneratingDesc(true);
    
    try {
      const prompt = `Escribe una descripción comercial atractiva y persuasiva para vender este producto en una tienda online premium de zapatillas.
      
      Detalles del producto:
      - Nombre: ${name}
      - Categoría: ${category}
      - Precio: $${price || 'No especificado'}
      
      La descripción debe:
      - Ser corta (máximo 3 párrafos breves).
      - Resaltar la calidad, confort y estilo.
      - Usar un tono profesional pero entusiasta.
      - Incluir emojis relevantes.
      - Estar en español de Argentina (vos).
      
      No incluyas títulos ni markdown, solo el texto de la descripción.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
          throw new Error(data.error.message || 'Error en la API de Gemini');
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setDescription(generatedText);
        toast.success('Descripción generada con IA ✨');
      } else {
        toast.error('La IA no devolvió ningún texto.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con Gemini AI.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('base_price', price);
        formData.append('stock_by_size', JSON.stringify(stock));
        formData.append('image_url', imageUrl); // Using URL for now

        if (file) {
          formData.append('image_file', file);
        }

        let result;
        if (product?.id) {
            result = await updateProduct(product.id, formData);
        } else {
            result = await createProduct(formData);
        }

        if (result.error) {
            setError(result.error);
        } else {
            const updatedProduct: ProductType = result.product || {
                ...product!,
                name,
                description,
                category,
                base_price: Number(price),
                images: [imageUrl],
                stock_by_size: stock,
                id: product?.id || '',
                is_active: product?.is_active ?? true,
                created_at: product?.created_at || new Date().toISOString()
            };
            onSuccess(updatedProduct);
        }
    } catch {
        // console.error(err);
        setError('Ocurrió un error inesperado');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
            <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre del Producto</label>
                <input 
                    required
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Ej. Nike Air Force 1"
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
                <div className="relative">
                    <select 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-medium"
                    >
                        <option value="Sneakers">Sneakers</option>
                        <option value="Running">Running</option>
                        <option value="Formal">Formal</option>
                        <option value="Botas">Botas</option>
                        <option value="Accesorios">Accesorios</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Precio Base ($)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                        required
                        type="number" 
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-mono font-bold"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Descripción</label>
                    <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={generatingDesc}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        {generatingDesc ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                        {generatingDesc ? 'Generando...' : 'Completar con IA'}
                    </button>
                </div>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-none transition-all placeholder:text-slate-400"
                    placeholder="Detalles del producto..."
                />
            </div>
        </div>

        {/* Right Column: Image & Stock */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Imagen del Producto</label>
                <div className="flex flex-col gap-4">
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-2xl p-8 transition-all text-center bg-slate-50">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-orange-600 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                <Upload size={20} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-700">Click para subir imagen</span>
                                <span className="text-xs text-slate-400">JPG, PNG (Máx. 5MB)</span>
                            </div>
                        </div>
                    </div>
                    
                    {previewUrl && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm">
                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setPreviewUrl('');
                                        setImageUrl('');
                                    }}
                                    className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg transform hover:scale-110"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Stock por Talle</label>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-5 gap-3">
                        {sizes.map(size => (
                            <div key={size} className="flex flex-col items-center gap-1">
                                <label className="text-xs font-bold text-slate-500">{size}</label>
                                <input 
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={stock[size] || ''}
                                    onChange={e => handleStockChange(size, e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-1 py-2 text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-2 border-t border-slate-100">
        <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 mr-3 transition-colors"
        >
            Cancelar
        </button>
        <button 
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 hover:-translate-y-0.5"
        >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {product ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};
