'use client';

import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, ArrowLeft,
  ShieldCheck, RefreshCw, User, MapPin,
  CheckCircle2, Building2, Tag, Percent, Loader2, Wallet,
  CreditCard, Banknote, Copy, MessageCircle,
  Target, Shield, Zap, ChevronDown, Truck
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

// Datos bancarios de Éter
const BANK_DATA = {
  titular: 'Elias Francesco Calderon Toledo',
  alias: 'eterstore / etershop',
  banco: 'Naranja',
};

const WHATSAPP_NUMBER = '5492236204002';

const PROVINCIAS = [
  'Buenos Aires',
  'Capital Federal (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

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
  // Per-item loading state (key: `${id}-${size}`)
  const [itemLoading, setItemLoading] = useState<Record<string, 'remove' | 'qty-up' | 'qty-down'>>({});

  // Reseller-specific path detection and state
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

  const activeTheme = isResellerCatalog ? (resellerProfile?.reseller_theme || 'original') : 'original';

  // Dynamic visual styling configurations for the 6 reseller themes
  const themeStyles: Record<string, {
    font: string;
    container: string;
    progressBar: string;
    header: string;
    card: string;
    buttonPrimary: string;
    buttonSecondary: string;
    input: string;
    accentText: string;
    textMuted: string;
    transferBg: string;
    transferItem: string;
    whatsappBtn: string;
    bgEffects: React.ReactNode;
  }> = {
    original: {
      font: 'font-sans',
      container: 'bg-[#070707] border-l border-white/5 text-white',
      progressBar: 'bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]',
      header: 'bg-black/40 border-b border-white/5 backdrop-blur-2xl',
      card: 'bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl',
      buttonPrimary: 'bg-white hover:bg-[#00E5FF] text-black rounded-xl font-semibold',
      buttonSecondary: 'bg-white/5 text-white/40 hover:text-white border border-white/5 rounded-lg',
      input: 'bg-[#0c0c0c] border border-white/5 focus:border-[#00E5FF]/30 text-white rounded-xl focus:bg-[#0c0c0c]',
      accentText: 'text-[#00E5FF]',
      textMuted: 'text-white/40',
      transferBg: 'bg-[#0b0b0b] border border-emerald-500/10 rounded-2xl',
      transferItem: 'bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 rounded-xl',
      whatsappBtn: 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md rounded-xl',
      bgEffects: (
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00E5FF]/10 blur-[90px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#7A00FF]/5 blur-[80px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-[0.2] contrast-100 mix-blend-overlay opacity-30" />
        </div>
      )
    },
    minimal: {
      font: 'font-sans tracking-tight',
      container: 'bg-black border-l border-zinc-800 text-zinc-100',
      progressBar: 'bg-zinc-300',
      header: 'bg-black border-b border-zinc-900',
      card: 'bg-transparent border border-zinc-900 hover:border-zinc-700 rounded-none',
      buttonPrimary: 'bg-white hover:bg-zinc-200 text-black rounded-none font-bold tracking-widest uppercase',
      buttonSecondary: 'bg-transparent text-zinc-400 hover:text-white border border-zinc-800 rounded-none',
      input: 'bg-black border border-zinc-800 focus:border-zinc-400 text-white rounded-none placeholder:text-zinc-600 focus:bg-black',
      accentText: 'text-white font-bold',
      textMuted: 'text-zinc-500',
      transferBg: 'bg-black border border-zinc-800 rounded-none',
      transferItem: 'bg-transparent border border-zinc-900 hover:border-zinc-700 rounded-none',
      whatsappBtn: 'bg-white hover:bg-zinc-200 text-black border border-zinc-800 rounded-none font-bold uppercase tracking-widest',
      bgEffects: null
    },
    cyber: {
      font: 'font-mono',
      container: 'bg-[#020408] border-l-2 border-emerald-500/80 text-emerald-400',
      progressBar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      header: 'bg-black border-b border-emerald-950/50',
      card: 'bg-black border border-emerald-950 hover:border-emerald-500/40 rounded-none',
      buttonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-black rounded-none font-bold uppercase border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      buttonSecondary: 'bg-transparent text-emerald-600 hover:text-emerald-400 border border-emerald-950 rounded-none',
      input: 'bg-black border border-emerald-950 focus:border-emerald-500 text-emerald-400 rounded-none placeholder:text-emerald-900 focus:bg-black',
      accentText: 'text-emerald-400',
      textMuted: 'text-emerald-700',
      transferBg: 'bg-[#020408] border border-emerald-500/30 rounded-none',
      transferItem: 'bg-black border border-emerald-950/80 hover:border-emerald-500/50 rounded-none',
      whatsappBtn: 'bg-transparent hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] rounded-none font-bold uppercase tracking-wider',
      bgEffects: (
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
      )
    },
    warm: {
      font: 'font-serif',
      container: 'bg-[#1a1816] border-l border-[#2c2824] text-[#F5F2EB]',
      progressBar: 'bg-[#D39E82]',
      header: 'bg-[#121110] border-b border-[#2c2824]',
      card: 'bg-[#22201d] border border-[#2c2824] hover:border-[#D39E82]/30 rounded-xl',
      buttonPrimary: 'bg-[#D39E82] hover:bg-[#c58d70] text-[#1a1816] rounded-xl font-serif font-medium',
      buttonSecondary: 'bg-[#22201d] text-[#8F9E8B] hover:text-[#F5F2EB] border border-[#2c2824] rounded-xl',
      input: 'bg-[#121110] border border-[#2c2824] focus:border-[#D39E82]/40 text-[#F5F2EB] rounded-xl placeholder:text-[#8F9E8B]/40 focus:bg-[#121110]',
      accentText: 'text-[#D39E82]',
      textMuted: 'text-[#8F9E8B]',
      transferBg: 'bg-[#121110] border border-[#2c2824] rounded-xl',
      transferItem: 'bg-[#22201d] border border-[#2c2824] hover:border-[#D39E82]/20 rounded-xl',
      whatsappBtn: 'bg-[#8F9E8B] hover:bg-[#7a8b76] text-[#1a1816] rounded-xl font-medium',
      bgEffects: (
        <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none">
          <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-[#D39E82] rounded-full blur-[100px]" />
        </div>
      )
    },
    swiss: {
      font: 'font-sans font-medium',
      container: 'bg-neutral-950 border-l-4 border-white text-white',
      progressBar: 'bg-[#FF3B30]',
      header: 'bg-black border-b-2 border-neutral-800',
      card: 'bg-black border-2 border-neutral-900 hover:border-white rounded-none',
      buttonPrimary: 'bg-white hover:bg-[#FF3B30] hover:text-white text-black rounded-none font-black uppercase border-2 border-white',
      buttonSecondary: 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 rounded-none',
      input: 'bg-black border-2 border-neutral-800 focus:border-white text-white rounded-none placeholder:text-neutral-700 focus:bg-black',
      accentText: 'text-[#FF3B30] font-black',
      textMuted: 'text-neutral-400',
      transferBg: 'bg-black border-2 border-white rounded-none',
      transferItem: 'bg-neutral-950 border border-neutral-900 hover:border-white rounded-none',
      whatsappBtn: 'bg-[#FF3B30] hover:bg-[#d92e24] text-white rounded-none font-black uppercase border-2 border-[#FF3B30]',
      bgEffects: null
    },
    kinetic: {
      font: 'font-sans tracking-wide',
      container: 'bg-[#030303] border-l border-yellow-500/20 text-white',
      progressBar: 'bg-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.6)]',
      header: 'bg-[#090909] border-b border-zinc-900',
      card: 'bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl',
      buttonPrimary: 'bg-[#FFFF00] hover:bg-yellow-400 text-black rounded-lg font-black uppercase italic tracking-wider shadow-[0_4px_12px_rgba(255,255,0,0.15)]',
      buttonSecondary: 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg',
      input: 'bg-[#0d0d0d] border border-zinc-800 focus:border-[#FFFF00] text-white rounded-lg placeholder:text-zinc-700 focus:bg-[#0d0d0d]',
      accentText: 'text-[#FFFF00] font-bold italic',
      textMuted: 'text-zinc-500',
      transferBg: 'bg-[#050505] border border-zinc-800 rounded-lg',
      transferItem: 'bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg',
      whatsappBtn: 'bg-[#FFFF00] hover:bg-yellow-400 text-black rounded-lg shadow-lg font-black uppercase tracking-wider',
      bgEffects: (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-yellow-500/20 blur-[80px] rounded-full" />
        </div>
      )
    }
  };

  const currentStyles = themeStyles[activeTheme] || themeStyles.original;

  const setItemOp = (key: string, op: 'remove' | 'qty-up' | 'qty-down' | null) => {
    setItemLoading(prev => {
      if (op === null) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: op };
    });
  };

  const handleRemoveItem = useCallback(async (itemId: string, size: string, name: string, image?: string) => {
    const key = `${itemId}-${size}`;
    setItemOp(key, 'remove');
    await new Promise(r => setTimeout(r, 250));
    removeItem(itemId, size);
    setItemOp(key, null);
    cartNotify({ type: 'removed', title: 'Producto eliminado', productName: name, productImage: image });
  }, [removeItem]);

  const handleUpdateQuantity = useCallback(async (
    itemId: string, size: string, newQty: number, dir: 'up' | 'down', name: string, image?: string
  ) => {
    if (newQty < 1) return;
    const key = `${itemId}-${size}`;
    setItemOp(key, dir === 'up' ? 'qty-up' : 'qty-down');
    await new Promise(r => setTimeout(r, 180));
    updateQuantity(itemId, size, newQty);
    setItemOp(key, null);
    cartNotify({ type: 'updated', title: 'Cantidad actualizada', productName: name, productImage: image });
  }, [updateQuantity]);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    resellerName: user?.name || '',
    deliveryAddress: '',
    paymentMethod: 'mercadopago' as 'stripe' | 'mercadopago' | 'transferencia',
    notes: ''
  });

  // Force direct bank transfer payment option for resellers
  useEffect(() => {
    if (isResellerCatalog) {
      setFormData(prev => ({ ...prev, paymentMethod: 'transferencia' }));
    }
  }, [isResellerCatalog]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Redesign: sub-step navigation for checkout Form vs Payment
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

  const handleGoToPayment = () => {
    if (!shippingForm.nombre.trim()) { toast.error('Completá tu nombre'); return; }
    if (!shippingForm.apellido.trim()) { toast.error('Completá tu apellido'); return; }
    if (!shippingForm.whatsapp.trim()) { toast.error('Completá tu WhatsApp'); return; }
    if (!shippingForm.provincia) { toast.error('Seleccioná tu provincia'); return; }
    if (!shippingForm.localidad.trim()) { toast.error('Completá tu localidad'); return; }
    if (!shippingForm.direccion.trim()) { toast.error('Completá tu dirección'); return; }
    if (!shippingForm.altura.trim()) { toast.error('Completá la altura / número de calle'); return; }

    setFormData({
      ...formData,
      customerName: `${shippingForm.nombre.trim()} ${shippingForm.apellido.trim()}`,
      customerPhone: shippingForm.whatsapp.trim(),
      deliveryAddress: `${shippingForm.direccion.trim()} ${shippingForm.altura.trim()}${shippingForm.depto ? `, Depto/Piso: ${shippingForm.depto.trim()}` : ''}, ${shippingForm.localidad.trim()}, ${shippingForm.provincia.trim()} (CP ${shippingForm.codigoPostal.trim()})`,
      notes: shippingForm.notas.trim(),
      resellerName: isResellerCatalog && resellerProfile ? (resellerProfile.full_name || 'Mi Showroom') : (user?.name || 'Éter Oficial')
    });

    setCheckoutSubStep('payment');
  };

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

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

    // Customize ticket title and thanks message if reseller catalog
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
🚚 Te contactaremos para coordinar el envío.

_${footerThanks}_ 🖤`;

    return encodeURIComponent(ticket);
  };

  const openWhatsApp = (refCode: string, orderItems: any[], orderTotal: number) => {
    const ticket = generateWhatsAppTicket(refCode, orderItems, orderTotal);
    // Dynamic WhatsApp destination number (with backup to fetched profile and fallback to Éter)
    const number = (isResellerCatalog && (resellerWhatsApp || resellerProfile?.whatsapp_number)) || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${number}?text=${ticket}`, '_blank');
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
            className={cn(
              "fixed right-0 top-0 bottom-0 w-full sm:w-[460px] z-[210] shadow-[0_0_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden",
              currentStyles.container,
              currentStyles.font
            )}
          >
            {/* Minimal Horizontal Progress Bar at the top of the cart */}
            {cartStep !== 'success' && (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-white/5 z-[220] overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{
                    width: cartStep === 'items' ? '33.33%' :
                           cartStep === 'checkout' ? '66.66%' :
                           cartStep === 'transferencia' ? '90%' : '100%'
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={cn("h-full transition-all duration-300", currentStyles.progressBar)}
                />
              </div>
            )}

            {/* Background Effects */}
            {currentStyles.bgEffects}

            {/* ── Header ── */}
            <header className={cn("relative flex items-center justify-between px-6 py-5 z-50 shrink-0 border-b", currentStyles.header)}>
              <div className="flex items-center gap-3">
                {(cartStep === 'checkout' || cartStep === 'transferencia') && (
                  <button
                    onClick={() => {
                      if (cartStep === 'checkout' && checkoutSubStep === 'payment') {
                        setCheckoutSubStep('shipping');
                      } else {
                        setCartStep(cartStep === 'transferencia' ? 'checkout' : 'items');
                        if (cartStep === 'transferencia') setCheckoutSubStep('payment');
                      }
                    }}
                    className={cn("w-8 h-8 flex items-center justify-center transition-all group", currentStyles.buttonSecondary)}
                  >
                    <ArrowLeft size={14} className="text-white/60 group-hover:text-white" />
                  </button>
                )}
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                    {cartStep === 'items' ? 'Mi Carrito' :
                     cartStep === 'checkout' ? (checkoutSubStep === 'shipping' ? `CARRITO (${items.reduce((acc, item) => acc + item.quantity, 0)})` : 'Pago') :
                     cartStep === 'transferencia' ? 'Pago' :
                     'Completado'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cartStep === 'items' && items.length > 0 && (
                  <button
                    onClick={() => {
                      clearCart();
                      cartNotify({ type: 'removed', title: 'Carrito vaciado', productName: 'Todos los productos eliminados' });
                    }}
                    className="text-[10px] font-semibold text-white/30 hover:text-[#FF3A5C] uppercase tracking-wider px-2.5 py-1 rounded transition-colors"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => { toggleCart(); if (cartStep === 'success' || cartStep === 'transferencia') setCartStep('items'); }}
                  className={cn("w-8 h-8 flex items-center justify-center group transition-all", currentStyles.buttonSecondary)}
                >
                  <X className="text-white/60 group-hover:text-[#FF0055]" size={15} />
                </button>
              </div>
            </header>

            {/* Alert Banner for free shipping (shown on items and checkout steps) */}
            {(cartStep === 'items' || cartStep === 'checkout') && (
              <div className={cn("flex items-center gap-2 px-6 py-3 shrink-0 z-40 border-b", currentStyles.header)}>
                <Truck size={14} className="opacity-50" />
                <span className={cn("text-[11px] font-medium", currentStyles.textMuted)}>
                  Tenés envío gratis en compras superiores a <span className={cn("font-semibold", currentStyles.accentText)}>$250.000</span>
                </span>
              </div>
            )}

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 px-6 py-6">
              {/* ════════════════════ STEP: ITEMS ════════════════════ */}
              {cartStep === 'items' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  {items.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-white/[0.01] border border-white/5 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="text-white/20" size={32} />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">Tu carrito está vacío</h3>
                      <p className="text-white/40 text-xs max-w-[240px] leading-relaxed mb-8">Agrega productos del catálogo para comenzar tu pedido.</p>
                      <Button
                        onClick={toggleCart}
                        className={cn("font-semibold text-xs tracking-wider uppercase py-5 px-8 transition-all", currentStyles.buttonPrimary)}
                      >
                        Explorar Catálogo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {items.map((item) => {
                          const key = `${item.id}-${item.selectedSize}`;
                          const op = itemLoading[key];
                          const isRemoving = op === 'remove';
                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: isRemoving ? 0.3 : 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              key={key}
                              className={cn("group flex gap-4 p-4 transition-all relative overflow-hidden", currentStyles.card)}
                            >
                              {/* Remove loading overlay */}
                              {isRemoving && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                  <Loader2 size={16} className="animate-spin text-[#FF3A5C]" />
                                </div>
                              )}
                              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black relative">
                                <Image
                                  src={item.images?.[0] || '/placeholder.png'}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-semibold text-white text-sm tracking-tight leading-tight group-hover:text-[#00E5FF] transition-colors line-clamp-1">{item.name}</h3>
                                    <button
                                      onClick={() => handleRemoveItem(item.id, item.selectedSize, item.name, item.images?.[0])}
                                      disabled={!!op}
                                      aria-label={`Eliminar ${item.name}`}
                                      className="text-white/20 hover:text-[#FF3A5C] transition-colors p-1"
                                    >
                                      {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
                                    </button>
                                  </div>
                                  <p className={cn("text-[10px] font-medium mt-1", currentStyles.textMuted)}>Talle: {item.selectedSize}</p>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                  {/* Quantity Selector */}
                                  <div className={cn("flex items-center p-0.5", currentStyles.buttonSecondary)}>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.quantity - 1, 'down', item.name, item.images?.[0])}
                                      disabled={!!op || item.quantity <= 1}
                                      aria-label={`Reducir cantidad de ${item.name}`}
                                      className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white rounded transition-colors disabled:opacity-20"
                                    >
                                      {op === 'qty-down' ? <Loader2 size={10} className="animate-spin" /> : <Minus size={10} />}
                                    </button>
                                    <span className="w-8 text-center text-xs font-semibold text-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, item.selectedSize, item.quantity + 1, 'up', item.name, item.images?.[0])}
                                      disabled={!!op}
                                      aria-label={`Aumentar cantidad de ${item.name}`}
                                      className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white rounded transition-colors disabled:opacity-20"
                                    >
                                      {op === 'qty-up' ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                                    </button>
                                  </div>

                                  <span className="font-semibold text-sm text-white">
                                    $${(item.basePrice * item.quantity).toLocaleString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Collapsible Coupon Input */}
                      <div className="border-t border-white/5 pt-5 mt-6">
                        {appliedCoupon ? (
                          <div className={cn("flex justify-between items-center p-3 rounded-xl border", currentStyles.card)}>
                            <div className="flex items-center gap-2">
                              <Percent size={12} className={cn(currentStyles.accentText)} />
                              <span className={cn("text-xs font-bold tracking-wider", currentStyles.accentText)}>{appliedCoupon.code}</span>
                            </div>
                            <button onClick={removeCoupon} className="text-[10px] font-semibold text-[#FF3A5C] hover:underline uppercase tracking-wider">
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => setShowCouponInput(!showCouponInput)}
                              className={cn("text-xs font-medium flex items-center gap-1.5 transition-colors", currentStyles.textMuted, "hover:text-white")}
                            >
                              <Tag size={12} />
                              ¿Tenés un código alpha?
                            </button>

                            {showCouponInput && (
                              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <input
                                  type="text"
                                  placeholder="Escribe el código aquí"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                  className={cn("flex-1 px-4 py-2 text-xs border focus:outline-none transition-all uppercase", currentStyles.input)}
                                />
                                <button
                                  onClick={handleApplyCoupon}
                                  disabled={isValidatingCoupon || !couponCode.trim()}
                                  className={cn("px-4 text-xs font-bold transition-all flex items-center justify-center min-w-[70px]", currentStyles.buttonPrimary)}
                                >
                                  {isValidatingCoupon ? <Loader2 className="animate-spin" size={14} /> : 'Aplicar'}
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

              {/* ════════════════════ STEP: CHECKOUT ════════════════════ */}
              {cartStep === 'checkout' && (
                <div className="animate-in slide-in-from-right-5 duration-300">
                  {checkoutSubStep === 'shipping' ? (
                    /* Sub-step 1: Shipping Form (Matching the new image) */
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">DATOS DE ENTREGA</h3>
                        <p className={cn("text-[11px] mt-1", currentStyles.textMuted)}>Completá los datos del cliente final para coordinar la entrega.</p>
                      </div>

                      <div className="space-y-3.5">
                        {/* Nombre & Apellido */}
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            required
                            type="text"
                            placeholder="Nombre"
                            value={shippingForm.nombre}
                            onChange={e => setShippingForm({ ...shippingForm, nombre: e.target.value })}
                            className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                          />
                          <input
                            required
                            type="text"
                            placeholder="Apellido"
                            value={shippingForm.apellido}
                            onChange={e => setShippingForm({ ...shippingForm, apellido: e.target.value })}
                            className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                          />
                        </div>

                        {/* WhatsApp */}
                        <div className="relative">
                          <input
                            required
                            type="tel"
                            placeholder="WhatsApp"
                            value={shippingForm.whatsapp}
                            onChange={e => setShippingForm({ ...shippingForm, whatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                            className={cn("w-full py-3 pl-3.5 pr-10 text-xs focus:outline-none transition-all", currentStyles.input)}
                          />
                          {/* WhatsApp SVG Logo Icon */}
                          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.074-4.522 10.077-10.077a9.98 9.98 0 0 0-2.954-7.118A9.975 9.975 0 0 0 12.008 2.04c-5.562 0-10.08 4.526-10.084 10.082-.001 1.83.479 3.626 1.39 5.222l-.992 3.616 3.725-.976zM17.07 14.39c-.274-.136-1.62-.8-1.87-.892-.25-.091-.433-.136-.615.136-.182.273-.705.89-.865 1.072-.16.182-.32.205-.594.069-.273-.136-1.157-.426-2.203-1.36-1.127-1.006-1.205-1.157-1.353-1.43-.148-.273-.016-.421.12-.557.123-.122.274-.32.41-.478.137-.159.182-.273.274-.455.092-.182.046-.341-.023-.478-.069-.136-.615-1.48-.842-2.025-.221-.532-.444-.46-.615-.468-.16-.008-.342-.01-.524-.01-.182 0-.479.068-.73.342-.25.273-.956.934-.956 2.278 0 1.343.978 2.637 1.115 2.82.137.182 1.925 2.938 4.664 4.12 1.637.705 2.585.836 3.195.746.68-.101 2.086-.851 2.378-1.674.292-.823.292-1.528.205-1.674-.087-.146-.27-.23-.54-.366z"/>
                          </svg>
                        </div>



                        {/* Código postal */}
                        <input
                          required
                          type="text"
                          placeholder="Código postal"
                          value={shippingForm.codigoPostal}
                          onChange={e => setShippingForm({ ...shippingForm, codigoPostal: e.target.value })}
                          className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                        />

                        {/* Dirección */}
                        <input
                          required
                          type="text"
                          placeholder="Dirección"
                          value={shippingForm.direccion}
                          onChange={e => setShippingForm({ ...shippingForm, direccion: e.target.value })}
                          className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                        />

                        {/* Altura / Calle y número */}
                        <input
                          required
                          type="text"
                          placeholder="Altura / Calle y número"
                          value={shippingForm.altura}
                          onChange={e => setShippingForm({ ...shippingForm, altura: e.target.value })}
                          className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                        />

                        {/* Departamento / Piso (opcional) */}
                        <input
                          type="text"
                          placeholder="Departamento / Piso (opcional)"
                          value={shippingForm.depto}
                          onChange={e => setShippingForm({ ...shippingForm, depto: e.target.value })}
                          className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all", currentStyles.input)}
                        />

                        {/* Referencias o notas (opcional) */}
                        <textarea
                          placeholder="Referencias o notas (opcional)"
                          value={shippingForm.notas}
                          onChange={e => setShippingForm({ ...shippingForm, notas: e.target.value })}
                          className={cn("w-full py-3 px-3.5 text-xs focus:outline-none transition-all min-h-[80px] resize-none", currentStyles.input)}
                        />
                      </div>

                      {/* CONTINUAR Button */}
                      <button
                        type="button"
                        onClick={handleGoToPayment}
                        className={cn("w-full h-11 font-semibold text-xs tracking-wider uppercase flex items-center justify-between px-4 transition-all mt-6 group", currentStyles.buttonPrimary)}
                      >
                        <span className="mx-auto">CONTINUAR</span>
                        <ArrowRight size={14} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    /* Sub-step 2: Payment Selector (Previous styling but cleaned up) */
                    <form onSubmit={handleCheckout} className="space-y-6">
                      {/* Payment Methods */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className={cn(currentStyles.accentText)} />
                          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Método de Pago</h3>
                        </div>

                        {isResellerCatalog ? (
                          <div className={cn("p-5 border space-y-3", currentStyles.transferBg)}>
                            <div className="flex items-center gap-2">
                              <Banknote size={16} className={currentStyles.accentText} />
                              <h3 className={cn("text-xs font-bold uppercase tracking-wider", currentStyles.accentText)}>Transferencia Directa</h3>
                            </div>
                            <p className={cn("text-[11px] leading-relaxed", currentStyles.textMuted)}>
                              Esta tienda procesa los pagos exclusivamente por transferencia bancaria directa al revendedor. Al presionar "Solicitar Transferencia", obtendrás los datos bancarios del showroom para completar tu pago de inmediato.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'mercadopago', icon: CreditCard, label: 'MP' },
                              { id: 'transferencia', icon: Banknote, label: 'Transfer' },
                              { id: 'stripe', icon: Wallet, label: 'Global' }
                            ].map((method) => {
                              const isSelected = formData.paymentMethod === method.id;
                              return (
                                <div
                                  key={method.id}
                                  onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                                  className={cn(
                                    "p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[70px]",
                                    isSelected
                                      ? "bg-white/[0.04] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                                      : "bg-white/[0.01] border-white/5 text-white/40 hover:border-white/10 hover:text-white/60"
                                  )}
                                >
                                  <method.icon size={18} className={cn(isSelected ? "text-[#00E5FF]" : "text-white/30")} />
                                  <span className="text-[10px] font-semibold tracking-wider uppercase">{method.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Totals Box */}
                      <div className={cn("border p-4 space-y-2 mt-4", currentStyles.card)}>
                        <div className={cn("flex justify-between text-xs", currentStyles.textMuted)}>
                          <span>Carga Parcial</span>
                          <span className="text-white">$${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        {appliedCoupon && (
                          <div className={cn("flex justify-between text-xs", currentStyles.accentText)}>
                            <span>Descuento ({appliedCoupon.code})</span>
                            <span>-$${discount.toLocaleString('es-AR')}</span>
                          </div>
                        )}
                        <div className="h-px bg-white/5 my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">Total a Liquidar</span>
                          <span className={cn("text-base font-bold", currentStyles.accentText)}>
                            $${total.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>

                      {/* Final Payment Trigger Button */}
                      <div className="space-y-3 pt-2">
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className={cn(
                            "w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs tracking-wider uppercase transition-all duration-300 relative overflow-hidden group",
                            isResellerCatalog ? currentStyles.buttonPrimary : (
                              formData.paymentMethod === 'mercadopago' ? "bg-[#00E5FF] hover:bg-[#00B3FF] text-black" :
                              formData.paymentMethod === 'transferencia' ? "bg-[#10B981] text-white hover:bg-[#0E9F6E]" :
                              "bg-white hover:bg-neutral-200 text-black"
                            )
                          )}
                        >
                          {isProcessing ? (
                            <><Loader2 className="animate-spin" size={16} /> <span>Procesando...</span></>
                          ) : (
                            <span className="flex items-center gap-2">
                              {isResellerCatalog ? 'Solicitar Transferencia' : (
                                formData.paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' :
                                formData.paymentMethod === 'transferencia' ? 'Solicitar Transferencia' :
                                'Pagar con Stripe'
                              )}
                              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutSubStep('shipping')}
                          className={cn("w-full text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 transition-colors", currentStyles.textMuted, "hover:text-white")}
                        >
                          Volver a los datos de envío
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ════════════════════ STEP: TRANSFERENCIA ════════════════════ */}
              {cartStep === 'transferencia' && (
                <div className="px-1 py-1 animate-in slide-in-from-right-5 duration-300 space-y-6">
                  <div className={cn("border p-5 relative overflow-hidden shadow-lg", currentStyles.transferBg)}>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Banknote className="text-emerald-400" size={24} />
                      </div>
                      <h3 className="text-base font-semibold text-white">Orden de Transferencia</h3>
                      <p className={cn("text-[10px] uppercase tracking-wider mt-1 font-mono", currentStyles.accentText)}>Sincronización Showroom Activada</p>
                    </div>

                    <div className="space-y-3">
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
                          { label: 'Titular de la cuenta', value: bankDetails.titular, key: 'titular', icon: Shield },
                          ...(bankDetails.alias ? [{ label: 'Alias de cuenta', value: bankDetails.alias, key: 'alias', icon: Target }] : []),
                          ...(bankDetails.cbu ? [{ label: 'CBU / CVU', value: bankDetails.cbu, key: 'cbu', icon: CreditCard }] : []),
                          ...(!isResellerCatalog ? [{ label: 'Banco', value: BANK_DATA.banco, key: 'banco', icon: Zap }] : [])
                        ];

                        return transferItems.map(({ label, value, key, icon: Icon }) => (
                          <div key={key} className={cn("flex items-center justify-between px-4 py-3 transition-all", currentStyles.transferItem)}>
                            <div>
                              <span className={cn("text-[9px] font-semibold uppercase tracking-wider block mb-0.5", currentStyles.textMuted)}>{label}</span>
                              <span className="text-xs font-medium text-white">{value}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(value, key)}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                copiedField === key
                                  ? "bg-emerald-500 text-black shadow-md"
                                  : "bg-white/5 text-white/40 hover:text-white"
                              )}
                            >
                              {copiedField === key ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ));
                      })()}
                    </div>

                    <div className={cn("mt-5 border p-4 flex justify-between items-center bg-white/[0.01]", currentStyles.card)}>
                      <div>
                        <span className={cn("text-[9px] font-semibold uppercase tracking-wider block", currentStyles.textMuted)}>Monto Total</span>
                        <span className={cn("text-xl font-bold", currentStyles.accentText)}>$${orderedTotal.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-[9px] font-semibold uppercase block", currentStyles.textMuted)}>Referencia</span>
                        <span className="text-xs font-mono font-bold text-white">{referenceCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        clearCart();
                        openWhatsApp(referenceCode!, orderedItems, orderedTotal);
                      }}
                      className={cn("w-full h-12 flex items-center justify-center gap-2 font-semibold text-xs tracking-wider uppercase transition-all shadow-md", currentStyles.whatsappBtn)}
                    >
                      <MessageCircle size={16} />
                      Enviar comprobante por WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        clearCart();
                        setCartStep('items');
                        toggleCart();
                      }}
                      className={cn("w-full text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 transition-colors", currentStyles.textMuted, "hover:text-white")}
                    >
                      Finalizar Proceso
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════════════ STEP: SUCCESS (MP/Stripe redirect fallback) ════════════════════ */}
              {cartStep === 'success' && (
                <div className="px-6 py-12 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 rounded-full bg-black border border-[#00E5FF]/20 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,229,255,0.15)] mb-6">
                    <CheckCircle2 className="text-[#00E5FF]" size={32} />
                  </div>
                  <h2 className="text-base font-semibold text-white mb-1">Pedido Registrado</h2>
                  <p className="text-white/40 text-xs mb-8 text-center">Conectando con la pasarela de pago...</p>

                  <Loader2 className="animate-spin text-[#00E5FF]" size={24} />

                  <button
                    onClick={() => {
                      setCartStep('items');
                      toggleCart();
                    }}
                    className="mt-12 text-[10px] font-semibold text-white/30 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Salir del Proceso
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer (Items Step Only) ── */}
            {cartStep === 'items' && items.length > 0 && (
              <div className={cn("border-t px-6 py-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md relative z-50 shrink-0 bg-black/95", currentStyles.header)}>
                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className={currentStyles.textMuted}>Subtotal</span>
                    <span className="font-medium text-white">$${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-xs">
                      <span className={currentStyles.accentText}>Descuento ({appliedCoupon.code})</span>
                      <span className={cn("font-medium", currentStyles.accentText)}>-$${discount.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">Total</span>
                    <span className={cn("text-base font-bold tracking-tight", currentStyles.accentText)}>
                      $${total.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleNextStep}
                  className={cn("w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_5px_15px_rgba(255,255,255,0.02)] active:scale-98 group", currentStyles.buttonPrimary)}
                >
                  <span>Continuar al Pago</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
