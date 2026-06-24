'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { syncUserRole } from '@/actions/auth-sync'
import { cn } from '@/lib/utils'

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
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
        if (touched.email && formData.email && !isValidEmail(formData.email)) newErrors.email = 'Email no válido'
        if (touched.password && formData.password && formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
        setErrors((prev) => ({ ...newErrors, general: prev.general || '' }))
    }, [formData, touched])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const validationErrors: Record<string, string> = {}
        if (!formData.email || !isValidEmail(formData.email)) {
            validationErrors.email = 'Email válido requerido'
        }
        if (!formData.password || formData.password.length < 6) {
            validationErrors.password = 'Mínimo 6 caracteres'
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            const supabase = createClient()

            // Derive name from email
            const emailPrefix = formData.email.split('@')[0]
            const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
            const randomSuffix = Math.floor(1000 + Math.random() * 9000)
            const generatedSlug = `${emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '')}-${randomSuffix}`

            // Register user in auth.users
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: displayName,
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
                // Update profile role and details in profiles table immediately
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        role: 'reseller',
                        full_name: displayName,
                        reseller_slug: generatedSlug,
                        reseller_markup: 10000 // default global markup $10,000 ARS
                    })
                    .eq('id', data.user.id)

                if (profileError) {
                    console.error('Error auto-setting reseller profile:', profileError)
                }

                // Sync the user metadata so they have the correct role immediately
                try {
                    await syncUserRole()
                } catch (e) {
                    console.error('Sync error:', e)
                }

                toast.success('¡Registro Exitoso!', {
                    description: 'Tu catálogo personalizado ha sido creado. Inicia sesión para configurarlo.',
                    duration: 5000,
                })
                router.push('/login')
            }
        } catch (err) {
            console.error(err)
            setErrors({ general: 'Error inesperado. Intenta nuevamente.' })
        } finally {
            setIsLoading(false)
        }
    }, [formData, router])

    return (
        <div className="w-full">
            {/* Glass card */}
            <div className="backdrop-blur-2xl bg-[#0A0A0A]/90 border border-white/15 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/5 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="mb-8 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-4 mx-auto sm:mx-0">
                        <Crown className="text-[#00E5FF]" size={20} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">
                        Crea tu <span className="text-[#00E5FF]">Tienda ÉTER</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mt-1">
                        Acceso 100% Gratuito e Instantáneo
                    </p>
                </div>

                {/* General error */}
                {errors.general && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                        role="alert"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errors.general}</span>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="reg-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                onBlur={handleBlur('email')}
                                placeholder="tu@email.com"
                                aria-invalid={!!errors.email}
                                className={cn(
                                    "w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.02] border text-white text-sm focus:outline-none focus:ring-2 transition-all",
                                    errors.email
                                        ? "border-red-500/50 focus:ring-red-500/10"
                                        : "border-white/10 focus:border-[#00E5FF]/50 focus:ring-[#00E5FF]/10"
                                )}
                            />
                        </div>
                        {errors.email && touched.email && (
                            <p className="text-[10px] text-red-400 font-bold ml-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="reg-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange('password')}
                                onBlur={handleBlur('password')}
                                placeholder="Mínimo 6 caracteres"
                                aria-invalid={!!errors.password}
                                className={cn(
                                    "w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.02] border text-white text-sm focus:outline-none focus:ring-2 transition-all",
                                    errors.password
                                        ? "border-red-500/50 focus:ring-red-500/10"
                                        : "border-white/10 focus:border-[#00E5FF]/50 focus:ring-[#00E5FF]/10"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && touched.password && (
                            <p className="text-[10px] text-red-400 font-bold ml-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
                        Al registrarte, obtendrás acceso inmediato para configurar tus propios precios, márgenes de ganancia y tu número de WhatsApp para recibir pedidos.
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00E5FF] hover:bg-[#00B8D9] text-black h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Crear Mi Catálogo ÉTER</>
                        )}
                    </motion.button>
                </form>

                {/* Footer link */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-400">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="text-[#00E5FF] hover:underline font-bold">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
