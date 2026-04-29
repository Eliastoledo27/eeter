import { Metadata } from 'next';
import { HomeDecision } from '@/components/home/HomeDecision';

export const metadata: Metadata = {
    title: 'Éter Store | Catálogo Exclusivo Revendedores',
    description: 'Acceso exclusivo al archivo maestro de productos ÉTER para revendedores autorizados.',
};

export default function Page() {
    return (
        <main className="min-h-screen bg-[#050505]">
            <h1 className="sr-only">Catálogo Exclusivo Éter Store - Acceso Revendedores</h1>
            <HomeDecision />
        </main>
    );
}
