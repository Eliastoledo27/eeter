import { Metadata } from 'next'
import LoginForm from './LoginForm'

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
  return <LoginForm />
}
