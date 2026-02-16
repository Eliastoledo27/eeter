'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldAlert, RefreshCcw, Loader2 } from 'lucide-react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { syncUserRole } from '@/actions/auth-sync';

function DashboardContent() {
    const searchParams = useSearchParams();
    const unauthorized = searchParams.get('unauthorized');
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncUserRole();
            if (result && result.success) {
                toast.success(`Permisos sincronizados: ${result.role}`, {
                    description: 'Tu rol ha sido actualizado correctamente.',
                });
                // Remove the query param and refresh
                router.replace('/dashboard');
                router.refresh();
            } else {
                toast.error('Error al sincronizar permisos', {
                    description: result?.error || 'Verifica la clave de servicio en .env',
                });
            }
        } catch {
            toast.error('Error inesperado al sincronizar');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 pb-20 space-y-6">
            {unauthorized && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-200">Acceso Restringido</h3>
                            <p className="text-xs text-red-300/80">
                                No tienes permisos para acceder a esa sección. Si eres administrador, intenta sincronizar tu rol via base de datos o contacta soporte.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-medium rounded-lg transition-colors border border-red-500/30"
                    >
                        {isSyncing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="w-4 h-4" />
                        )}
                        Reparar Permisos
                    </button>
                </div>
            )}

            <DashboardGrid />
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" /></div>}>
            <DashboardContent />
        </Suspense>
    )
}
