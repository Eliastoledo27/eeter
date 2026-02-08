import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderItem {
    name: string;
    selectedSize?: string;
    quantity: number;
    basePrice: number;
}

interface OrderData {
    referenceCode: string;
    date: Date;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    resellerName: string;
    deliveryAddress: string;
    city: string;
    province: string;
    postalCode?: string;
    paymentMethod: string;
    items: OrderItem[];
    total: number;
    notes?: string;
}

export const generateOrderPDF = (order: OrderData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Colors
    const primaryColor = [202, 138, 4]; // #CA8A04 (Gold/Amber)
    const textColor = [30, 30, 30];
    const secondaryColor = [100, 100, 100];

    // Header
    doc.setFillColor(28, 25, 23); // Dark background
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ÉTER STORE', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Pedido', 20, 28);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Ref: ${order.referenceCode}`, 190, 20, { align: 'right' });
    doc.text(format(order.date, "d 'de' MMMM, yyyy", { locale: es }), 190, 28, { align: 'right' });

    // Customer & Reseller Info
    let yPos = 55;

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL PEDIDO', 20, yPos);

    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Two columns layout
    const leftCol = 20;
    const rightCol = 110;

    // Left Column: Customer
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(order.customerName, leftCol, yPos + 5);
    doc.text(order.customerPhone, leftCol, yPos + 10);
    if (order.customerEmail) doc.text(order.customerEmail, leftCol, yPos + 15);

    // Right Column: Reseller & Shipping
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Vendedor:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(order.resellerName, rightCol, yPos + 5);

    yPos += 25;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Entrega:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${order.deliveryAddress}`, leftCol, yPos + 5);
    doc.text(`${order.city}, ${order.province}`, leftCol, yPos + 10);
    if (order.postalCode) doc.text(`CP: ${order.postalCode}`, leftCol, yPos + 15);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Pago:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(order.paymentMethod.replace('_', ' ').toUpperCase(), rightCol, yPos + 5);

    if (order.notes) {
        yPos += 25;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notas:', leftCol, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        const splitNotes = doc.splitTextToSize(order.notes, 170);
        doc.text(splitNotes, leftCol, yPos + 5);
        yPos += (splitNotes.length * 5);
    } else {
        yPos += 25;
    }

    // Items Table
    yPos += 10;

    const tableBody = order.items.map(item => [
        item.name,
        item.selectedSize || '-',
        item.quantity,
        `$${item.basePrice.toLocaleString('es-AR')}`,
        `$${(item.basePrice * item.quantity).toLocaleString('es-AR')}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Producto', 'Talle', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [28, 25, 23],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Product name
            1: { cellWidth: 20, halign: 'center' }, // Size
            2: { cellWidth: 15, halign: 'center' }, // Qty
            3: { cellWidth: 30, halign: 'right' }, // Price
            4: { cellWidth: 30, halign: 'right' } // Subtotal
        },
        foot: [['', '', '', 'TOTAL', `$${order.total.toLocaleString('es-AR')}`]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [202, 138, 4],
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'right'
        }
    });

    // Footer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Gracias por elegir Éter Store.', 105, finalY, { align: 'center' });
    doc.text('Mar del Plata, Buenos Aires', 105, finalY + 5, { align: 'center' });
    doc.text('www.eterstore.com.ar', 105, finalY + 10, { align: 'center' });

    // Save
    doc.save(`Pedido-${order.referenceCode}.pdf`);
};
