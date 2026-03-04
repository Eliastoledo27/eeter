import { NextResponse } from 'next/server';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import ExcelJS from 'exceljs';

export const revalidate = 0; // Fuerza renderizado dinámico y sin caché en Next.js App Router

export async function GET() {
    try {
        const repo = new SupabaseProductRepository();
        // Solo traemos los activos, que son los que van para el cliente (suponiendo que le mandan a clientes)
        // Puedes traer todos si lo deseas quitando el filtro.
        let products = await repo.findAll();
        products = products.filter(p => p.status === 'active');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Éter System';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Catálogo Éter', {
            views: [{ state: 'frozen', ySplit: 1 }]
        });

        // Configuramos las columnas
        sheet.columns = [
            { header: '📸 Imagen', key: 'imagen', width: 20 },
            { header: 'ID del Producto', key: 'id', width: 15 },
            { header: '📦 Nombre / Modelo', key: 'nombre', width: 35 },
            { header: '🏷️ Categoría', key: 'categoria', width: 20 },
            { header: '💰 Precio ($)', key: 'precio', width: 15 },
            { header: '📊 Stock Total', key: 'stock', width: 15 },
            { header: '📏 Talles Disponibles (Stock)', key: 'talles', width: 45 },
            { header: '📝 Descripción', key: 'descripcion', width: 50 },
        ];

        // Estilos para la primera fila (Cabecera)
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FF000000' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD900' } // Color Éter / Dorado
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;

        // Añadir filas y procesar imágenes
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            const rowIndex = i + 2; // Las filas son en base 1, la fila 1 es el header

            const sizesStr = Object.keys(p.stockBySize).length > 0
                ? Object.entries(p.stockBySize)
                    .map(([s, q]) => `Talle ${s} (Hay ${q})`)
                    .join(', ')
                : 'Sin stock específico o talle único';

            const row = sheet.addRow({
                imagen: '', // Esto queda en blanco, la imagen va superpuesta en la celda
                id: p.id,
                nombre: p.name,
                categoria: p.category,
                precio: p.basePrice,
                stock: p.totalStock,
                talles: sizesStr,
                descripcion: p.description || '-',
            });

            // Altura grande para que entre la foto
            row.height = 90;
            row.alignment = { vertical: 'middle', wrapText: true };

            // Inyectar la imagen en el Excel
            if (p.images && p.images.length > 0) {
                try {
                    const response = await fetch(p.images[0]);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);

                        // Inferir extensión de la URL, por default jpeg
                        let ext: 'jpeg' | 'png' | 'gif' = 'jpeg';
                        if (p.images[0].toLowerCase().includes('.png')) ext = 'png';
                        if (p.images[0].toLowerCase().includes('.gif')) ext = 'gif';

                        const imageId = workbook.addImage({
                            buffer: buffer as any,
                            extension: ext,
                        });

                        // Colocar la imagen en la columna 'A' (col: 0 en índice 0 para addImage) 
                        // de la fila actual (row: rowIndex - 1)
                        sheet.addImage(imageId, {
                            tl: { col: 0.2, row: rowIndex - 1 + 0.1 }, // Top Left 
                            ext: { width: 100, height: 100 },         // Dimensiones en px
                            editAs: 'oneCell'                         // Flotar en celda
                        });
                    }
                } catch (e) {
                    console.error(`🔴 Error cargando la imagen para el producto ${p.name}: `, e);
                }
            }
        }

        // Configurar los bordes y el formato de precio de todas las filas
        sheet.eachRow((row, r) => {
            row.eachCell((cell, c) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (c === 5 && r > 1) {
                    cell.numFmt = '"$"#,##0.00';
                }
            });
        });

        // Generar el Buffer del Excel
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Devolver la respuesta al cliente
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Disposition': 'attachment; filename="Catalogo_Eter_Completo.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        });

    } catch (error: any) {
        console.error('Error generando Excel:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
