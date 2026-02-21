import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { AuthModal } from '@/components/auth/AuthModal';
import { CartSidebar } from '@/components/cart/CartSidebar';


const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Éter Store',
    default: 'Éter Store | La Plataforma #1 de Resellers de Sneakers',
  },
  description: "Accede al catálogo de sneakers más exclusivo, gestiona tu stock digital y escala tu negocio de dropshipping con Éter Store.",
  keywords: ["sneakers", "dropshipping", "reseller", "zapatillas", "logística", "emprendimiento", "calzado de lujo"],
  metadataBase: new URL('https://www.xn--ter-9la.store'),
  openGraph: {
    title: 'Éter Store | Tu Imperio de Sneakers',
    description: 'Vende sneakers exclusivos sin invertir en stock. Nosotros nos encargamos de la logística.',
    url: 'https://www.xn--ter-9la.store',
    siteName: 'Éter Store',
    locale: 'es_AR',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
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
          </AuthInitializer>
          <Toaster position="top-center" theme="dark" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
