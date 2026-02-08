'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2, CheckCircle, ArrowRight, User, FileText, MapPin, CreditCard, Store, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import { createOrderFromCart, CheckoutInput } from '@/app/actions/orders';
import { generateOrderPDF } from '@/utils/pdf-generator';

export function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; referenceCode: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastOrderItems, setLastOrderItems] = useState<any[]>([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [resellerName, setResellerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!showCheckoutForm) {
      setShowCheckoutForm(true);
      return;
    }

    if (!customerName.trim()) {
      toast.error('Por favor ingresa tu nombre completo');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Por favor ingresa tu teléfono de contacto');
      return;
    }

    if (!resellerName.trim()) {
      toast.error('Por favor ingresa el nombre del vendedor/revendedor');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Por favor ingresa tu dirección de entrega');
      return;
    }

    if (!paymentMethod) {
      toast.error('Por favor selecciona un método de pago');
      return;
    }

    setIsCheckingOut(true);

    try {
      const checkoutData: CheckoutInput = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.basePrice,
          quantity: item.quantity,
          size: item.selectedSize,
          image: item.images?.[0]
        })),
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        resellerName,
        deliveryAddress,
        postalCode: postalCode || undefined,
        deliveryDate: deliveryDate || undefined,
        paymentMethod: paymentMethod as 'efectivo' | 'transferencia' | 'mercado_pago' | 'tarjeta' || undefined,
        notes: notes || undefined
      };

      const result = await createOrderFromCart(checkoutData);

      if (result.success) {
        setLastOrderItems(items);
        setLastOrderTotal(getTotal());
        setOrderSuccess({
          orderId: result.orderId!,
          referenceCode: result.referenceCode!
        });
        clearCart();
        toast.success('¡Pedido creado exitosamente!', {
          style: {
            background: '#1C1917',
            color: '#FAFAF9',
            border: '1px solid #CA8A04'
          }
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al procesar el pedido');
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const phoneNumber = '5492235025196';
    let message = '*¡Hola! Quiero realizar un pedido en Éter Store:* \n\n';

    // Order details
    message += '*📦 DETALLES DEL PEDIDO:*\n';
    items.forEach((item) => {
      message += `• ${item.name} (Talle: ${item.selectedSize}) x${item.quantity} - $${(item.basePrice * item.quantity).toLocaleString('es-AR')}\n`;
    });
    message += `\n*💰 Total: $${getTotal().toLocaleString('es-AR')}*\n\n`;

    // Customer information
    message += '*👤 DATOS PERSONALES:*\n';
    message += `• Nombre: ${customerName}\n`;
    message += `• Teléfono: ${customerPhone}\n`;
    if (customerEmail) message += `• Email: ${customerEmail}\n`;
    message += `• Revendedor: ${resellerName}\n\n`;

    // Delivery information
    message += '*📍 DIRECCIÓN DE ENTREGA:*\n';
    if (deliveryAddress) message += `• Dirección: ${deliveryAddress}\n`;
    message += `• Ubicación: Mar del Plata, Buenos Aires\n`;
    if (postalCode) message += `• Código Postal: ${postalCode}\n`;
    if (deliveryDate) message += `• Fecha deseada: ${deliveryDate}\n\n`;

    // Payment method
    if (paymentMethod) {
      message += '*💳 MÉTODO DE PAGO:*\n';
      const paymentMethods = {
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia Bancaria',
        'mercado_pago': 'Mercado Pago',
        'tarjeta': 'Tarjeta de Crédito/Débito'
      };
      message += `• ${paymentMethods[paymentMethod as keyof typeof paymentMethods]}\n\n`;
    }

    // Additional notes
    if (notes) {
      message += '*📝 NOTAS ADICIONALES:*\n';
      message += `${notes}\n\n`;
    }

    message += '*Por favor, indíquenme los pasos para el pago y envío.*';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadPDF = () => {
    if (!orderSuccess) return;

    generateOrderPDF({
      referenceCode: orderSuccess.referenceCode,
      date: new Date(),
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      resellerName,
      deliveryAddress,
      city: 'Mar del Plata',
      province: 'Buenos Aires',
      postalCode: postalCode || undefined,
      paymentMethod,
      items: lastOrderItems.map(item => ({
        name: item.name,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        basePrice: item.basePrice
      })),
      total: lastOrderTotal,
      notes: notes || undefined
    });
  };

  const resetCheckout = () => {
    setShowCheckoutForm(false);
    setOrderSuccess(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setResellerName('');
    setDeliveryAddress('');
    setPostalCode('');
    setDeliveryDate('');
    setPaymentMethod('');
    setNotes('');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CA8A04] to-[#A16207] flex items-center justify-center shadow-lg shadow-[#CA8A04]/20">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                {orderSuccess ? 'Pedido Confirmado' : showCheckoutForm ? 'Finalizar Compra' : 'Tu Carrito'}
              </h2>
              <button
                onClick={() => { toggleCart(); resetCheckout(); }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Order Success State */}
            <AnimatePresence mode="wait">
              {orderSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                    <CheckCircle size={48} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">¡Pedido Confirmado!</h3>
                  <p className="text-gray-400 mb-6">Tu pedido ha sido registrado exitosamente.</p>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Código de Referencia</p>
                    <p className="text-2xl font-black text-[#CA8A04] tracking-wider mb-4">{orderSuccess.referenceCode}</p>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cliente:</span>
                        <span className="text-white font-medium">{customerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Revendedor:</span>
                        <span className="text-white font-medium">{resellerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Método de Pago:</span>
                        <span className="text-white font-medium capitalize">{paymentMethod?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-[#CA8A04] font-bold">${getTotal().toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <Button
                      onClick={() => {
                        if (!orderSuccess) return;
                        const itemsList = lastOrderItems.map(i => `• ${i.quantity}x ${i.name} (${i.selectedSize})`).join('%0A');
                        const total = lastOrderTotal.toLocaleString('es-AR');
                        const message = `Hola! 👋 Realicé el pedido *${orderSuccess.referenceCode}* en Eter Store.%0A%0A` +
                          `*Cliente:* ${customerName}%0A` +
                          `*Detalle:*%0A${itemsList}%0A%0A` +
                          `*Total: $${total}*%0A` +
                          `*Entrega:* ${deliveryAddress}%0A%0A` +
                          `Aguardo confirmación para coordinar el pago y envío. Gracias!`;
                        window.open(`https://wa.me/5492235025196?text=${message}`, '_blank');
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl mb-6 flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02]"
                    >
                      <MessageCircle size={20} />
                      Enviar Pedido por WhatsApp
                    </Button>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 w-full max-w-sm mb-6">
                      <p className="text-sm text-blue-300 mb-2">
                        <strong>Próximos Pasos:</strong>
                      </p>
                      <ul className="text-xs text-blue-200 space-y-1 text-left">
                        <li>• Nos comunicaremos contigo en las próximas 24hs</li>
                        <li>• Confirmaremos los detalles de entrega</li>
                        <li>• Coordinaremos el pago seleccionado</li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      <Button
                        onClick={() => { toggleCart(); resetCheckout(); }}
                        className="bg-[#CA8A04] hover:bg-[#A16207] text-white font-bold py-4 px-8 rounded-xl"
                      >
                        Continuar Comprando
                      </Button>

                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="border-white/10 text-gray-300 hover:bg-white/5 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <FileText size={18} />
                        Descargar Ticket PDF
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : showCheckoutForm ? (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex-1 overflow-y-auto p-6 space-y-8"
                >
                  {/* Order Summary */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Resumen del Pedido</p>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.name} x{item.quantity}</span>
                          <span className="text-white font-bold">${(item.basePrice * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span suppressHydrationWarning className="text-[#CA8A04] font-black text-lg">${getTotal().toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Forms */}
                  <div className="space-y-6">
                    {/* Reseller Info */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Store size={16} className="text-[#CA8A04]" />
                        Datos del Vendedor
                      </h3>
                      <div className="bg-white/[0.03] p-4 rounded-xl space-y-4 border border-white/5">
                        <div className="space-y-2">
                          <Label htmlFor="resellerName" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Nombre del Revendedor *</Label>
                          <Input
                            id="resellerName"
                            placeholder="Nombre de quien te vendió"
                            value={resellerName}
                            onChange={(e) => setResellerName(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <User size={16} className="text-[#CA8A04]" />
                        Datos del Cliente
                      </h3>
                      <div className="bg-white/[0.03] p-4 rounded-xl space-y-4 border border-white/5">
                        <div className="space-y-2">
                          <Label htmlFor="customerName" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Nombre Completo *</Label>
                          <Input
                            id="customerName"
                            placeholder="Tu nombre y apellido"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Teléfono de Contacto *</Label>
                          <Input
                            id="customerPhone"
                            type="tel"
                            placeholder="Ej: 223 123 4567"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Email (Opcional)</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            placeholder="para recibir el comprobante"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin size={16} className="text-[#CA8A04]" />
                        Entrega
                      </h3>
                      <div className="bg-white/[0.03] p-4 rounded-xl space-y-4 border border-white/5">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-200 text-center font-medium">
                            📍 Entrega exclusiva en Mar del Plata, Buenos Aires
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryAddress" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Dirección de Entrega *</Label>
                          <Input
                            id="deliveryAddress"
                            placeholder="Calle y Número"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Código Postal (Opcional)</Label>
                          <Input
                            id="postalCode"
                            placeholder="7600"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment & Date */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard size={16} className="text-[#CA8A04]" />
                        Pago y Fecha
                      </h3>
                      <div className="bg-white/[0.03] p-4 rounded-xl space-y-4 border border-white/5">
                        <div className="space-y-2">
                          <Label htmlFor="deliveryDate" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Fecha de Entrega Deseada</Label>
                          <Input
                            id="deliveryDate"
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#CA8A04]/50 block w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Método de Pago *</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['efectivo', 'transferencia', 'mercado_pago', 'tarjeta'].map((method) => (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all ${paymentMethod === method
                                  ? 'bg-[#CA8A04] border-[#CA8A04] text-white shadow-lg shadow-[#CA8A04]/20'
                                  : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                  }`}
                              >
                                {method === 'efectivo' && '💵 Efectivo'}
                                {method === 'transferencia' && '🏦 Transferencia'}
                                {method === 'mercado_pago' && '📱 Mercado Pago'}
                                {method === 'tarjeta' && '💳 Tarjeta'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-xs uppercase text-gray-500 font-bold tracking-wider">Notas Adicionales</Label>
                          <textarea
                            id="notes"
                            placeholder="Horarios, referencias, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA8A04]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white resize-none"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    ← Volver al carrito
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                        <ShoppingBag size={36} className="opacity-30" />
                      </div>
                      <p className="text-lg font-medium">Tu carrito está vacío.</p>
                      <p className="text-sm text-gray-500">¡Descubre nuestros productos exclusivos!</p>
                      <Button variant="outline" onClick={toggleCart} className="mt-4 border-white/20 text-white hover:bg-white/10">
                        Ver Catálogo
                      </Button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <motion.div
                        layout
                        key={`${item.id}-${item.selectedSize}`}
                        className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className="relative w-20 h-20 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={item.images[0] || '/placeholder-shoe.png'}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">Talle: {item.selectedSize}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-6 text-center text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-bold text-[#CA8A04]">${(item.basePrice * item.quantity).toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize)}
                          className="text-gray-600 hover:text-red-400 self-start p-2 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {items.length > 0 && !orderSuccess && (
              <div className="p-6 border-t border-white/10 bg-black/40 space-y-4">
                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Envío Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Pago Protegido</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400 font-medium">Total</span>
                  <span suppressHydrationWarning className="text-2xl font-black text-[#CA8A04]">${getTotal().toLocaleString('es-AR')}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-[#CA8A04] to-[#A16207] hover:from-[#A16207] hover:to-[#854D0E] text-white font-bold py-6 text-base rounded-xl shadow-xl shadow-[#CA8A04]/20 transition-all"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : showCheckoutForm ? (
                    <>
                      Confirmar Pedido
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Continuar al Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {showCheckoutForm && (
                  <Button
                    onClick={handleWhatsAppCheckout}
                    variant="outline"
                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 font-bold py-5 rounded-xl"
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    O continuar por WhatsApp
                  </Button>
                )}

                {!showCheckoutForm && (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-gray-600">
                      ✅ Tu pedido quedará registrado en nuestra plataforma
                    </p>
                    <p className="text-xs text-center text-gray-600">
                      📦 Envíos a todo el país
                    </p>
                    <p className="text-xs text-center text-gray-600">
                      💳 Múltiples métodos de pago disponibles
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
