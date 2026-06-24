'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown, ArrowLeft, ExternalLink, Printer, Shield,
  Target, Zap, Calendar, DollarSign, ShoppingBag,
  TrendingUp, Users, Smartphone, Globe, Phone, Info,
  Sparkles, CheckCircle2, ChevronRight, Award, AlertCircle,
  User, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { getProfile, getResellerStats } from '@/app/actions/profiles';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function InfoContent() {
  const { isInitialized, isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth Guard redirect
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push('/reseller/login');
    }
  }, [isInitialized, isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          const [profileRes, statsRes] = await Promise.all([
            getProfile(),
            getResellerStats()
          ]);

          if (profileRes.data) setProfile(profileRes.data);
          if (statsRes.data) setStats(statsRes.data);
        } catch (err) {
          console.error('Error loading reseller info details:', err);
          toast.error('Error al cargar la información.');
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [isAuthenticated, user]);

  if (!isInitialized || (isLoading && !isAuthenticated) || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-4 mx-auto animate-pulse">
              <Info className="text-[#00E5FF]" size={32} />
            </div>
            <div className="absolute -inset-4 bg-[#00E5FF]/5 blur-2xl rounded-full -z-10 animate-pulse" />
          </div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider animate-pulse">
            Obteniendo ficha técnica de tu tienda...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${profile?.reseller_slug}` : `/c/${profile?.reseller_slug}`;

  // Theme descriptions
  const themeDetails: Record<string, { name: string; color: string; desc: string; preview: string }> = {
    original: {
      name: 'Original Éter',
      color: 'from-[#00E5FF]/20 to-[#7A00FF]/10 border-[#00E5FF]/30 text-[#00E5FF]',
      desc: 'El clásico diseño de alta gama con oscuros premium y luces de neón cian y magenta.',
      preview: 'Oscuro + Cian'
    },
    minimal: {
      name: 'Arquitectura Minimalista',
      color: 'from-white/5 to-zinc-900 border-zinc-700 text-white',
      desc: 'Minimalismo puro en blanco y negro. Tipografía condensada y espaciados amplios.',
      preview: 'Sólido + Blanco'
    },
    cyber: {
      name: 'Hacker Cyberpunk',
      color: 'from-emerald-950/20 to-black border-emerald-500/30 text-emerald-400',
      desc: 'Estilo terminal digital con tipografía monoespaciada y verde fosforescente de matriz.',
      preview: 'Consola + Verde'
    },
    warm: {
      name: 'Warm Editorial / Cozy Sand',
      color: 'from-[#D39E82]/10 to-[#1a1816] border-[#D39E82]/30 text-[#D39E82]',
      desc: 'Tonos cálidos de tierra, beige y café con tipografía clásica con serifas elegantes.',
      preview: 'Serif + Arena'
    },
    swiss: {
      name: 'Swiss Brutalism',
      color: 'from-[#FF3B30]/10 to-neutral-900 border-[#FF3B30]/30 text-[#FF3B30]',
      desc: 'Diseño asimétrico inspirado en el estilo suizo con bordes gruesos y rojo vibrante.',
      preview: 'Brutalista + Rojo'
    },
    kinetic: {
      name: 'Kinetic Tech / High-Speed',
      color: 'from-[#FFFF00]/10 to-zinc-900 border-yellow-500/30 text-[#FFFF00]',
      desc: 'Tipografías en cursiva de alta velocidad, amarillo carrera y estética deportiva.',
      preview: 'Velocidad + Amarillo'
    }
  };

  const activeTheme = profile?.reseller_theme || 'original';
  const themeInfo = themeDetails[activeTheme] || themeDetails.original;

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00E5FF]/20 overflow-x-hidden relative flex flex-col texture-grain pb-16 print:bg-white print:text-black">
      {/* Background ambient glows (hidden in print) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#FF007A]/3 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#222222] px-4 md:px-8 py-4 flex items-center justify-between print:relative print:bg-white print:border-b-2 print:border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/reseller/portal"
            className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-[#222222] flex items-center justify-center text-gray-400 hover:text-white transition-all print:hidden"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono print:text-black">
              Ficha Técnica de Tienda
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest print:text-gray-400">
              Showroom ID: {profile?.reseller_slug || 'sin-slug'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-[#222222] hover:border-white/20 text-xs text-gray-300 hover:text-white transition-all duration-200"
          >
            <Printer size={13} />
            <span>Imprimir Ficha</span>
          </button>

          {profile?.reseller_slug && (
            <Link
              href={`/c/${profile.reseller_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 to-[#8F00FF]/10 border border-[#00E5FF]/25 text-xs text-[#00E5FF] hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-200"
            >
              <span>Ver Tienda En Vivo</span>
              <ExternalLink size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-8 print:p-0 print:max-w-full">

        {/* Banner principal */}
        <div className="relative rounded-[2.5rem] border border-white/5 bg-gradient-to-r from-black via-slate-950 to-black p-8 md:p-12 overflow-hidden shadow-2xl print:border-none print:bg-white print:p-4">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF007A]/3 blur-[90px] rounded-full pointer-events-none -z-10 print:hidden" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[10px] font-black uppercase tracking-widest text-[#00E5FF] print:border-gray-300 print:text-black">
                <Crown size={10} />
                <span>Tienda Oficial Autorizada</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic text-white print:text-black print:not-italic">
                {profile?.full_name || 'Showroom sin nombre'}
              </h2>
              <p className="text-xs text-gray-400 font-medium max-w-xl print:text-gray-600">
                Esta es la ficha técnica completa de la tienda virtual provista y procesada bajo la infraestructura de <span className="text-[#00E5FF] font-semibold print:text-black">ÉTER Store</span>. Detalla las configuraciones comerciales, pasarelas habilitadas, identidad visual y desempeño histórico.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 min-w-[240px] text-center md:text-right print:bg-gray-50 print:border-gray-200">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Margen Comercial General</span>
              <span className="text-3xl font-black text-[#00E5FF] tracking-tight block print:text-black">
                +${(profile?.reseller_markup ?? 10000).toLocaleString('es-AR')}
              </span>
              <span className="text-[9px] text-gray-500 block mt-1">Por par sobre costo mayorista</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Identidad y visual (Col-span 7) */}
          <div className="md:col-span-7 space-y-8">
            {/* Tarjeta de Identidad de Marca */}
            <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 print:border-gray-200 print:bg-white">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white print:text-black">
                <Globe size={18} className="text-[#00E5FF] print:text-black" />
                <span>Identidad y Enlaces</span>
              </h3>
              <div className="h-px bg-white/5 print:bg-gray-200" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">Nombre Comercial</span>
                  <span className="text-sm font-bold text-white print:text-black">{profile?.full_name || 'No configurado'}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">Dirección Web (Enlace)</span>
                  {profile?.reseller_slug ? (
                    <Link
                      href={`/c/${profile.reseller_slug}`}
                      target="_blank"
                      className="text-sm font-bold text-[#00E5FF] hover:underline flex items-center gap-1 print:text-black"
                    >
                      <span>{profile.reseller_slug}</span>
                      <ExternalLink size={12} className="print:hidden" />
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-red-400">No configurado</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">WhatsApp de Contacto</span>
                  {profile?.whatsapp_number ? (
                    <span className="text-sm font-bold text-white print:text-black font-mono">
                      +{profile.whatsapp_number}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-yellow-500">No configurado</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest block">Fecha de Registro</span>
                  <span className="text-sm font-bold text-white print:text-black font-mono">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Datos de Cobro */}
            <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 print:border-gray-200 print:bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white print:text-black">
                  <Shield size={18} className="text-[#00E5FF] print:text-black" />
                  <span>Datos de Cobro (Transferencia Directa)</span>
                </h3>
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase print:border-gray-300 print:text-black">
                  Exclusivo
                </div>
              </div>
              <div className="h-px bg-white/5 print:bg-gray-200" />

              <p className="text-xs text-gray-400 leading-relaxed print:text-gray-600">
                El carrito de compras de tus clientes tiene únicamente habilitado el pago mediante transferencia bancaria directa. Los fondos irán directamente a tu cuenta sin pasar por ÉTER.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 print:border-gray-200 print:bg-white">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-mono block">Titular de la Cuenta</span>
                    <span className="text-xs font-bold text-white print:text-black">{profile?.bank_owner_name || 'No especificado'}</span>
                  </div>
                  <User size={14} className="text-gray-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 print:border-gray-200 print:bg-white">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">Alias Bancario</span>
                      <span className="text-xs font-bold text-white print:text-black">{profile?.bank_alias || 'No especificado'}</span>
                    </div>
                    <Target size={14} className="text-gray-600" />
                  </div>

                  <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 print:border-gray-200 print:bg-white">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-mono block">CBU / CVU Bancario</span>
                      <span className="text-xs font-bold text-white print:text-black font-mono">{profile?.bank_cbu || 'No especificado'}</span>
                    </div>
                    <Zap size={14} className="text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plantilla y Métricas (Col-span 5) */}
          <div className="md:col-span-5 space-y-8">
            {/* Tarjeta de Plantilla Activa */}
            <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 print:border-gray-200 print:bg-white">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white print:text-black">
                <Smartphone size={18} className="text-[#00E5FF] print:text-black" />
                <span>Diseño y Plantilla</span>
              </h3>
              <div className="h-px bg-white/5 print:bg-gray-200" />

              <div className={cn(
                "rounded-2xl border bg-gradient-to-br p-5 space-y-4",
                themeInfo.color
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest block opacity-60">Diseño Activo</span>
                    <span className="text-base font-black uppercase tracking-tight block">{themeInfo.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-black/40 px-2 py-1 border border-white/10 rounded uppercase font-bold tracking-wider">
                    {themeInfo.preview}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-80">
                  {themeInfo.desc}
                </p>
              </div>
            </div>

            {/* Tarjeta de Métricas */}
            <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6 print:border-gray-200 print:bg-white">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white print:text-black">
                <TrendingUp size={18} className="text-[#00E5FF] print:text-black" />
                <span>Desempeño Comercial</span>
              </h3>
              <div className="h-px bg-white/5 print:bg-gray-200" />

              <div className="space-y-4">
                {/* Ventas */}
                <div className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.01] rounded-xl print:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 print:text-black">
                      <ShoppingBag size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-mono">Pedidos Completados</span>
                      <span className="text-xs font-bold text-white print:text-black">{stats?.total_orders || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Ingresos */}
                <div className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.01] rounded-xl print:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] print:text-black">
                      <DollarSign size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-mono">Volumen Facturado</span>
                      <span className="text-xs font-bold text-white print:text-black">${(stats?.total_revenue || 0).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                {/* Ganancias netas */}
                <div className="flex items-center justify-between p-3 border border-emerald-500/10 bg-emerald-500/[0.02] rounded-xl print:border-gray-100 print:bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 print:text-black">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-400/60 block uppercase font-mono print:text-gray-500">Ganancias Estimadas</span>
                      <span className="text-sm font-black text-emerald-400 print:text-black">${(stats?.total_profit || 0).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de soporte (oculto en impresión) */}
        <div className="bg-[#0C0C0C] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-white/40 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-bold text-white">¿Necesitas asistencia con tu Showroom?</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">Puedes comunicarte con el equipo de soporte mayorista de ÉTER para resolver problemas con tus transferencias o editar tu identificador de catálogo.</p>
            </div>
          </div>
          <Link
            href="https://wa.me/5492236204002"
            target="_blank"
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white rounded-xl text-center whitespace-nowrap"
          >
            Contactar Soporte
          </Link>
        </div>

      </main>
    </div>
  );
}

export default function ResellerInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    }>
      <InfoContent />
    </Suspense>
  );
}
