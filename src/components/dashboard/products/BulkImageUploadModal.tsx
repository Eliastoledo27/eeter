'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bulkUploadImages } from '@/app/actions/images';
import { createProduct } from '@/app/actions/products';
import { toast } from 'sonner';
import Image from 'next/image';

interface BulkImageUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

// interface UploadResult {
//     fileName: string;
//     url: string;
//     error?: string;
// }

export function BulkImageUploadModal({ onClose, onSuccess }: BulkImageUploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ fileName: string, url: string }[]>([]);
    const [step, setStep] = useState<'upload' | 'associate'>('upload');
    const [processing, setProcessing] = useState(false);

    // State for association step
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

                // Initialize product data for each image
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
                toast.success(`${successFiles.length} imágenes subidas correctamente`);
            } else {
                toast.error('Error al subir imágenes');
            }
        } catch {
            // console.error(error);
            toast.error('Error de conexión');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateProducts = async () => {
        setProcessing(true);
        let createdCount = 0;

        try {
            // Iterate over valid results and create products
            for (const img of uploadResults) {
                const productData = productsToCreate[img.url];
                if (!productData) continue;

                const formData = new FormData();
                formData.append('name', productData.name);
                formData.append('base_price', productData.price);
                formData.append('category', productData.category);
                formData.append('description', 'Producto creado desde carga masiva de imágenes');
                formData.append('image_url', img.url); // Use the URL we just got
                // Default stock
                formData.append('stock_by_size', JSON.stringify({ 'Unique': 10 }));

                await createProduct(formData);
                createdCount++;
            }

            toast.success(`${createdCount} productos creados exitosamente`);
            onSuccess();
            onClose();

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear algunos productos';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <ImageIcon className="text-orange-500" />
                            Carga Masiva de Imágenes
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {step === 'upload'
                                ? 'Sube múltiples imágenes para crear productos automáticamente.'
                                : 'Asocia detalles a las imágenes subidas.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-12 transition-all bg-slate-50 text-center group cursor-pointer hover:bg-orange-50/30"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-orange-600">
                                    <Upload size={64} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                                    <div>
                                        <span className="font-bold text-lg text-slate-900 block mb-1">
                                            {files.length > 0 ? `${files.length} archivos seleccionados` : 'Seleccionar imágenes'}
                                        </span>
                                        <span className="text-sm text-slate-500">JPG, PNG, WEBP</span>
                                    </div>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {files.map((file, i) => (
                                        <div key={i} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs p-2 text-center font-medium">
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'associate' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {uploadResults.map((img, index) => (
                                    <div key={index} className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 items-start shadow-sm">
                                        <div className="relative w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                            <Image src={img.url} alt="Uploaded" fill className="object-cover" />
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 block mb-1.5">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={productsToCreate[img.url]?.name || ''}
                                                    onChange={e => updateProductData(img.url, 'name', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 block mb-1.5">Categoría</label>
                                                <input
                                                    type="text"
                                                    value={productsToCreate[img.url]?.category || ''}
                                                    onChange={e => updateProductData(img.url, 'category', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 block mb-1.5">Precio ($)</label>
                                                <input
                                                    type="number"
                                                    value={productsToCreate[img.url]?.price || ''}
                                                    onChange={e => updateProductData(img.url, 'price', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all font-bold font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={uploading || processing} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium">
                        Cancelar
                    </Button>

                    {step === 'upload' ? (
                        <Button
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] font-bold shadow-lg shadow-orange-600/20"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                'Subir Imágenes'
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCreateProducts}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] font-bold shadow-lg shadow-emerald-600/20"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Productos
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
