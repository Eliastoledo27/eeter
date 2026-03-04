import { NextRequest, NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import ExcelJS from 'exceljs';

export const revalidate = 0;

/**
 * Endpoint especializado para generar un archivo Excel con el formato exacto 
 * de Catálogo de Meta / WhatsApp Business API.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const part = parseInt(searchParams.get('part') || '1');
        const ITEMS_PER_PAGE = 500; // Sin imágenes pesadas incrustadas, podemos subir el límite

        const repo = new SupabaseProductRepository();
        let products = await repo.findAll();
        products = products.filter(p => p.status === 'active');

        // Paginación
        const totalParts = Math.ceil(products.length / ITEMS_PER_PAGE);
        const start = (part - 1) * ITEMS_PER_PAGE;
        const currentBatch = products.slice(start, start + ITEMS_PER_PAGE);

        if (currentBatch.length === 0 && products.length > 0) {
            return NextResponse.json({ error: 'Parte no encontrada' }, { status: 404 });
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('whatsapp_catalog');

        // Columnas oficiales de Meta Catalog (Data Feed)
        // Basadas en el archivo de referencia del usuario
        const columns = [
            { header: 'id', key: 'id' },
            { header: 'title', key: 'title' },
            { header: 'description', key: 'description' },
            { header: 'availability', key: 'availability' },
            { header: 'condition', key: 'condition' },
            { header: 'price', key: 'price' },
            { header: 'link', key: 'link' },
            { header: 'image_link', key: 'image_link' },
            { header: 'brand', key: 'brand' },
            { header: 'google_product_category', key: 'google_product_category' },
            { header: 'fb_product_category', key: 'fb_product_category' },
            { header: 'quantity_to_sell_on_facebook', key: 'quantity_to_sell_on_facebook' },
            { header: 'sale_price', key: 'sale_price' },
            { header: 'sale_price_effective_date', key: 'sale_price_effective_date' },
            { header: 'item_group_id', key: 'item_group_id' },
            { header: 'gender', key: 'gender' },
            { header: 'color', key: 'color' },
            { header: 'size', key: 'size' },
            { header: 'age_group', key: 'age_group' },
            { header: 'material', key: 'material' },
            { header: 'pattern', key: 'pattern' },
            { header: 'shipping', key: 'shipping' },
            { header: 'shipping_weight', key: 'shipping_weight' },
            { header: 'gtin', key: 'gtin' },
        ];

        sheet.columns = columns.map(col => ({ ...col, width: 25 }));

        // Generamos filas
        // Para que WhatsApp maneje talles correctamente, lo ideal es una fila por variante.
        // Pero para simplificar y cumplir con el formato directo solicitado:
        currentBatch.forEach(p => {
            const hasStock = p.totalStock > 0;
            const baseUrl = 'https://eter.store'; // Dominio de producción

            // Creamos una fila base para el producto
            // Si tiene talles, podríamos iterar, pero aquí pondremos los talles concatenados o el primer talle.
            const sizes = Object.keys(p.stockBySize || {});

            // Meta prefiere una fila por talle con el mismo item_group_id.
            // Si no hay talles, solo una fila.
            if (sizes.length > 0) {
                sizes.forEach(size => {
                    if ((p.stockBySize[size] || 0) > 0) {
                        sheet.addRow({
                            id: `${p.id}_${size}`, // ID único por variante
                            title: `${p.name} - Talle ${size}`,
                            description: p.description || p.name,
                            availability: 'in stock',
                            condition: 'new',
                            price: `${p.basePrice}.00 ARS`, // Formato "Precio Moneda"
                            link: `${baseUrl}/c/${p.category.toLowerCase().replace(/\s+/g, '-')}/${p.id}`,
                            image_link: p.images?.[0] || '',
                            brand: 'Éter',
                            google_product_category: 'Apparel & Accessories > Clothing > Shoes',
                            item_group_id: p.id, // Agrupa variantes
                            size: size,
                            age_group: 'adult',
                            gender: 'unisex'
                        });
                    }
                });
            } else {
                sheet.addRow({
                    id: p.id,
                    title: p.name,
                    description: p.description || p.name,
                    availability: hasStock ? 'in stock' : 'out of stock',
                    condition: 'new',
                    price: `${p.basePrice}.00 ARS`,
                    link: `${baseUrl}/c/${p.category.toLowerCase().replace(/\s+/g, '-')}/${p.id}`,
                    image_link: p.images?.[0] || '',
                    brand: 'Éter',
                    google_product_category: 'Apparel & Accessories > Clothing > Shoes',
                    age_group: 'adult',
                    gender: 'unisex'
                });
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename="whatsapp_catalog_eter_part_${part}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
