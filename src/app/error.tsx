'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center backdrop-blur-xl">
        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500 w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">¡Ups! Algo salió mal</h2>
        <p className="text-gray-400 mb-8">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        </p>

        <button
          onClick={reset}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full hover:bg-gray-200 transition-colors"
        >
          <RefreshCcw size={18} />
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
