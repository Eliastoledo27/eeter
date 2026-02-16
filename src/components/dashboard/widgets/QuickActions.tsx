'use client';

import { useTranslations } from 'next-intl';
import { Plus, ShoppingCart, RefreshCw, Megaphone, ShoppingBag, MessageSquare, ListOrdered, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export function QuickActions() {
    const t = useTranslations('dashboard');
    const { user } = useAuthStore();
    const router = useRouter();
    const role = user?.app_metadata?.role || 'user';

    const handleNav = (path: string) => router.push(path);

    // Admin Actions
    if (role === 'admin' || role === 'support') {
        return (
            <div className="pb-4">
                <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 font-mono">
                    {t('quick_execution') || 'Acciones Rápidas'}
                </h3>
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => handleNav('/dashboard/catalogue?new=true')} className="flex-1 min-w-[140px] border border-primary text-primary hover:bg-primary hover:text-white rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                        {t('add_product') || 'Nuevo Producto'}
                    </button>
                    <button onClick={() => handleNav('/dashboard/purchases?new=true')} className="flex-1 min-w-[140px] border border-primary/50 text-white hover:border-primary hover:bg-primary/10 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                        <ShoppingCart size={16} className="text-primary group-hover:scale-110 transition-transform" />
                        {t('create_order') || 'Crear Pedido'}
                    </button>
                    {role === 'admin' && (
                        <>
                            <button onClick={() => handleNav('/dashboard/catalogue')} className="flex-1 min-w-[140px] border border-primary/50 text-white hover:border-primary hover:bg-primary/10 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                                <RefreshCw size={16} className="text-primary group-hover:spin transition-transform" />
                                {t('stock_update') || 'Stock'}
                            </button>
                            <button onClick={() => handleNav('/dashboard/messages?broadcast=true')} className="flex-1 min-w-[140px] border border-primary/50 text-white hover:border-primary hover:bg-primary/10 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                                <Megaphone size={16} className="text-primary group-hover:scale-110 transition-transform" />
                                {t('campaign') || 'Campaña'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // User/Reseller Actions
    return (
        <div className="pb-4">
            <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3 font-mono">
                Atajos
            </h3>
            <div className="flex gap-4 flex-wrap">
                <button onClick={() => handleNav('/dashboard/myshop')} className="flex-1 min-w-[140px] border border-[#C88A04]/50 text-[#C88A04] hover:bg-[#C88A04]/10 hover:border-[#C88A04] rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                    <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
                    Mi Tienda
                </button>
                <button onClick={() => handleNav('/dashboard/catalogue')} className="flex-1 min-w-[140px] border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                    <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
                    Catálogo
                </button>
                <button onClick={() => handleNav('/dashboard/purchases')} className="flex-1 min-w-[140px] border border-white/20 text-white hover:border-primary hover:bg-white/5 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                    <ListOrdered size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                    Mis Pedidos
                </button>
                <button onClick={() => handleNav('/dashboard/messages')} className="flex-1 min-w-[140px] border border-white/20 text-white hover:border-blue-500 hover:bg-blue-500/10 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                    <MessageSquare size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    Soporte
                </button>
                <button onClick={() => handleNav('/academy')} className="flex-1 min-w-[140px] border border-white/20 text-white hover:border-purple-500 hover:bg-purple-500/10 rounded-lg py-4 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs font-bold group bg-black/40 backdrop-blur-sm font-mono">
                    <FileText size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    Academia
                </button>
            </div>
        </div>
    );
}
