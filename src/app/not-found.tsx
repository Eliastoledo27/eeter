import Link from 'next/link'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="text-center">
        <div className="bg-white/5 border border-white/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
          <FileQuestion className="text-accent-gold w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La ruta que intentas visitar no existe o ha sido movida. Verifica la URL e intenta nuevamente.
        </p>

        <Link href="/">
          <button className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
            <ArrowLeft size={18} />
            Volver al Inicio
          </button>
        </Link>
      </div>
    </div>
  )
}
