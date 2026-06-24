'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, LogIn, Loader2, AlertCircle, CheckCircle2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { syncUserRole } from '@/actions/auth-sync'

function isValidIdentifier(value: string): boolean {
  if (value.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  return /^[a-zA-Z0-9_]{3,20}$/.test(value)
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const checkSession = useAuthStore((s) => s.checkSession)

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {}
    if (touched.email && email && !isValidIdentifier(email)) {
      newErrors.email = 'Ingresa un usuario o email válido'
    }
    if (touched.password && password && password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    setErrors((prev) => ({ ...prev, ...newErrors, general: prev.general }))
  }, [email, password, touched])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    if (!email || !isValidIdentifier(email)) {
      setErrors({ email: 'Ingresa un usuario o email válido' })
      return
    }
    if (!password || password.length < 6) {
      setErrors({ password: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const resolvedEmail = email.includes('@')
        ? email.toLowerCase().trim()
        : `${email.toLowerCase().trim()}@local.reseller`

      const { data, error } = await supabase.auth.signInWithPassword({ email: resolvedEmail, password })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Email o contraseña incorrectos' })
        } else {
          setErrors({ general: error.message })
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Record last login/activity time in profiles
        try {
          await supabase
            .from('profiles')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', data.user.id)
        } catch (err) {
          console.error('Error updating last_activity:', err)
        }

        try {
          await syncUserRole()
        } catch (e) {
          console.error('Sync error:', e)
        }
        await checkSession()

        // Si el usuario NO quiere sesión permanente, marcamos para expirar al cerrar el navegador
        if (!rememberMe) {
          sessionStorage.setItem('eter-reseller-session-temp', 'true')
        } else {
          // Sesión permanente: borramos cualquier flag temporal previo
          sessionStorage.removeItem('eter-reseller-session-temp')
          localStorage.setItem('eter-reseller-logged-in', 'true')
        }

        toast.success('¡Bienvenido de vuelta! 🚀', {
          description: 'Sesión iniciada correctamente.',
        })
        router.push('/reseller/portal')
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setErrors({ general: 'Error inesperado. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }, [email, password, rememberMe, checkSession, router])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-4 mx-auto">
          <Crown className="text-[#00E5FF]" size={24} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
          Mi Tienda
        </h1>
        <p className="text-xs text-gray-400 font-mono tracking-wider uppercase mt-1">
          Portal de Control del Revendedor
        </p>
      </div>

      {/* Glass card */}
      <div className="backdrop-blur-2xl bg-[#0A0A0A]/90 border border-[#222222] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Ingresar al Panel
          </h2>
          <p className="text-xs text-gray-400">
            Ingresa tus credenciales para administrar tu tienda
          </p>
        </div>

        {/* General error */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.general}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email / Username */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
              Usuario o Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-email"
                type="text"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="ej: lucas123 o correo@ejemplo.com"
                aria-invalid={!!errors.email}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/60 transition-all duration-200
                  ${errors.email ? 'border-red-500/50' : 'border-[#222222] hover:border-white/20'}`}
              />
              {touched.email && email && !errors.email && (
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-400 ml-1" role="alert">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`w-full pl-11 pr-11 py-3.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/60 transition-all duration-200
                  ${errors.password ? 'border-red-500/50' : 'border-[#222222] hover:border-white/20'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400 ml-1" role="alert">{errors.password}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="remember-me-btn"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                rememberMe
                  ? 'border-[#00E5FF] bg-[#00E5FF]/20'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <label
              htmlFor="remember-me-btn"
              className="text-xs text-gray-400 cursor-pointer select-none"
              onClick={() => setRememberMe(!rememberMe)}
            >
              Mantener sesión iniciada
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00E5FF] text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 mt-2 shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ingresar</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
          <p className="text-xs text-gray-400">
            ¿Aún no tienes una tienda?{' '}
            <Link
              href="/reseller/register"
              className="text-[#00E5FF] font-bold hover:underline transition-colors"
            >
              Créala Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResellerLoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 bg-[#050505] relative overflow-hidden texture-grain">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#FF007A]/3 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md mx-auto animate-pulse">
          <div className="h-12 bg-white/5 rounded-xl w-3/4 mx-auto mb-8" />
          <div className="h-96 bg-white/5 rounded-[2rem]" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  )
}
