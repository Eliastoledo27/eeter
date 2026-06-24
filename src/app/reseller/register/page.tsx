'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, Loader2, AlertCircle, CheckCircle2, Crown, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { syncUserRole } from '@/actions/auth-sync'
import { useAuthStore } from '@/store/auth-store'

function isValidIdentifier(value: string): boolean {
  if (value.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  return /^[a-zA-Z0-9_]{3,20}$/.test(value)
}

function RegisterContent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({})
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})

  const router = useRouter()
  const checkSession = useAuthStore((s) => s.checkSession)

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {}
    if (touched.username && username) {
      if (!isValidIdentifier(username)) {
        newErrors.username = 'Ingresa un usuario o email válido'
      }
    }
    if (touched.password && password && password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    setErrors((prev) => ({ ...newErrors, general: prev.general }))
  }, [username, password, touched])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    if (!username || !isValidIdentifier(username)) {
      setErrors({ username: 'Ingresa un usuario o email válido' })
      return
    }
    if (!password || password.length < 6) {
      setErrors({ password: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Convert to email if it's a username
      const email = username.includes('@')
        ? username.toLowerCase().trim()
        : `${username.toLowerCase().trim()}@local.reseller`

      // Derive profile details from email prefix
      const emailPrefix = email.split('@')[0]
      const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const generatedSlug = `${emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '')}-${randomSuffix}`

      // Register user in auth.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already exists')) {
          setErrors({ general: 'Este usuario o email ya está registrado. Elige otro.' })
        } else {
          setErrors({ general: error.message })
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Update profile in profiles table immediately to grant reseller privileges
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'reseller',
            full_name: displayName,
            reseller_slug: generatedSlug,
            reseller_markup: 10000, // default markup
            last_activity: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('Error auto-setting reseller profile:', profileError)
        }

        // Sync user role metadata
        try {
          await syncUserRole()
        } catch (e) {
          console.error('Sync error:', e)
        }

        // Si signUp no devolvió sesión (email confirmation requerida), iniciamos sesión manualmente
        // para garantizar acceso inmediato al portal
        let finalSession = data.session
        if (!finalSession) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (!signInError && signInData.session) {
            finalSession = signInData.session
          }
        }

        try {
          await checkSession()
        } catch (e) {
          console.error('Error checking session on registration:', e)
        }

        // Sesión permanente por defecto al registrarse
        sessionStorage.removeItem('eter-reseller-session-temp')
        localStorage.setItem('eter-reseller-logged-in', 'true')

        toast.success('¡Registro Exitoso! 🎉', {
          description: 'Tu tienda ÉTER ha sido creada. Ya podés configurarla.',
          duration: 5000,
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
  }, [username, password, router, checkSession])

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
          Crea Tu Propio Catálogo Gratis
        </p>
      </div>

      {/* Glass card */}
      <div className="backdrop-blur-2xl bg-[#0A0A0A]/90 border border-[#222222] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Registro de Revendedor
          </h2>
          <p className="text-xs text-gray-400">
            Regístrate en pocos segundos con tu correo y contraseña
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
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label htmlFor="register-username" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
              Usuario o Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="register-username"
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                placeholder="ej: lucas123 o correo@ejemplo.com"
                aria-invalid={!!errors.username}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/60 transition-all duration-200
                  ${errors.username ? 'border-red-500/50' : 'border-[#222222] hover:border-white/20'}`}
              />
              {touched.username && username && !errors.username && (
                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {errors.username && (
              <p className="text-[11px] text-red-400 ml-1" role="alert">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Mínimo 6 caracteres"
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
                <span>Crear Mi Tienda</span>
                <PlusCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Footer */}
        <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
          <p className="text-xs text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/reseller/login"
              className="text-[#00E5FF] font-bold hover:underline transition-colors"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResellerRegisterPage() {
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
        <RegisterContent />
      </Suspense>
    </main>
  )
}
