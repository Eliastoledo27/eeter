'use client';

import { ProductType } from '@/app/actions/products';
import { useState } from 'react';
import { X, TrendingUp, DollarSign, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    product: ProductType;
    onClose: () => void;
}

export function MarginCalculator({ product, onClose }: Props) {
    const [sellPrice, setSellPrice] = useState(Math.ceil(product.base_price * 1.4 / 1000) * 1000);
    const [qty, setQty] = useState(1);

    const margin = sellPrice - product.base_price;
    const marginPercent = ((margin / product.base_price) * 100).toFixed(1);
    const totalProfit = margin * qty;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp size={14} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Calculadora</h3>
                            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">{product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cost */}
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block mb-2">Tu Costo ÉTER</span>
                        <span className="text-3xl font-black text-white">${product.base_price.toLocaleString('es-AR')}</span>
                    </div>

                    {/* Sell Price Slider */}
                    <div>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block mb-3">Tu Precio de Venta</span>
                        <input
                            type="range"
                            min={product.base_price}
                            max={product.base_price * 3}
                            step={1000}
                            value={sellPrice}
                            onChange={(e) => setSellPrice(Number(e.target.value))}
                            className="w-full accent-[#00E5FF] h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-[9px] text-white/20 font-black">${product.base_price.toLocaleString('es-AR')}</span>
                            <span className="text-xl font-black text-[#00E5FF]">${sellPrice.toLocaleString('es-AR')}</span>
                            <span className="text-[9px] text-white/20 font-black">${(product.base_price * 3).toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block mb-3">Cantidad de Pares</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <Minus size={16} />
                            </button>
                            <span className="text-2xl font-black text-white w-16 text-center">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] text-emerald-400/60 font-black uppercase tracking-widest">Margen x par</span>
                            <span className="text-lg font-black text-emerald-400">+${margin.toLocaleString('es-AR')} ({marginPercent}%)</span>
                        </div>
                        <div className="h-[1px] bg-emerald-500/10" />
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] text-emerald-400/60 font-black uppercase tracking-widest">Ganancia Total ({qty} pares)</span>
                            <span className="text-2xl font-black text-emerald-400">+${totalProfit.toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
