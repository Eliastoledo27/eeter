import { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Regístrate | Éter Store - Empieza a Ganar Dinero Hoy',
  description: 'Únete a la comunidad de revendedores más grande. Sin inversión inicial, catálogo premium y logística resuelta. Crea tu cuenta gratis.',
  keywords: ['registro', 'crear cuenta', 'revendedores', 'ganar dinero', 'emprendimiento'],
  openGraph: {
    title: 'Regístrate en Éter Store',
    description: 'Comienza tu propio negocio de reventa sin inversión inicial.',
    type: 'website',
  }
}

export default function RegisterPage() {
  return <RegisterForm />
}
