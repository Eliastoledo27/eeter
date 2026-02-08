'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { GlassCard } from '@/components/dashboard/GlassCard'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 max-w-md w-full text-center border-red-500/20 bg-red-500/5">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
        <p className="text-slate-400 text-sm mb-6">
          No pudimos cargar el panel correctamente. Error: {error.message}
        </p>
        <button
          onClick={() => reset()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCcw size={18} /> Reintentar
        </button>
      </GlassCard>
    </div>
  )
}
