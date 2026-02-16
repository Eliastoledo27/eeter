'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function RegionalOperations() {
    const t = useTranslations('dashboard');

    return (
        <div className="bg-black/40 backdrop-blur-md border border-primary/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-xl p-6 relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase font-mono">{t('regional_operations')} {'//'} Argentina</h2>
                <div className="flex gap-2">
                    <div className="px-2 py-1 border border-primary/30 rounded text-[10px] text-primary uppercase bg-primary/5 font-mono">Buenos Aires</div>
                    <div className="px-2 py-1 border border-white/10 rounded text-[10px] text-gray-500 uppercase font-mono">Córdoba</div>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
                <div className="relative w-full h-full opacity-60 mix-blend-screen grayscale contrast-125 hover:opacity-100 transition-opacity duration-700">
                    <Image
                        src="https://raw.githubusercontent.com/djaiss/mapsicon/master/all/ar/vector.svg"
                        alt="Argentina Map"
                        fill
                        className="object-contain p-8 drop-shadow-[0_0_10px_rgba(200,138,4,0.3)]"
                    />
                </div>

                <div className="absolute bottom-[40%] left-[60%] flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-1.5 h-16 bg-white/10 rounded-t-sm relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-[70%] bg-gradient-to-t from-primary/10 to-primary shadow-[0_0_10px_#c88a04]"></div>
                    </div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#c88a04]"></div>
                </div>

                <div className="absolute top-[30%] left-[45%] flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-1.5 h-10 bg-white/10 rounded-t-sm relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-[40%] bg-gradient-to-t from-primary/10 to-primary"></div>
                    </div>
                    <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
