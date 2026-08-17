import { Metadata } from 'next';
import ContactPage from '@/app/contact/page';

export const metadata: Metadata = {
    title: 'Contacto & Envíos de Zapatillas 24/48hs | ÉTER Store',
    description: 'Atención al cliente y consultas de stock de calzado y zapatillas. Despachos rápidos a toda Argentina por Andreani y Correo Argentino desde Mar del Plata.',
    keywords: [
        'contacto eter store', 'envíos de zapatillas', 'comprar zapas whatsapp',
        'cambio de talle zapatillas', 'calzado mar del plata atención', 'tienda zapatillas contacto'
    ],
    alternates: {
        canonical: 'https://www.eter.store/contacto',
    },
};

export default function Page() {
    return <ContactPage />;
}
