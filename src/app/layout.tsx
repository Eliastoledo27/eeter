import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Éter Store',
    default: 'Éter Store | Tu Negocio de Dropshipping y Reventa',
  },
  description: "La plataforma líder para revendedores en Argentina. Zapatillas premium, indumentaria y accesorios con logística incluida. Sin inversión inicial.",
  keywords: ["dropshipping", "reventa", "zapatillas", "mayorista", "emprendimiento", "dinero extra"],
  metadataBase: new URL('https://eter-store.com'), // Replace with actual domain in prod
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Éter Store',
    title: 'Éter Store | Tu Negocio de Dropshipping',
    description: 'Empieza a vender hoy mismo sin stock ni inversión.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${cormorant.variable} ${montserrat.variable} font-body antialiased`}
      >
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        <Toaster position="top-center" theme="light" richColors />
      </body>
    </html>
  );
}
