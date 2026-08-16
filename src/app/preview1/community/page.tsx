import { Metadata } from 'next';
import { HomeDecision } from '@/components/home/HomeDecision';

export const metadata: Metadata = {
    title: 'Éter Store | Calzado Premium Brasilero y Oportunidad de Negocio',
    description: 'La plataforma N°1 en Mar del Plata de calzado High-End importado. Calidad exclusiva, logística integrada y el ecosistema de revendedores más sólido del país.',
    keywords: ['Zapatillas importadas Brasil Mar del Plata', 'Calzado deportivo premium', 'Éter Store Oficial', 'sneakers', 'dropshipping argentina'],
    openGraph: {
        title: 'Éter Store | Calzado Premium Brasilero',
        description: 'La plataforma N°1 en Mar del Plata de calzado High-End importado. Calidad exclusiva, logística integrada y el ecosistema de revendedores más sólido del país.',
        url: 'https://eter.store',
        siteName: 'Éter Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Éter Store Premium Sneakers & Business Opportunity',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Éter Store | The New Standard',
        description: 'Donde la ingeniería de precisión se encuentra con la estética del diseño premium y el éxito digital.',
    },
};

export default function Page() {
    return (
        <main className="min-h-screen bg-[#050505]">
            <h1 className="sr-only">Zapatillas importadas Brasil Mar del Plata - Calzado deportivo premium - Éter Store Oficial</h1>
            
            {/* JSON-LD LocalBusiness Script para SEO Independiente */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ShoeStore",
                        "name": "Éter Store",
                        "image": "https://eter.store/og-image.jpg",
                        "description": "La plataforma N°1 en Mar del Plata de calzado High-End importado. Calidad exclusiva, logística integrada y el ecosistema de revendedores más sólido del país.",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Mar del Plata",
                            "addressRegion": "Buenos Aires",
                            "addressCountry": "AR"
                        },
                        "priceRange": "$$$"
                    })
                }}
            />

            <HomeDecision />
        </main>
    );
}
