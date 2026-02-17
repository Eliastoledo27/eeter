import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
    title: 'ÉTER Store | Calzado Premium y Oportunidad de Negocio Digital',
    description: 'Descubre la colección exclusiva de ÉTER. Calzado premium brasilero con logística incluida. Únete como revendedor y genera ingresos reales desde tu casa.',
    keywords: ['sneakers', 'calzado premium', 'ropa urbana', 'dropshipping argentina', 'éter store', 'revender calzado', 'negocio digital', 'calzado brasilero', 'logística para revendedores'],
    openGraph: {
        title: 'ÉTER Store | Tu Éxito es Nuestro ÉXito',
        description: 'Vende calzado premium brasilero con logística incluida. Ingeniería de precisión y estética de lujo.',
        url: 'https://eter-store.com',
        siteName: 'ÉTER Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'ÉTER Store Premium Sneakers & Business Opportunity',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ÉTER Store | The New Standard',
        description: 'Donde la ingeniería de precisión se encuentra con la estética del diseño premium y el éxito digital.',
    },
};

export default function Page() {
    return <LandingPage />;
}
