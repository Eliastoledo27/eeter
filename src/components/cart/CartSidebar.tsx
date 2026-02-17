'use client';

import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, ShoppingBag, Trash2, ArrowRight,
  ShieldCheck, RefreshCw, User, Phone, MapPin,
  CheckCircle2, Building2, Tag, Percent, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createOrderFromCart } from '@/app/actions/orders';
import { validateCoupon } from '@/app/actions/coupons';
import { toast } from 'sonner';

export function CartSidebar() {
  const {
    items, isOpen, toggleCart, removeItem, updateQuantity,
    clearCart, resellerWhatsApp, cartStep, setCartStep,
    getSubtotal, getDiscountAmount, getTotal: getFinalTotal,
    appliedCoupon, applyCoupon, removeCoupon
  } = useCartStore();

  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    resellerName: user?.name || '',
    deliveryAddress: '',
    paymentMethod: 'transferencia' as 'transferencia' | 'efectivo' | 'mercado_pago' | 'tarjeta',
    notes: ''
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

  const handleNextStep = () => {
    if (cartStep === 'items') {
      if (items.length === 0) return;
      setCartStep('checkout');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.deliveryAddress || !formData.resellerName) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsProcessing(true);
    try {
      const fullCustomerPhone = `549${formData.customerPhone}`;
      const result = await createOrderFromCart({
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.basePrice,
          quantity: item.quantity,
          size: item.selectedSize,
          image: item.images[0]
        })),
        customerName: formData.customerName,
        customerPhone: fullCustomerPhone,
        resellerName: formData.resellerName,
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        couponCode: appliedCoupon?.code
      });

      if (result.success) {
        setOrderedItems([...items]);
        setOrderedTotal(total);
        setOrderId(result.orderId!);
        setReferenceCode(result.referenceCode!);
        setCartStep('success');

        const message = `*PEDIDO ÉTER STORE*%0A` +
          `---------------------------%0A` +
          `*Orden:* ${result.referenceCode}%0A` +
          `*Revendedor:* ${formData.resellerName}%0A` +
          `*Cliente:* ${formData.customerName}%0A` +
          `*Teléfono:* ${fullCustomerPhone}%0A` +
          `*Dirección:* ${formData.deliveryAddress}%0A` +
          `---------------------------%0A` +
          `*PRODUCTOS:*%0A` +
          items.map(item => `- ${item.quantity}x ${item.name} (${item.selectedSize}) - $${(item.basePrice * item.quantity).toLocaleString('es-AR')}`).join('%0A') +
          `%0A---------------------------%0A` +
          `*TOTAL: $${total.toLocaleString('es-AR')}*%0A` +
          `*Método:* ${formData.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}%0A` +
          (formData.notes ? `*Notas:* ${formData.notes}%0A` : '');

        const waNumber = resellerWhatsApp || '5492235025196';

        setTimeout(() => {
          try {
            window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
          } catch (e) {
            console.error("WhatsApp redirect blocked:", e);
          }
          clearCart();
        }, 1500);

      } else {
        toast.error(result.message || 'Error al procesar el pedido');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.success && result.coupon) {
        applyCoupon(result.coupon);
        setCouponCode('');
        toast.success(`Cupón ${result.coupon.code} aplicado con éxito`);
      } else {
        toast.error(result.error || 'Error al validar el cupón');
      }
    } catch (error) {
      toast.error('Error de conexión al validar el cupón');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#050505] border-l border-white/5 z-[210] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tighter text-white uppercase italic">
                  {cartStep === 'items' ? 'Tu Selección' : cartStep === 'checkout' ? 'Datos de Envío' : 'Pedido Confirmado'}
                </h2>
                {cartStep === 'items' && items.length > 0 && (
                  <p className="text-[9px] md:text-[10px] font-bold text-[#C88A04] tracking-[0.3em] uppercase mt-1">
                    {items.reduce((a, b) => a + b.quantity, 0)} PRODUCTOS LISTOS
                  </p>
                )}
              </div>
              <button
                onClick={toggleCart}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group"
              >
                <X className="text-white/70 group-hover:text-white" size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
              {cartStep === 'items' && (
                <div className="animate-in fade-in duration-500">
                  <div className="px-8 py-8 space-y-8">
                    {items.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                          <ShoppingBag className="text-gray-800" size={40} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase mb-4">MIRA EL CATÁLOGO</h3>
                        <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed mb-10">Tu carrito aún está esperando la mejor selección de sneakers brasileros.</p>
                        <Button
                          onClick={toggleCart}
                          className="bg-white text-black font-black text-[10px] tracking-widest uppercase py-6 px-12 rounded-2xl"
                        >
                          Explorar Ahora
                        </Button>
                      </div>
                    ) : (
                      items.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={`${item.id}-${item.selectedSize}`}
                          className="group flex gap-6"
                        >
                          <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative">
                            <Image
                              src={item.images?.[0] || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 flex flex-col py-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-2">{item.name}</h3>
                                <span className="text-[10px] font-black text-[#C88A04]/80 uppercase tracking-widest">TALLE {item.selectedSize}</span>
                              </div>
                              <button
                                onClick={() => removeItem(item.id, item.selectedSize)}
                                className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-xl font-black text-white">
                                ${(item.basePrice * item.quantity).toLocaleString('es-AR')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {cartStep === 'checkout' && (
                <div className="px-8 py-8 animate-in slide-in-from-right-10 duration-500">
                  <form onSubmit={handleCheckout} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Revendedor Responsable</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C88A04]" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Nombre del Revendedor / Empresa"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#C88A04] transition-all"
                            value={formData.resellerName}
                            onChange={e => setFormData({ ...formData, resellerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Nombre del Cliente</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C88A04]" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Nombre y Apellido del Cliente"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#C88A04] transition-all"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">WhatsApp Cliente</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C88A04] font-bold text-sm whitespace-nowrap">+54 9</span>
                          <input
                            required
                            type="tel"
                            placeholder="2235000000"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-20 pr-4 text-sm text-white focus:outline-none focus:border-[#C88A04] transition-all"
                            value={formData.customerPhone}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value.replace(/[^0-9]/g, '') })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Dirección de Envío</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C88A04]" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Calle, Número, Localidad"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#C88A04] transition-all"
                            value={formData.deliveryAddress}
                            onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Notas Adicionales</label>
                        <textarea
                          placeholder="Indicaciones para el envío, referencias, etc."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-4 text-sm text-white focus:outline-none focus:border-[#C88A04] transition-all min-h-[100px] resize-none"
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'transferencia' })}
                          className={cn(
                            "p-4 rounded-2xl border cursor-pointer transition-all text-center",
                            formData.paymentMethod === 'transferencia'
                              ? "bg-[#C88A04]/10 border-[#C88A04] text-white"
                              : "bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20"
                          )}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Pago</span>
                          <span className="text-xs font-bold uppercase">Transferencia</span>
                        </div>
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'efectivo' })}
                          className={cn(
                            "p-4 rounded-2xl border cursor-pointer transition-all text-center",
                            formData.paymentMethod === 'efectivo'
                              ? "bg-[#C88A04]/10 border-[#C88A04] text-white"
                              : "bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20"
                          )}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Pago</span>
                          <span className="text-xs font-bold uppercase">Efectivo</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-[#C88A04] h-16 rounded-2xl flex items-center justify-center gap-3 text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-[#ECA413] transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(200,138,4,0.3)]"
                    >
                      {isProcessing ? 'Procesando...' : 'Finalizar Pedido'}
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCartStep('items')}
                      className="w-full text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Revisar Productos
                    </button>
                  </form>
                </div>
              )}

              {cartStep === 'success' && (
                <div className="px-8 py-12 flex flex-col items-center animate-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                    <CheckCircle2 className="text-emerald-500" size={48} />
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase mb-4 text-center leading-[0.9]">GRACIAS POR <br /> TU COMPRA</h2>
                  <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mb-12 text-center">PROTOCOLO DE PEDIDO CONFIRMADO</p>

                  {/* Digital Ticket */}
                  <div className="w-full bg-[#111] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#C88A04] shadow-[0_4px_20px_rgba(200,138,4,0.4)]" />

                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="text-[8px] font-black text-[#C88A04] tracking-[0.4em] uppercase block mb-1">ID REFERENCIA</span>
                        <h4 className="text-xl font-black text-white tracking-tighter">{referenceCode}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black text-gray-600 tracking-[0.3em] uppercase block mb-1">FECHA</span>
                        <span className="text-[10px] font-bold text-white">{new Date().toLocaleDateString('es-AR')}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 border-y border-white/5 py-8">
                      {orderedItems.map(item => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-xs font-bold uppercase tracking-tight">
                          <span className="text-gray-400">{item.quantity}x {item.name} <span className="text-[9px] text-[#C88A04]/60 ml-2">{item.selectedSize}</span></span>
                          <span className="text-white">${(item.basePrice * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] font-black text-[#C88A04] tracking-widest uppercase">TOTAL DEL PEDIDO</span>
                      <span className="text-3xl font-black text-white">${orderedTotal.toLocaleString('es-AR')}</span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 space-y-4 mb-8">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 uppercase font-black tracking-widest leading-none">Reseller Jefe</span>
                        <span className="text-white font-bold">{formData.resellerName}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 uppercase font-black tracking-widest leading-none">Cliente Final</span>
                        <span className="text-white font-bold">{formData.customerName}</span>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-dashed border-white/10 flex flex-col items-center gap-4">
                      <div className="w-full h-12 bg-white flex items-center justify-center rounded-xl p-2 px-6">
                        <div className="w-full h-full flex items-center justify-center gap-[2px]">
                          {[...Array(40)].map((_, i) => (
                            <div key={i} className={cn("bg-black rounded-full", i % 7 === 0 ? "w-[3px] h-full" : i % 3 === 0 ? "w-[1px] h-3/4" : "w-[2px] h-2/3")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[8px] font-black text-gray-700 tracking-[0.6em] uppercase">ÉTER DIGITAL RECEIPT</p>
                    </div>
                  </div>

                  <div className="mt-12 w-full space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const fullCustomerPhone = `549${formData.customerPhone}`;
                        const message = `*PEDIDO ÉTER STORE*%0A` +
                          `---------------------------%0A` +
                          `*Orden:* ${referenceCode}%0A` +
                          `*Revendedor:* ${formData.resellerName}%0A` +
                          `*Cliente:* ${formData.customerName}%0A` +
                          `*Teléfono:* ${fullCustomerPhone}%0A` +
                          `*Dirección:* ${formData.deliveryAddress}%0A` +
                          `---------------------------%0A` +
                          `*PRODUCTOS:*%0A` +
                          orderedItems.map(item => `- ${item.quantity}x ${item.name} (${item.selectedSize}) - $${(item.basePrice * item.quantity).toLocaleString('es-AR')}`).join('%0A') +
                          `%0A---------------------------%0A` +
                          `*TOTAL: $${orderedTotal.toLocaleString('es-AR')}*%0A` +
                          `*Método:* ${formData.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}%0A` +
                          (formData.notes ? `*Notas:* ${formData.notes}%0A` : '');

                        const waNumber = resellerWhatsApp || '5492235025196';
                        window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
                      }}
                      className="w-full bg-[#25D366] text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-widest uppercase shadow-[0_10px_30px_rgba(37,211,102,0.3)]"
                    >
                      Enviar de nuevo a WhatsApp
                    </motion.button>
                    <button
                      onClick={() => {
                        setCartStep('items');
                        toggleCart();
                      }}
                      className="w-full py-4 text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
                    >
                      Cerrar y volver a la tienda
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary (Only for items step) */}
            {cartStep === 'items' && items.length > 0 && (
              <div className="bg-black border-t border-white/10 px-8 py-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                {/* Coupon Section */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">¿Tienes un cupón?</span>
                    {appliedCoupon && (
                      <button
                        onClick={removeCoupon}
                        className="text-[9px] font-bold text-red-400 uppercase tracking-tighter hover:text-red-300 transition-colors"
                      >
                        Remover {appliedCoupon.code}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                      <input
                        type="text"
                        placeholder="CÓDIGO"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[10px] font-black text-white placeholder:text-gray-700 focus:outline-none focus:border-[#C88A04]/50 transition-all uppercase"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white rounded-xl border border-white/5 disabled:opacity-30 transition-all"
                    >
                      {isValidatingCoupon ? <Loader2 className="animate-spin" size={12} /> : 'Aplicar'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8 pt-6 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-black text-white">${subtotal.toLocaleString('es-AR')}</span>
                  </div>

                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <Percent size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Descuento ({appliedCoupon.code})</span>
                      </div>
                      <span className="text-sm font-black text-emerald-400">-${discount.toLocaleString('es-AR')}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Total Inversión</span>
                    <span className="relative">
                      {appliedCoupon && (
                        <span className="absolute -top-4 right-0 text-[10px] text-gray-600 line-through font-bold">
                          ${subtotal.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="text-3xl font-black text-white tracking-tighter">${total.toLocaleString('es-AR')}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-white h-16 rounded-2xl flex items-center justify-center gap-3 text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
                  >
                    Siguiente Paso
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2 opacity-40">
                      <ShieldCheck size={14} className="text-[#C88A04]" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Protocolo Seguro</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <RefreshCw size={14} className="text-[#C88A04]" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Garantía Éter</span>
                    </div>
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
