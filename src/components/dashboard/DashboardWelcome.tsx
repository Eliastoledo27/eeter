'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, BookOpen, Trophy,
    Users, Package, MessageSquare, BarChart2,
    ClipboardList, Settings, Sparkles, AlertCircle,
    Check, ArrowRight, User as UserIcon, Phone,
    Globe, Shield, Zap, TrendingUp, Info, Save, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/app/actions/profiles';
import { GlassCard, Badge } from './GlassCard';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function DashboardWelcome() {
    const { profile, role, checkSession } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Form states for repair
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [whatsapp, setWhatsapp] = useState('');

    useEffect(() => {
        if (profile?.whatsapp_number) {
            const num = profile.whatsapp_number;
            const cleanNum = num.startsWith('549') ? num.slice(3) : num;
            setWhatsapp(cleanNum);
        }
    }, [profile]);

    const isMissingData = !profile?.full_name || profile.full_name === profile?.email || !profile?.whatsapp_number;

    const handleRepair = async () => {
        if (!fullName || !whatsapp) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setIsSaving(true);
        try {
            const finalWhatsApp = `549${whatsapp.replace(/[^0-9]/g, '')}`;
            const { success, error } = await updateProfile({
                full_name: fullName,
                whatsapp_number: finalWhatsApp
            });

            if (success) {
                toast.success('Perfil actualizado correctamente');
                await checkSession();
            } else {
                throw new Error(error || 'Error al actualizar');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const modules = [
        {
            id: 'panel',
            title: 'Panel Control',
            desc: 'Estadísticas de rendimiento y métricas de crecimiento.',
            icon: LayoutDashboard,
            href: '/dashboard/panel',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
        {
            id: 'catalog',
            title: 'Catálogo ÉTER',
            desc: 'Explora lanzamientos exclusivos y calzado de alta gama.',
            icon: ShoppingBag,
            href: '/dashboard/catalogue',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            id: 'myshop',
            title: 'Configurar Mi Tienda',
            desc: 'Gestiona tu catálogo propio y define tus beneficios.',
            icon: Globe,
            href: '/dashboard/myshop',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            restrictTo: ['admin', 'reseller']
        },
        {
            id: 'orders',
            title: 'Gestión de Pedidos',
            desc: 'Control total sobre tus ventas y envíos activos.',
            icon: ClipboardList,
            href: '/dashboard/orders',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
        {
            id: 'academy',
            title: 'Academia VIP',
            desc: 'Domina el arte de la venta con expertos del sector.',
            icon: BookOpen,
            href: '/academy',
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        }
    ].filter(m => !m.restrictTo || m.restrictTo.includes(role || 'user'));

    return (
        <div className="space-y-12 pb-20">
            {/* Header section with Greeting */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#0A0A0A] to-black border border-white/5 p-10 md:p-14 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Sparkles className="text-amber-500" size={20} />
                            </div>
                            <span className="text-amber-500 font-mono text-[10px] tracking-[0.5em] uppercase">Ecosistema Digital</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white">
                            Bienvenido {profile?.full_name?.split(' ')[0] || 'Usuario'}
                        </h1>

                        <p className="text-gray-400 text-lg font-light leading-relaxed">
                            Has ingresado al centro de comando de <span className="text-white font-bold">ÉTER</span>.
                            Aquí tienes el control total de tu negocio, tu formación y tus resultados.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[240px]">
                        <GlassCard className="p-6 border-amber-500/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tu Nivel</span>
                                <Badge variant="gold">Premium</Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{profile?.points || 0}</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ÉTER POINTS</span>
                            </div>
                        </GlassCard>

                        <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                            <Zap className="text-amber-500" size={14} />
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Racha: {profile?.streak_days || 0} Días</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Missing Data Section (Actionable) */}
            <AnimatePresence>
                {isMissingData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
                        <GlassCard className="p-10 border-red-500/30 bg-red-500/[0.02]">
                            <div className="flex flex-col lg:flex-row gap-12 items-center">
                                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                                    <AlertCircle className="text-red-500" size={32} />
                                </div>
                                <div className="flex-1 space-y-4 text-center lg:text-left">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Completa tu Identidad Digital</h3>
                                    <p className="text-gray-400 font-light max-w-md">
                                        Para habilitar todas las funciones comerciales y recibir pagos, necesitamos verificar tus datos básicos.
                                    </p>
                                </div>

                                <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nombre Completo</label>
                                        <div className="relative">
                                            <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full h-12 bg-black border border-white/10 rounded-xl pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-white/30 transition-all text-white"
                                                placeholder="Ej: Juan Pérez"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">WhatsApp Directo</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-xs">+54 9</span>
                                            <input
                                                type="text"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full h-12 bg-black border border-white/10 rounded-xl pl-16 pr-4 text-xs font-bold focus:outline-none focus:border-white/30 transition-all text-white"
                                                placeholder="2235000000"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRepair}
                                        disabled={isSaving}
                                        className="sm:col-span-2 h-14 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Guardar y Activar ÉTER
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Features Menu */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Funciones Estratégicas</h2>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Navegación Asistida</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {modules.map((module) => (
                        <Link key={module.id} href={module.href}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group h-full"
                            >
                                <GlassCard className="p-8 h-full flex flex-col justify-between border-white/5 hover:border-amber-500/40 transition-all duration-500">
                                    <div className="space-y-6">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500", module.bg)}>
                                            <module.icon className={module.color} size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                                                {module.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                {module.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 opacity-0 group-hover:opacity-100 transition-all">
                                        Acceder Ahora <ArrowRight size={14} />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Utility Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-2 p-10 bg-[#C88A04]/10 border-[#C88A04]/20 relative overflow-hidden group">
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                                <Shield className="text-amber-500" size={24} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-amber-500 italic">Estatus de Seguridad</h3>
                            <p className="text-xs text-black/60 max-w-md font-bold uppercase tracking-wider leading-relaxed">
                                Tu conexión está protegida por encriptación de grado militar. ÉTER garantiza que tus ventas y datos personales están siempre a salvo.
                            </p>
                        </div>
                        <Link href="/dashboard/settings" className="h-14 px-10 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all shrink-0 flex items-center justify-center">
                            Gestionar Seguridad
                        </Link>
                    </div>
                </GlassCard>

                <GlassCard className="p-10 border-white/5 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <TrendingUp className="text-emerald-400" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black uppercase tracking-tighter">Metas del Mes</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Próximo objetivo: Élite</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        />
                    </div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">45% COMPLETADO</span>
                </GlassCard>
            </div>
        </div>
    );
}
