'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function TacticalFeed() {
    const t = useTranslations('dashboard');

    const products = [
        { name: "Nike Air Max", tag: "RUNNING / RED", price: "$189.00", stock: "142/200", stockFill: "70%", color: "primary", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80" },
        { name: "Yeezy Boost", tag: "LIFESTYLE / WHT", price: "$320.00", stock: "12/200", stockFill: "20%", color: "red-500", critical: true, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80" },
        { name: "Jordan 1 High", tag: "BASKETBALL / GRY", price: "$245.00", stock: "85/100", stockFill: "85%", color: "primary", img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80" },
        { name: "Track.2", tag: "COUTURE / BLK", price: "$950.00", stock: "12/25", stockFill: "45%", color: "primary", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80" }
    ];

    return (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-4">
                <h3 className="text-sm font-bold text-white/90 tracking-widest uppercase border-l-2 border-primary pl-3 font-mono">{t('tactical_feed')}</h3>
                <a className="text-[10px] text-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 font-mono" href="#">
                    {t('view_all')} <ArrowRight size={12} />
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((item, idx) => (
                    <div key={idx} className="bg-black/40 backdrop-blur-md border border-primary/20 hover:border-primary/60 shadow-lg rounded-lg p-0 relative group overflow-hidden transition-all h-64">
                        <div className="absolute top-3 left-3 z-20">
                            <span className="text-[9px] font-mono text-primary bg-black/60 border border-primary/20 px-1.5 py-0.5 rounded uppercase">
                                {item.tag.split(' / ')[0]} {'//'} LTD
                            </span>
                        </div>

                        {/* Dome Effect Container */}
                        <div className="h-40 w-full relative flex items-center justify-center mt-2 perspective-1000">
                            <div className="absolute inset-x-4 inset-y-2 rounded-t-full bg-gradient-to-b from-white/5 to-transparent z-10 border-t border-white/10 pointer-events-none"></div>
                            <div className="relative w-32 h-32 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 z-0">
                                <Image
                                    src={item.img}
                                    alt={item.name}
                                    fill
                                    className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-black/60 backdrop-blur-md border-t border-white/5 absolute bottom-0 w-full h-24 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-semibold text-white font-heading">{item.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{item.tag}</p>
                                </div>
                                <span className="text-sm font-mono text-primary font-bold">{item.price}</span>
                            </div>

                            <div className="mt-3 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.critical ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-primary shadow-[0_0_5px_#c88a04]'}`}
                                    style={{ width: item.stockFill }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-1">
                                <span className="text-[9px] text-gray-500 font-mono">{item.critical ? 'CRITICAL' : 'STOCK LVL'}</span>
                                <span className={`text-[9px] font-mono ${item.critical ? 'text-red-400' : 'text-white'}`}>{item.stock}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
