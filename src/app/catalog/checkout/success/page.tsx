'use client';

import { useCartStore } from '@/store/cart-store';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, ArrowLeft, Clock, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '5492236204002';

function SuccessContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'approved';
  const paymentId = searchParams.get('payment_id');
  const externalRef = searchParams.get('external_reference');

  const { lastOrder, clearLastOrder } = useCartStore();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const isPending = status === 'pending';

  const generateWhatsAppTicket = () => {
    if (!lastOrder) return '';

    const itemsList = lastOrder.items.map(item =>
      `▪️ ${item.quantity}x ${item.name} (${item.selectedSize}) — $${(item.basePrice * item.quantity).toLocaleString('es-AR')}`
    ).join('\n');

    const ticket = `🧾 *TICKET DE COMPRA — ÉTER STORE*
━━━━━━━━━━━━━━━━━━━━

📋 *Ref:* ${lastOrder.referenceCode}
📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')}
🕐 *Hora:* ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
${paymentId ? `💳 *ID Pago MP:* ${paymentId}` : ''}

👤 *Cliente:* ${lastOrder.customerName}
📱 *Tel:* +54 9 ${lastOrder.customerPhone}
📍 *Envío:* ${lastOrder.deliveryAddress}
🏷️ *Reseller:* ${lastOrder.resellerName}

━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCTOS:*

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: $${lastOrder.total.toLocaleString('es-AR')}*
💳 *Método:* ${lastOrder.paymentMethod === 'mercadopago' ? 'Mercado Pago' : lastOrder.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Stripe'}
${isPending ? '⏳ *Estado:* Pago Pendiente' : '✅ *Estado:* Pago Confirmado'}

━━━━━━━━━━━━━━━━━━━━
🚚 Te contactaremos para coordinar el envío.

_Gracias por elegir ÉTER_ 🖤`;

    return encodeURIComponent(ticket);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), opacity: 1 }}
              animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.8 }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: ['#00E5FF', '#10B981', '#009EE3', '#fff', '#FBBF24'][i % 5] }}
            />
          ))}
        </div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center ${isPending ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : 'bg-emerald-500/10 border-2 border-emerald-500/30'}`}
          >
            {isPending ? (
              <Clock className="text-yellow-500" size={48} />
            ) : (
              <CheckCircle2 className="text-emerald-500" size={48} />
            )}
          </motion.div>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
            {isPending ? '¡PAGO PENDIENTE!' : '¡COMPRA EXITOSA!'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isPending ? 'Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.' : 'Tu pedido fue registrado correctamente. ¡Gracias por elegirnos!'}
          </p>
        </motion.div>

        {/* Digital Ticket */}
        {lastOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 mb-6 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isPending ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-[#00E5FF]'}`} />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[7px] font-black text-[#00E5FF] tracking-[0.4em] uppercase block mb-1">Referencia</span>
                <h4 className="text-lg font-black text-white tracking-tighter">{lastOrder.referenceCode}</h4>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-black text-gray-600 tracking-[0.3em] uppercase block mb-1">Fecha</span>
                <span className="text-xs font-bold text-white">{new Date().toLocaleDateString('es-AR')}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6 border-y border-white/5 py-5">
              {lastOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-gray-400">
                    {item.quantity}x {item.name}
                    <span className="text-[8px] text-[#00E5FF]/60 ml-2">{item.selectedSize}</span>
                  </span>
                  <span className="text-white">${(item.basePrice * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[9px] font-black text-[#00E5FF] tracking-widest uppercase">Total del Pedido</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-emerald-400">${lastOrder.total.toLocaleString('es-AR')}</span>
            </div>

            {/* Customer Info */}
            <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600 font-black uppercase tracking-widest">Cliente</span>
                <span className="text-white font-bold">{lastOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600 font-black uppercase tracking-widest">Reseller</span>
                <span className="text-white font-bold">{lastOrder.resellerName}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-600 font-black uppercase tracking-widest">Método</span>
                <span className="text-white font-bold">{lastOrder.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Stripe'}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-600 font-black uppercase tracking-widest">ID Pago</span>
                  <span className="text-white font-bold text-[9px]">{paymentId}</span>
                </div>
              )}
            </div>

            {/* Barcode */}
            <div className="mt-6 pt-6 border-t border-dashed border-white/10 flex flex-col items-center gap-2">
              <div className="w-full h-10 bg-white flex items-center justify-center rounded-lg px-4">
                <div className="w-full h-full flex items-center justify-center gap-[1.5px]">
                  {[...Array(45)].map((_, i) => (
                    <div key={i} className={`bg-black rounded-full ${i % 7 === 0 ? 'w-[3px] h-full' : i % 3 === 0 ? 'w-[1px] h-3/4' : 'w-[2px] h-2/3'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[7px] font-black text-gray-700 tracking-[0.5em] uppercase">ÉTER DIGITAL RECEIPT</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-3">
          {lastOrder && (
            <button
              onClick={() => {
                const ticket = generateWhatsAppTicket();
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${ticket}`, '_blank');
              }}
              className="w-full h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs tracking-widest uppercase shadow-[0_10px_30px_rgba(37,211,102,0.25)] hover:bg-[#22c55e] transition-all active:scale-[0.98]"
            >
              <MessageCircle size={20} />
              Enviar Ticket por WhatsApp
            </button>
          )}

          <Link
            href="/catalog"
            onClick={() => clearLastOrder()}
            className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={14} />
            Volver al Catálogo
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-1.5">
            <Package size={11} />
            <span className="text-[7px] font-black uppercase tracking-widest text-white">Envío Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={11} />
            <span className="text-[7px] font-black uppercase tracking-widest text-white">Garantía Éter</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
