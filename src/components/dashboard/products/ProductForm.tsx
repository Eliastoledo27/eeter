'use client';

import { useState } from 'react';
import { createProduct, updateProduct, ProductType } from '@/app/actions/products';
import { X, Loader2, Sparkles, Upload, Save, Info, Hash, Palette, Scan, Cpu, Zap, Box, Layers } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settings-store';
import { analyzeImageWithName } from '@/lib/ai-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ProductFormProps {
    product?: ProductType;
    onSuccess: (product: ProductType) => void;
    onClose: () => void;
}

export const ProductForm = ({ product, onSuccess, onClose }: ProductFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatingDesc, setGeneratingDesc] = useState(false);
    const [analyzingName, setAnalyzingName] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [category, setCategory] = useState(product?.category || 'Sneakers');
    const [price, setPrice] = useState(product?.base_price?.toString() || '');
    const [imageUrl, setImageUrl] = useState(product?.images?.[0] || '');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] || '');

    // Stock State
    const [stock, setStock] = useState<Record<string, number>>(product?.stock_by_size || {});

    // Helper for stock inputs
    const sizes = [
        '28', '29', '30', '31', '32', '33', '34', '35',
        '36', '37', '38', '39', '40', '41', '42', '43',
        '44', '45', '46', '47', 'Unique'
    ];

    const { geminiApiKey } = useSettingsStore();

    const handleAnalyzeImage = async () => {
        if (!previewUrl && !imageUrl) {
            toast.error('ACCESO_DE_DATOS_FALLIDO: Sube una imagen para el análisis sensorial.');
            return;
        }

        setAnalyzingName(true);
        try {
            const generatedName = await analyzeImageWithName(previewUrl || imageUrl, geminiApiKey);
            if (generatedName) {
                setName(generatedName);
                toast.success('NOMENCLATURA_IA_IDENTIFICADA ✨');
            }
        } finally {
            setAnalyzingName(false);
        }
    };

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
            toast.error('ERR_AI_CLUSTER: Sin credenciales Gemini.');
            return;
        }

        if (!name || !category) {
            toast.error('ERR_DATA_INCOMPLETE: Se requiere modelo y categoría.');
            return;
        }

        setGeneratingDesc(true);
        try {
            const availableSizes = Object.entries(stock)
                .filter(([_, qty]) => Number(qty) > 0)
                .map(([size]) => size);

            const stockSummary = availableSizes.length > 0
                ? `Talles disponibles: ${availableSizes.join(', ')}.`
                : 'Consultar disponibilidad física.';

            const prompt = `Escribí una descripción corta, simple y canchera para estas zapatillas en la tienda "ÉTER".
      
      DATOS:
      - Modelo: ${name}
      - Estilo: ${category}
      - Precio: $${price}
      - Stock: ${stockSummary}
      
      REGLAS:
      - Usá español de Argentina (voseo: "llevátelas", "sentite", "combiná").
      - No des vueltas, sé directo. Hablale al cliente como un amigo.
      - Mencioná el modelo "${name}" y que por $${price} son una bomba.
      - Incluí los talles de forma natural (${availableSizes.join(', ') || 'consultanos'}).
      - Máximo 2 párrafos cortitos.
      - Usá un par de emojis copados.
      - Solo devolvé el texto limpio, sin títulos.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error(`ERR_AI_SYNC: ${response.status}`);
            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedText) {
                setDescription(generatedText.trim());
                toast.success('DNA_TEXTUAL_SINTETIZADO ✨');
            }
        } catch (err: any) {
            toast.error(`ERR_AI_GATEWAY: ${err.message}`);
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
            formData.append('image_url', imageUrl);
            if (file) formData.append('image_file', file);

            let result;
            if (product?.id) result = await updateProduct(product.id, formData);
            else result = await createProduct(formData);

            if (result.error) setError(result.error);
            else {
                onSuccess(result.product as ProductType);
                toast.success('NODO_DATOS_PERSISTIDO_CORRECTAMENTE');
            }
        } catch {
            setError('ERR_CORE_SYNC: Fallo en la persistencia del archivo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[30px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl bg-[#030303] rounded-[3.5rem] shadow-[0_0_120px_-20px_rgba(0,229,255,0.15)] border border-white/5 flex flex-col max-h-[92vh] overflow-hidden"
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                    {/* Header Stage */}
                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.01] to-transparent">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#00E5FF]/10 p-2 rounded-xl border border-[#00E5FF]/20">
                                    <Box className="text-[#00E5FF]" size={20} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">
                                    {product ? 'MODIFICACIÓN_' : 'NUEVA_'} <span className="text-[#00E5FF]">ENTRADA</span>
                                </h2>
                            </div>
                            <p className="text-white/20 text-[9px] font-black tracking-[0.4em] uppercase">REGISTRO DE ACTIVO EN EL CLÚSTER DE PRODUCTOS</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl transition-all text-white/20 hover:text-white border border-white/5 active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.02),transparent_60%)]">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-rose-500/5 border border-rose-500/10 p-6 rounded-[1.5rem] flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{error}</span>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Primary Data */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                            <Hash size={12} /> NOMENCLATURA_COMERCIAL
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAnalyzeImage}
                                            disabled={analyzingName}
                                            className="bg-[#00E5FF]/5 hover:bg-[#00E5FF]/10 px-4 py-2 rounded-xl text-[9px] font-black text-[#00E5FF] uppercase tracking-[0.2em] border border-[#00E5FF]/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {analyzingName ? <Loader2 className="animate-spin" size={14} /> : <Scan size={14} />}
                                            IA_SENSOR
                                        </button>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 px-6 text-sm text-white focus:border-[#00E5FF]/40 outline-none transition-all font-black uppercase tracking-widest"
                                        placeholder="MODELO_ID_SJK"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-1 flex items-center gap-2">
                                            <Layers size={12} /> CATEGORÍA_CORE
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                className="w-full appearance-none bg-black/40 border border-white/5 rounded-2xl h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] outline-none hover:border-white/10 transition-all cursor-pointer"
                                            >
                                                {['Sneakers', 'Running', 'Formal', 'Botas', 'Accesorios'].map(cat => (
                                                    <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat.toUpperCase()}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-1 flex items-center gap-2">
                                            <Palette size={12} /> VALOR_USD
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00E5FF] font-black text-sm">$</span>
                                            <input
                                                required
                                                type="number"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 pl-12 pr-6 text-sm text-white focus:border-[#00E5FF]/40 outline-none transition-all font-black"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                            <Cpu size={12} /> SÍNTESIS_DESCRIPTOR
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={generatingDesc}
                                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {generatingDesc ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                                            NEURAL_TEXT
                                        </button>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 text-sm text-white/60 focus:border-[#00E5FF]/40 outline-none resize-none transition-all font-medium uppercase tracking-wider leading-relaxed"
                                        placeholder="DATA_DESCRIPTOR_NULL..."
                                    />
                                </div>
                            </div>

                            {/* Media & Matrix */}
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-1">RECURSO_MULTIMEDIA</label>
                                    <div className="relative group cursor-pointer border-2 border-dashed border-white/5 hover:border-[#00E5FF]/40 rounded-[3rem] p-12 transition-all duration-700 bg-white/[0.01] text-center hover:bg-[#00E5FF]/5">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        {!previewUrl ? (
                                            <div className="flex flex-col items-center gap-6 py-4">
                                                <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center text-white/10 group-hover:text-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-all duration-700">
                                                    <Upload size={32} strokeWidth={1} />
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-xs font-black text-white/40 group-hover:text-white transition-colors block uppercase tracking-widest">INGESTAR_ARCHIVO</span>
                                                    <span className="text-[8px] text-white/10 font-black uppercase tracking-[0.4em]">MAX_SIZE: 10MB | FORMAT: IMG</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-3xl group/img">
                                                <Image src={previewUrl} alt="Preview" fill className="object-contain p-8 group-hover/img:scale-105 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => { setFile(null); setPreviewUrl(''); setImageUrl(''); }} className="p-4 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-all shadow-2xl">
                                                        <X size={24} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-1">MATRIZ_STOCK_SJK</label>
                                    <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl grid grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                        {sizes.map(size => (
                                            <div key={size} className="flex flex-col items-center gap-2 group">
                                                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-[#00E5FF] transition-colors">{size}</label>
                                                <input
                                                    type="number"
                                                    value={stock[size] || ''}
                                                    onChange={e => handleStockChange(size, e.target.value)}
                                                    className="w-full bg-black border border-white/5 rounded-xl h-12 text-center text-xs font-black text-white focus:border-[#00E5FF]/40 outline-none transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Control */}
                    <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-end gap-6">
                        <Button type="button" onClick={onClose} variant="ghost" className="px-10 h-16 rounded-2xl font-black text-[10px] tracking-[0.4em] text-white/20 hover:text-white uppercase">ANULAR_REGISTRO</Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-white text-black hover:bg-[#00E5FF] px-14 h-16 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all active:scale-95 border-none flex items-center gap-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={3} />}
                            {product ? 'CONFIRMAR_UPDATE' : 'PERSISTIR_NUEVO_NODO'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
