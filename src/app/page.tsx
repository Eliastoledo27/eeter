import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
    title: 'ÉTER Store | Calzado Premium y Diseño Exclusivo',
    description: 'Descubre la colección exclusiva de ÉTER. Ingeniería de precisión y estética de lujo en calzado deportivo. Envíos a todo el país.',
    keywords: ['sneakers', 'calzado premium', 'ropa urbana', 'dropshipping argentina', 'éter store'],
    openGraph: {
        title: 'ÉTER Store | The New Standard',
        description: 'Donde la ingeniería de precisión se encuentra con la estética del oro líquido. Colecciones limitadas.',
        url: 'https://eter-store.com',
        siteName: 'ÉTER Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg', // Make sure to add an OG image ideally
                width: 1200,
                height: 630,
                alt: 'ÉTER Store Premium Sneakers',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ÉTER Store | The New Standard',
        description: 'Donde la ingeniería de precisión se encuentra con la estética del oro líquido.',
    },
};

export default function Page() {
    return <LandingPage />;
}
