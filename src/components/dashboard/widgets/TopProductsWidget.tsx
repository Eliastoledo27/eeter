'use client';

import { BentoItem } from '../bento/BentoGrid';
import Image from 'next/image';
import { TopProduct } from '@/app/actions/dashboard';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TopProductsWidget({ products = [] }: { products: TopProduct[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy size={14} className="text-[#F59E0B]" strokeWidth={2.5} />;
    if (index === 1) return <Medal size={14} className="text-[#94A3B8]" strokeWidth={2.5} />;
    if (index === 2) return <Award size={14} className="text-[#92400E]" strokeWidth={2.5} />;
    return null;
  };

  const getMedalBg = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-amber-500/15 to-amber-600/10 border-amber-400/30';
    if (index === 1) return 'bg-gradient-to-br from-slate-400/15 to-slate-500/10 border-slate-400/30';
    if (index === 2) return 'bg-gradient-to-br from-amber-700/15 to-amber-800/10 border-amber-700/30';
    return 'bg-white/40 border-slate-200/50';
  };

  const maxRevenue = products.length > 0 ? Math.max(...products.map(p => p.revenue)) : 1;

  return (
    <BentoItem colSpan={1} rowSpan={2} className="overflow-hidden">
      <div className="flex items-center gap-2 mb-4 relative z-20">
        <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse motion-reduce:animate-none" />
        <h3 className="text-[#0F172A] font-black text-lg tracking-tight uppercase">Top Productos</h3>
        <TrendingUp size={16} className="text-[#10B981] ml-auto" />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Trophy size={32} className="text-slate-300" />
          </div>
          <p className="text-[#94A3B8] text-xs font-medium">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-2.5 relative z-10">
          {products.map((product, index) => {
            const progressWidth = (product.revenue / maxRevenue) * 100;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative group cursor-pointer p-2.5 rounded-xl border transition-all duration-300",
                  getMedalBg(index),
                  "hover:scale-[1.02] hover:shadow-lg"
                )}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/5 to-transparent rounded-xl transition-all duration-500"
                  style={{ width: `${progressWidth}%` }}
                />

                <div className="flex items-center gap-2.5 relative z-10">
                  {/* Rank/Medal */}
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-lg font-bold text-xs transition-all duration-300",
                    index < 3
                      ? "bg-white/80 border border-white/60 shadow-md group-hover:scale-110"
                      : "text-[#94A3B8] group-hover:text-[#1E40AF]"
                  )}>
                    {index < 3 ? getMedalIcon(index) : index + 1}
                  </div>

                  {/* Product Image */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    className="relative w-11 h-11 rounded-lg overflow-hidden bg-white border-2 border-white/80 shadow-md"
                  >
                    <Image
                      src={product.image || '/placeholder-shoe.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#1E40AF] transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-[#64748B] font-medium">
                        {product.sales} ventas
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[#E2E8F0]" />
                      <div className="h-1 flex-1 bg-slate-200/60 rounded-full overflow-hidden max-w-[40px]">
                        <div
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] transition-all duration-500"
                          style={{ width: `${(product.sales / (products[0]?.sales || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right">
                    <p className="text-xs font-black text-[#1E40AF] tracking-tight">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>

                {/* Hover glow */}
                {index < 3 && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </BentoItem>
  );
}
