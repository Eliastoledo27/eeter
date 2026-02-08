'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface ProductType {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    base_price: number;
    images: string[];
    stock_by_size: Record<string, number>;
    is_active: boolean;
    created_at?: string;
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized', successCount: 0, errors: [] };
    }

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    let successCount = 0;
    const errors = [];

    for (const update of updates) {
        const { id, data } = update;

        const dbUpdate: Record<string, unknown> = {};
        if (data.name) dbUpdate.name = data.name;
        if (data.base_price !== undefined) dbUpdate.price = data.base_price;
        if (data.stock_by_size) {
            dbUpdate.stock_by_size = data.stock_by_size;
            dbUpdate.stock = Object.values(data.stock_by_size).reduce((a: number, b: unknown) => Number(a) + Number(b), 0);
        }
        if (data.description) dbUpdate.description = data.description;
        if (data.is_active !== undefined) {
            dbUpdate.status = data.is_active ? 'activo' : 'inactivo';
        }

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

    revalidatePath('/');
    revalidatePath('/dashboard/products');

    return { success: true, successCount, errors };
}

export async function bulkDeleteProducts(ids: string[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

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
    status: 'active' | 'inactive' | 'all' = 'active'
) {
    let supabase = createClient();

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabase = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
    }

    let dbQuery = supabase
        .from('productos')
        .select('id, name, description, category, price, images, stock_by_size, status, created_at')
        .order('created_at', { ascending: false });

    if (status === 'active') {
        dbQuery = dbQuery.eq('status', 'activo');
    }

    if (status === 'inactive') {
        dbQuery = dbQuery.eq('status', 'inactivo');
    }

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    if (category && category !== 'Todos') {
        dbQuery = dbQuery.eq('category', category);
    }

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Fetch products error:', error);
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

export async function createProduct(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const stockStr = formData.get('stock_by_size') as string;
    const stock_by_size = stockStr ? JSON.parse(stockStr) : {};

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
        status: 'activo'
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const base_price = parseFloat(formData.get('base_price') as string);
    const stockStr = formData.get('stock_by_size') as string;
    const stock_by_size = stockStr ? JSON.parse(stockStr) : {};
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
        images: [imageUrl]
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

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
