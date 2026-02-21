'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { syncUserRole } from '@/actions/auth-sync'

// ─── Password Strength ────────────────────────────────────────────
function getPasswordStrength(pw: string): { label: string; score: number; color: string } {
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

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
    return /^\+?[\d\s()-]{7,}$/.test(phone)
}

// ─── Component ────────────────────────────────────────────────────
export default function RegisterForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const router = useRouter()

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleBlur = (field: string) => () => {
        setTouched((t) => ({ ...t, [field]: true }))
    }

    // Real-time validation
    useEffect(() => {
        const newErrors: Record<string, string> = {}
        if (touched.fullName && !formData.fullName.trim()) newErrors.fullName = 'Ingresa tu nombre completo'
        if (touched.email && formData.email && !isValidEmail(formData.email)) newErrors.email = 'Email no válido'
        if (touched.phone && formData.phone && !isValidPhone(formData.phone)) newErrors.phone = 'Número de teléfono no válido'
        if (touched.password && formData.password && formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
        if (touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
        setErrors((prev) => ({ ...newErrors, general: prev.general || '' }))
    }, [formData, touched])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Full validation
        const validationErrors: Record<string, string> = {}
        if (!formData.fullName.trim()) validationErrors.fullName = 'Nombre requerido'
        if (!formData.email || !isValidEmail(formData.email)) validationErrors.email = 'Email válido requerido'
        if (!formData.password || formData.password.length < 6) validationErrors.password = 'Mínimo 6 caracteres'
        if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Las contraseñas no coinciden'
        if (!acceptTerms) validationErrors.terms = 'Debes aceptar los términos y condiciones'

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim(),
                        phone: formData.phone.trim(),
                    },
                },
            })

            if (error) {
                if (error.message.includes('already registered')) {
                    setErrors({ general: 'Este email ya tiene una cuenta. Intenta iniciar sesión.' })
                } else {
                    setErrors({ general: error.message })
                }
                setIsLoading(false)
                return
            }

            if (data.user) {
                try { await syncUserRole() } catch (e) { console.error('Sync error:', e) }
                toast.success('¡Cuenta creada exitosamente!', {
                    description: 'Revisa tu email para confirmar tu cuenta.',
                })
                router.push('/login')
            }
        } catch {
            setErrors({ general: 'Error inesperado. Intenta nuevamente.' })
        } finally {
            setIsLoading(false)
        }
    }, [formData, acceptTerms, router])

    // Social login handlers
    const handleGoogleLogin = async () => {
        const supabase = createClient()
        const origin = window.location.origin.normalize('NFC')
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${origin}/auth/callback` },
        })
    }

    const handleFacebookLogin = async () => {
        const supabase = createClient()
        const origin = window.location.origin.normalize('NFC')
        await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo: `${origin}/auth/callback` },
        })
    }

    const strength = getPasswordStrength(formData.password)

    const fieldValid = (field: string) =>
        touched[field] && (formData as Record<string, string>)[field] && !errors[field]

    return (
        <div className="w-full">
            {/* Glass card */}
            <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                        Crea tu{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                            tienda
                        </span>
                    </h2>
                    <p className="text-sm text-gray-400">
                        Completa tus datos para comenzar a vender
                    </p>
                </div>

                {/* General error */}
                {errors.general && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        role="alert"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errors.general}</span>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                            Nombre completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="reg-name"
                                type="text"
                                autoComplete="name"
                                value={formData.fullName}
                                onChange={handleChange('fullName')}
                                onBlur={handleBlur('fullName')}
                                placeholder="Tu nombre completo"
                                aria-invalid={!!errors.fullName}
                                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 transition-all duration-200
                  ${errors.fullName ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                            />
                            {fieldValid('fullName') && (
                                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            )}
                        </div>
                        {errors.fullName && <p className="text-xs text-red-400 ml-1" role="alert">{errors.fullName}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-phone" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                            Teléfono <span className="text-gray-600 normal-case">(opcional)</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="reg-phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={handleChange('phone')}
                                onBlur={handleBlur('phone')}
                                placeholder="+54 223 502 5196"
                                aria-invalid={!!errors.phone}
                                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 transition-all duration-200
                  ${errors.phone ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                            />
                            {fieldValid('phone') && (
                                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            )}
                        </div>
                        {errors.phone && <p className="text-xs text-red-400 ml-1" role="alert">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="reg-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                onBlur={handleBlur('email')}
                                placeholder="tu@email.com"
                                aria-invalid={!!errors.email}
                                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 transition-all duration-200
                  ${errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                            />
                            {fieldValid('email') && (
                                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            )}
                        </div>
                        {errors.email && <p className="text-xs text-red-400 ml-1" role="alert">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange('password')}
                                onBlur={handleBlur('password')}
                                placeholder="••••••••"
                                aria-invalid={!!errors.password}
                                className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 transition-all duration-200
                  ${errors.password ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-400 ml-1" role="alert">{errors.password}</p>}

                        {/* Password strength */}
                        {formData.password.length > 0 && (
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 uppercase">{strength.label}</span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                id="reg-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                                className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-[#CA8A04]/40 focus:border-[#CA8A04]/60 transition-all duration-200
                  ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-400 ml-1" role="alert">{errors.confirmPassword}</p>}
                        {touched.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length >= 6 && (
                            <p className="text-xs text-emerald-400 ml-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Las contraseñas coinciden
                            </p>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="space-y-1">
                        <label className="flex items-start gap-2.5 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-[#CA8A04] focus:ring-[#CA8A04]/40 focus:ring-offset-0"
                            />
                            <span className="text-xs leading-relaxed">
                                Acepto los{' '}
                                <Link href="/about" className="text-[#CA8A04] hover:text-amber-300 underline transition-colors">
                                    términos y condiciones
                                </Link>{' '}
                                y la{' '}
                                <Link href="/about" className="text-[#CA8A04] hover:text-amber-300 underline transition-colors">
                                    política de privacidad
                                </Link>
                            </span>
                        </label>
                        {errors.terms && <p className="text-xs text-red-400 ml-6" role="alert">{errors.terms}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-500 via-[#CA8A04] to-amber-600
              hover:from-amber-400 hover:via-amber-500 hover:to-amber-500 transition-all duration-300
              shadow-[0_0_30px_rgba(200,138,4,0.2)] hover:shadow-[0_0_40px_rgba(200,138,4,0.35)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
              flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Crear Cuenta <UserPlus className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Social login divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-[#0A0A0A] text-gray-500 uppercase tracking-wider font-mono">
                            o regístrate con
                        </span>
                    </div>
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/10
              hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 text-sm text-gray-300 font-medium group"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="group-hover:text-white transition-colors">Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/10
              hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 text-sm text-gray-300 font-medium group"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="group-hover:text-white transition-colors">Facebook</span>
                    </button>
                </div>

                {/* Login link */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="text-[#CA8A04] hover:text-amber-300 transition-colors font-semibold">
                        Inicia sesión
                    </Link>
                </p>
            </div>

            {/* Security badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Conexión segura con cifrado SSL</span>
            </div>
        </div>
    )
}
