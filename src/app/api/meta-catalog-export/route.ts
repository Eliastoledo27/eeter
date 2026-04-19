import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkUserPermissions } from '@/utils/supabase/middleware-auth'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ─── AI Description Generator ──────────────────────────────────────
// Generates professional Meta-ready descriptions for each product
// Uses Gemini Flash API if available, otherwise falls back to smart templates

interface ProductRow {
    id: string
    name: string
    description: string | null
    category: string | null
    price: number
    images: string[]
    stock_by_size: Record<string, number>
    status: string
}

function generateLocalDescription(product: ProductRow): string {
    const stockBySize = product.stock_by_size || {}
    const availableSizes = Object.entries(stockBySize)
        .filter(([, qty]) => qty > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b))

    const price = Number(product.price).toLocaleString('es-AR')
    const category = product.category || 'Calzado'
    const name = product.name

    // Smart description based on product type
    const sizesText = availableSizes.length > 0
        ? `Talles disponibles: ${availableSizes.join(', ')}.`
        : 'Consultar disponibilidad de talles.'

    const descriptions = [
        `${name} de ÉTER — ${category} premium diseñado para quienes buscan estilo y comodidad sin compromiso. ${sizesText} Precio: $${price} ARS. Envíos a todo el país. Calidad garantizada ÉTER Original.`,
        `Descubrí el ${name} de ÉTER, la nueva referencia en ${category.toLowerCase()} urbano de alta gama. Confección de primera calidad con materiales seleccionados. ${sizesText} $${price} ARS. Envío rápido a todo Argentina.`,
        `${name} — Colección ÉTER. ${category} de diseño exclusivo con terminaciones premium. Ideal para el día a día con un toque de distinción. ${sizesText} Precio: $${price} ARS. Compra segura y envío nacional.`,
    ]

    // Use a deterministic selection based on product ID hash
    const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return descriptions[hash % descriptions.length]
}

async function generateAIDescriptions(products: ProductRow[], clientApiKey?: string | null): Promise<Map<string, string>> {
    const descriptions = new Map<string, string>()
    const apiKey = clientApiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
        // Fallback to local template descriptions
        for (const product of products) {
            descriptions.set(product.id, generateLocalDescription(product))
        }
        return descriptions
    }

    // Use Gemini Flash (free tier) - batch products to minimize API calls
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)

        const prompt = `Eres un copywriter profesional para ÉTER, una marca premium de calzado urbano en Argentina. 
Genera una descripción atractiva en español para cada producto del catálogo para usar en Meta Commerce (Facebook/Instagram Shopping).
Cada descripción debe mencionar:
- El nombre del modelo
- Los talles disponibles 
- El precio en ARS
- Que es marca ÉTER, calzado premium
- Ser concisa (máximo 150 palabras)
- No usar emojis

Productos:
${batch.map(p => {
    const sizes = Object.entries(p.stock_by_size || {})
        .filter(([, qty]) => qty > 0)
        .map(([size]) => size)
        .sort((a, b) => Number(a) - Number(b))
    return `- ID: ${p.id} | Nombre: ${p.name} | Categoría: ${p.category || 'Calzado'} | Precio: $${Number(p.price).toLocaleString('es-AR')} ARS | Talles disponibles: ${sizes.join(', ') || 'Sin stock'}`
}).join('\n')}

Responde SOLO en formato JSON como un array de objetos con "id" (el ID del producto) y "description" (la descripción generada). Sin markdown, sin bloques de código.`

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4096,
                        }
                    })
                }
            )

            if (response.ok) {
                const data = await response.json()
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

                // Parse JSON from response (handle possible markdown wrapping)
                const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
                try {
                    const parsed = JSON.parse(jsonStr) as Array<{ id: string; description: string }>
                    for (const item of parsed) {
                        descriptions.set(item.id, item.description)
                    }
                } catch {
                    console.warn('Failed to parse AI response, using local fallback for batch')
                    for (const product of batch) {
                        if (!descriptions.has(product.id)) {
                            descriptions.set(product.id, generateLocalDescription(product))
                        }
                    }
                }
            } else {
                console.warn('Gemini API error, using local fallback:', response.status)
                for (const product of batch) {
                    descriptions.set(product.id, generateLocalDescription(product))
                }
            }
        } catch (err) {
            console.warn('Gemini API fetch error, using local fallback:', err)
            for (const product of batch) {
                descriptions.set(product.id, generateLocalDescription(product))
            }
        }
    }

    // Ensure all products have descriptions (fill gaps with local)
    for (const product of products) {
        if (!descriptions.has(product.id)) {
            descriptions.set(product.id, generateLocalDescription(product))
        }
    }

    return descriptions
}

// ─── Main Handler ──────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        // Verify admin permissions
        const { user, isAdmin } = await checkUserPermissions()

        if (!user || !isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            )
        }

        // Extract client-side API key from header
        const clientApiKey = request.headers.get('x-gemini-key');

        // Fetch all products
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )

        const { data: products, error } = await supabase
            .from('productos')
            .select('id, name, description, category, price, images, stock_by_size, status')
            .order('name')

        if (error || !products) {
            return NextResponse.json(
                { error: 'Failed to fetch products', details: error?.message },
                { status: 500 }
            )
        }

        // Generate AI descriptions
        const descriptions = await generateAIDescriptions(products as ProductRow[], clientApiKey)

        // Build XLSX rows — one row per product variant (size)
        const storeUrl = 'https://éter.store'
        const rows: Record<string, string | number>[] = []

        for (const product of products) {
            const p = product as ProductRow
            const stockBySize = p.stock_by_size || {}
            const sizes = Object.keys(stockBySize).sort((a, b) => Number(a) - Number(b))
            const aiDescription = descriptions.get(p.id) || p.description || ''
            const imageLink = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : ''
            const additionalImages = Array.isArray(p.images) && p.images.length > 1
                ? p.images.slice(1, 10).join(',')
                : ''
            const price = `${Number(p.price).toFixed(2)} ARS`
            const category = p.category || 'Calzado'
            const productLink = `${storeUrl}/catalog`

            if (sizes.length === 0) {
                // Product with no sizes — single row
                rows.push({
                    'id': p.id,
                    'title': p.name,
                    'description': aiDescription,
                    'availability': 'out of stock',
                    'condition': 'new',
                    'price': price,
                    'link': productLink,
                    'image_link': imageLink,
                    'additional_image_link': additionalImages,
                    'brand': 'ÉTER',
                    'google_product_category': 'Apparel & Accessories > Shoes',
                    'fb_product_category': 'Shoes',
                    'size': '',
                    'color': '',
                    'item_group_id': p.id,
                    'gender': 'unisex',
                    'age_group': 'adult',
                    'material': '',
                    'pattern': '',
                    'product_type': category,
                    'sale_price': '',
                    'sale_price_effective_date': '',
                    'custom_label_0': category,
                    'custom_label_1': p.status === 'activo' ? 'Active' : 'Inactive',
                    'status': p.status === 'activo' ? 'active' : 'archived',
                })
            } else {
                // One row per size variant
                for (const size of sizes) {
                    const stock = Number(stockBySize[size]) || 0
                    const availability = stock > 0 ? 'in stock' : 'out of stock'
                    const variantId = `${p.id}_${size}`

                    rows.push({
                        'id': variantId,
                        'title': `${p.name} - Talle ${size}`,
                        'description': aiDescription,
                        'availability': availability,
                        'inventory': stock,
                        'condition': 'new',
                        'price': price,
                        'link': productLink,
                        'image_link': imageLink,
                        'additional_image_link': additionalImages,
                        'brand': 'ÉTER',
                        'google_product_category': 'Apparel & Accessories > Shoes',
                        'fb_product_category': 'Shoes',
                        'size': size,
                        'color': '',
                        'item_group_id': p.id,
                        'gender': 'unisex',
                        'age_group': 'adult',
                        'material': '',
                        'pattern': '',
                        'product_type': category,
                        'sale_price': '',
                        'sale_price_effective_date': '',
                        'custom_label_0': category,
                        'custom_label_1': stock > 0 ? 'In Stock' : 'Out of Stock',
                        'status': p.status === 'activo' ? 'active' : 'archived',
                    })
                }
            }
        }

        // Create XLSX workbook
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(rows)

        // Set column widths for better readability
        ws['!cols'] = [
            { wch: 40 },  // id
            { wch: 45 },  // title
            { wch: 80 },  // description
            { wch: 14 },  // availability
            { wch: 10 },  // inventory
            { wch: 10 },  // condition
            { wch: 18 },  // price
            { wch: 35 },  // link
            { wch: 60 },  // image_link
            { wch: 60 },  // additional_image_link
            { wch: 10 },  // brand
            { wch: 35 },  // google_product_category
            { wch: 20 },  // fb_product_category
            { wch: 8 },   // size
            { wch: 10 },  // color
            { wch: 40 },  // item_group_id
            { wch: 10 },  // gender
            { wch: 10 },  // age_group
            { wch: 15 },  // material
            { wch: 15 },  // pattern
            { wch: 15 },  // product_type
            { wch: 18 },  // sale_price
            { wch: 30 },  // sale_price_effective_date
            { wch: 15 },  // custom_label_0
            { wch: 15 },  // custom_label_1
            { wch: 10 },  // status
        ]

        XLSX.utils.book_append_sheet(wb, ws, 'Meta Catalog')

        // Generate buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        // Format filename with timestamp
        const now = new Date()
        const timestamp = now.toISOString().replace(/T/, ' ').replace(/:/g, '_').split('.')[0]
        const filename = `catalog_products_${timestamp}.xlsx`

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        })
    } catch (err: unknown) {
        console.error('Meta Catalog Export Error:', err)
        return NextResponse.json(
            { error: 'Failed to generate catalog export', details: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
