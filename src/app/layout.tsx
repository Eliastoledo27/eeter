import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { AuthModal } from '@/components/auth/AuthModal';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { AudioProvider } from '@/providers/AudioProvider';
import { PulseManager } from '@/components/pulse/PulseManager';
import { CartNotificationContainer } from '@/components/cart/CartNotificationSystem';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { FloatingAnnouncements } from '@/components/announcements/FloatingAnnouncements';

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ÉTER Store - Calzado Urbano, Zapatillas & Sneakers',
    default: 'Zapatillas Urbanas, Calzado Brasil & Sneakers | ÉTER Store Oficial',
  },
  description: "Tienda online de zapatillas urbanas, calzado importado de Brasil y sneakers en Argentina. Comprá zapas con stock físico en Mar del Plata (MDQ), envíos 24/48hs a todo el país y precios mayoristas para revendedores.",
  keywords: [
    // Búsquedas genéricas de calzado y zapatillas
    "zapas", "calzado", "zapatillas", "sneakers", "calzado urbano", "zapas urbanas",
    "zapatillas urbanas", "zapatillas brasil", "calzado brasilero", "zapatillas importadas",
    "zapas importadas", "zapatillas hombre", "zapatillas mujer", "comprar zapatillas",
    "tienda de zapatillas", "tienda de calzado", "venta de zapatillas online", "zapas online",
    "zapatillas streetwear", "sneakers argentina", "zapatillas por mayor", "calzado mayorista",
    "revendedores calzado", "revendedores zapatillas", "dropshipping zapatillas argentina",
    // Geográficas
    "zapatillas mar del plata", "calzado mar del plata", "zapas mdp", "zapas mdq",
    "zapatillas buenos aires", "calzado argentina",
    // Marca y variaciones
    "eter", "éter", "eter store", "éter store", "eter calzados", "éter calzados",
    "eter calzado", "éter calzado", "eter zapas", "éter zapas", "eter zapatillas", "éter zapatillas",
    "eter shop", "éter shop", "eter mdq", "éter mdq", "eter mar del plata"
  ],
  authors: [{ name: "ÉTER Store Oficial" }],
  creator: "ÉTER Store",
  publisher: "ÉTER Store",
  metadataBase: new URL('https://www.eter.store'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Zapatillas Urbanas, Calzado Brasil & Sneakers | ÉTER Store Oficial',
    description: 'Comprá zapatillas urbanas y sneakers importados de Brasil. Stock físico en Mar del Plata, envíos rápidos en 24/48hs a todo el país y venta mayorista/minorista.',
    url: 'https://www.eter.store',
    siteName: 'ÉTER Store Oficial - Calzado & Zapatillas',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/images/eter-brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'ÉTER Store Oficial - Zapatillas Urbanas, Calzado & Sneakers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zapatillas Urbanas, Calzado Brasil & Sneakers | ÉTER Store Oficial',
    description: 'Comprá zapatillas urbanas y sneakers importados de Brasil. Stock físico en Mar del Plata y envíos 24/48hs.',
    images: ['/images/eter-brand-logo.png'],
    creator: '@eterstore',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/images/eter-icon-circle.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'nave-verification': 'P-69AF-88A4-X',
      'nave-domain-verification': 'P-69AF-88A4-X',
      'nave': 'P-69AF-88A4-X'
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.eter.store/#website",
      "url": "https://www.eter.store",
      "name": "ÉTER Store Oficial",
      "alternateName": [
        "ÉTER",
        "ETER",
        "Éter Store",
        "Eter Store",
        "Éter Calzados",
        "Eter Calzados",
        "Éter Zapas",
        "Eter Zapas",
        "Éter Shop",
        "Eter Shop",
        "Éter MDQ",
        "Eter MDQ",
        "Éter Mar del Plata",
        "Eter Mar del Plata"
      ],
      "description": "Tienda oficial de calzado urbano brasilero, sneakers y zapas en Mar del Plata y Argentina.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.eter.store/catalog?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "inLanguage": "es-AR"
    },
    {
      "@type": "ShoeStore",
      "@id": "https://www.eter.store/#store",
      "name": "ÉTER Store Oficial",
      "alternateName": [
        "Éter Calzados",
        "Eter Calzados",
        "Éter Zapas",
        "Eter Zapas",
        "Éter Shop",
        "Éter MDQ"
      ],
      "url": "https://www.eter.store",
      "logo": "https://www.eter.store/images/eter-brand-logo.png",
      "image": "https://www.eter.store/images/eter-brand-logo.png",
      "description": "Distribuidora oficial de calzado urbano y sneakers importados de Brasil en Mar del Plata (MDQ). Stock real verificado y envíos a toda Argentina.",
      "priceRange": "$$$",
      "currenciesAccepted": "ARS",
      "paymentAccepted": "Efectivo, Transferencia, Tarjeta de Crédito, Mercado Pago",
      "telephone": "+5492236204002",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mar del Plata",
        "addressRegion": "Buenos Aires",
        "addressCountry": "AR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -38.0055,
        "longitude": -57.5426
      },
      "areaServed": {
        "@type": "Country",
        "name": "Argentina"
      },
      "sameAs": [
        "https://instagram.com/eterstore",
        "https://facebook.com/eterstore"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+5492236204002",
        "contactType": "customer service",
        "areaServed": "AR",
        "availableLanguage": ["Spanish"]
      }
    }
  ]
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
        className={`${manrope.variable} font-sans antialiased bg-[#050505] text-white overflow-x-hidden texture-grain`}
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
              <WhatsAppFloatingButton />
              <PulseManager />
              <FloatingAnnouncements />
              <CartNotificationContainer />
              <FloatingCartButton />
            </AudioProvider>
          </AuthInitializer>
          <Toaster position="top-center" theme="dark" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
