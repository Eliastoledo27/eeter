import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { AuthModal } from '@/components/auth/AuthModal';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { AiConcierge } from '@/components/ai/AiConcierge';


const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ÉTER Store',
    default: 'ÉTER Store | Archivo Premium de Sneakers',
  },
  description: "Accede al catálogo de sneakers más exclusivo, gestiona tu stock digital y escala tu negocio de dropshipping con la infraestructura tecnológica de ÉTER.",
  keywords: ["sneakers", "calzado premium", "reseller", "zapatillas", "logística", "emprendimiento", "calzado de lujo", "dropshipping", "argentina"],
  metadataBase: new URL('https://www.eter.store'),
  openGraph: {
    title: 'ÉTER Store | The New Standard',
    description: 'Ingeniería de precisión y estética de lujo. Vende calzado premium brasilero con logística automatizada.',
    url: 'https://www.eter.store',
    siteName: 'ÉTER Store',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ÉTER Store Premium Archive Node',
      },
    ],
  },
  twitter: {
      card: 'summary_large_image',
      title: 'ÉTER Store | The New Standard',
      description: 'Ingeniería de precisión y estética de lujo. Vende calzado premium con logística automatizada.',
      images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    other: {
      'nave-verification': 'P-69AF-88A4-X',
      'nave-domain-verification': 'P-69AF-88A4-X',
      'nave': 'P-69AF-88A4-X'
    }
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${manrope.variable} font-sans antialiased bg-[#0A0A0A] text-white`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthInitializer>
            {children}
            <AuthModal />
            <CartSidebar />
            <AiConcierge />
          </AuthInitializer>
          <Toaster position="top-center" theme="dark" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
