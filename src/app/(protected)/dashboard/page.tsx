import { Metadata } from 'next';
import DashboardPageClient from './DashboardPageClient';

export const metadata: Metadata = {
    title: 'Dashboard de Revendedor | ÉTER Store',
    description: 'Gestioná tus pedidos, márgenes de ganancia y material de marketing. La central operativa para hacer crecer tu negocio de reventa de zapatillas premium.',
    openGraph: {
        title: 'Dashboard de Revendedor | ÉTER Store',
        description: 'Gestioná tus pedidos, márgenes de ganancia y material de marketing. La central operativa para hacer crecer tu negocio de reventa.',
        url: 'https://xn--ter-9la.store/dashboard',
        images: [
            {
                url: '/dashboard-og.jpg',
                width: 1200,
                height: 630,
                alt: 'Dashboard de Revendedor Éter Store',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dashboard de Revendedor | ÉTER Store',
        description: 'Gestioná tus pedidos, márgenes de ganancia y material de marketing.',
        images: ['/dashboard-og.jpg'],
    }
};

export default function DashboardPage() {
    return <DashboardPageClient />;
}
