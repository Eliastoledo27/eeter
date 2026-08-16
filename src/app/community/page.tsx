import { Metadata } from 'next';
import { PreviewCommunityClient } from '@/components/preview/PreviewCommunityClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Comunidad & Academia | ÉTER Store',
    description: 'Sumate a la red federal de revendedores de calzado urbano. Stock asegurado, margen 100% libre y despachos en 24/48hs por Andreani.',
};

export default function CommunityPage() {
    return <PreviewCommunityClient />;
}
