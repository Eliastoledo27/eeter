'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus, Info, Zap, Layers, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bulkUploadImages } from '@/app/actions/images';
import { createProduct } from '@/app/actions/products';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkImageUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkImageUploadModal({ onClose, onSuccess }: BulkImageUploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ fileName: string, url: string }[]>([]);
    const [step, setStep] = useState<'upload' | 'associate'>('upload');
    const [processing, setProcessing] = useState(false);
    const [productsToCreate, setProductsToCreate] = useState<Record<string, { name: string, price: string, category: string }>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        try {
            const result = await bulkUploadImages(formData);
            if (result.success) {
                const successFiles = result.results
                    .filter((r): r is { fileName: string; url: string } => !!r && 'url' in r && !!r.url && !('error' in r))
                    .map((r) => ({ fileName: r.fileName, url: r.url }));
                setUploadResults(successFiles);
                const initialData: Record<string, { name: string, price: string, category: string }> = {};
                successFiles.forEach((f: { fileName: string; url: string }) => {
                    const rawName = f.fileName.split('.').slice(0, -1).join('.');
                    const cleanName = rawName.replace(/[-_]/g, ' ').replace(/\d+/g, '').trim();
                    initialData[f.url] = {
                        name: cleanName || 'Nuevo Producto',
                        price: '0',
                        category: 'Sneakers'
                    };
                });
                setProductsToCreate(initialData);
                setStep('associate');
                toast.success(`${successFiles.length} RECURSOS_SUBIDOS_AL_SERVIDOR.`);
            } else {
                toast.error('ERR_UPLOAD: Error en el transporte de datos.');
            }
        } catch {
            toast.error('ERR_CONEXION: Servidor inaccesible durante el volcado.');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateProducts = async () => {
        setProcessing(true);
        let createdCount = 0;
        try {
            for (const img of uploadResults) {
                const productData = productsToCreate[img.url];
                if (!productData) continue;
                const formData = new FormData();
                formData.append('name', productData.name);
                formData.append('base_price', productData.price);
                formData.append('category', productData.category);
                formData.append('description', 'Producto creado desde carga masiva de imágenes');
                formData.append('image_url', img.url);
                formData.append('stock_by_size', JSON.stringify({ 'Unique': 10 }));
                await createProduct(formData);
                createdCount++;
            }
            toast.success(`${createdCount} PRODUCTOS_GENERADOS_EN_BASE_DE_DATOS.`);
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'ERR_PERSISTENCE: Error en la creación de nodos.';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const updateProductData = (url: string, field: string, value: string) => {
        setProductsToCreate(prev => ({
            ...prev,
            [url]: { ...prev[url], [field]: value }
        }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-[40px]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl bg-[#030303] rounded-[4rem] shadow-[0_0_150px_-30px_rgba(0,229,255,0.2)] border border-white/5 flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-12 pb-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.01] to-transparent">
                    <div>
                        <div className="flex items-center gap-5 mb-3">
                            <div className="bg-[#00E5FF]/10 p-2.5 rounded-xl border border-[#00E5FF]/20">
                                <Zap className="text-[#00E5FF]" size={24} strokeWidth={3} />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                INGESTA_ <span className="text-[#00E5FF]">VISUAL</span>
                            </h2>
                        </div>
                        <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">
                            {step === 'upload'
                                ? 'SUBRE_MÚLTIPLES_ACTIVOS_PARA_GENERACIÓN_AUTÓNOMA'
                                : 'MAPEADO_DE_DETALLES_PARA_LA_MALLA_DE_PRODUCTOS'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-6 bg-white/[0.03] hover:bg-white/[0.08] rounded-[1.5rem] transition-all text-white/20 hover:text-white border border-white/5 active:scale-90">
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-12 flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.02),transparent_60%)]">
                    {step === 'upload' && (
                        <div className="space-y-10">
                            <motion.div
                                whileHover={{ scale: 0.995 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/5 hover:border-[#00E5FF]/40 rounded-[3rem] p-24 transition-all duration-700 bg-white/[0.01] text-center group cursor-pointer hover:bg-[#00E5FF]/5 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[#00E5FF]/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-8 relative z-10">
                                    <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center group-hover:border-[#00E5FF]/40 group-hover:bg-[#00E5FF]/10 transition-all duration-700">
                                        <Upload size={48} className="text-white/10 group-hover:text-[#00E5FF] transition-all duration-700" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-3">
                                        <span className="font-black text-2xl text-white block uppercase tracking-tighter">
                                            {files.length > 0 ? `${files.length} ARCHIVOS_SELECCIONADOS` : 'SELECCIONAR_ACTIVOS'}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">JPG, PNG, WEBP_FORMAT_SUPPORTED</span>
                                    </div>
                                </div>
                            </motion.div>

                            {files.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {files.map((file, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={i} 
                                            className="relative aspect-square bg-[#050505] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl flex items-center justify-center p-4 group"
                                        >
                                            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10 text-[8px] text-white/20 font-black uppercase tracking-widest text-center truncate w-full p-2">
                                                {file.name}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'associate' && (
                        <div className="space-y-8 pb-10">
                            <div className="flex items-center gap-3 mb-4 mx-2">
                                <Info size={14} className="text-[#00E5FF]/40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">CONFIGURAR_DETALLES_OPERATIVOS_PARA_CADA_NODO</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {uploadResults.map((img, index) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={index} 
                                        className="flex flex-col lg:flex-row gap-8 bg-white/[0.01] p-8 rounded-[2.5rem] border border-white/5 items-center hover:border-[#00E5FF]/20 hover:bg-[#00E5FF]/2 transition-all duration-700 shadow-2xl"
                                    >
                                        <div className="relative w-32 h-32 bg-black rounded-[2rem] overflow-hidden shrink-0 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                                            <Image src={img.url} alt="Uploaded" fill className="object-cover p-2 hover:scale-110 transition-transform duration-1000" />
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-1">NOMENCLATURA</label>
                                                <input
                                                    type="text"
                                                    value={productsToCreate[img.url]?.name || ''}
                                                    onChange={e => updateProductData(img.url, 'name', e.target.value)}
                                                    className="w-full bg-black/60 border-white/5 rounded-xl h-14 px-5 text-xs text-white uppercase tracking-widest focus:border-[#00E5FF]/40 focus:ring-0 outline-none transition-all font-black"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-1">CENTRO_LOGÍSTICO_CAT</label>
                                                <input
                                                    type="text"
                                                    value={productsToCreate[img.url]?.category || ''}
                                                    onChange={e => updateProductData(img.url, 'category', e.target.value)}
                                                    className="w-full bg-black/60 border-white/5 rounded-xl h-14 px-5 text-xs text-white uppercase tracking-widest focus:border-[#00E5FF]/40 focus:ring-0 outline-none transition-all font-black"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] px-1">VALOR_MÉTRICO_USD</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00E5FF] font-black text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        value={productsToCreate[img.url]?.price || ''}
                                                        onChange={e => updateProductData(img.url, 'price', e.target.value)}
                                                        className="w-full bg-black/60 border-white/5 rounded-xl h-14 pl-10 pr-5 text-sm text-white focus:border-[#00E5FF]/40 focus:ring-0 outline-none transition-all font-black tracking-widest"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-12 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white/10">
                        <Layers size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em]">{files.length} ITEMS_EN_PROCESADOR</span>
                    </div>
                    <div className="flex gap-6">
                        <Button 
                            variant="ghost" 
                            onClick={onClose} 
                            disabled={uploading || processing} 
                            className="text-white/20 hover:text-white uppercase px-10 h-16 rounded-[1.5rem] font-black text-[10px] tracking-[0.4em] transition-all"
                        >
                            ANULAR_OPS
                        </Button>

                        <AnimatePresence mode='wait'>
                            {step === 'upload' ? (
                                <motion.div key="upload-btn">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={files.length === 0 || uploading}
                                        className="bg-white text-black hover:bg-[#00E5FF] h-16 px-14 rounded-[1.5rem] font-black text-[10px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all active:scale-95 border-none"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-4 h-5 w-5 animate-spin" />
                                                SUBIENDO...
                                            </>
                                        ) : (
                                            'INICIAR_TRANSFERENCIA'
                                        )}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="create-btn">
                                    <Button
                                        onClick={handleCreateProducts}
                                        disabled={processing}
                                        className="bg-emerald-600 text-white hover:bg-emerald-500 h-16 px-14 rounded-[1.5rem] font-black text-[10px] tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all active:scale-95 border-none flex items-center gap-4"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                PERSISTIENDO...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} strokeWidth={3} />
                                                GENERAR_NODOS
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
