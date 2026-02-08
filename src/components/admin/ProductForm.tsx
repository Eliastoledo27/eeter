'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product } from '@/types';
import { productSchema, ProductFormValues } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { generateProductDescription } from '@/app/actions/ai';
import { Loader2, Upload, Sparkles, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      basePrice: initialData?.basePrice || 0,
      totalStock: initialData?.totalStock || 0,
      images: initialData?.images?.[0] || '',
    },
  });

  const imageUrl = watch('images');

  // AI Generation (Server-Side with Gemini)
  const handleGenerateDescription = async () => {
    const { name, category, basePrice } = getValues();

    if (!name || !category) {
      toast.error('Completa el nombre y la categoría para generar la descripción.');
      return;
    }

    setGeneratingDesc(true);

    try {
      const result = await generateProductDescription(name, category, Number(basePrice) || 0);

      if (result.success && result.text) {
        setValue('description', result.text);
        toast.success('Descripción generada con IA ✨');
      } else {
        toast.error(result.error || 'No se pudo generar la descripción.');
      }
    } catch {
      // console.error(error);
      toast.error('Error al conectar con la IA.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      if (!event.target.files || event.target.files.length === 0) {
        return; // No file selected
      }

      const file = event.target.files[0];

      // 1. Validate File Type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato no permitido. Solo se aceptan JPG, PNG o WEBP.');
      }

      // 2. Validate File Size (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen es demasiado pesada (máx 5MB).');
      }

      // 3. Inspect original resolution to decide compression targets
      setUploadProgress(20);
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
      const maxDim = Math.max(dims.w, dims.h);
      const targetMax = maxDim > 2500 ? 1920 : 1200;
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: targetMax,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      };

      const compressedFile = await imageCompression(file, options);
      setUploadProgress(40);

      // 4. Generate Unique Filename
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 5. Upload to Supabase (Check bucket existence logic handled by Supabase usually, but we handle error)
      setUploadProgress(60);
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Handle specific bucket not found error
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Error Crítico: El bucket "products" no existe.', {
            description: 'Por favor ejecuta el script de migración SQL en el Dashboard de Supabase para crearlo.',
            duration: 10000,
          });
          throw new Error('Error de configuración: El bucket "products" no existe en Supabase. Ejecuta el script SQL de migración.');
        }
        throw uploadError;
      }
      setUploadProgress(80);

      // 6. Get Public URL
      const { data } = supabase.storage.from('products').getPublicUrl(filePath);

      setValue('images', data.publicUrl);
      setUploadProgress(100);
      toast.success('Imagen optimizada y subida correctamente');

    } catch (error: unknown) {
      console.error('Upload error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).message || 'Error al subir la imagen');
      setUploadProgress(0);
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same file again if needed
      event.target.value = '';
    }
  };

  const onFormSubmit = (data: ProductFormValues) => {
    try {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        description: data.description,
        category: data.category,
        basePrice: data.basePrice,
        images: data.images ? [data.images] : [],
        stockBySize: { 'Unique': data.totalStock },
        totalStock: data.totalStock,
        status: 'active',
      };

      onSubmit(productData);
      toast.success(initialData ? 'Producto actualizado' : 'Producto creado');
    } catch {
      toast.error('Error al guardar el producto');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700">Nombre del Producto</Label>
        <Input id="name" {...register('name')} placeholder="Ej: Nike Air Max" className="bg-white border-gray-200 text-gray-900 shadow-sm" />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-700">Categoría</Label>
          <Input id="category" {...register('category')} placeholder="Ej: Zapatillas" className="bg-white border-gray-200 text-gray-900 shadow-sm" />
          {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="basePrice" className="text-gray-700">Precio ($)</Label>
          <Input id="basePrice" type="number" step="0.01" {...register('basePrice')} className="bg-white border-gray-200 text-gray-900 shadow-sm" />
          {errors.basePrice && <p className="text-red-500 text-xs">{errors.basePrice.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalStock" className="text-gray-700">Stock Total</Label>
        <Input id="totalStock" type="number" {...register('totalStock')} className="bg-white border-gray-200 text-gray-900 shadow-sm" />
        {errors.totalStock && <p className="text-red-500 text-xs">{errors.totalStock.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-upload" className="text-gray-700">Imagen del Producto</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="images"
            {...register('images')}
            placeholder="URL de la imagen o subir archivo..."
            className="bg-white border-gray-200 text-gray-900 flex-1 shadow-sm"
            readOnly={uploading}
          />
          <div className="relative">
            <input
              type="file"
              id="image-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleImageUpload}
              disabled={uploading}
              accept="image/png, image/jpeg, image/webp"
            />
            <Button type="button" variant="secondary" disabled={uploading} className="bg-gray-100 hover:bg-gray-200 text-gray-700">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">Formatos: PNG, JPG, WEBP. Máx 5MB (optimizada autom.).</p>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {imageUrl && (
          <div className="mt-2 relative w-full h-40 bg-gray-50 rounded-md overflow-hidden border border-gray-200 group">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setValue('images', '')}
              className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {errors.images && <p className="text-red-500 text-xs">{errors.images.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="description" className="text-gray-700">Descripción</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={generatingDesc}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 h-6 text-xs gap-1.5"
          >
            {generatingDesc ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {generatingDesc ? 'Generando...' : 'Completar con IA'}
          </Button>
        </div>
        <Textarea id="description" {...register('description')} className="bg-white border-gray-200 text-gray-900 min-h-[100px] shadow-sm" />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100" disabled={isSubmitting || uploading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading} className="bg-primary hover:bg-primary/90 text-white shadow-md">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
