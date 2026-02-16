'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, LogIn, UserPlus, Loader2, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { getDefaultRedirect, type UserRole } from '@/config/roles'

// ─── Helpers ──────────────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (pw.length >= 12) score++
  if (score <= 1) return { label: 'Débil', score, color: 'bg-red-500' }
  if (score <= 2) return { label: 'Regular', score, color: 'bg-orange-500' }
  if (score <= 3) return { label: 'Buena', score, color: 'bg-yellow-500' }
  return { label: 'Fuerte', score, color: 'bg-emerald-500' }
}

// ─── AuthModal ────────────────────────────────────────────────────
export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authView, toggleAuthView } = useUIStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const checkSession = useAuthStore((s) => s.checkSession)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const resetForm = () => {
    setLoginEmail(''); setLoginPassword('')
    setRegName(''); setRegPhone(''); setRegEmail(''); setRegPassword(''); setRegConfirm('')
    setError(''); setShowPassword(false)
  }

  const handleClose = () => {
    closeAuthModal()
    resetForm()
  }

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !isValidEmail(loginEmail)) { setError('Email no válido'); return }
    if (!loginPassword || loginPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
      if (authError) { setError(authError.message.includes('Invalid login') ? 'Email o contraseña incorrectos' : authError.message); return }
      if (data.user) {
        await checkSession()
        toast.success('¡Bienvenido!')
        handleClose()
        const role = (data.user.app_metadata?.role as UserRole) || 'user'
        router.push(getDefaultRedirect(role))
        router.refresh()
      }
    } catch { setError('Error inesperado') }
    finally { setIsLoading(false) }
  }, [loginEmail, loginPassword, checkSession, router])

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!regName.trim()) { setError('Nombre requerido'); return }
    if (!regEmail || !isValidEmail(regEmail)) { setError('Email no válido'); return }
    if (!regPassword || regPassword.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (regPassword !== regConfirm) { setError('Las contraseñas no coinciden'); return }
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: { data: { full_name: regName.trim(), phone: regPhone.trim() } },
      })
      if (authError) { setError(authError.message.includes('already registered') ? 'Este email ya tiene una cuenta' : authError.message); return }
      if (data.user) {
        toast.success('¡Cuenta creada!', { description: 'Revisa tu email para confirmar.' })
        handleClose()
      }
    } catch { setError('Error inesperado') }
    finally { setIsLoading(false) }
  }, [regName, regPhone, regEmail, regPassword, regConfirm])

  const handleSocial = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (!isAuthModalOpen) return null

  const strength = getPasswordStrength(authView === 'login' ? loginPassword : regPassword)
  const currentPassword = authView === 'login' ? loginPassword : regPassword

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto backdrop-blur-2xl bg-[#0A0A0A]/95 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl scrollbar-thin"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 border border-[#CA8A04] flex items-center justify-center rounded-lg">
            <span className="text-xl font-bold text-[#CA8A04]">É</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">ÉTER STORE</span>
        </div>

        {/* Header */}
        <h2 id="auth-modal-title" className="text-2xl font-black text-white mb-1">
          {authView === 'login' ? (
            <>Bienvenido de <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">vuelta</span></>
          ) : (
            <>Crea tu <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">cuenta</span></>
          )}
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          {authView === 'login' ? 'Ingresa tus credenciales para continuar' : 'Completa tus datos para empezar a vender'}
        </p>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={authView}
            initial={{ opacity: 0, x: authView === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: authView === 'login' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={authView === 'login' ? handleLogin : handleRegister}
            className="space-y-3.5"
            noValidate
          >
            {authView === 'register' && (
              <>
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Nombre completo" value={regName} onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 hover:border-white/20 transition-all" />
                </div>
                {/* Phone */}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="tel" placeholder="Teléfono (opcional)" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 hover:border-white/20 transition-all" />
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" placeholder="tu@email.com"
                value={authView === 'login' ? loginEmail : regEmail}
                onChange={(e) => authView === 'login' ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 hover:border-white/20 transition-all" />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                value={authView === 'login' ? loginPassword : regPassword}
                onChange={(e) => authView === 'login' ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 hover:border-white/20 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength */}
            {currentPassword.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase">{strength.label}</span>
              </div>
            )}

            {authView === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" placeholder="Confirmar contraseña" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 hover:border-white/20 transition-all" />
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-500 via-[#CA8A04] to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-[0_0_20px_rgba(200,138,4,0.2)] hover:shadow-[0_0_30px_rgba(200,138,4,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : authView === 'login' ? <><span>Ingresar</span><LogIn className="w-4 h-4" /></> : <><span>Crear Cuenta</span><UserPlus className="w-4 h-4" /></>}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Social divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-3 bg-[#0A0A0A] text-gray-500 uppercase tracking-wider font-mono">o continúa con</span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => handleSocial('google')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs text-gray-300 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" onClick={() => handleSocial('facebook')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs text-gray-300 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Toggle */}
        <p className="mt-5 text-center text-xs text-gray-500">
          {authView === 'login' ? (
            <>¿No tienes cuenta? <button type="button" onClick={() => { setError(''); toggleAuthView() }} className="text-[#CA8A04] hover:text-amber-300 font-semibold transition-colors">Regístrate</button></>
          ) : (
            <>¿Ya tienes cuenta? <button type="button" onClick={() => { setError(''); toggleAuthView() }} className="text-[#CA8A04] hover:text-amber-300 font-semibold transition-colors">Inicia sesión</button></>
          )}
        </p>
      </motion.div>
    </div>
  )
}
