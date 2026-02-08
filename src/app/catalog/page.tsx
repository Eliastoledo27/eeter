import { Navbar } from '@/components/layout/Navbar'
import { getProducts } from '@/app/actions/products'
import { CatalogView } from '@/components/catalog/CatalogView'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Zapatillas Premium en Mar del Plata | Catálogo Éter Store",
  description: "El mejor catálogo de reventa de calzado premium en Argentina. Sneakers exclusivas, stock real y envíos a todo el país desde Mar del Plata.",
  keywords: ["zapatillas premium mar del plata", "reventa calzado argentina", "sneakers exclusivas argentina", "dropshipping calzado premium"],
}

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-background font-body selection:bg-accent/20">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(202,138,4,0.15),transparent_60%)] opacity-80" />
        <div className="absolute top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(68,64,60,0.1),transparent_60%)] opacity-70" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(202,138,4,0.1),transparent_60%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(250,250,249,0.92),rgba(250,250,249,1))]" />
      </div>

      <Navbar />

      <main className="min-h-screen pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <CatalogView products={products} />
        </div>
      </main>

      <footer className="border-t border-black/10 bg-[#FAFAF9] py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#78716C] text-sm">
          © 2026 Éter Store Inc. Catálogo para revendedores.
        </div>
      </footer>
    </div>
  )
}
