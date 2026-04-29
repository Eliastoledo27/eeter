import { Metadata } from 'next';
import ContactPage from '@/components/contact/ContactPage';

export const metadata: Metadata = {
    title: 'Contacto ÉTER | Soporte VIP y Alianzas Comerciales',
    description: 'Conectá con la elite. Soporte dedicado para revendedores, consultas de pedidos y alianzas estratégicas con ÉTER Store.',
    keywords: ['Contacto Éter', 'atención al cliente Éter Store', 'WhatsApp Éter', 'revendedores soporte argentina'],
    openGraph: {
        title: 'Contacto ÉTER | Canal Directo con la Elite',
        description: 'Estamos acá para potenciar tu negocio. Consultas comerciales y soporte estratégico.',
        url: 'https://eter.store/contacto',
        siteName: 'Éter Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Contacto Éter Official Channels',
            },
        ],
    },
};

export default function Page() {
    return (
        <>
            <h1 className="sr-only">Contacto ÉTER - Canales Oficiales y Soporte al Revendedor</h1>
            <ContactPage />
        </>
    );
}
