import { Metadata } from 'next';
import BestOffersPage from '@/components/landing/BestOffersPage';

export const metadata: Metadata = {
    title: 'Ofertas & Best Sellers | Éter Store — Zapatillas Premium en Mar del Plata',
    description: 'Descubrí los modelos más vendidos y las mejores ofertas en calzado premium importado. Zapatillas Nike, Jordan y Adidas con envío desde Mar del Plata.',
    keywords: ['ofertas zapatillas Mar del Plata', 'best sellers sneakers Argentina', 'zapatillas importadas liquidación', 'calzado premium ofertas', 'Éter Store descuentos'],
    openGraph: {
        title: 'Ofertas & Best Sellers | Éter Store',
        description: 'Los modelos más buscados de Mar del Plata al mejor precio. Calidad G5/OG con disponibilidad inmediata.',
        url: 'https://eter.store/catalog/best',
        siteName: 'Éter Store',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Éter Store Best Sellers & Ofertas' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ofertas & Best Sellers | Éter Store',
        description: 'Los modelos que más se venden en Mar del Plata. Calidad premium, precios de oportunidad.',
    },
};

export default function Page() {
    return (
        <main className="min-h-screen bg-[#050505]">
            <h1 className="sr-only">Ofertas zapatillas premium Mar del Plata - Best Sellers sneakers importadas - Éter Store</h1>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "OfferCatalog",
                        "name": "Ofertas & Best Sellers — Éter Store",
                        "description": "Los modelos más vendidos y las mejores oportunidades en calzado premium importado desde Mar del Plata.",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Éter Store",
                            "logo": { "@type": "ImageObject", "url": "https://eter.store/logo.png" }
                        },
                        "areaServed": {
                            "@type": "City",
                            "name": "Mar del Plata"
                        }
                    })
                }}
            />
            <BestOffersPage />
        </main>
    );
}
