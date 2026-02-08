'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterForm({ 
  isModal = false, 
  onLoginClick 
}: { 
  isModal?: boolean;
  onLoginClick?: () => void;
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: phone,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Cuenta creada exitosamente')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={isModal 
        ? "w-full" 
        : "glass p-8 rounded-3xl border border-stone-200/70 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(12,10,9,0.12)]"
      }
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#0C0A09]">
          Únete a Éter
        </h1>
        <p className="text-stone-500 text-sm">Comienza tu viaje de negocios</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">
            NOMBRE COMPLETO
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white/80 border border-stone-200 rounded-xl px-4 py-3 text-[#0C0A09] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 transition-all"
            placeholder="Juan Pérez"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">
            TELÉFONO
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white/80 border border-stone-200 rounded-xl px-4 py-3 text-[#0C0A09] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 transition-all"
            placeholder="+54 9 11 1234-5678"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/80 border border-stone-200 rounded-xl px-4 py-3 text-[#0C0A09] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 transition-all"
            placeholder="usuario@eter.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">
            CONTRASEÑA
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/80 border border-stone-200 rounded-xl px-4 py-3 text-[#0C0A09] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 transition-all"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#CA8A04] to-[#F59E0B] text-[#0C0A09] font-bold rounded-xl py-3 mt-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(202,138,4,0.25)]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Crear Cuenta <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-stone-500">
        ¿Ya tienes cuenta?{' '}
        {onLoginClick ? (
          <button 
            type="button"
            onClick={onLoginClick} 
            className="text-[#0C0A09] hover:text-[#CA8A04] font-bold"
          >
            Inicia Sesión
          </button>
        ) : (
          <Link href="/login" className="text-[#0C0A09] hover:text-[#CA8A04]">
            Inicia Sesión
          </Link>
        )}
      </div>
    </motion.div>
  )
}
