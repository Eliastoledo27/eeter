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
            productId: i.id,
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
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[540px] bg-[#020202] border-l border-white/10 z-[210] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF]/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7A00FF]/5 blur-[100px] rounded-full" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150 mix-blend-overlay opacity-40" />
            </div>

            {/* Glowing Accent */}
            <div className="absolute -top-[10%] -right-[10%] w-[300px] h-[300px] bg-[#00E5FF]/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* ── Header ── */}
            <header className="relative flex items-center justify-between px-8 py-8 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-50">
              <div className="flex items-center gap-4">
                {(cartStep === 'checkout' || cartStep === 'transferencia') && (
                  <button
                    onClick={() => setCartStep(cartStep === 'transferencia' ? 'checkout' : 'items')}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <ArrowLeft size={18} className="text-white/50 group-hover:text-white" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                    {cartStep === 'items' ? 'Mi Carrito' :
                     cartStep === 'checkout' ? 'Finalizar' :
                     cartStep === 'transferencia' ? 'Pago' :
                     'Completado'}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 w-8 rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                    <p className="text-[10px] font-black text-[#00E5FF]/60 tracking-[0.2em] uppercase">Ecosistema ÉTER</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { toggleCart(); if (cartStep === 'success' || cartStep === 'transferencia') setCartStep('items'); }}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#FF0055]/10 hover:border-[#FF0055]/20 group transition-all"
              >
                <X className="text-white/40 group-hover:text-[#FF0055]" size={24} />
              </button>
            </header>

            {/* ── Progress Steps ── */}
            {cartStep !== 'success' && cartStep !== 'transferencia' && (
              <div className="px-8 py-5 bg-black/20 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-700 relative overflow-hidden", cartStep === 'items' || cartStep === 'checkout' ? "bg-[#00E5FF]/20" : "bg-white/5")}>
                    {(cartStep === 'items' || cartStep === 'checkout') && <motion.div layoutId="progress" className="absolute inset-0 bg-[#00E5FF]" />}
                  </div>
                  <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-700 relative overflow-hidden", cartStep === 'checkout' ? "bg-[#00E5FF]/20" : "bg-white/5")}>
                    {cartStep === 'checkout' && <motion.div layoutId="progress-2" className="absolute inset-0 bg-[#00E5FF]" />}
                  </div>
                  <div className="h-1.5 flex-1 rounded-full bg-white/5" />
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", cartStep === 'items' ? "text-[#00E5FF]" : "text-white/40")}>Selección</span>
                  <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", cartStep === 'checkout' ? "text-[#00E5FF]" : "text-white/40")}>Información</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Liquidación</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
              {/* ════════════════════ STEP: ITEMS ════════════════════ */}
              {cartStep === 'items' && (
                <div className="animate-in fade-in duration-500">
                  <div className="px-8 py-8 space-y-6">
                    {items.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-28 h-28 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group">
                          <ShoppingBag className="text-gray-800 group-hover:text-[#00E5FF]/40 transition-colors" size={48} />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter text-white uppercase mb-4 italic">El Carrito está <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">Vacío</span></h3>
                        <p className="text-gray-600 text-sm max-w-[280px] leading-relaxed mb-12 font-medium">Sincroniza tu estilo con las mejores sneakers del mercado.</p>
                        <Button
                          onClick={toggleCart}
                          className="bg-white text-black font-black text-xs tracking-[0.2em] uppercase py-7 px-14 rounded-2xl hover:bg-[#00E5FF] hover:text-black transition-all shadow-[0_10px_40px_rgba(255,255,255,0.05)]"
                        >
                          Explorar Catálogo
                        </Button>
                      </div>
                    ) : (
                      items.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`${item.id}-${item.selectedSize}`}
                          className="group flex gap-6 bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 hover:border-[#00E5FF]/20 hover:bg-white/[0.04] transition-all relative overflow-hidden"
                        >
                          <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-black relative">
                            <Image
                              src={item.images?.[0] || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-1 flex flex-col py-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none mb-2 group-hover:text-[#00E5FF] transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-black text-white/60 uppercase tracking-widest">Talle {item.selectedSize}</span>
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none">Unid. ${item.basePrice.toLocaleString('es-AR')}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(item.id, item.selectedSize)}
                                className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center text-gray-700 hover:text-[#FF0055] hover:bg-[#FF0055]/10 hover:border-[#FF0055]/20 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                              <div className="flex items-center bg-black/50 border border-white/5 rounded-xl p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-10 text-center text-sm font-black text-white italic">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-xl font-black text-white italic group-hover:text-[#00E5FF] transition-colors">
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
                <div className="px-8 py-8 animate-in slide-in-from-right-10 duration-500">
                  <form onSubmit={handleCheckout} className="space-y-8">
                    {/* ── Form Section Title ── */}
                    <div className="flex items-center gap-3 mb-2">
                       <User size={16} className="text-[#00E5FF]" />
                       <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Información de Compra</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Representante ÉTER</label>
                        <div className="relative group/field">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#00E5FF] transition-colors" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Nombre del Revendedor"
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all placeholder:text-gray-800"
                            value={formData.resellerName}
                            onChange={e => setFormData({ ...formData, resellerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Cliente</label>
                          <div className="relative group/field">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#00E5FF] transition-colors" size={16} />
                            <input
                              required
                              type="text"
                              placeholder="Nombre Completo"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all placeholder:text-gray-800"
                              value={formData.customerName}
                              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">WhatsApp</label>
                          <div className="relative group/field">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[10px] text-white/30 group-focus-within/field:text-[#00E5FF] transition-colors">+54 9</span>
                            <input
                              required
                              type="tel"
                              placeholder="2235000000"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-16 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all placeholder:text-gray-800"
                              value={formData.customerPhone}
                              onChange={e => setFormData({ ...formData, customerPhone: e.target.value.replace(/[^0-9]/g, '') })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Logística y Envío</label>
                        <div className="relative group/field">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#00E5FF] transition-colors" size={16} />
                          <input
                            required
                            type="text"
                            placeholder="Dirección exacta, Localidad, CP"
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all placeholder:text-gray-800"
                            value={formData.deliveryAddress}
                            onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Instrucciones Adicionales</label>
                        <textarea
                          placeholder="Referencia de casa, horarios de entrega..."
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all min-h-[100px] resize-none placeholder:text-gray-800"
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* ── Payment Methods ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <CreditCard size={16} className="text-[#00E5FF]" />
                         <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Fondeo y Pago</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'mercadopago', icon: CreditCard, label: 'MP', color: '#009EE3', accent: 'shadow-[0_0_20px_rgba(0,158,227,0.2)]' },
                          { id: 'transferencia', icon: Banknote, label: 'Transfer', color: '#10b981', accent: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' },
                          { id: 'stripe', icon: Wallet, label: 'Global', color: '#00E5FF', accent: 'shadow-[0_0_20px_rgba(0,229,255,0.2)]' }
                        ].map((method) => (
                          <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                            className={cn(
                              "relative p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] overflow-hidden",
                              formData.paymentMethod === method.id
                                ? `bg-white/[0.05] border-[${method.color}] ${method.accent}`
                                : "bg-white/[0.01] border-white/5 text-gray-600 hover:border-white/10"
                            )}
                            style={{ borderColor: formData.paymentMethod === method.id ? method.color : undefined }}
                          >
                             <method.icon size={24} className={cn(formData.paymentMethod === method.id ? "text-white" : "text-gray-700")} />
                             <span className={cn("text-[9px] font-black uppercase tracking-widest", formData.paymentMethod === method.id ? "text-white" : "text-gray-700")}>{method.label}</span>
                             {formData.paymentMethod === method.id && (
                               <div className="absolute top-0 right-0 w-8 h-8 bg-current opacity-10 rounded-bl-full" style={{ color: method.color }} />
                             )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* ── Summary & CTA ── */}
                    <div className="pt-4 border-t border-white/5 space-y-6">
                      <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[2rem] p-6 space-y-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-bold uppercase tracking-[0.2em]">Carga Parcial</span>
                          <span className="text-white font-black italic">${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-xs items-center">
                            <span className="text-[#00E5FF] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 bg-[#00E5FF]/10 px-2 py-0.5 rounded-md border border-[#00E5FF]/20">
                              <Tag size={10} /> {appliedCoupon.code}
                            </span>
                            <span className="text-[#00E5FF] font-black italic">-${discount.toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block mb-1">Total a Liquidar</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sincronizado vía ÉTER Core</span>
                          </div>
                          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00B3FF] tracking-tighter italic">
                            ${total.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={cn(
                          "w-full h-16 rounded-[1.5rem] flex items-center justify-center gap-4 font-black text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-50 relative overflow-hidden group",
                          formData.paymentMethod === 'mercadopago'
                            ? "bg-[#009EE3] text-white"
                            : formData.paymentMethod === 'transferencia'
                            ? "bg-emerald-500 text-white"
                            : "bg-[#00E5FF] text-black"
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" size={20} /> <span className="relative z-10 italic">Procesando...</span></>
                        ) : (
                          <span className="relative z-10 flex items-center gap-3">
                            {formData.paymentMethod === 'mercadopago' ? 'Confirmar via Mercado Pago' :
                             formData.paymentMethod === 'transferencia' ? 'Protocolo de Transferencia' :
                             'Liquidación Internacional'}
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCartStep('items')}
                        className="w-full text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-white transition-all py-2 italic"
                      >
                        ← Volver a la Selección
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ════════════════════ STEP: TRANSFERENCIA ════════════════════ */}
              {cartStep === 'transferencia' && (
                <div className="px-8 py-10 animate-in slide-in-from-right-10 duration-500 flex-1 overflow-y-auto scroll-smooth">
                  {/* Digital Holographic Ticket */}
                  <div className="bg-[#050505] border border-emerald-500/20 rounded-[2.5rem] p-8 relative overflow-hidden mb-10 shadow-[0_0_50px_rgba(16,185,129,0.1)] group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    
                    <div className="text-center mb-10 relative z-10">
                      <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-700 shadow-inner">
                        <Banknote className="text-emerald-400" size={40} />
                      </div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">Orden de <span className="text-emerald-400">Transferencia</span></h3>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none italic">Sincronización VIP Activada</span>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {[
                        { label: 'ALIAS DE CUENTA', value: BANK_DATA.alias, key: 'alias', icon: Target },
                        { label: 'TITULAR REGISTRADO', value: BANK_DATA.titular, key: 'titular', icon: Shield },
                        { label: 'ENTIDAD BANCARIA', value: BANK_DATA.banco, key: 'banco', icon: Zap },
                      ].map(({ label, value, key, icon: Icon }) => (
                        <div key={key} className="group/item">
                          <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-[1.5rem] px-6 py-5 transition-all group-hover/item:border-emerald-500/30">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-gray-500 group-hover/item:text-emerald-400 transition-all">
                                <Icon size={20} />
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] block mb-1">{label}</span>
                                <span className="text-base font-black text-white tracking-tight italic">{value}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(value, key)}
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                copiedField === key 
                                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]" 
                                  : "bg-white/[0.05] border border-white/5 text-gray-500 hover:text-white hover:border-white/20"
                              )}
                            >
                              {copiedField === key ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden">
                      <div className="flex justify-between items-end relative z-10">
                        <div>
                          <span className="text-[11px] font-black text-emerald-400/60 uppercase tracking-[0.3em] block mb-2">Liquidación Final</span>
                          <span className="text-5xl font-black text-emerald-400 tracking-tighter italic leading-none">${orderedTotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-gray-600 uppercase block mb-1">Referencia ÉTER</span>
                          <span className="text-sm font-black text-white font-mono">{referenceCode}</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        clearCart();
                        openWhatsApp(referenceCode!, orderedItems, orderedTotal);
                      }}
                      className="w-full h-16 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs tracking-[0.2em] uppercase shadow-[0_15px_40px_rgba(37,211,102,0.2)] hover:shadow-[0_20px_50px_rgba(37,211,102,0.3)] transition-all"
                    >
                      <MessageCircle size={22} />
                      Enviar Comprobante WhatsApp
                    </motion.button>

                    <button
                      onClick={() => {
                        clearCart();
                        setCartStep('items');
                        toggleCart();
                      }}
                      className="w-full py-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] hover:text-white transition-all text-center italic"
                    >
                      Finalizar y Sincronizar
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════════════ STEP: SUCCESS (MP/Stripe redirect fallback) ════════════════════ */}
              {cartStep === 'success' && (
                <div className="px-8 py-16 flex flex-col items-center animate-in zoom-in-95 duration-1000">
                  <div className="relative mb-10">
                    <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[40px] rounded-full scale-150 animate-pulse" />
                    <div className="w-24 h-24 rounded-full bg-black border border-[#00E5FF]/30 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
                      <CheckCircle2 className="text-[#00E5FF]" size={48} />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase mb-4 text-center italic leading-none">Canal <span className="text-[#00E5FF]">Establecido</span></h2>
                  <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mb-12 text-center">Conectando con pasarela de liquidación...</p>

                  <div className="flex items-center gap-3 py-10">
                    <Loader2 className="animate-spin text-[#00E5FF]" size={40} />
                  </div>

                  <button
                    onClick={() => {
                      setCartStep('items');
                      toggleCart();
                    }}
                    className="w-full py-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] hover:text-white transition-all mt-auto italic"
                  >
                    Salir del Proceso
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer (Items Step Only) ── */}
            {cartStep === 'items' && items.length > 0 && (
              <div className="bg-[#030303] border-t border-white/5 px-8 py-8 shadow-[0_-30px_60px_rgba(0,0,0,0.8)] relative z-50">
                {/* Coupon */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">CÓDIGO ALPHA</span>
                    {appliedCoupon && (
                      <button onClick={removeCoupon} className="text-[9px] font-black text-[#FF0055] uppercase tracking-tighter hover:bg-[#FF0055]/10 px-2 py-0.5 rounded-md transition-all">
                        CANCELAR {appliedCoupon.code}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00E5FF] transition-colors" size={14} />
                      <input
                        type="text"
                        placeholder="ETR-2026"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-black text-white placeholder:text-gray-900 focus:outline-none focus:border-[#00E5FF]/30 focus:bg-white/[0.04] transition-all uppercase italic"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-6 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[11px] font-black uppercase tracking-[0.2em] text-[#00E5FF] rounded-xl border border-[#00E5FF]/20 disabled:opacity-20 transition-all flex items-center justify-center min-w-[80px]"
                    >
                      {isValidatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'ACTIVAR'}
                    </button>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-3 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Carga de Productos</span>
                    <span className="text-base font-black text-white italic">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {appliedCoupon && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-between items-center bg-[#00E5FF]/5 p-2 rounded-xl border border-[#00E5FF]/10">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#00E5FF] flex items-center justify-center">
                           <Percent size={10} className="text-black" />
                        </div>
                        <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">{appliedCoupon.code}</span>
                      </div>
                      <span className="text-base font-black text-[#00E5FF] italic">-${discount.toLocaleString('es-AR')}</span>
                    </motion.div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em] block mb-0.5">NETO A PAGAR</span>
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">SISTEMA ÉTER v5.3</span>
                    </div>
                    <span className="text-4xl font-black text-white tracking-tighter italic leading-none">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleNextStep}
                  className="w-full bg-white h-16 rounded-[1.5rem] flex items-center justify-center gap-4 text-black font-black text-sm tracking-[0.3em] uppercase hover:bg-[#00E5FF] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.05)] active:scale-95 group"
                >
                  <span className="italic leading-none">Siguiente Nivel</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="flex justify-around items-center mt-6">
                  <div className="flex items-center gap-2 opacity-20 hover:opacity-40 transition-opacity">
                    <ShieldCheck size={14} className="text-[#00E5FF]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">NODOS SEGUROS</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-20 hover:opacity-40 transition-opacity">
                    <RefreshCw size={14} className="text-[#00E5FF]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">SYNC 24/7</span>
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
