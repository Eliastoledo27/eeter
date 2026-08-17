import { Metadata } from 'next';
import { PreviewCommunityClient } from '@/components/preview/PreviewCommunityClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Revendedores de Zapatillas & Calzado Mayorista | ÉTER Store',
    description: 'Comenzá a vender zapatillas y calzado urbano con listas mayoristas directas de Brasil. Stock físico garantizado en Mar del Plata, fotos profesionales y margen 100% libre.',
    keywords: [
        'revendedores de zapatillas', 'calzado por mayor argentina', 'venta mayorista zapatillas',
        'comprar zapatillas por mayor', 'dropshipping calzado argentina', 'vender zapas online',
        'distribuidor zapatillas brasil', 'comunidad eter revendedores'
    ],
    alternates: {
        canonical: 'https://www.eter.store/comunidad',
    },
};

export default function ComunidadPage() {
    return <PreviewCommunityClient />;
}
