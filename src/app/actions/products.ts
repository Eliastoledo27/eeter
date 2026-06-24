'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { checkUserPermissions } from '@/utils/supabase/middleware-auth';

export interface ProductType {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    base_price: number;
    images: string[];
    stock_by_size: Record<string, number>;
    is_active: boolean;
    brand?: string | null;
    created_at?: string;
    auraScore?: number;
    liquidation_active?: boolean;
    liquidation_discount_percent?: number;
    liquidation_price?: number;
    liquidation_at?: string;
    product_sections?: Array<'home' | 'catalog' | 'liquidation' | 'flash'> | null;
}

interface SupabaseProduct {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    price: number;
    images: string[];
    stock_by_size: Record<string, number>;
    status: string;
    created_at: string;
    liquidation_active?: boolean;
    liquidation_discount_percent?: number;
    liquidation_price?: number;
    liquidation_at?: string;
}

const bulkProductSchema = z.object({
    name: z.string().min(1, "Nombre es obligatorio"),
    description: z.string().optional(),
    category: z.string().optional().default("General"),
    base_price: z.number().min(0, "Precio debe ser positivo"),
    stock_by_size: z.record(z.string(), z.number().min(0)).optional().default({}),
    image_url: z.string().url().optional()
});

export async function bulkImportProducts(products: Record<string, unknown>[]) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { success: false, error: 'Unauthorized', successCount: 0, errors: [] };
    }

    const supabase = createClient();

    const results = {
        successCount: 0,
        errors: [] as { row: number, error: string }[]
    };

    const validProducts = [];

    for (let i = 0; i < products.length; i++) {
        const row = products[i] as Record<string, string>;
        try {
            const parsed = bulkProductSchema.parse({
                name: row.name || row.Nombre,
                description: row.description || row.Descripcion,
                category: row.category || row.Categoria,
                base_price: Number(row.base_price || row.Precio || 0),
                stock_by_size: typeof row.stock_by_size === 'string' ? JSON.parse(row.stock_by_size) : (row.stock_by_size || {}),
                image_url: row.image_url || row.Imagen
            });

            validProducts.push(parsed);
        } catch (error) {
            if (error instanceof z.ZodError) {
                results.errors.push({ row: i + 1, error: error.issues.map((e) => e.message).join(', ') });
            } else {
                results.errors.push({ row: i + 1, error: 'Invalid format' });
            }
        }
    }

    if (validProducts.length === 0) {
        return { ...results, success: false, message: 'No valid products found to import.' };
    }

    const dbPayload = validProducts.map(p => ({
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.base_price,
        images: p.image_url ? [p.image_url] : [],
        stock_by_size: p.stock_by_size,
        stock: Object.values(p.stock_by_size).reduce((a: number, b: unknown) => Number(a) + Number(b), 0),
        status: 'activo'
    }));

    const { error } = await supabase.from('productos').insert(dbPayload);

    if (error) {
        return { success: false, error: 'Failed to insert products into database', successCount: 0, errors: results.errors };
    }

    results.successCount = validProducts.length;

    revalidatePath('/');
    revalidatePath('/dashboard/products');

    return { success: true, ...results };
}

export async function bulkUpdateProducts(updates: { id: string, data: Partial<ProductType> }[]) {
    try {
        let permResult = await checkUserPermissions();

        // Retry once if occasionally failing due to network glitch
        if (!permResult.user) {
            await new Promise(res => setTimeout(res, 500));
            permResult = await checkUserPermissions();
        }

        const { user, isAdmin, isStaff, error: permError } = permResult;

        if (!user || (!isAdmin && !isStaff)) {
            return {
                success: false,
                error: `Autorización denegada: ${permError || 'Permisos insuficientes'}`
            };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createSupabaseAdmin(
            supabaseUrl!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnon!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        console.log(`[bulkUpdateProducts] Processing ${updates.length} updates...`);
        let successCount = 0;
        const errors: { id?: string; error: string }[] = [];

        // Sequential processing for reliability with improved data sanitization
        for (const update of updates) {
            const { id, data } = update;
            if (!id) continue;

            const dbUpdate: Record<string, unknown> = {};

            if (data.name) dbUpdate.name = data.name.trim();
            if (data.category) dbUpdate.category = data.category.trim();
            if (data.description !== undefined) dbUpdate.description = data.description;
            if (data.base_price !== undefined) dbUpdate.price = Number(data.base_price);

            if (data.stock_by_size) {
                const cleanStock = typeof data.stock_by_size === 'object' ? data.stock_by_size : {};
                dbUpdate.stock_by_size = cleanStock;

                // Precise stock total calculation
                dbUpdate.stock = Object.values(cleanStock).reduce((acc: number, val: unknown) => {
                    const n = Number(val);
                    return acc + (isNaN(n) ? 0 : n);
                }, 0);
            }

            if (data.is_active !== undefined) {
                dbUpdate.status = data.is_active ? 'activo' : 'inactivo';
            }

            if (Object.keys(dbUpdate).length === 0) {
                successCount++;
                continue;
            }

            console.log(`[bulkUpdateProducts] Updating product ${id}:`, dbUpdate);

            const { error } = await supabase
                .from('productos')
                .update(dbUpdate)
                .eq('id', id);

            if (error) {
                errors.push({ id, error: error.message });
            } else {
                successCount++;
            }
        }

        // Parallel revalidation
        console.log(`[bulkUpdateProducts] Update complete. Success: ${successCount}, Errors: ${errors.length}`);
        const paths = ['/', '/dashboard/products', '/c/catalogorev', '/catalog', '/catalog/best'];
        paths.forEach(path => {
            try {
                revalidatePath(path);
            } catch (e) {
                console.error(`Error revalidating path ${path}:`, e);
            }
        });

        return {
            success: errors.length === 0,
            successCount,
            errors,
            message: errors.length > 0 ? `Error en ${errors.length} ítems.` : 'Sincronización completa.'
        };
    } catch (error: any) {
        console.error('CRITICAL ERROR in bulkUpdateProducts:', error);
        return {
            success: false,
            error: error?.message || 'Error de conexión',
            details: 'No se pudo completar la sincronización con la base de datos.'
        };
    }
}

export async function bulkDeleteProducts(ids: string[]) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { error: 'Unauthorized' };
    }

    const supabase = createClient();

    const { error } = await supabase
        .from('productos')
        .delete()
        .in('id', ids);

    if (error) {
        return { error: 'Failed to delete products' };
    }

    revalidatePath('/');
    revalidatePath('/dashboard/products');

    return { success: true, count: ids.length };
}

export async function getProducts(
    query?: string,
    category?: string,
    status: 'active' | 'inactive' | 'all' = 'active',
    options?: { limit?: number }
) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
        console.error('Environment variables for Supabase are missing');
        return [];
    }

    const supabase = createSupabaseAdmin(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnon,
        {
            auth: { autoRefreshToken: false, persistSession: false }
        }
    );

    try {
        let dbQuery = supabase
            .from('productos')
            .select('id,name,description,category,price,images,stock_by_size,status,created_at,liquidation_active,liquidation_discount_percent,liquidation_price,liquidation_at')
            .order('created_at', { ascending: false });

        if (status === 'active') dbQuery = dbQuery.eq('status', 'activo');
        if (status === 'inactive') dbQuery = dbQuery.eq('status', 'inactivo');
        if (query) dbQuery = dbQuery.ilike('name', `%${query.trim()}%`);
        if (category && category !== 'Todos') dbQuery = dbQuery.eq('category', category);
        if (options?.limit && options.limit > 0) dbQuery = dbQuery.limit(options.limit);

        const { data, error } = await dbQuery;

        if (error) throw error;
        if (!data) return [];

        return data.map((p: any) => ({
            id: p.id,
            name: p.name || 'Producto sin nombre',
            description: p.description || '',
            category: p.category || 'General',
            base_price: Number(p.price || 0),
            images: Array.isArray(p.images) ? p.images : [],
            stock_by_size: p.stock_by_size || {},
            is_active: p.status === 'activo',
            created_at: p.created_at,
            liquidation_active: !!p.liquidation_active,
            liquidation_discount_percent: Number(p.liquidation_discount_percent || 0),
            liquidation_price: Number(p.liquidation_price || 0),
            liquidation_at: p.liquidation_at
        })) as ProductType[];
    } catch (e) {
        console.error('Error fetching products:', e);
        return [];
    }
}

export async function createProduct(formData: FormData) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { error: 'Unauthorized' };
    }

    const supabase = createClient();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const stockStr = formData.get('stock_by_size') as string;
    const stock_by_size = stockStr ? JSON.parse(stockStr) : {};
    const isActive = formData.get('is_active') === 'true';

    const imageFile = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `products/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, imageFile);

        if (!uploadError) {
            const { data } = supabase.storage.from('products').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        } else {
            console.error('Storage upload error:', uploadError);
        }
    } else if (!imageUrl) {
        imageUrl = 'https://placehold.co/600x600?text=No+Image';
    }

    const newProduct = {
        name,
        description,
        category,
        price: base_price,
        images: [imageUrl],
        stock_by_size,
        stock: Object.values(stock_by_size).reduce((a: number, b: unknown) => Number(a) + Number(b), 0),
        status: isActive ? 'activo' : 'inactivo'
    };

    const { data, error } = await supabase
        .from('productos')
        .insert(newProduct)
        .select()
        .single();

    if (error) {
        console.error('Create product error:', error);
        return { error: `Error al crear producto: ${error.message}` };
    }

    revalidatePath('/');
    revalidatePath('/dashboard/products');

    const createdProduct: ProductType = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        base_price: data.price,
        images: data.images,
        stock_by_size: data.stock_by_size,
        is_active: data.status === 'activo',
        created_at: data.created_at
    };

    return { success: true, product: createdProduct };
}

export async function updateProduct(id: string, formData: FormData) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { error: 'Unauthorized' };
    }

    const supabase = createClient();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const stockStr = formData.get('stock_by_size') as string;
    const stock_by_size = stockStr ? JSON.parse(stockStr) : {};
    const isActive = formData.get('is_active') === 'true';
    let imageUrl = formData.get('image_url') as string;
    const imageFile = formData.get('image_file') as File;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `products/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, imageFile);

        if (!uploadError) {
            const { data } = supabase.storage.from('products').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }
    }

    const updates = {
        name,
        description,
        category,
        price: base_price,
        stock_by_size,
        stock: Object.values(stock_by_size).reduce((a: number, b: unknown) => Number(a) + Number(b), 0),
        images: [imageUrl],
        status: isActive ? 'activo' : 'inactivo'
    };

    const { error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { error: 'Failed to update product' };
    }

    // Get updated product to return
    const { data: updatedData } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

    revalidatePath('/');
    revalidatePath('/dashboard/products');

    const updatedProduct: ProductType = {
        id: updatedData.id,
        name: updatedData.name,
        description: updatedData.description,
        category: updatedData.category,
        base_price: updatedData.price,
        images: updatedData.images,
        stock_by_size: updatedData.stock_by_size,
        is_active: updatedData.status === 'activo',
        created_at: updatedData.created_at
    };

    return { success: true, product: updatedProduct };
}

export async function deleteProduct(id: string) {
    const { user, isAdmin, isStaff } = await checkUserPermissions();

    if (!user || (!isAdmin && !isStaff)) {
        return { error: 'Unauthorized' };
    }

    const supabase = createClient();

    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

    if (error) {
        return { error: 'Failed to delete product' };
    }

    revalidatePath('/');
    revalidatePath('/dashboard/products');
    return { success: true };
}

export async function getCategories() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) return [];

    const supabase = createSupabaseAdmin(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnon,
        {
            auth: { autoRefreshToken: false, persistSession: false }
        }
    );
    const { data, error } = await supabase
        .from('productos')
        .select('category')
        .not('category', 'is', null);

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return uniqueCategories.sort();
}
export async function getProductsByIds(ids: string[]) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error('Error fetching products by ids:', error);
        return [];
    }

    const mappedData = data.map((p: SupabaseProduct) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        base_price: p.price,
        images: p.images || [],
        stock_by_size: p.stock_by_size || {},
        is_active: p.status === 'activo',
        created_at: p.created_at
    }));

    return mappedData as ProductType[];
}
