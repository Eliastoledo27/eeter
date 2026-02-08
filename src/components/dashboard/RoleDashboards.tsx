'use client';

import { BentoGrid } from '@/components/dashboard/bento/BentoGrid';
import { WelcomeWidget } from '@/components/dashboard/widgets/WelcomeWidget';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { QuickActionsWidget } from '@/components/dashboard/widgets/QuickActionsWidget';
import { RecentOrdersWidget } from '@/components/dashboard/widgets/RecentOrdersWidget';
import { DashboardStats, Order } from '@/app/actions/dashboard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, ShieldCheck, User } from "lucide-react";
import { Button } from '@/components/ui/button';

// --- Types ---
interface DashboardViewProps {
    stats?: DashboardStats;
    recentOrders?: Order[];
}

// --- Admin Dashboard is already imported ---

// --- Reseller Dashboard ---
export function ResellerDashboard({ stats, recentOrders = [] }: DashboardViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Modern Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100 mb-4">
                        <ShoppingBag size={12} className="text-blue-600" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Modo Reseller</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
                        Panel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Reseller</span>
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Gestiona tus ventas y catálogo mayorista.</p>
                </div>
            </div>

            {/* Alert Badge */}
            <Alert className="bg-blue-50 border-blue-200 text-blue-900 rounded-2xl shadow-sm">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <AlertTitle className="font-black text-blue-900">Acceso Mayorista Activo</AlertTitle>
                <AlertDescription className="text-blue-700 font-medium">
                    Tienes acceso a precios mayoristas y catálogo exclusivo.
                </AlertDescription>
            </Alert>

            {/* Content */}
            <BentoGrid>
                <WelcomeWidget />
                <StatsWidget stats={stats || null} mode="reseller" />
                <QuickActionsWidget role="reseller" />
                <RecentOrdersWidget orders={recentOrders} />
            </BentoGrid>
        </div>
    );
}

// --- Support Dashboard ---
export function SupportDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Modern Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 border border-orange-100 mb-4">
                        <ShieldCheck size={12} className="text-orange-600" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Soporte Técnico</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
                        Panel <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Soporte</span>
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Atención al cliente y resolución de problemas.</p>
                </div>
            </div>

            {/* Alert Badge */}
            <Alert className="bg-orange-50 border-orange-200 text-orange-900 rounded-2xl shadow-sm">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                <AlertTitle className="font-black text-orange-900">Modo Soporte Activo</AlertTitle>
                <AlertDescription className="text-orange-700 font-medium">
                    Visualización limitada para asistencia a usuarios.
                </AlertDescription>
            </Alert>

            {/* Support Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-8 shadow-lg shadow-slate-900/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Tickets Recientes</h3>
                        <p className="text-slate-500 font-medium mb-6">No hay tickets pendientes.</p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                            <span className="text-xs font-bold text-emerald-700">Todo al día</span>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-8 shadow-lg shadow-slate-900/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Búsqueda de Usuarios</h3>
                        <p className="text-slate-500 font-medium mb-6">Encuentra y asiste a cualquier usuario.</p>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold shadow-lg shadow-blue-600/30">
                            Buscar Usuario
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- User Dashboard (Default) ---
export function UserDashboard({ recentOrders = [] }: DashboardViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Modern Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border border-slate-200/60 p-8 shadow-xl shadow-slate-900/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100 mb-4">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Cuenta Personal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
                        Mi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Cuenta</span>
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Bienvenido a Éter Store.</p>
                </div>
            </div>

            {/* Content Grid */}
            <BentoGrid>
                <WelcomeWidget />
                <QuickActionsWidget role="user" />
                <RecentOrdersWidget orders={recentOrders} />

                {/* Fallback Activity Card if no orders */}
                {recentOrders.length === 0 && (
                    <div className="col-span-full relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-8 shadow-lg shadow-slate-900/5 min-h-[280px] flex items-center justify-center">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl" />
                        <div className="relative text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <User className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Tu actividad reciente</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">Realiza tu primera compra para ver actividad aquí.</p>
                        </div>
                    </div>
                )}
            </BentoGrid>
        </div>
    );
}
