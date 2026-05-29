/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Inicializar cliente de Supabase usando claves de servidor para bypass de RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ADMIN_KEY = (process.env.ADMIN_API_KEY || "Feter").replace(/^"|"$/g, '');

// Cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Verificación segura de la firma en la cabecera
function isAuthorized(req: Request): boolean {
    const authHeader = req.headers.get('Authorization');
    const adminHeader = req.headers.get('x-admin-token');
    if (!authHeader && !adminHeader) return false;
    
    const token = (adminHeader || authHeader?.replace('Bearer ', '') || '').trim().replace(/^"|"$/g, '');
    const normalizeToken = (value: string) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace('Ã©', 'e')
        .replace('Ã‰', 'E');

    return normalizeToken(token) === normalizeToken(ADMIN_KEY);
}

// Función auxiliar para revalidar la caché de Next.js en tiempo real
async function triggerRevalidation() {
    try {
        console.log('🔄 Iniciando revalidación de caché en Next.js...');
        
        // Revalidar rutas fijas principales
        const generalPaths = ['/', '/catalog', '/dashboard/products', '/c/catalogorev'];
        generalPaths.forEach(path => {
            try {
                revalidatePath(path);
            } catch (e) {
                console.error(`Error revalidando ruta ${path}:`, e);
            }
        });

        // Obtener todos los reseller slugs activos y revalidar sus catálogos correspondientes
        const { data: profiles } = await supabase
            .from('profiles')
            .select('reseller_slug')
            .not('reseller_slug', 'is', null);

        if (profiles) {
            profiles.forEach((p: any) => {
                if (p.reseller_slug) {
                    try {
                        revalidatePath(`/c/${p.reseller_slug}`);
                        revalidatePath(`/c/${p.reseller_slug}/[productId]`, 'page');
                    } catch (e) {
                        console.error(`Error revalidando catálogo /c/${p.reseller_slug}:`, e);
                    }
                }
            });
        }
        console.log('✅ Revalidación de caché de Next.js completada.');
    } catch (revalError) {
        console.error('❌ Error general durante el proceso de revalidación:', revalError);
    }
}

function getStockBySize(input: any): Record<string, number> {
    return input?.stock_by_size || input?.stockBySize || {};
}

function getTotalStock(stockBySize: Record<string, number>): number {
    return Object.values(stockBySize).reduce((total, value) => total + (Number(value) || 0), 0);
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        if (url.searchParams.get('revalidate') === 'true') {
            await triggerRevalidation();
            return NextResponse.json({ success: true, message: 'Caché de Next.js revalidada correctamente' });
        }

        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Formateamos la respuesta para facilitar su lectura en la App Celular
        const formatted = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            category: p.category || 'Otros',
            price: Number(p.price) || 0,
            images: p.images || (p.image ? [p.image] : []),
            stock_by_size: p.stock_by_size || {},
            stock: Number(p.stock) || 0,
            status: p.status || 'activo',
            brand: p.brand || 'Éter',
            product_sections: Array.isArray(p.product_sections) ? p.product_sections : ['catalog']
        }));

        return NextResponse.json(formatted, {
            headers: {
                'Cache-Control': 'no-store'
            }
        });
    } catch (error: any) {
        console.error('❌ Féter Admin GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, productId, stockBySize, productData, bulkProducts, fileName, contentType, base64Data } = body;

        // ACCIÓN 1: Actualización de stock por talle en tiempo real (y opcionalmente precio y nombre)
        if (action === 'update_stock' && productId) {
            const normalizedStockBySize = stockBySize || {};
            const updates: Record<string, any> = {
                stock_by_size: normalizedStockBySize,
                stock: getTotalStock(normalizedStockBySize),
                updated_at: new Date().toISOString()
            };

            if (body.price !== undefined && body.price !== null) {
                updates.price = Number(body.price);
            }
            if (body.name !== undefined && body.name !== null) {
                updates.name = body.name.trim();
            }
            if (body.brand !== undefined && body.brand !== null) {
                updates.brand = body.brand.trim();
            }
            if (body.category !== undefined && body.category !== null) {
                updates.category = body.category.trim();
            }
            if (body.description !== undefined && body.description !== null) {
                updates.description = body.description.trim();
            }
            if (body.status !== undefined && body.status !== null) {
                updates.status = body.status.trim();
            }
            if (Array.isArray(body.productSections) || Array.isArray(body.product_sections)) {
                const sections = body.productSections || body.product_sections;
                updates.product_sections = sections.length ? sections : ['catalog'];
            }

            const { data, error } = await supabase
                .from('productos')
                .update(updates)
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;

            // Disparar revalidación de caché asíncrona
            await triggerRevalidation();

            return NextResponse.json({ success: true, product: data });
        }

        if (action === 'upload_image' && fileName && contentType && base64Data) {
            const safeFileName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = `products/${Date.now()}_${safeFileName}`;
            const fileBuffer = Buffer.from(String(base64Data), 'base64');

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, fileBuffer, {
                    contentType: String(contentType),
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('products').getPublicUrl(filePath);
            return NextResponse.json({ success: true, imageUrl: data.publicUrl });
        }

        // ACCIÓN 2: Creación manual de producto
        if (action === 'create' && productData) {
            const normalizedStockBySize = getStockBySize(productData);
            const images = productData.images || (productData.image ? [productData.image] : []);
            const { data, error } = await supabase
                .from('productos')
                .insert({
                    name: productData.name,
                    description: productData.description || '',
                    category: productData.category || 'Otros',
                    price: Number(productData.price) || 0,
                    images,
                    image: images[0] || null,
                    stock_by_size: normalizedStockBySize,
                    stock: getTotalStock(normalizedStockBySize),
                    status: productData.status || 'activo',
                    brand: productData.brand || 'Éter',
                    product_sections: Array.isArray(productData.productSections) && productData.productSections.length
                        ? productData.productSections
                        : Array.isArray(productData.product_sections) && productData.product_sections.length
                            ? productData.product_sections
                            : ['catalog'],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Disparar revalidación de caché asíncrona
            await triggerRevalidation();

            return NextResponse.json({ success: true, product: data });
        }

        // ACCIÓN 3: Carga y Actualización Masiva (Bulk Stock Load)
        if (action === 'bulk_load' && bulkProducts) {
            const results = [];

            for (const item of bulkProducts) {
                const normalizedStockBySize = getStockBySize(item);
                // Si viene un ID, actualizamos; de lo contrario insertamos
                if (item.id) {
                    const { data, error } = await supabase
                        .from('productos')
                        .update({
                            stock_by_size: normalizedStockBySize,
                            stock: getTotalStock(normalizedStockBySize),
                            price: item.price ? Number(item.price) : undefined,
                            status: item.status || undefined,
                            product_sections: Array.isArray(item.productSections) && item.productSections.length
                                ? item.productSections
                                : Array.isArray(item.product_sections) && item.product_sections.length
                                    ? item.product_sections
                                    : undefined,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', item.id)
                        .select();

                    if (!error && data && data[0]) {
                        results.push(data[0]);
                    }
                } else {
                    const { data, error } = await supabase
                        .from('productos')
                        .insert({
                            name: item.name,
                            description: item.description || '',
                            category: item.category || 'Otros',
                            price: Number(item.price) || 0,
                            images: item.images || [],
                            image: item.images?.[0] || null,
                            stock_by_size: normalizedStockBySize,
                            stock: getTotalStock(normalizedStockBySize),
                            status: item.status || 'activo',
                            brand: item.brand || 'Éter',
                            product_sections: Array.isArray(item.productSections) && item.productSections.length
                                ? item.productSections
                                : Array.isArray(item.product_sections) && item.product_sections.length
                                    ? item.product_sections
                                    : ['catalog'],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select();

                    if (!error && data && data[0]) {
                        results.push(data[0]);
                    }
                }
            }

            // Disparar revalidación de caché asíncrona
            await triggerRevalidation();

            return NextResponse.json({ success: true, count: results.length, items: results });
        }

        return NextResponse.json({ error: 'Acción no soportada o parámetros incompletos' }, { status: 400 });
    } catch (error: any) {
        console.error('❌ Féter Admin POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
