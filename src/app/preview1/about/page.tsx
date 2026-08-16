import { Metadata } from 'next';
import AboutPage from '@/components/about/AboutPage';

export const metadata: Metadata = {
    title: 'Sobre ÉTER | Ingeniería de Precisión y Estética de Lujo',
    description: 'Conocé la visión detrás de ÉTER. Redefiniendo el mercado de calzado premium en Argentina a través de la tecnología, la transparencia y la excelencia operativa.',
    keywords: ['Éter Store Historia', 'calzado brasilero calidad', 'zapatillas premium argentina', 'startup calzado mar del plata'],
    openGraph: {
        title: 'Sobre ÉTER | El Estándar Elite en Calzado',
        description: 'No solo vendemos zapatillas. Construimos una plataforma de activos premium.',
        url: 'https://eter.store/about',
        siteName: 'Éter Store',
        locale: 'es_AR',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Sobre Éter Manifest',
            },
        ],
    },
};

export default function Page() {
    return (
        <>
            <h1 className="sr-only">Sobre ÉTER - Nuestra Historia, Visión y Compromiso con el Calzado Premium</h1>
            <AboutPage />
        </>
    );
}