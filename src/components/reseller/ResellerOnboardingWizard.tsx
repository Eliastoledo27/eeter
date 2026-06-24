'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, TrendingUp, Phone, Palette, CreditCard,
    CheckCircle2, ChevronRight, ChevronLeft, X,
    Sparkles, ArrowUpRight, Loader2
} from 'lucide-react';
import { updateResellerMarkup } from '@/app/actions/reseller-catalog';
import { updateProfile as updateProfileAction } from '@/app/actions/profiles';
import { toast } from 'sonner';
import Link from 'next/link';

// ─── Themes preview data ──────────────────────────────────────────────────────
const THEMES = [
    {
        key: 'original',
        name: 'Éter Classic',
        description: 'Dark premium con acentos cyan',
        preview: 'bg-gradient-to-br from-[#050505] to-[#0A1520]',
        accent: 'border-[#00E5FF]',
        dot: 'bg-[#00E5FF]',
    },
    {
        key: 'minimal',
        name: 'Minimal',
        description: 'Limpio y moderno',
        preview: 'bg-gradient-to-br from-neutral-900 to-zinc-900',
        accent: 'border-zinc-400',
        dot: 'bg-zinc-400',
    },
    {
        key: 'cyber',
        name: 'Cyber',
        description: 'Neón verde sobre negro',
        preview: 'bg-gradient-to-br from-[#020408] to-[#041208]',
        accent: 'border-emerald-500',
        dot: 'bg-emerald-500',
    },
    {
        key: 'warm',
        name: 'Warm',
        description: 'Elegante y acogedor',
        preview: 'bg-gradient-to-br from-[#1A1816] to-[#2A2520]',
        accent: 'border-[#c2b29f]',
        dot: 'bg-[#c2b29f]',
    },
    {
        key: 'swiss',
        name: 'Swiss',
        description: 'Brutalismo internacional',
        preview: 'bg-gradient-to-br from-black to-zinc-900',
        accent: 'border-[#EF4444]',
        dot: 'bg-[#EF4444]',
    },
    {
        key: 'kinetic',
        name: 'Kinetic',
        description: 'Energía y movimiento',
        preview: 'bg-gradient-to-br from-zinc-950 to-zinc-900',
        accent: 'border-yellow-500',
        dot: 'bg-yellow-500',
    },
];

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, icon: Store, label: 'Tu Tienda' },
    { id: 2, icon: TrendingUp, label: 'Tu Margen' },
    { id: 3, icon: Phone, label: 'WhatsApp' },
    { id: 4, icon: Palette, label: 'Diseño' },
    { id: 5, icon: CreditCard, label: 'Cobros' },
    { id: 6, icon: CheckCircle2, label: '¡Listo!' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
}

function formatARS(value: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
    }).format(value);
}

// ─── Onboarding Wizard ────────────────────────────────────────────────────────
interface ResellerOnboardingWizardProps {
    onComplete: (slug: string) => void;
}

export function ResellerOnboardingWizard({ onComplete }: ResellerOnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);

    // Form data
    const [storeName, setStoreName] = useState('');
    const [markup, setMarkup] = useState(12000);
    const [whatsapp, setWhatsapp] = useState('');
    const [theme, setTheme] = useState('original');
    const [bankCbu, setBankCbu] = useState('');
    const [bankAlias, setBankAlias] = useState('');
    const [bankOwnerName, setBankOwnerName] = useState('');
    const [savedSlug, setSavedSlug] = useState('');

    const slug = slugify(storeName);
    const estimatedMonthly = markup * 15;

    const goNext = () => {
        setDirection(1);
        setStep(s => s + 1);
    };

    const goPrev = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    const handleDismiss = () => {
        localStorage.setItem('eter-onboarding-complete', 'true');
        onComplete('');
    };

    const handleFinish = async () => {
        if (!bankCbu.trim() && !bankAlias.trim()) {
            toast.error('Necesitás al menos un CBU o Alias para recibir pagos');
            return;
        }
        if (!bankOwnerName.trim()) {
            toast.error('El nombre del titular de la cuenta es obligatorio');
            return;
        }

        setSaving(true);
        try {
            const finalWhatsApp = whatsapp ? `549${whatsapp.replace(/[^0-9]/g, '')}` : '';

            const [profileResult] = await Promise.all([
                updateProfileAction({
                    full_name: storeName.trim(),
                    reseller_slug: slug,
                    whatsapp_number: finalWhatsApp,
                    reseller_theme: theme,
                    bank_cbu: bankCbu.trim(),
                    bank_alias: bankAlias.trim(),
                    bank_owner_name: bankOwnerName.trim(),
                }),
                updateResellerMarkup(markup),
            ]);

            if (!profileResult.success) {
                toast.error(profileResult.error || 'Error al guardar');
                return;
            }

            setSavedSlug(slug);
            localStorage.setItem('eter-onboarding-complete', 'true');
            setDirection(1);
            setStep(6);
        } catch (err) {
            console.error(err);
            toast.error('Error de conexión. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    // Slide variants
    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    const canProceedStep1 = storeName.trim().length >= 3;
    const canProceedStep3 = whatsapp.replace(/[^0-9]/g, '').length >= 10 || whatsapp === '';
    const canProceedStep5 = (bankCbu.trim() || bankAlias.trim()) && bankOwnerName.trim();

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden"
            >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute top-0 left-1/3 w-64 h-64 bg-[#00E5FF]/5 blur-[80px] rounded-full" />
                <div className="pointer-events-none absolute bottom-0 right-1/3 w-64 h-64 bg-[#FF007A]/5 blur-[80px] rounded-full" />

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center">
                            <Sparkles className="text-[#00E5FF]" size={16} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00E5FF] font-mono">
                                Configuración Inicial
                            </p>
                            <p className="text-[10px] text-white/30 font-mono">
                                Paso {Math.min(step, 5)} de 5
                            </p>
                        </div>
                    </div>
                    {step < 6 && (
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
                            aria-label="Configurar más tarde"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                {step < 6 && (
                    <div className="h-0.5 bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#FF007A] to-[#00E5FF]"
                            animate={{ width: `${((step - 1) / 5) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                )}

                {/* Step dots */}
                {step < 6 && (
                    <div className="flex items-center justify-center gap-2 pt-4 pb-2">
                        {STEPS.slice(0, 5).map((s) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.id}
                                    className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
                                        step === s.id
                                            ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]'
                                            : step > s.id
                                            ? 'border-[#00E5FF]/40 bg-[#00E5FF]/5 text-[#00E5FF]/50'
                                            : 'border-white/10 bg-white/3 text-white/20'
                                    }`}
                                >
                                    {step > s.id
                                        ? <CheckCircle2 size={12} />
                                        : <Icon size={12} />
                                    }
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Step content */}
                <div className="relative min-h-[320px] overflow-hidden px-6 py-4">
                    <AnimatePresence mode="wait" custom={direction}>
                        {/* ── STEP 1: Store name ── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col gap-4"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                                        ¿Cómo se llama tu tienda?
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        Este nombre aparecerá en tu catálogo público y en las comunicaciones con tus clientes.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={e => setStoreName(e.target.value)}
                                        placeholder="Ej: Tienda de Moda de Lucas"
                                        maxLength={40}
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#00E5FF]/60 focus:bg-[#00E5FF]/5 transition-all text-sm"
                                    />
                                    {slug && (
                                        <p className="text-[11px] text-white/30 font-mono px-1">
                                            Tu link: <span className="text-[#00E5FF]/60">eter.store/c/<strong>{slug}</strong></span>
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[11px] text-white/40 leading-relaxed">
                                        💡 <span className="text-white/60">Tip:</span> Usá un nombre que tus clientes puedan recordar fácil. Podés cambiarlo cuando quieras desde el panel.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Margin ── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col gap-4"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                                        ¿Cuánto querés ganar por par?
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        Este monto se suma al precio mayorista de cada producto. Podés ajustarlo por producto después.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                        <span className="text-white/40 text-sm font-mono">$ ARS</span>
                                        <input
                                            type="number"
                                            value={markup}
                                            onChange={e => setMarkup(Math.max(0, Number(e.target.value)))}
                                            min={0}
                                            step={1000}
                                            className="flex-1 bg-transparent text-white text-lg font-black focus:outline-none"
                                        />
                                    </div>
                                    {/* Quick amounts */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {[5000, 10000, 15000, 20000].map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setMarkup(v)}
                                                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                    markup === v
                                                        ? 'border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF]'
                                                        : 'border-white/10 bg-white/3 text-white/50 hover:border-white/20'
                                                }`}
                                            >
                                                {formatARS(v)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-[#00E5FF]/5 to-[#FF007A]/5 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[11px] text-white/40 mb-1">Proyección mensual estimada (15 ventas)</p>
                                    <p className="text-2xl font-black text-white">
                                        {formatARS(estimatedMonthly)}
                                        <span className="text-sm font-normal text-white/30 ml-2">/ mes</span>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: WhatsApp ── */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col gap-4"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                                        ¿Cuál es tu WhatsApp de ventas?
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        Tus clientes van a poder contactarte directo desde tu catálogo. Podés saltear este paso.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00E5FF]/60 transition-all">
                                    <span className="text-white/40 text-sm font-mono shrink-0">+549</span>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="2236204002"
                                        maxLength={12}
                                        autoFocus
                                        className="flex-1 bg-transparent text-white placeholder-white/25 focus:outline-none text-sm"
                                    />
                                </div>
                                <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[11px] text-white/40 leading-relaxed">
                                        💬 <span className="text-white/60">¿Para qué sirve?</span> Cada producto de tu catálogo tendrá un botón "Consultar por WhatsApp" que abre una conversación directa con vos.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 4: Theme ── */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col gap-4"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                                        ¿Qué estilo querés para tu catálogo?
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        Elegí la estética visual que mejor represente tu marca. Podés cambiarlo después.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {THEMES.map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setTheme(t.key)}
                                            className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                                theme === t.key
                                                    ? `${t.accent} bg-white/5`
                                                    : 'border-white/8 bg-white/2 hover:border-white/20'
                                            }`}
                                        >
                                            {/* Color preview swatch */}
                                            <div className={`w-8 h-8 rounded-lg shrink-0 ${t.preview} border border-white/10`}>
                                                <div className={`w-2 h-2 rounded-full ${t.dot} mt-1 ml-1`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white">{t.name}</p>
                                                <p className="text-[10px] text-white/35">{t.description}</p>
                                            </div>
                                            {theme === t.key && (
                                                <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#00E5FF]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 5: Bank details ── */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col gap-3"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                                        ¿Dónde recibís los pagos?
                                    </h2>
                                    <p className="text-sm text-white/40">
                                        Tus clientes van a ver estos datos para transferirte. Necesitás al menos uno (CBU o Alias).
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider px-1">Nombre del titular</label>
                                    <input
                                        type="text"
                                        value={bankOwnerName}
                                        onChange={e => setBankOwnerName(e.target.value)}
                                        placeholder="Ej: Lucas González"
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#00E5FF]/60 transition-all text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider px-1">CBU</label>
                                        <input
                                            type="text"
                                            value={bankCbu}
                                            onChange={e => setBankCbu(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="22 dígitos"
                                            maxLength={22}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#00E5FF]/60 transition-all text-xs font-mono"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-white/40 font-mono uppercase tracking-wider px-1">Alias</label>
                                        <input
                                            type="text"
                                            value={bankAlias}
                                            onChange={e => setBankAlias(e.target.value.replace(/\s/g, ''))}
                                            placeholder="mi.alias.banco"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#00E5FF]/60 transition-all text-xs font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-white/35 leading-relaxed">
                                        🔒 Estos datos solo son visibles para tus compradores al momento de pagar. Nunca son compartidos con terceros.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 6: Success ── */}
                        {step === 6 && (
                            <motion.div
                                key="step6"
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex flex-col items-center gap-5 py-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-[#00E5FF]/30 flex items-center justify-center shadow-xl shadow-cyan-500/10"
                                >
                                    <CheckCircle2 className="text-[#00E5FF]" size={40} />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                                        ¡Tu tienda está lista! 🎉
                                    </h2>
                                    <p className="text-sm text-white/40 max-w-xs mx-auto">
                                        Configuraste <strong className="text-white">{storeName}</strong> con éxito.
                                        Ya podés compartir tu catálogo con tus clientes.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    {savedSlug && (
                                        <Link
                                            href={`/c/${savedSlug}`}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black font-black text-sm hover:opacity-90 transition-opacity"
                                        >
                                            <Store size={16} />
                                            Ver mi catálogo
                                            <ArrowUpRight size={15} />
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => onComplete(savedSlug)}
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all"
                                    >
                                        Ir al panel de control
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation footer */}
                {step < 6 && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            {step > 1 && (
                                <button
                                    onClick={goPrev}
                                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
                                >
                                    <ChevronLeft size={14} />
                                    Atrás
                                </button>
                            )}
                            {step === 1 && (
                                <button
                                    onClick={handleDismiss}
                                    className="text-xs text-white/25 hover:text-white/50 transition-colors underline underline-offset-2"
                                >
                                    Configurar más tarde
                                </button>
                            )}
                        </div>

                        {step < 5 && (
                            <button
                                onClick={goNext}
                                disabled={step === 1 && !canProceedStep1}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                                    (step === 1 && !canProceedStep1)
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black hover:opacity-90'
                                }`}
                            >
                                Siguiente
                                <ChevronRight size={15} />
                            </button>
                        )}

                        {step === 5 && (
                            <button
                                onClick={handleFinish}
                                disabled={saving || !canProceedStep5}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                                    saving || !canProceedStep5
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                        : 'bg-gradient-to-r from-[#FF007A] to-[#00E5FF] text-black hover:opacity-90'
                                }`}
                            >
                                {saving ? (
                                    <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                                ) : (
                                    <><CheckCircle2 size={14} /> Activar mi tienda</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
