'use client';

import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, ArrowLeft,
  ShieldCheck, RefreshCw, User, MapPin,
  CheckCircle2, Building2, Tag, Percent, Loader2, Wallet,
  CreditCard, Banknote, Copy, MessageCircle,
  Target, Shield, Zap, ChevronDown, Truck, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createOrderFromCart } from '@/app/actions/orders';
import { validateCoupon } from '@/app/actions/coupons';
import { toast } from 'sonner';
import { cartNotify } from '@/components/cart/CartNotificationSystem';
import { usePathname } from 'next/navigation';
import { getResellerBySlug } from '@/app/actions/reseller-catalog';

// Datos bancarios oficiales de Éter
const BANK_DATA = {
  titular: 'Elias Francesco Calderon Toledo',
  alias: 'eterstore / etershop',
  banco: 'Naranja',
};

const WHATSAPP_NUMBER = '5492236204002';
const FREE_SHIPPING_THRESHOLD = 250000;

export function CartSidebar() {
  const {
    items, isOpen, toggleCart, removeItem, updateQuantity,
    clearCart, cartStep, setCartStep,
    getSubtotal, getDiscountAmount, getTotal: getFinalTotal,
    appliedCoupon, applyCoupon, removeCoupon,
    setLastOrder, resellerWhatsApp
  } = useCartStore();

  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Per-item loading state (key: `${id}-${size}`)
  const [itemLoading, setItemLoading] = useState<Record<string, 'remove' | 'qty-up' | 'qty-down'>>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Reseller path detection
  const pathname = usePathname();
  const isResellerCatalog = pathname ? pathname.startsWith('/c/') : false;
  const resellerSlug = isResellerCatalog && pathname ? pathname.split('/')[2] : null;

  const [resellerProfile, setResellerProfile] = useState<any>(null);
  const [loadingReseller, setLoadingReseller] = useState(false);

  useEffect(() => {
    if (!resellerSlug) {
      setResellerProfile(null);
      return;
    }

    const fetchReseller = async () => {
      setLoadingReseller(true);
      try {
        const { data, error } = await getResellerBySlug(resellerSlug);
        if (data) {
          setResellerProfile(data);
        } else {
          console.error(error);
        }
      } catch (err) {
        console.error('Error fetching reseller for cart:', err);
      } finally {
        setLoadingReseller(false);
      }
    };

    fetchReseller();
  }, [resellerSlug]);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    resellerName: '',
    deliveryAddress: '',
    paymentMethod: 'mercadopago' as 'mercadopago' | 'transferencia' | 'stripe',
    notes: ''
  });

  const [checkoutSubStep, setCheckoutSubStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingForm, setShippingForm] = useState({
    nombre: '',
    apellido: '',
    whatsapp: '',
    provincia: 'Buenos Aires',
    localidad: 'Mar del Plata',
    codigoPostal: '',
    direccion: '',
    altura: '',
    depto: '',
    notas: ''
  });

  // Calculate totals
  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getFinalTotal();
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Shipping progress calculation
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Coupon handling
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponCode.trim(), subtotal);
      if (res.valid && res.coupon) {
        applyCoupon(res.coupon);
        toast.success(`Cupón ${res.coupon.code} aplicado con éxito`);
        setCouponCode('');
        setShowCouponInput(false);
      } else {
        toast.error(res.message || 'Cupón inválido o expirado');
      }
    } catch (err) {
      toast.error('Error al validar el cupón');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info('Cupón eliminado');
  };

  const handleUpdateQuantity = async (
    id: string,
    size: string,
    newQuantity: number,
    direction: 'up' | 'down',
    name: string,
    image?: string
  ) => {
    const key = `${id}-${size}`;
    setItemLoading((prev) => ({ ...prev, [key]: direction === 'up' ? 'qty-up' : 'qty-down' }));
    updateQuantity(id, size, newQuantity);
    setTimeout(() => {
      setItemLoading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 200);
  };

  const handleRemoveItem = (id: string, size: string, name: string, image?: string) => {
    const key = `${id}-${size}`;
    setItemLoading((prev) => ({ ...prev, [key]: 'remove' }));
    removeItem(id, size);
    cartNotify({
      type: 'removed',
      title: 'Producto eliminado',
      message: `${name} (Talle AR ${size})`,
      productImage: image || '/hero.webp'
    });
    setTimeout(() => {
      setItemLoading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 200);
  };

  const handleGoToPayment = () => {
    if (!shippingForm.nombre.trim()) { toast.error('Completá tu nombre'); return; }
    if (!shippingForm.apellido.trim()) { toast.error('Completá tu apellido'); return; }
    if (!shippingForm.whatsapp.trim()) { toast.error('Completá tu WhatsApp'); return; }
    if (!shippingForm.direccion.trim()) { toast.error('Completá tu dirección'); return; }
    if (!shippingForm.altura.trim()) { toast.error('Completá la altura / número de calle'); return; }

    setFormData({
      ...formData,
      customerName: `${shippingForm.nombre.trim()} ${shippingForm.apellido.trim()}`,
      customerPhone: shippingForm.whatsapp.trim(),
      deliveryAddress: `${shippingForm.direccion.trim()} ${shippingForm.altura.trim()}${shippingForm.depto ? `, Depto/Piso: ${shippingForm.depto.trim()}` : ''}, ${shippingForm.localidad.trim()}, ${shippingForm.provincia.trim()}${shippingForm.codigoPostal ? ` (CP ${shippingForm.codigoPostal.trim()})` : ''}`,
      notes: shippingForm.notas.trim(),
      resellerName: isResellerCatalog && resellerProfile ? (resellerProfile.full_name || 'Mi Showroom') : (user?.name || 'Éter Oficial')
    });

    setCheckoutSubStep('payment');
  };

  const handleNextStep = () => {
    if (cartStep === 'items') {
      if (items.length === 0) return;
      setCartStep('checkout');
      setCheckoutSubStep('shipping');
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

    const headerTitle = isResellerCatalog ? formData.resellerName.toUpperCase() : 'ÉTER STORE';
    const footerThanks = isResellerCatalog ? `Gracias por elegir ${formData.resellerName}` : 'Gracias por elegir ÉTER';

    const ticket = `🧾 *TICKET DE COMPRA — ${headerTitle}*
━━━━━━━━━━━━━━━━━━━━

📋 *Ref:* ${refCode}
📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}
🕐 *Hora:* ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}

👤 *Cliente:* ${formData.customerName}
📱 *Tel:* +54 9 ${formData.customerPhone}
📍 *Envío:* ${formData.deliveryAddress}
${isResellerCatalog ? `🏷️ *Showroom:* ${formData.resellerName}` : `🏷️ *Reseller:* ${formData.resellerName}`}

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCTOS:*

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: $${orderTotal.toLocaleString('es-AR')}*
💳 *Método:* ${formData.paymentMethod === 'mercadopago' ? 'Mercado Pago' : formData.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Stripe'}

━━━━━━━━━━━━━━━━━━━━
✅ *Pedido registrado exitosamente*
🚚 Te contactaremos para coordinar el despacho en 24/48hs.

_${footerThanks}_ 🖤`;

    return encodeURIComponent(ticket);
  };

  const openWhatsApp = (refCode: string, orderItems: any[], orderTotal: number) => {
    const ticket = generateWhatsAppTicket(refCode, orderItems, orderTotal);
    const number = (isResellerCatalog && (resellerWhatsApp || resellerProfile?.whatsapp_number)) || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${number}?text=${ticket}`, '_blank');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.deliveryAddress) {
      toast.error('Por favor completa los datos de entrega');
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
        resellerName: formData.resellerName || 'Éter Oficial',
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
          paymentMethod: formData.paymentMethod,
          createdAt: new Date().toISOString()
        });

        if (formData.paymentMethod === 'transferencia') {
          setCartStep('transferencia');
        } else if (result.initPoint) {
          clearCart();
          window.location.href = result.initPoint;
        } else {
          setCartStep('success');
        }
      } else {
        toast.error(result.message || 'Error al procesar el pedido');
      }
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] transition-opacity duration-300"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] z-[210] bg-[#070707] border-l border-white/10 text-white shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden font-sans"
          >
            {/* Minimal Progress Bar */}
            {cartStep !== 'success' && (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-white/5 z-[220] overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{
                    width:
                      cartStep === 'items'
                        ? '33.33%'
                        : cartStep === 'checkout'
                        ? checkoutSubStep === 'shipping'
                          ? '66.66%'
                          : '85%'
                        : '100%'
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="h-full bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.8)]"
                />
              </div>
            )}

            {/* ── 1. HEADER ── */}
            <header className="relative flex items-center justify-between px-6 py-5 z-50 shrink-0 border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                {cartStep === 'checkout' && (
                  <button
                    onClick={() => {
                      if (checkoutSubStep === 'payment') {
                        setCheckoutSubStep('shipping');
                      } else {
                        setCartStep('items');
                      }
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft size={14} />
                  </button>
                )}

                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  {cartStep === 'items'
                    ? 'Mi Carrito'
                    : cartStep === 'checkout'
                    ? checkoutSubStep === 'shipping'
                      ? `CARRITO (${totalItemsCount})`
                      : 'Método de Pago'
                    : cartStep === 'transferencia'
                    ? 'Transferencia'
                    : 'Completado'}
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                {cartStep === 'items' && items.length > 0 && (
                  <button
                    onClick={() => {
                      clearCart();
                      cartNotify({
                        type: 'removed',
                        title: 'Carrito vaciado',
                        message: 'Se han eliminado todos los productos'
                      });
                    }}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 hover:text-[#FF3A5C] px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Vaciar
                  </button>
                )}

                <button
                  onClick={() => {
                    toggleCart();
                    if (cartStep === 'success' || cartStep === 'transferencia') setCartStep('items');
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </header>

            {/* ── 2. FREE SHIPPING THRESHOLD NOTIFICATION ── */}
            {(cartStep === 'items' || cartStep === 'checkout') && (
              <div className="px-6 py-3 shrink-0 z-40 border-b border-white/[0.06] bg-[#0c0c0c]/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Truck size={13} className="text-[#39FF14]" />
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-[#39FF14] font-bold">¡Tenés ENVÍO GRATIS a todo el país!</span>
                    ) : (
                      <span>
                        Envío gratis superando <strong className="text-white">$250.000</strong>
                      </span>
                    )}
                  </span>
                  {remainingForFreeShipping > 0 && (
                    <span className="text-[10px] text-white/40">
                      Faltan ${remainingForFreeShipping.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>

                {/* Progress bar container */}
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#39FF14] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── 3. SCROLLABLE BODY ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 px-5 sm:px-6 py-5 space-y-4">
              {/* ════════════════════ STEP 1: ITEMS LIST ════════════════════ */}
              {cartStep === 'items' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  {items.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                        <ShoppingBag className="text-white/30" size={32} />
                      </div>
                      <h3 className="text-base font-black uppercase text-white mb-1.5">Tu carrito está vacío</h3>
                      <p className="text-white/40 text-xs max-w-[240px] leading-relaxed mb-6 font-mono">
                        Agregá calzados del catálogo para comenzar tu compra.
                      </p>
                      <button
                        onClick={toggleCart}
                        className="px-6 py-3 rounded-xl bg-[#39FF14] text-black font-mono text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                      >
                        Explorar Catálogo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {items.map((item) => {
                          const key = `${item.id}-${item.selectedSize}`;
                          const op = itemLoading[key];
                          const isRemoving = op === 'remove';

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: isRemoving ? 0.3 : 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              key={key}
                              className="group flex gap-3.5 p-3.5 rounded-2xl bg-[#0c0c0c] border border-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden"
                            >
                              {/* Shoe Image */}
                              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-[#121212] relative flex items-center justify-center p-1.5">
                                <Image
                                  src={item.images?.[0] || '/hero.webp'}
                                  alt={item.name}
                                  fill
                                  unoptimized
                                  className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-white text-xs sm:text-sm tracking-tight leading-snug line-clamp-1 group-hover:text-[#39FF14] transition-colors">
                                      {item.name}
                                    </h3>
                                    <button
                                      onClick={() => handleRemoveItem(item.id, item.selectedSize, item.name, item.images?.[0])}
                                      disabled={!!op}
                                      aria-label={`Eliminar ${item.name}`}
                                      className="text-white/30 hover:text-[#FF3A5C] transition-colors p-1"
                                    >
                                      {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                      Talle: AR {item.selectedSize}
                                    </span>
                                  </div>
                                </div>

                                {/* Price & Quantity Controls */}
                                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                                  {/* Quantity pill */}
                                  <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.quantity - 1, 'down', item.name, item.images?.[0])}
                                      disabled={!!op || item.quantity <= 1}
                                      className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded transition-colors disabled:opacity-20"
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span className="w-7 text-center text-xs font-mono font-bold text-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.quantity + 1, 'up', item.name, item.images?.[0])}
                                      disabled={!!op}
                                      className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white rounded transition-colors disabled:opacity-20"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>

                                  {/* Price */}
                                  <span className="font-mono font-black text-sm text-white">
                                    ${(item.basePrice * item.quantity).toLocaleString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Coupon Accordion */}
                      <div className="border-t border-white/[0.08] pt-4 mt-5">
                        {appliedCoupon ? (
                          <div className="flex justify-between items-center p-3 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/20">
                            <div className="flex items-center gap-2">
                              <Percent size={13} className="text-[#39FF14]" />
                              <span className="text-xs font-mono font-bold text-[#39FF14]">{appliedCoupon.code}</span>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-[10px] font-mono font-bold text-[#FF3A5C] hover:underline uppercase tracking-wider"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <button
                              type="button"
                              onClick={() => setShowCouponInput(!showCouponInput)}
                              className="text-xs font-mono text-white/50 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                              <Tag size={13} />
                              ¿Tenés un código alpha o cupón?
                            </button>

                            {showCouponInput && (
                              <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <input
                                  type="text"
                                  placeholder="CÓDIGO DE DESCUENTO"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                  className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all uppercase"
                                />
                                <button
                                  onClick={handleApplyCoupon}
                                  disabled={isValidatingCoupon || !couponCode.trim()}
                                  className="px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#39FF14] text-black rounded-xl hover:bg-white transition-all disabled:opacity-40"
                                >
                                  {isValidatingCoupon ? <Loader2 className="animate-spin" size={13} /> : 'Aplicar'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ════════════════════ STEP 2: CHECKOUT (SHIPPING & PAYMENT) ════════════════════ */}
              {cartStep === 'checkout' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  {checkoutSubStep === 'shipping' ? (
                    /* ── Sub-step 2A: Shipping Information Form ── */
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          DATOS DE ENTREGA
                        </h3>
                        <p className="text-[11px] text-white/50 mt-0.5">
                          Completá los datos para coordinar el despacho seguro en 24/48hs.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Nombre & Apellido */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            required
                            type="text"
                            placeholder="Nombre"
                            value={shippingForm.nombre}
                            onChange={(e) => setShippingForm({ ...shippingForm, nombre: e.target.value })}
                            className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                          />
                          <input
                            required
                            type="text"
                            placeholder="Apellido"
                            value={shippingForm.apellido}
                            onChange={(e) => setShippingForm({ ...shippingForm, apellido: e.target.value })}
                            className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                          />
                        </div>

                        {/* WhatsApp */}
                        <div className="relative">
                          <input
                            required
                            type="tel"
                            placeholder="WhatsApp (ej. 223 620 4002)"
                            value={shippingForm.whatsapp}
                            onChange={(e) =>
                              setShippingForm({ ...shippingForm, whatsapp: e.target.value.replace(/[^0-9]/g, '') })
                            }
                            className="w-full py-3 pl-3.5 pr-10 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                          />
                          <MessageCircle
                            size={16}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#39FF14] pointer-events-none"
                          />
                        </div>

                        {/* Código Postal */}
                        <input
                          type="text"
                          placeholder="Código postal"
                          value={shippingForm.codigoPostal}
                          onChange={(e) => setShippingForm({ ...shippingForm, codigoPostal: e.target.value })}
                          className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                        />

                        {/* Dirección */}
                        <input
                          required
                          type="text"
                          placeholder="Dirección / Calle"
                          value={shippingForm.direccion}
                          onChange={(e) => setShippingForm({ ...shippingForm, direccion: e.target.value })}
                          className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                        />

                        {/* Altura / Calle y número */}
                        <input
                          required
                          type="text"
                          placeholder="Altura / Calle y número"
                          value={shippingForm.altura}
                          onChange={(e) => setShippingForm({ ...shippingForm, altura: e.target.value })}
                          className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                        />

                        {/* Departamento / Piso (opcional) */}
                        <input
                          type="text"
                          placeholder="Departamento / Piso (opcional)"
                          value={shippingForm.depto}
                          onChange={(e) => setShippingForm({ ...shippingForm, depto: e.target.value })}
                          className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all"
                        />

                        {/* Referencias o notas (opcional) */}
                        <textarea
                          placeholder="Referencias de entrega o notas (opcional)"
                          value={shippingForm.notas}
                          onChange={(e) => setShippingForm({ ...shippingForm, notas: e.target.value })}
                          className="w-full py-3 px-3.5 text-xs font-mono bg-[#121212] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#39FF14] focus:outline-none transition-all min-h-[75px] resize-none"
                        />
                      </div>

                      {/* CONTINUAR Button */}
                      <button
                        type="button"
                        onClick={handleGoToPayment}
                        className="w-full h-12 mt-4 rounded-2xl bg-white text-black font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all group"
                      >
                        <span>CONTINUAR</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    /* ── Sub-step 2B: Payment Method Selection ── */
                    <form onSubmit={handleCheckout} className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-[#39FF14]" />
                          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                            Seleccioná Método de Pago
                          </h3>
                        </div>

                        {isResellerCatalog ? (
                          <div className="p-4 rounded-2xl bg-[#0c0c0c] border border-emerald-500/20 space-y-2">
                            <div className="flex items-center gap-2 text-[#39FF14] font-bold text-xs uppercase">
                              <Banknote size={16} />
                              <span>Transferencia Bancaria Directa</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed font-mono">
                              Esta tienda procesa pagos por transferencia bancaria directa al showroom. Al continuar obtendrás los datos bancarios y el comprobante por WhatsApp.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2.5">
                            {[
                              { id: 'mercadopago', icon: CreditCard, label: 'Mercado Pago' },
                              { id: 'transferencia', icon: Banknote, label: 'Transferencia' },
                              { id: 'stripe', icon: Wallet, label: 'Tarjeta' }
                            ].map((method) => {
                              const isSelected = formData.paymentMethod === method.id;
                              return (
                                <div
                                  key={method.id}
                                  onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[75px] ${
                                    isSelected
                                      ? 'bg-[#39FF14]/10 border-[#39FF14] text-white shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                                      : 'bg-[#121212] border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                                  }`}
                                >
                                  <method.icon size={18} className={isSelected ? 'text-[#39FF14]' : 'text-white/40'} />
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-center leading-tight">
                                    {method.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Totals Breakdown */}
                      <div className="rounded-2xl bg-[#0c0c0c] border border-white/[0.08] p-4 space-y-2 font-mono">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Subtotal</span>
                          <span className="text-white">${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-xs text-[#39FF14]">
                            <span>Descuento ({appliedCoupon.code})</span>
                            <span>-${discount.toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        <div className="h-px bg-white/5 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white uppercase">Total Final</span>
                          <span className="text-base font-black text-[#39FF14]">
                            ${total.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>

                      {/* Final Submit CTA */}
                      <div className="space-y-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full h-12 rounded-2xl bg-[#39FF14] text-black font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all group disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <span className="flex items-center gap-2">
                              {formData.paymentMethod === 'mercadopago'
                                ? 'PAGAR CON MERCADO PAGO'
                                : formData.paymentMethod === 'transferencia'
                                ? 'SOLICITAR TRANSFERENCIA'
                                : 'PAGAR CON TARJETA'}
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutSubStep('shipping')}
                          className="w-full text-center text-[10px] font-mono font-bold uppercase tracking-wider py-1.5 text-white/40 hover:text-white transition-colors"
                        >
                          ← Volver a datos de entrega
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ════════════════════ STEP 3: TRANSFERENCIA BANCARIA ════════════════════ */}
              {cartStep === 'transferencia' && (
                <div className="px-1 py-1 animate-in slide-in-from-right-4 duration-300 space-y-5 font-mono">
                  <div className="rounded-3xl border border-emerald-500/20 bg-[#0c0c0c] p-5 relative overflow-hidden shadow-xl">
                    <div className="text-center mb-5">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Banknote className="text-[#39FF14]" size={22} />
                      </div>
                      <h3 className="text-base font-black uppercase text-white">Datos de Transferencia</h3>
                      <p className="text-[10px] text-[#39FF14] tracking-wider mt-0.5">ORDEN REGISTRADA EXITOSAMENTE</p>
                    </div>

                    <div className="space-y-2.5">
                      {(() => {
                        const getBankDetails = () => {
                          if (isResellerCatalog && resellerProfile) {
                            return {
                              alias: resellerProfile.bank_alias,
                              cbu: resellerProfile.bank_cbu,
                              titular: resellerProfile.bank_owner_name || resellerProfile.full_name || 'Titular no especificado',
                              banco: resellerProfile.bank_cbu ? 'CBU / CVU' : 'Transferencia Directa'
                            };
                          }
                          return {
                            alias: BANK_DATA.alias,
                            cbu: null,
                            titular: BANK_DATA.titular,
                            banco: BANK_DATA.banco
                          };
                        };

                        const bankDetails = getBankDetails();
                        const transferItems = [
                          { label: 'Titular de la cuenta', value: bankDetails.titular, key: 'titular' },
                          ...(bankDetails.alias ? [{ label: 'Alias de cuenta', value: bankDetails.alias, key: 'alias' }] : []),
                          ...(bankDetails.cbu ? [{ label: 'CBU / CVU', value: bankDetails.cbu, key: 'cbu' }] : []),
                          ...(!isResellerCatalog ? [{ label: 'Banco', value: BANK_DATA.banco, key: 'banco' }] : [])
                        ];

                        return transferItems.map(({ label, value, key }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all"
                          >
                            <div>
                              <span className="text-[9px] font-bold uppercase text-white/40 block">{label}</span>
                              <span className="text-xs font-bold text-white">{value}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(value, key)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                copiedField === key
                                  ? 'bg-[#39FF14] text-black shadow-md'
                                  : 'bg-white/5 text-white/50 hover:text-white'
                              }`}
                            >
                              {copiedField === key ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ));
                      })()}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-white/40 block">Monto a Transferir</span>
                        <span className="text-lg font-black text-[#39FF14]">${orderedTotal.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase text-white/40 block">N° Referencia</span>
                        <span className="text-xs font-bold text-white">{referenceCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        clearCart();
                        openWhatsApp(referenceCode!, orderedItems, orderedTotal);
                      }}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white font-mono font-black text-xs uppercase tracking-widest hover:bg-[#20ba5a] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                    >
                      <MessageCircle size={16} />
                      <span>Enviar Comprobante por WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        clearCart();
                        setCartStep('items');
                        toggleCart();
                      }}
                      className="w-full text-center text-[10px] font-mono font-bold uppercase tracking-wider py-1.5 text-white/40 hover:text-white transition-colors"
                    >
                      Cerrar y volver a la tienda
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════════════ STEP 4: SUCCESS / REDIRECT ════════════════════ */}
              {cartStep === 'success' && (
                <div className="px-6 py-16 flex flex-col items-center justify-center text-center font-mono">
                  <div className="w-16 h-16 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                    <CheckCircle2 className="text-[#39FF14]" size={32} />
                  </div>
                  <h2 className="text-base font-black uppercase text-white mb-1">Pedido Registrado</h2>
                  <p className="text-white/40 text-xs mb-8">Conectando con la pasarela de pago segura...</p>

                  <Loader2 className="animate-spin text-[#39FF14]" size={24} />

                  <button
                    onClick={() => {
                      setCartStep('items');
                      toggleCart();
                    }}
                    className="mt-10 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>

            {/* ── 4. STICKY FOOTER (ITEMS STEP ONLY) ── */}
            {cartStep === 'items' && items.length > 0 && (
              <div className="border-t border-white/[0.08] px-6 py-5 bg-[#080808]/95 backdrop-blur-2xl relative z-50 shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.9)]">
                {/* Summary Rows */}
                <div className="space-y-2 mb-4 font-mono">
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-xs text-[#39FF14]">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span className="font-bold">-${discount.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-white">Total</span>
                    <span className="text-lg font-black text-[#39FF14]">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={handleNextStep}
                  className="w-full h-12 rounded-2xl bg-white text-black font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all group"
                >
                  <span>Continuar al Pago</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
