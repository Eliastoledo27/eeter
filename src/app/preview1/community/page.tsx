import { Metadata } from 'next';
import CommunityPage from '@/components/community/CommunityPage';

export const metadata: Metadata = {
    title: 'Comunidad ÉTER (Respaldo) | Red de Revendedores',
    description: 'Página de respaldo de la comunidad de revendedores de Éter Store.',
};

export default function Page() {
    return <CommunityPage />;
}
