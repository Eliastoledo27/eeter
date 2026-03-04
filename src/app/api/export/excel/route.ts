import { NextRequest, NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import ExcelJS from 'exceljs';

export const revalidate = 0;

// Límite de 15MB en bytes
const MAX_BYTES = 15 * 1024 * 1024;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const part = parseInt(searchParams.get('part') || '1');

        const repo = new SupabaseProductRepository();
        let products = await repo.findAll();
        products = products.filter(p => p.status === 'active');

        // Función para generar un Excel y retornar su tamaño y buffer
        const generateExcelBuffer = async (items: typeof products) => {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Catálogo Éter', {
                views: [{ state: 'frozen', ySplit: 1 }]
            });

            sheet.columns = [
                { header: '📸 Imagen', key: 'imagen', width: 20 },
                { header: 'ID del Producto', key: 'id', width: 15 },
                { header: '📦 Nombre / Modelo', key: 'nombre', width: 35 },
                { header: '🏷️ Categoría', key: 'categoria', width: 20 },
                { header: '💰 Precio ($)', key: 'precio', width: 15 },
                { header: '📊 Stock Total', key: 'stock', width: 15 },
                { header: '📏 Talles Disponibles', key: 'talles', width: 45 },
                { header: '📝 Descripción', key: 'descripcion', width: 50 },
            ];

            const headerRow = sheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD900' } };
            headerRow.height = 30;

            for (let i = 0; i < items.length; i++) {
                const p = items[i];
                const sizesStr = Object.entries(p.stockBySize || {})
                    .map(([s, q]) => `Talle ${s} (Hay ${q})`)
                    .join(', ') || '-';

                const row = sheet.addRow({
                    id: p.id,
                    nombre: p.name,
                    categoria: p.category,
                    precio: p.basePrice,
                    stock: p.totalStock,
                    talles: sizesStr,
                    descripcion: p.description || '-',
                });
                row.height = 90;
                row.alignment = { vertical: 'middle', wrapText: true };

                if (p.images?.length > 0) {
                    try {
                        const imgRes = await fetch(p.images[0]);
                        if (imgRes.ok) {
                            const buffer = Buffer.from(await imgRes.arrayBuffer());
                            const imageId = workbook.addImage({
                                buffer: buffer as any,
                                extension: 'jpeg',
                            });
                            sheet.addImage(imageId, {
                                tl: { col: 0.1, row: i + 1.1 },
                                ext: { width: 100, height: 100 }
                            });
                        }
                    } catch (e) { }
                }
            }

            return await workbook.xlsx.writeBuffer();
        };

        // Dividimos los productos en partes si es necesario
        // Dado que no sabemos el peso exacto hasta generar, hacemos una estimación agresiva:
        // Cada producto con imagen pesa ~150kb. 15MB / 150kb = ~100 productos por Excel.
        const ITEMS_PER_PAGE = 80;
        const totalParts = Math.ceil(products.length / ITEMS_PER_PAGE);

        const start = (part - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const currentBatch = products.slice(start, end);

        if (currentBatch.length === 0) {
            return NextResponse.json({ error: 'Parte no encontrada' }, { status: 404 });
        }

        const buffer = await generateExcelBuffer(currentBatch);

        return new NextResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename="Catalogo_Eter_Parte_${part}_de_${totalParts}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'X-Total-Parts': totalParts.toString(),
                'X-Current-Part': part.toString()
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
