import { getProducts } from '@/app/actions/products';
import CatalogView from '@/components/catalog/CatalogView';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export const revalidate = 3600; // revalidate every hour

export default async function CollectionPage() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C88A04] selection:text-black overflow-x-hidden">
            <Navbar />

            <section className="pt-48 pb-12 bg-[#0A0A0A]">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="text-[#C88A04] font-black text-[10px] tracking-[0.5em] uppercase mb-6 block">Curaduría Exclusiva</span>
                        <h1 className="text-6xl md:text-8xl font-black mb-12 tracking-tighter uppercase leading-none">
                            LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#ECA413]">COLECCIÓN</span>
                        </h1>
                    </div>
                </div>
            </section>

            <CatalogView initialProducts={products} />

            <Footer />
        </main>
    );
}
