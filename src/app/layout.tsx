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
import { AudioProvider } from '@/providers/AudioProvider';


const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ÉTER Store',
    default: 'ÉTER Store | Calzado Brasilero Premium & Sneakers de Lujo',
  },
  description: "La tienda N°1 de calzado premium brasilero en Argentina. Accede a stock exclusivo, precios mayoristas y convertite en revendedor de ÉTER. Calidad certificada y envíos a todo el país.",
  keywords: [
    "sneakers argentina", "calzado brasilero", "zapatillas por mayor", 
    "revendedor de calzado", "eter store", "sneakers premium", 
    "calzado de lujo", "dropshipping argentina", "zapatillas importadas"
  ],
  authors: [{ name: "ÉTER Store Engineering" }],
  creator: "ÉTER Store",
  publisher: "ÉTER Store",
  metadataBase: new URL('https://www.eter.store'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ÉTER Store | The New Standard in Premium Footwear',
    description: 'Ingeniería de precisión y estética de lujo. Vende calzado premium brasilero con logística automatizada y los mejores márgenes del mercado.',
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
      title: 'ÉTER Store | Calzado Premium & Dropshipping',
      description: 'Ingeniería de precisión y estética de lujo. Vende calzado premium con logística automatizada.',
      images: ['/og-image.jpg'],
      creator: '@eterstore',
  },
  icons: {
    icon: [
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
  },
  verification: {
    google: 'your-google-verification-code', // Recommended to add
    other: {
      'nave-verification': 'P-69AF-88A4-X',
      'nave-domain-verification': 'P-69AF-88A4-X',
      'nave': 'P-69AF-88A4-X'
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ÉTER Store",
  "url": "https://www.eter.store",
  "logo": "https://www.eter.store/icon.svg",
  "description": "Distribuidora líder de calzado premium brasilero y plataforma para revendedores.",
  "sameAs": [
    "https://facebook.com/eterstore",
    "https://instagram.com/eterstore"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+5492236204002",
    "contactType": "customer service",
    "areaServed": "AR",
    "availableLanguage": "Spanish"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <AuthInitializer>
            <AudioProvider>
              {children}
              <AuthModal />
              <CartSidebar />
              <AiConcierge />
            </AudioProvider>
          </AuthInitializer>
          <Toaster position="top-center" theme="dark" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
