'use client';

import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, ArrowLeft,
  ShieldCheck, RefreshCw, User, Phone, MapPin,
  CheckCircle2, Building2, Tag, Percent, Loader2, Wallet,
  CreditCard, Banknote, Copy, MessageCircle, ExternalLink,
  Sparkles, Target, Shield, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createOrderFromCart } from '@/app/actions/orders';
import { validateCoupon } from '@/app/actions/coupons';
import { toast } from 'sonner';

// Datos bancarios de Éter
const BANK_DATA = {
  titular: 'Elias Francesco Calderon Toledo',
  alias: 'eterstore / etershop',
  banco: 'Naranja',
};

const WHATSAPP_NUMBER = '5492236204002';

export function CartSidebar() {
  const {
    items, isOpen, toggleCart, removeItem, updateQuantity,
    clearCart, cartStep, setCartStep,
    getSubtotal, getDiscountAmount, getTotal: getFinalTotal,
    appliedCoupon, applyCoupon, removeCoupon,
    setLastOrder
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
    paymentMethod: 'mercadopago' as 'stripe' | 'mercadopago' | 'transferencia',
    notes: ''
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

  const handleNextStep = () => {
    if (cartStep === 'items') {
      if (items.length === 0) return;
      setCartStep('checkout');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('¡Copiado al portapapeles!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateWhatsAppTicket = (refCode: string, orderItems: any[], orderTotal: number) => {
    const itemsList = orderItems.map(item =>
      `▪️ ${item.quantity}x ${item.name} (${item.selectedSize}) — $${(item.basePrice * item.quantity).toLocaleString('es-AR')}`
    ).join('\n');

    const ticket = `🧾 *TICKET DE COMPRA — ÉTER STORE*
━━━━━━━━━━━━━━━━━━━━

📋 *Ref:* ${refCode}
📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}
🕐 *Hora:* ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}

👤 *Cliente:* ${formData.customerName}
📱 *Tel:* +54 9 ${formData.customerPhone}
📍 *Envío:* ${formData.deliveryAddress}
🏷️ *Reseller:* ${formData.resellerName}

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCTOS:*

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: $${orderTotal.toLocaleString('es-AR')}*
💳 *Método:* ${formData.paymentMethod === 'mercadopago' ? 'Mercado Pago' : formData.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Stripe'}

━━━━━━━━━━━━━━━━━━━━
✅ *Pedido registrado exitosamente*
🚚 Te contactaremos para coordinar el envío.

_Gracias por elegir ÉTER_ 🖤`;

    return encodeURIComponent(ticket);
  };

  const openWhatsApp = (refCode: string, orderItems: any[], orderTotal: number) => {
    const ticket = generateWhatsAppTicket(refCode, orderItems, orderTotal);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${ticket}`, '_blank');
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
        const currentItems = [...items];
        const currentTotal = total;
        setOrderedItems(currentItems);
        setOrderedTotal(currentTotal);
        setOrderId(result.orderId!);
        setReferenceCode(result.referenceCode!);

        // Persist order data for the success page
        setLastOrder({
          orderId: result.orderId!,
          referenceCode: result.referenceCode!,
          items: currentItems.map(i => ({
            name: i.name,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
            basePrice: i.basePrice,
            images: i.images || []
          })),
          total: currentTotal,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          deliveryAddress: formData.deliveryAddress,
          resellerName: formData.resellerName,
          paymentMethod: formData.paymentMethod
        });

        // Handle payment flow based on method
        if (formData.paymentMethod === 'transferencia') {
          setCartStep('transferencia');
        } else {
          // Mercado Pago or Stripe
          setCartStep('success');

          const paymentEndpoint = formData.paymentMethod === 'mercadopago' ? '/api/checkout/mercadopago' : '/api/checkout/stripe';
          try {
            const response = await fetch(paymentEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: currentItems.map(i => ({
                  id: i.id,
                  name: i.name,
                  price: i.basePrice,
                  size: i.selectedSize,
                  quantity: i.quantity,
                  images: i.images
                })),
                payer: {
                  firstName: formData.customerName,
                  lastName: '',
                  email: '',
                  phone: fullCustomerPhone,
                  address: formData.deliveryAddress,
                  city: '',
                  postalCode: '',
                  province: ''
                }
              })
            });
            const resultPayment = await response.json();
            if (resultPayment.success && resultPayment.init_point) {
              clearCart();
              window.location.href = resultPayment.init_point;
              return;
            } else {
              toast.error(`Error al iniciar el pago: ${resultPayment.error || "Intente nuevamente"}`);
            }
          } catch (error) {
            console.error("Network Error:", error);
            toast.error("Error de red al conectar pasarela de pago");
          }
        }
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

  // ─── RENDER ─────────────────────────────────────────────
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
            {/* Scanline / Grain Overlay for Premium Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[0]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent animate-scanline" />
            </div>

            {/* Glowing Accent */}
            <div className="absolute -top-[10%] -right-[10%] w-[300px] h-[300px] bg-[#00E5FF]/5 blur-[100px] rounded-full pointer-events-none" />
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
              <div className="flex items-center gap-3">
                {(cartStep === 'checkout' || cartStep === 'transferencia') && (
                  <button
                    onClick={() => setCartStep(cartStep === 'transferencia' ? 'checkout' : 'items')}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft size={16} className="text-white/70" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">
                    {cartStep === 'items' ? 'Tu Selección' :
                     cartStep === 'checkout' ? 'Checkout' :
                     cartStep === 'transferencia' ? 'Transferencia' :
                     'Pedido Confirmado'}
                  </h2>
                  {cartStep === 'items' && items.length > 0 && (
                    <p className="text-[9px] font-bold text-[#00E5FF] tracking-[0.3em] uppercase mt-0.5">
                      {items.reduce((a, b) => a + b.quantity, 0)} productos
                    </p>
                  )}
                  {cartStep === 'checkout' && (
                    <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-0.5">
                      Completa tus datos
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { toggleCart(); if (cartStep === 'success' || cartStep === 'transferencia') setCartStep('items'); }}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group"
              >
                <X className="text-white/70 group-hover:text-white" size={20} />
              </button>
            </header>

            {/* ── Progress Steps ── */}
            {cartStep !== 'success' && cartStep !== 'transferencia' && (
              <div className="px-8 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className={cn("h-1 flex-1 rounded-full transition-all duration-500", cartStep === 'items' || cartStep === 'checkout' ? "bg-[#00E5FF]" : "bg-white/10")} />
                  <div className={cn("h-1 flex-1 rounded-full transition-all duration-500", cartStep === 'checkout' ? "bg-[#00E5FF]" : "bg-white/10")} />
                  <div className="h-1 flex-1 rounded-full bg-white/10" />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#00E5FF]">Carrito</span>
                  <span className={cn("text-[7px] font-black uppercase tracking-[0.2em]", cartStep === 'checkout' ? "text-[#00E5FF]" : "text-gray-700")}>Datos</span>
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-700">Pago</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar">

              {/* ════════════════════ STEP: ITEMS ════════════════════ */}
              {cartStep === 'items' && (
                <div className="animate-in fade-in duration-500">
                  <div className="px-6 md:px-8 py-6 space-y-6">
                    {items.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                          <ShoppingBag className="text-gray-800" size={40} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase mb-4">Mirá el Catálogo</h3>
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
                          className="group flex gap-5 bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
                        >
                          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
                            <Image
                              src={item.images?.[0] || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 flex flex-col py-0.5">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-black text-white text-base tracking-tight uppercase leading-none mb-1.5">{item.name}</h3>
                                <span className="text-[9px] font-black text-[#00E5FF]/80 uppercase tracking-widest">Talle {item.selectedSize}</span>
                              </div>
                              <button
                                onClick={() => removeItem(item.id, item.selectedSize)}
                                className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                              <div className="flex items-center bg-black border border-white/10 rounded-xl px-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="w-7 text-center text-xs font-black text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <span className="text-lg font-black text-white">
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

              {/* ════════════════════ STEP: CHECKOUT ════════════════════ */}
              {cartStep === 'checkout' && (
                <div className="px-6 md:px-8 py-6 animate-in slide-in-from-right-10 duration-500">
                  <form onSubmit={handleCheckout} className="space-y-6">
                    {/* ── Form Fields ── */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Revendedor</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF]/60" size={15} />
                          <input
                            required
                            type="text"
                            placeholder="Nombre del Revendedor"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-700"
                            value={formData.resellerName}
                            onChange={e => setFormData({ ...formData, resellerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Cliente Final</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF]/60" size={15} />
                          <input
                            required
                            type="text"
                            placeholder="Nombre y Apellido"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-700"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">WhatsApp</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF]/60 font-bold text-xs">+54 9</span>
                          <input
                            required
                            type="tel"
                            placeholder="2235000000"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-[4.5rem] pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-700"
                            value={formData.customerPhone}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value.replace(/[^0-9]/g, '') })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Dirección de Envío</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF]/60" size={15} />
                          <input
                            required
                            type="text"
                            placeholder="Calle, Número, Localidad"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder:text-gray-700"
                            value={formData.deliveryAddress}
                            onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Notas <span className="text-gray-700">(opcional)</span></label>
                        <textarea
                          placeholder="Indicaciones para el envío..."
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all min-h-[70px] resize-none placeholder:text-gray-700"
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* ── Payment Methods ── */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Método de Pago</label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Mercado Pago */}
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'mercadopago' })}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[85px]",
                            formData.paymentMethod === 'mercadopago'
                              ? "border-[#009EE3] bg-[#009EE3]/10 text-[#009EE3] shadow-[0_0_20px_rgba(0,158,227,0.15)]"
                              : "border-white/10 text-gray-500 hover:border-white/20"
                          )}
                        >
                          <CreditCard size={20} />
                          <span className="text-[8px] font-black uppercase leading-tight text-center">Mercado Pago</span>
                          {formData.paymentMethod === 'mercadopago' && (
                            <span className="text-[6px] font-bold uppercase tracking-wider opacity-70">✨ Recomendado</span>
                          )}
                        </div>

                        {/* Transferencia */}
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'transferencia' })}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[85px]",
                            formData.paymentMethod === 'transferencia'
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                              : "border-white/10 text-gray-500 hover:border-white/20"
                          )}
                        >
                          <Banknote size={20} />
                          <span className="text-[8px] font-black uppercase leading-tight text-center">Transferencia</span>
                        </div>

                        {/* Stripe */}
                        <div
                          onClick={() => setFormData({ ...formData, paymentMethod: 'stripe' })}
                          className={cn(
                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[85px]",
                            formData.paymentMethod === 'stripe'
                              ? "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                              : "border-white/10 text-gray-500 hover:border-white/20"
                          )}
                        >
                          <Wallet size={20} />
                          <span className="text-[8px] font-black uppercase leading-tight text-center">Internacional</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Summary ── */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-white font-black">${subtotal.toLocaleString('es-AR')}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Percent size={10} /> {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-400 font-black">-${discount.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Total</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00B3FF]">
                          ${total.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={cn(
                        "w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-[0.15em] uppercase transition-all disabled:opacity-50 shadow-lg",
                        formData.paymentMethod === 'mercadopago'
                          ? "bg-[#009EE3] text-white hover:bg-[#008ACC]"
                          : formData.paymentMethod === 'transferencia'
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-[#00E5FF] text-black hover:bg-[#00C8E0]"
                      )}
                    >
                      {isProcessing ? (
                        <><Loader2 className="animate-spin" size={18} /> Procesando...</>
                      ) : (
                        <>
                          {formData.paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' :
                           formData.paymentMethod === 'transferencia' ? 'Ver Datos de Transferencia' :
                           'Pagar con Stripe'}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCartStep('items')}
                      className="w-full text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors py-2"
                    >
                      ← Revisar Productos
                    </button>
                  </form>
                </div>
              )}

              {/* ════════════════════ STEP: TRANSFERENCIA ════════════════════ */}
              {cartStep === 'transferencia' && (
                <div className="px-6 md:px-8 py-8 animate-in slide-in-from-right-10 duration-500 flex-1 overflow-y-auto">
                  {/* Digital Holographic Ticket */}
                  <div className="bg-[#0A0A0A] border border-emerald-500/30 rounded-[2.5rem] p-8 relative overflow-hidden mb-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] group">
                    {/* Scanlines for the ticket */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 animate-pulse" />
                    
                    {/* Watermark Logo */}
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                      <Sparkles size={200} className="text-emerald-500" />
                    </div>

                    <div className="text-center mb-8 relative z-10">
                      <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
                        <Banknote className="text-emerald-400" size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Orden de <span className="text-emerald-400">Transferencia</span></h3>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Beneficio VIP: 10% OFF Aplicado</span>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {[
                        { label: 'ALIAS DE CUENTA', value: BANK_DATA.alias, key: 'alias', icon: Target },
                        { label: 'TITULAR REGISTRADO', value: BANK_DATA.titular, key: 'titular', icon: Shield },
                        { label: 'ENTIDAD BANCARIA', value: BANK_DATA.banco, key: 'banco', icon: Zap },
                      ].map(({ label, value, key, icon: Icon }) => (
                        <div key={key} className="group/item relative overflow-hidden">
                          <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl px-5 py-4 transition-all group-hover/item:border-emerald-500/30">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 transition-colors">
                                <Icon size={18} />
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-0.5">{label}</span>
                                <span className="text-sm font-bold text-white tracking-tight">{value}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(value, key)}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                copiedField === key 
                                  ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                                  : "bg-white/[0.05] text-gray-400 hover:text-white"
                              )}
                            >
                              {copiedField === key ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] p-6 relative overflow-hidden shadow-inner">
                      <div className="flex justify-between items-end relative z-10">
                        <div>
                          <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em] block mb-1">Monto Total Final</span>
                          <span className="text-4xl font-black text-emerald-400 tracking-tighter italic">${orderedTotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-gray-500 uppercase block">Ref Code</span>
                          <span className="text-xs font-black text-white font-mono">{referenceCode}</span>
                        </div>
                      </div>
                      {/* Grid effect inside amount box */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #10b981 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        clearCart();
                        openWhatsApp(referenceCode!, orderedItems, orderedTotal);
                      }}
                      className="w-full h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-widest uppercase shadow-[0_10px_30px_rgba(37,211,102,0.25)]"
                    >
                      <MessageCircle size={20} />
                      Enviar Comprobante por WhatsApp
                    </motion.button>

                    <button
                      onClick={() => {
                        clearCart();
                        setCartStep('items');
                        toggleCart();
                      }}
                      className="w-full py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Cerrar y volver a la tienda
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════════════ STEP: SUCCESS (MP/Stripe redirect fallback) ════════════════════ */}
              {cartStep === 'success' && (
                <div className="px-6 md:px-8 py-10 flex flex-col items-center animate-in zoom-in-95 duration-700">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                    <CheckCircle2 className="text-emerald-500" size={40} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase mb-2 text-center">¡Pedido Creado!</h2>
                  <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-center">Redirigiendo a la pasarela de pago...</p>

                  <div className="w-full flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-[#00E5FF]" size={32} />
                  </div>

                  <button
                    onClick={() => {
                      setCartStep('items');
                      toggleCart();
                    }}
                    className="w-full py-3 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors mt-4"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer (Items Step Only) ── */}
            {cartStep === 'items' && items.length > 0 && (
              <div className="bg-black border-t border-white/5 px-6 md:px-8 py-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                {/* Coupon */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">¿Tienes un cupón?</span>
                    {appliedCoupon && (
                      <button onClick={removeCoupon} className="text-[8px] font-bold text-red-400 uppercase tracking-tighter hover:text-red-300 transition-colors">
                        Remover {appliedCoupon.code}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={11} />
                      <input
                        type="text"
                        placeholder="CÓDIGO"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-2 pl-8 pr-3 text-[10px] font-black text-white placeholder:text-gray-700 focus:outline-none focus:border-[#00E5FF]/50 transition-all uppercase"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white rounded-lg border border-white/5 disabled:opacity-30 transition-all"
                    >
                      {isValidatingCoupon ? <Loader2 className="animate-spin" size={11} /> : 'OK'}
                    </button>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-5 pt-4 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-black text-white">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {appliedCoupon && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Percent size={9} className="text-emerald-400" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{appliedCoupon.code}</span>
                      </div>
                      <span className="text-sm font-black text-emerald-400">-${discount.toLocaleString('es-AR')}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Total</span>
                    <span className="text-2xl font-black text-white tracking-tighter">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleNextStep}
                  className="w-full bg-white h-14 rounded-2xl flex items-center justify-center gap-3 text-black font-black text-xs tracking-[0.15em] uppercase hover:bg-zinc-200 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.08)] group"
                >
                  Siguiente Paso
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-1.5 opacity-30">
                    <ShieldCheck size={12} className="text-[#00E5FF]" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Protocolo Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-30">
                    <RefreshCw size={12} className="text-[#00E5FF]" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Garantía Éter</span>
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
