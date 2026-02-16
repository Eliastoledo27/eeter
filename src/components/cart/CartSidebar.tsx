'use client';

import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, CreditCard, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

export function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const freeShippingThreshold = 200000; // Example threshold
  const [couponCode, setCouponCode] = useState('');

  const progress = Math.min((total / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - total, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[60]"
          />

          {/* Sidebar - Stitch Exact Design */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#0a0a0a] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            {/* 1. Header */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 text-white">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight font-display">
                  TU CARRITO <span className="text-[#ffd900] font-normal text-lg">({items.reduce((a, b) => a + b.quantity, 0)})</span>
                </h2>
              </div>
              <button
                onClick={toggleCart}
                className="group p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="text-white/70 group-hover:text-[#ffd900] transition-colors" size={24} />
              </button>
            </header>

            {/* Main Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">

              {/* 2. Free Shipping Progress */}
              <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#141414]/50">
                <p className="text-sm font-body text-gray-300 mb-3 flex items-center gap-2">
                  <Truck className="text-[#ffd900]" size={16} />
                  {remainingForFreeShipping > 0 ? (
                    <>
                      ¡Estás a <span className="text-white font-bold">${remainingForFreeShipping.toLocaleString('es-AR')}</span> del envío gratis!
                    </>
                  ) : (
                    <span className="text-[#ffd900] font-bold">¡Tenés envío gratis!</span>
                  )}
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#ffd900]/60 to-[#ffd900] h-2 rounded-full shadow-[0_0_10px_rgba(255,217,0,0.3)] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 3. Cart Items List */}
              <div className="px-6 py-6 space-y-6">
                {items.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-gray-400 font-display">Tu carrito está vacío</p>
                    <Button
                      onClick={toggleCart}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-8"
                    >
                      Ver Catálogo
                    </Button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="group flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5 relative">
                        <Image
                          src={item.images?.[0] || '/placeholder.png'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white text-lg leading-tight font-display">{item.name}</h3>
                            <p className="text-sm text-gray-400 font-body mt-1">Talle: {item.selectedSize}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id, item.selectedSize)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          {/* Quantity Control */}
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#ffd900] hover:bg-white/5 transition-colors rounded-l-md disabled:opacity-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-white font-display">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#ffd900] hover:bg-white/5 transition-colors rounded-r-md"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-[#ffd900] font-bold tracking-wide font-display">
                            ${(item.basePrice * item.quantity).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 4. Coupon Section */}
              {items.length > 0 && (
                <>
                  <div className="px-6 py-6 border-t border-white/5 mt-auto">
                    <label htmlFor="coupon" className="block text-xs font-body uppercase tracking-wider text-gray-500 mb-2">
                      Código promocional
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="coupon"
                        type="text"
                        placeholder="Código de descuento"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ffd900] focus:border-[#ffd900] transition-all font-display"
                      />
                      <button className="px-5 py-2 bg-transparent border border-[#ffd900] text-[#ffd900] font-bold text-sm rounded-md hover:bg-[#ffd900] hover:text-black transition-all font-display">
                        APLICAR
                      </button>
                    </div>
                  </div>
                  <div className="h-6"></div> {/* Spacer */}
                </>
              )}
            </div>

            {/* 5, 6, 7. Footer Summary & Actions */}
            {items.length > 0 && (
              <div className="bg-[#141414] border-t border-white/10 px-6 py-6 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] z-20">
                {/* Summary */}
                <div className="space-y-3 mb-6 font-body text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-display">${total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Descuento</span>
                    <span className="text-white font-display">-</span>
                  </div>
                  <div className="flex justify-between text-gray-400 items-center">
                    <span>Envío</span>
                    {remainingForFreeShipping <= 0 ? (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-400/10 px-2 py-0.5 rounded">GRATIS</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Calculado en checkout</span>
                    )}
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <span className="text-white font-bold text-lg font-display">Total</span>
                    <span className="text-3xl font-bold text-[#ffd900] tracking-tight font-display">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      const message = `Hola Éter Store, quiero realizar el siguiente pedido:%0A%0A${items.map(item => `- ${item.quantity}x ${item.name} (Talle: ${item.selectedSize}) - $${(item.basePrice * item.quantity).toLocaleString('es-AR')}`).join('%0A')}%0A%0ATotal: $${total.toLocaleString('es-AR')}`;
                      window.open(`https://wa.me/5492235025196?text=${message}`, '_blank');
                      toggleCart();
                    }}
                    className="w-full bg-[#ffd900] text-black font-bold py-4 rounded-md text-lg tracking-wide hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,217,0,0.3)] transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 group font-display h-auto"
                  >
                    REALIZAR PEDIDO POR WHATSAPP
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <button className="w-full bg-[#009EE3] text-white font-medium py-3 rounded-md hover:bg-[#008bc7] transition-colors flex items-center justify-center gap-2 font-body">
                    <span className="text-sm">Pagar con</span>
                    <span className="font-bold italic">mercadopago</span>
                    <CreditCard size={18} />
                  </button>
                  <div className="text-center pt-2">
                    <button onClick={toggleCart} className="text-sm text-gray-400 hover:text-[#ffd900] transition-colors border-b border-transparent hover:border-[#ffd900] pb-0.5 font-display">
                      Continuar comprando
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/5 opacity-60">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ShieldCheck className="text-[#ffd900]" size={18} />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-display">Pago Seguro</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <RefreshCw className="text-[#ffd900]" size={18} />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-display">Devolución Fácil</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ShieldCheck className="text-[#ffd900]" size={18} />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-display">Autenticidad</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
