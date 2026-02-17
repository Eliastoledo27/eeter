'use client';

import { useState } from 'react';
import { ProductManager } from '@/components/dashboard/products/ProductManager';
import { CouponManager } from '@/components/dashboard/admin/CouponManager';
import { Package, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="container mx-auto px-4 py-8">
            {isAdmin && (
                <div className="flex bg-white/5 border border-white/5 p-1.5 rounded-2xl w-fit mb-8 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'products'
                                ? "bg-[#C88A04] text-black shadow-lg shadow-[#C88A04]/20"
                                : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Package size={14} />
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'coupons'
                                ? "bg-[#C88A04] text-black shadow-lg shadow-[#C88A04]/20"
                                : "text-gray-500 hover:text-white"
                        )}
                    >
                        <Ticket size={14} />
                        Cupones
                    </button>
                </div>
            )}

            {activeTab === 'products' ? (
                <ProductManager />
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CouponManager />
                </div>
            )}
        </div>
    );
}

