import { NextRequest, NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import ExcelJS from 'exceljs';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const part = parseInt(searchParams.get('part') || '1');
        const ITEMS_PER_PAGE = 500;

        const repo = new SupabaseProductRepository();
        let products = await repo.findAll();
        products = products.filter(p => p.status === 'active');

        const start = (part - 1) * ITEMS_PER_PAGE;
        const currentBatch = products.slice(start, start + ITEMS_PER_PAGE);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('whatsapp_catalog');

        // Definición de columnas exactas según la imagen
        const metaColumns = [
            { key: "id", header2: "id", header1: "# Obligatorio | Identificador de contenido único del artículo. Se recomienda usar el SKU del artículo. Cada identificador de contenido debe aparecer una sola vez en el catálogo. Para publicar anuncios dinámicos; este identificador debe coincidir exactamente con el identificador de contenido del mismo artículo en el código del píxel de Facebook. Límite de caracteres: 100." },
            { key: "title", header2: "title", header1: "# Obligatorio | A specific and relevant title for the item. See title specifications: https://www.facebook.com/business/help/2104231189874655 Character limit: 200" },
            { key: "description", header2: "description", header1: "# Obligatorio | A short and relevant description of the item. Include specific or unique product features like material or color. Use plain text and don't enter text in all capital letters. See description specifications: https://www.facebook.com/business/help/2302017289821154 Character limit: 9999" },
            { key: "availability", header2: "availability", header1: "# Obligatorio | The current availability of the item. | Valores compatibles: in stock; out of stock" },
            { key: "condition", header2: "condition", header1: "# Obligatorio | The current condition of the item. | Valores compatibles: new; used" },
            { key: "price", header2: "price", header1: "# Obligatorio | The price of the item. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don't use a comma." },
            { key: "link", header2: "link", header1: "# Obligatorio | URL de la página del producto específica donde las personas pueden comprar el artículo." },
            { key: "image_link", header2: "image_link", header1: "# Obligatorio | URL de la imagen principal de tu artículo. Las imágenes deben estar en un formato compatible (JPG/GIF/PNG) y su tamaño debe ser de 500 x 500 píxeles como mínimo." },
            { key: "brand", header2: "brand", header1: "# Obligatorio | Marca del artículo. Límite de caracteres: 100." },
            { key: "google_product_category", header2: "google_product_category", header1: "# Opcional | Categoría de productos de Google para el artículo. Obtén más información sobre las categorías de productos: https://www.facebook.com/business/help/526764014610932." },
            { key: "fb_product_category", header2: "fb_product_category", header1: "# Opcional | Categoría de productos de Facebook para el artículo. Obtén más información sobre las categorías de productos: https://www.facebook.com/business/help/526764014610932." },
            { key: "quantity_to_sell_on_facebook", header2: "quantity_to_sell_on_facebook", header1: "# Opcional | The quantity of this item you have to sell on Facebook and Instagram with checkout. Must be 1 or higher or the item won't be buyable" },
            { key: "sale_price", header2: "sale_price", header1: "# Opcional | The discounted price of the item if it's on sale. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don't use a comma. A sale price is required if you want to use an overlay for discounted prices." },
            { key: "sale_price_effective_date", header2: "sale_price_effective_date", header1: "# Opcional | Intervalo del período de oferta; incluidas la fecha y la hora o zona horaria del inicio y la finalización de la oferta. Si no ingresas las fechas; los artículos con el campo \"sale_price\" permanecerán en oferta hasta que elimines el precio de oferta. Usa este formato: YYYY-MM-DDT23:59+00:00/YYYY-MM-DDT23:59+00:00. Ingresa la fecha de inicio de la siguiente manera: YYYY-MM-DD. Escribe una \"T\". A continuación; ingresa la hora de inicio en formato de 24 horas (00:00 a 23:59) seguida de la zona horaria UTC (-12:00 a +14:00). Escribe una barra (\"/\") y repite el mismo formato para la fecha y hora de finalización. En la siguiente fila de ejemplo se usa la zona horaria del Pacífico (-08:00)." },
            { key: "item_group_id", header2: "item_group_id", header1: "# Opcional | Use this field to create variants of the same item. Enter the same group ID for all variants within a group. Learn more about variants: https://www.facebook.com/business/help/2256580051262113 Character limit: 100." },
            { key: "gender", header2: "gender", header1: "# Opcional | Género de una persona a la que se dirige el artículo. | Valores compatibles: female; male; unisex" },
            { key: "color", header2: "color", header1: "# Opcional | Color del artículo. Usa una o más palabras para describir el color. No uses un código hexadecimal. Límite de caracteres: 200." },
            { key: "size", header2: "size", header1: "# Opcional | Tamaño o talle del artículo escrito como una palabra; abreviatura o número. Por ejemplo: pequeño; XL o 12. Límite de caracteres: 200." },
            { key: "age_group", header2: "age_group", header1: "# Opcional | Grupo de edad al que se dirige el artículo. | Valores compatibles: adult; all ages; infant; kids; newborn; teen; toddler" },
            { key: "material", header2: "material", header1: "# Opcional | Material con el que se fabricó el artículo; como algodón; denim o cuero. Límite de caracteres: 200." },
            { key: "pattern", header2: "pattern", header1: "# Opcional | Estampado o impresión gráfica del artículo. Límite de caracteres: 100." },
            { key: "shipping", header2: "shipping", header1: "# Opcional | Detalles de envío del artículo; con el siguiente formato: \"País:Región:Servicio:Precio\". Incluye el código de divisa ISO 4217 de 3 letras en el precio. Para usar el texto superpuesto \"Envío gratuito\" en tus anuncios; ingresa un precio de \"0.0\". Usa punto y coma \";\" o coma \";\" para separar varios detalles de envío para distintas regiones o países. Solo las personas de una región o país especificado verán los detalles de envío correspondientes a su ubicación. Puedes omitir la región (conserva ambos signos \"::\") si los detalles de envío son los mismos para todo el país." },
            { key: "shipping_weight", header2: "shipping_weight", header1: "# Opcional | Peso del envío del artículo. Incluye la unidad de medida (lb/oz/g/kg)." },
            { key: "video_url", header2: "video[0].url", header1: "#Opcional | La URL de un video de tu producto. El enlace debe dirigirse a un archivo de video ubicado en un sitio web de alojamiento de archivos; no un reproductor de videos. Los videos deben estar en un formato compatible (.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob o .wmv)." },
            { key: "video_tag", header2: "video[0].tag[0]", header1: "#Opcional | La URL de un video de tu producto. El enlace debe dirigirse a un archivo de video ubicado en un sitio web de alojamiento de archivos; no un reproductor de videos. Los videos deben estar en un formato compatible (.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob o .wmv)." },
            { key: "gtin", header2: "gtin", header1: "# Opcional | Número mundial de artículo comercial (GTIN) del artículo. Se recomienda para ayudar a clasificar el artículo. Puede aparecer en el código de barras; en el embalaje o en la tapa del libro. Indica el GTIN solo si sabes con seguridad que es el correcto. Los tipos de GTIN incluyen: UPC (12 dígitos); EAN (13 dígitos); JAN (8 o 13 dígitos); ISBN (13 dígitos) o ITF-14 (14 dígitos)." },
            { key: "tag0", header2: "product_tags[0]", header1: "# Opcional | Add labels to products to help filter them into product sets. Max characters: 110 per label; 5000 labels per product" },
            { key: "tag1", header2: "product_tags[1]", header1: "# Opcional | Add labels to products to help filter them into product sets. Max characters: 110 per label; 5000 labels per product" },
            { key: "style", header2: "style[0]", header1: "# Opcional | Describe el estilo del artículo." },
        ];

        // 1. Insertar Fila 1 (Instrucciones # Obligatorio / # Opcional)
        const row1 = sheet.addRow(metaColumns.map(c => c.header1));
        row1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
        row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B5998' } }; // Azul Meta/Facebook
        row1.height = 60; // Dar espacio a las instrucciones largas
        row1.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

        // 2. Insertar Fila 2 (Nombres de campos: id, title, etc)
        const row2 = sheet.addRow(metaColumns.map(c => c.header2));
        row2.font = { bold: true, color: { argb: 'FF333333' } };
        row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF1' } };

        // Mapeamos las columnas del sheet para que ExcelJS pueda usar row.getCell y sheet.addRow con objetos
        sheet.columns = metaColumns.map((c, i) => ({
            key: c.key,
            width: Math.min(Math.max(c.header2.length, 15), 40) // Ajuste dinámico de ancho
        }));

        // 3. Insertar datos
        currentBatch.forEach(p => {
            const baseUrl = 'https://xn--ter-9la.store';
            const sizes = Object.keys(p.stockBySize || {});

            const imageUrl = p.images?.[0] || '';
            const optimizedImageUrl = imageUrl
                ? `${baseUrl}/_next/image?url=${encodeURIComponent(imageUrl)}&w=3840&q=75`
                : '';

            const commonData = {
                description: p.description || p.name,
                availability: p.totalStock > 0 ? 'in stock' : 'out of stock',
                condition: 'new',
                price: `${p.basePrice}.00 ARS`,
                link: `${baseUrl}/catalog/${p.id}`,
                image_link: optimizedImageUrl,
                brand: 'Éter',
                google_product_category: 'Apparel & Accessories > Clothing > Shoes',
                fb_product_category: 'Clothing & Accessories > Clothing',
                gender: 'unisex',
                age_group: 'adult'
            };

            if (sizes.length > 0) {
                sizes.forEach(size => {
                    const quantity = p.stockBySize[size] || 0;
                    if (quantity > 0) {
                        sheet.addRow({
                            ...commonData,
                            id: `${p.id}_${size}`,
                            title: `${p.name} (Talle ${size})`,
                            item_group_id: p.id,
                            size: size,
                            quantity_to_sell_on_facebook: quantity,
                            availability: 'in stock'
                        });
                    }
                });
            } else {
                sheet.addRow({
                    ...commonData,
                    id: p.id,
                    title: p.name,
                    quantity_to_sell_on_facebook: p.totalStock
                });
            }
        });

        const format = searchParams.get('format') || 'xlsx';

        if (format === 'csv') {
            const buffer = await workbook.csv.writeBuffer();
            return new NextResponse(buffer, {
                headers: {
                    'Content-Disposition': `attachment; filename="catalogo_meta_eter.csv"`,
                    'Content-Type': 'text/csv; charset=utf-8',
                }
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename="catalogo_meta_eter.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
