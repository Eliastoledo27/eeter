/**
 * BASE DE CONOCIMIENTO OFICIAL — ÉTER
 * Fuente de verdad principal para texto, secciones y respuestas de IA.
 */

export const ETER_BRAND = {
    name: 'ÉTER',
    description: 'Marca de calzado urbano, premium y de alta rotación.',
    location: 'Mar del Plata, Argentina',
    shipping: 'Envíos a todo el país (24/48 hs hábiles).',
    whatsapp: '2236204002',
    style: {
        colors: {
            base: '#050505', // Negro profundo
            accent: '#00E5FF', // Cian
            secondary: '#C6FF00', // Verde neón
            tertiary: '#7A00FF', // Violeta eléctrico
        },
        tone: 'Directo, simple, seguro y con calle. Profesional pero cercano.',
    },
};

export const RESELLER_MODEL = {
    type: 'Margen propio (No comisión)',
    explanation: 'ÉTER pasa un precio mayorista. El revendedor decide cuánto sumarle. La diferencia es su ganancia.',
    example: 'Si un par vale $45.000 mayorista y lo vendés a $60.000, ganás $15.000.',
    process: [
        'Elegí productos del catálogo.',
        'Publicá con tu precio final.',
        'Consultá stock con ÉTER antes de cerrar.',
        'Tomá los datos del cliente.',
        'Coordinamos entrega o envío.',
        'El cliente abona (Efectivo/Transferencia).',
        'Conservás tu ganancia.',
    ],
    requiredData: [
        'Foto o nombre del modelo',
        'Talle',
        'Dirección',
        'Ubicación o zona de referencia',
        'Teléfono del cliente',
        'Forma de pago',
    ],
};

export const LOGISTICS = {
    marDelPlata: {
        deliverySameDay: 'Pedidos antes de las 15:00 hs se entregan el mismo día (15:00 - 19:00 hs).',
        deliveryNextDay: 'Pedidos después de las 15:00 hs se entregan al día siguiente (09:00 - 18:00 hs).',
    },
    nationalShipping: 'Todo el país. 24/48 hs hábiles post-confirmación.',
};

export const AURA_CONFIG = {
    identity: {
        name: 'Aura',
        role: 'Asistente oficial de ÉTER',
        personality: 'Profesional, callejera controlada, directa, clara, rápida y confiable.',
        tone: 'Seguridad, sin vueltas, guiando siempre a la acción.',
    },
    priorities: [
        'Explicar cómo funciona el sistema.',
        'Aclarar margen de ganancia.',
        'Guiar al catálogo.',
        'Pedir datos completos.',
        'Recomendar confirmar stock antes de vender.',
    ],
};

export const OFFICIAL_PHRASES = [
    'Vos vendés. Nosotros respaldamos.',
    'El que responde primero, vende primero.',
    'Los precios son mayoristas. Tu ganancia la definís vos.',
    'Confirmá stock antes de cerrar.',
    'Orden + datos completos = entrega sin problemas.',
    'En ÉTER, ganamos todos.',
    'Publicá hoy. Vendé antes.',
];
