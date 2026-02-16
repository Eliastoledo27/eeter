import { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Iniciar Sesión | Éter Store - Tu Negocio de Reventa',
  description: 'Accede a tu panel de control, gestiona tus pedidos y consulta el catálogo mayorista más exclusivo de Argentina. Empieza a vender hoy mismo.',
  openGraph: {
    title: 'Iniciar Sesión | Éter Store',
    description: 'Accede a tu panel de control y gestiona tu negocio de reventa.',
    type: 'website',
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto">
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl animate-pulse">
          <div className="h-8 bg-white/10 rounded w-3/4 mb-4" />
          <div className="h-4 bg-white/5 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-amber-500/20 rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
