'use client';

import { useAuthStore } from '@/store/auth-store';
import { motion, useAnimationControls } from 'framer-motion';
import { BentoItem } from '../bento/BentoGrid';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, TrendingUp, Zap, Sparkles, ShoppingBag, Package, Store } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function WelcomeWidget({ role = 'admin' }: { role?: 'admin' | 'reseller' | 'user' }) {
  const { profile, user } = useAuthStore();
  const time = new Date().getHours();
  let greeting = 'Buenos días';
  let greetingIcon = '🌅';
  if (time >= 12) {
    greeting = 'Buenas tardes';
    greetingIcon = '☀️';
  }
  if (time >= 19) {
    greeting = 'Buenas noches';
    greetingIcon = '🌙';
  }

  const [mounted, setMounted] = useState(false);
  const controls = useAnimationControls();

  const config = {
    admin: {
       message: "Aquí tienes un resumen de la actividad de tu imperio hoy.",
       primaryAction: { label: "Nuevo Producto", href: "/dashboard?view=products&action=new", icon: Plus, color: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700", shadow: "shadow-amber-500/30" },
       secondaryAction: { label: "Ver Pedidos", href: "/dashboard?view=orders", icon: ShoppingCart }
    },
    reseller: {
       message: "Gestiona tus pedidos y explora el catálogo mayorista.",
       primaryAction: { label: "Nuevo Pedido", href: "/dashboard?view=catalog", icon: ShoppingBag, color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800", shadow: "shadow-blue-600/30" },
       secondaryAction: { label: "Mis Pedidos", href: "/dashboard?view=orders", icon: Package }
    },
    user: {
       message: "Explora nuestras novedades y encuentra lo que buscas.",
       primaryAction: { label: "Ir a la Tienda", href: "/catalog", icon: Store, color: "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800", shadow: "shadow-emerald-600/30" },
       secondaryAction: { label: "Mis Compras", href: "/dashboard?view=orders", icon: ShoppingCart }
    }
  };

  const { message, primaryAction, secondaryAction } = config[role];

  useEffect(() => {
    setMounted(true);
    controls.start({
      scale: [1, 1.02, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    });
  }, [controls]);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';

  // Floating particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 3 + Math.random() * 2,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  if (!mounted) {
    return (
      <BentoItem colSpan={2} className="relative overflow-hidden group bg-white/70 animate-pulse">
        <div className="h-full w-full"></div>
      </BentoItem>
    );
  }

  return (
    <BentoItem colSpan={2} className="relative overflow-hidden group border-slate-200/60">
      {/* Clean White Background with Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 z-0" />
      
      {/* Decorative Gradients - Subtle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />

      {/* Floating Particles - Subtle */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
          initial={{ opacity: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [`${particle.y}%`, `${particle.y - 20}%`],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Subtle Scan Line */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-200/20 to-transparent"
        initial={{ y: '-100%' }}
        animate={{ y: '200%' }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 3
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase flex items-center gap-1.5">
                <Zap size={11} className="text-emerald-600" />
                Sistema Operativo
              </span>
            </div>

            {/* Greeting */}
            <motion.h2
              className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {greeting}, <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                  {userName}
                </span>
                <motion.span
                  className="absolute -right-8 top-0 text-2xl"
                  animate={{
                    rotate: [0, 14, -8, 14, 0],
                    scale: [1, 1.2, 1.1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {greetingIcon}
                </motion.span>
              </span>
            </motion.h2>

            <motion.p
              className="text-slate-600 font-medium max-w-md text-base mt-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {message}
            </motion.p>

            {/* Quick Stats Mini Cards */}
            {role === 'admin' && (
              <motion.div
                className="flex gap-3 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
                  <TrendingUp size={14} className="text-emerald-600" strokeWidth={2.5} />
                  <div>
                    <p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider">Hoy</p>
                    <p className="text-sm font-black text-emerald-900">+24.5%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                  <Sparkles size={14} className="text-amber-600" strokeWidth={2.5} />
                  <div>
                    <p className="text-[9px] text-amber-600 font-medium uppercase tracking-wider">Racha</p>
                    <p className="text-sm font-black text-amber-900">7 días</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            asChild
            className={`bg-gradient-to-r ${primaryAction.color} text-white font-black rounded-xl px-6 h-12 shadow-lg ${primaryAction.shadow} hover:shadow-xl transition-all duration-300`}
          >
            <Link href={primaryAction.href}>
              <primaryAction.icon size={20} className="mr-2" strokeWidth={3} />
              {primaryAction.label}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-12 px-6 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-400 transition-all font-bold shadow-sm hover:shadow-md"
          >
            <Link href={secondaryAction.href}>
              <secondaryAction.icon size={20} className="mr-2" strokeWidth={2.5} />
              {secondaryAction.label}
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Icon - Subtle */}
      <motion.div
        className="absolute right-[-30px] bottom-[-50px] opacity-[0.04] pointer-events-none"
        animate={{
          rotate: [12, 6, 12],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ShoppingCart size={320} strokeWidth={1.5} className="text-slate-400" />
      </motion.div>

      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 via-transparent to-transparent opacity-40 pointer-events-none" />
    </BentoItem>
  );
}
