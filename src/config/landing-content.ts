/**
 * CONFIGURACIÓN DECLARATIVA DE CONTENIDO — NUEVA LANDING ÉTER (2026)
 * Fuente única de verdad para textos, claims, métricas y assets de la experiencia editorial.
 */

export interface NavLink {
    label: string;
    href: string;
}

export interface MetricItem {
    value: string;
    label: string;
    sublabel: string;
}

export interface PillarItem {
    id: string;
    number: string;
    title: string;
    description: string;
    badge: string;
    iconName: 'ShieldCheck' | 'Truck' | 'PackageCheck' | 'Zap';
}

export interface StepItem {
    step: string;
    title: string;
    description: string;
    iconName: 'ShoppingBag' | 'MessageCircle' | 'TrendingUp';
}

export interface TestimonialItem {
    id: string;
    name: string;
    location: string;
    period: string;
    quote: string;
    earnings: string;
    orders: string;
    rating: string;
    avatarUrl: string;
}

export interface AcademyModulePreview {
    number: string;
    title: string;
    lessons: string;
    badge: string;
}

export interface LandingContentConfig {
    hero: {
        badge: string;
        headlineMain: string;
        headlineHighlight: string;
        subtitle: string;
        communityMetric: string;
        ctaPrimary: NavLink;
        ctaSecondary: NavLink;
        heroImagePlaceholder: string;
    };
    tickers: {
        ticker1: string[];
        ticker2: string[];
    };
    manifesto: {
        badge: string;
        lines: string[];
        conclusion: string;
    };
    newDrop: {
        badge: string;
        title: string;
        highlightText: string;
        catalogBridgeCta: NavLink;
    };
    whyEter: {
        badge: string;
        title: string;
        highlightText: string;
        pillars: PillarItem[];
    };
    resellerEngine: {
        badge: string;
        title: string;
        subtitle: string;
        steps: StepItem[];
        cta: NavLink;
    };
    community: {
        badge: string;
        title: string;
        highlightText: string;
        description: string;
        metrics: MetricItem[];
        testimonials: TestimonialItem[];
        cta: NavLink;
    };
    academy: {
        badge: string;
        title: string;
        highlightText: string;
        description: string;
        modules: AcademyModulePreview[];
        cta: NavLink;
    };
    finalCta: {
        headline: string;
        headlineHighlight: string;
        subtitle: string;
        actions: {
            shop: NavLink;
            resell: NavLink;
            academy: NavLink;
        };
    };
}

export const LANDING_CONTENT: LandingContentConfig = {
    hero: {
        badge: 'DROP ACTIVO / STOCK LIMITADO',
        headlineMain: 'CALZADO PREMIUM.',
        headlineHighlight: 'ESTÁNDAR URBANO.',
        subtitle: 'Modelos de alta rotación directo de Brasil. Comprá stock exclusivo o construí tu negocio de reventa sin inversión previa.',
        communityMetric: '+500 revendedores activos en todo el país',
        ctaPrimary: {
            label: 'VER CATÁLOGO',
            href: '/catalog',
        },
        ctaSecondary: {
            label: 'QUIERO REVENDER',
            href: '/register',
        },
        heroImagePlaceholder: '/hero.webp',
    },
    tickers: {
        ticker1: [
            'ÉTER STORE',
            'CALZADO URBANO BRASIL',
            'NUEVOS DROPS SEMANALES',
            'STOCK REAL VERIFICADO',
            'ENVÍOS A TODO EL PAÍS',
        ],
        ticker2: [
            'SIN INVERSIÓN PREVIA',
            'LOGÍSTICA INTEGRADA',
            'MARGEN PROPIO',
            'VENTAS 24/7',
            'COMUNIDAD PRIVADA',
        ],
    },
    manifesto: {
        badge: 'MANIFIESTO ÉTER',
        lines: [
            'No creemos en productos genéricos ni en catálogos infinitos sin control.',
            'Creemos en la curaduría quirúrgica, en modelos que marcan la calle y en un sistema que permite ganar desde el primer día.',
            'Donde la ingeniería de producto se encuentra con la oportunidad real.',
        ],
        conclusion: 'ÉTER — The New Standard',
    },
    newDrop: {
        badge: 'SELECCIÓN EXCLUSIVA',
        title: 'Modelos con mayor rotación',
        highlightText: 'de la semana.',
        catalogBridgeCta: {
            label: 'EXPLORAR CATÁLOGO COMPLETO',
            href: '/catalog',
        },
    },
    whyEter: {
        badge: 'VALOR VERIFICADO',
        title: 'Por qué elegir',
        highlightText: 'ÉTER.',
        pillars: [
            {
                id: 'calidad',
                number: '01',
                title: 'Curaduría Brasil',
                description: 'Modelos seleccionados por terminación, confort y fidelidad de materiales de primera línea.',
                badge: 'High-End',
                iconName: 'ShieldCheck',
            },
            {
                id: 'logistica',
                number: '02',
                title: 'Logística Propia',
                description: 'Despacho express desde Mar del Plata a cualquier punto del país con seguimiento en tiempo real.',
                badge: '24/48hs',
                iconName: 'Truck',
            },
            {
                id: 'stock',
                number: '03',
                title: 'Stock Real sin Espera',
                description: 'Talles y unidades confirmadas en vivo antes de cerrar cualquier operación.',
                badge: 'En Mano',
                iconName: 'PackageCheck',
            },
            {
                id: 'margen',
                number: '04',
                title: 'Margen Transparente',
                description: 'Precios mayoristas claros. Vos decidís tu ganancia y tu precio de venta final.',
                badge: '100% Tuyo',
                iconName: 'Zap',
            },
        ],
    },
    resellerEngine: {
        badge: 'MODELO DE NEGOCIO',
        title: 'Tu propio negocio de sneakers',
        subtitle: 'Sin comprar stock por adelantado. Nosotros gestionamos el producto y la logística; vos te enfocás en conectar con tus clientes.',
        steps: [
            {
                step: '01',
                title: 'Publicá en tus redes',
                description: 'Elegí modelos del catálogo oficial y subilos con tu propio precio de venta.',
                iconName: 'ShoppingBag',
            },
            {
                step: '02',
                title: 'Confirmá stock en vivo',
                description: 'Consultás con nosotros por WhatsApp antes de cerrar la operación.',
                iconName: 'MessageCircle',
            },
            {
                step: '03',
                title: 'Cobrá tu ganancia',
                description: 'Nosotros nos encargamos del despacho o entrega. El margen te queda en mano.',
                iconName: 'TrendingUp',
            },
        ],
        cta: {
            label: 'EMPEZAR AHORA',
            href: '/register',
        },
    },
    community: {
        badge: 'ECOSISTEMA ÉTER',
        title: 'No vendés solo.',
        highlightText: 'Tenés sistema.',
        description: 'Una red activa de revendedores compartiendo estrategias de venta, lanzamientos antes de hora y soporte operativo.',
        metrics: [
            { value: '+500', label: 'Revendedores', sublabel: 'Activos en Argentina' },
            { value: '+12.000', label: 'Pares Entregados', sublabel: 'Logística nacional' },
            { value: '24/48hs', label: 'Despacho', sublabel: 'Tiempos de entrega' },
            { value: '100%', label: 'Margen Libre', sublabel: 'Vos ponés el precio' },
        ],
        testimonials: [
            {
                id: 'valen',
                name: 'Valentina R.',
                location: 'Mar del Plata, MDQ',
                period: 'Revendedora activa',
                quote: 'Me cambió la dinámica de trabajo. Consulto stock, cierro la venta y me olvido del envío. La ganancia me queda en el momento.',
                earnings: '$450k+',
                orders: '35 pares/mes',
                rating: '5.0',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=160&h=160&fit=crop',
            },
            {
                id: 'matias',
                name: 'Matías G.',
                location: 'Buenos Aires',
                period: 'Revendedor activo',
                quote: 'La velocidad de respuesta es todo. Meto ventas todas las semanas con la tranquilidad de que el producto llega impecable.',
                earnings: '$620k+',
                orders: '52 pares/mes',
                rating: '5.0',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=160&h=160&fit=crop',
            },
            {
                id: 'carolina',
                name: 'Carolina M.',
                location: 'Interior del País',
                period: 'Revendedora activa',
                quote: 'Manejo todo desde el celular. Éter me resuelve la logística y yo solo me encargo de que los clientes vean los modelos nuevos.',
                earnings: '$980k+',
                orders: '80 pares/mes',
                rating: '4.9',
                avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=160&h=160&fit=crop',
            },
        ],
        cta: {
            label: 'UNIRME A LA COMUNIDAD',
            href: '/comunidad',
        },
    },
    academy: {
        badge: 'FORMACIÓN & CRECIMIENTO',
        title: 'ÉTER',
        highlightText: 'Academy.',
        description: 'Aprender a vender, crear contenido que convierta en Instagram/TikTok y dominar el cierre de ventas por WhatsApp.',
        modules: [
            { number: '01', title: 'Fundamentos de Reventa Urbana', lessons: '4 Lecciones', badge: 'Básico' },
            { number: '02', title: 'Creación de Contenido Viral', lessons: '6 Lecciones', badge: 'Marketing' },
            { number: '03', title: 'Cierre de Ventas por WhatsApp', lessons: '5 Lecciones', badge: 'Ventas' },
            { number: '04', title: 'Escala y Fidelización de Clientes', lessons: '4 Lecciones', badge: 'Pro' },
        ],
        cta: {
            label: 'CONOCER ACADEMIA',
            href: '/academy',
        },
    },
    finalCta: {
        headline: 'TU PRÓXIMO PAR.',
        headlineHighlight: 'TU PRÓXIMO NEGOCIO.',
        subtitle: 'El calzado más buscado. La plataforma de reventa más sólida del país.',
        actions: {
            shop: {
                label: 'VER CATÁLOGO',
                href: '/catalog',
            },
            resell: {
                label: 'SER REVENDEDOR',
                href: '/register',
            },
            academy: {
                label: 'ACADEMIA ÉTER',
                href: '/academy',
            },
        },
    },
};
