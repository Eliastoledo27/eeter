import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    base_price: number;
    images: string[];
}

interface CatalogWidgetProps {
    products: Product[];
}

export const CatalogWidget = ({ products }: CatalogWidgetProps) => {
    const latestProduct = products[0];

    if (!latestProduct) return null;

    return (
        <div className="h-full w-full relative group overflow-hidden bg-black/40 backdrop-blur-md rounded-3xl border border-white/10">
            {latestProduct.images && latestProduct.images[0] ? (
                <Image
                    src={latestProduct.images[0]}
                    alt={latestProduct.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-40"
                />
            ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <ShoppingBag size={48} className="text-slate-700" />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="px-2 py-1 rounded bg-accent-gold text-black text-[10px] font-bold uppercase tracking-widest mb-2 inline-block shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                    Nuevo Ingreso
                </span>
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-2 leading-tight text-glow">
                    {latestProduct.name}
                </h3>
                <p className="text-slate-300 font-mono text-sm mb-4">
                    ${latestProduct.base_price}
                </p>

                <Link href="/dashboard?view=catalog">
                    <button className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-md shadow-lg shadow-black/20">
                        Ver Catálogo
                    </button>
                </Link>
            </div>
        </div>
    );
};
