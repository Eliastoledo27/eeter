import { Metadata } from 'next';
import ContactPage from '@/components/contact/ContactPage';

export const metadata: Metadata = {
    title: 'Contacto ÉTER (Respaldo) | Canales Oficiales',
    description: 'Página de respaldo de contacto de Éter Store.',
};

export default function Page() {
    return <ContactPage />;
}
