import { Metadata } from 'next';
import CommunityPage from '@/components/community/CommunityPage';

export const metadata: Metadata = {
    title: 'Comunidad ÉTER | La Red Elite de Revendedores de Calzado',
    description: 'Unite al ecosistema ÉTER. Más de 500 revendedores activos, tecnología aplicada al trading de calzado premium y soporte estratégico 24/7.',
    keywords: ['Comunidad ÉTER', 'revendedores calzado argentina', 'dropshipping sneakers', 'negocio zapatillas Mar del Plata', 'mastermind emprendedores'],
    openGraph: {
        title: 'Comunidad ÉTER | El Ecosistema Elite',
        description: 'No vendés solo. Tenés sistema. Unite a la red de reventa de calzado premium más sólida de Argentina.',
        url: 'https://xn--ter-9la.store/comunidad',
        siteName: 'Éter Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/community-og.jpg',
                width: 1200,
                height: 630,
                alt: 'Comunidad Éter Elite Network',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Comunidad ÉTER | El Ecosistema Elite',
        description: 'No vendés solo. Tenés sistema. Unite a la red de reventa de calzado premium.',
        images: ['/community-og.jpg'],
    },
};

export default function Page() {
    return (
        <>
            <h1 className="sr-only">Comunidad ÉTER - Red de Revendedores Elite de Calzado Premium</h1>
            <CommunityPage />
        </>
    );
}
