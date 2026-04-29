'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, X, Sparkles } from 'lucide-react'
import { useAuraStore, AuraProfile } from '@/hooks/useAuraStore'

interface QuizQuestion {
    id: keyof AuraProfile
    emoji: string
    question: string
    subtitle: string
    options: {
        label: string
        value: string
        icon?: string
    }[]
}

const questions: QuizQuestion[] = [
    {
        id: 'occasion',
        emoji: '👟',
        question: '¿Cuál es tu escenario?',
        subtitle: 'Sincronizamos la estética con tu entorno activo.',
        options: [
            { label: 'Uso Diario / Urbano', value: 'casual', icon: '🏙️' },
            { label: 'Night / Eventos Elite', value: 'salidas', icon: '💎' },
            { label: 'Performance / Gym', value: 'deporte', icon: '⚡' },
            { label: 'Hyper Streetwear', value: 'streetwear', icon: '🔥' },
        ]
    },
    {
        id: 'style',
        emoji: '🎨',
        question: 'Tu DNA Estético',
        subtitle: 'Identidad visual pura y balance estructural.',
        options: [
            { label: 'Minimalista Estructural', value: 'minimal', icon: '⬜' },
            { label: 'Vanguardista / Bold', value: 'bold', icon: '🌈' },
            { label: 'Legado Retro', value: 'retro', icon: '⏳' },
            { label: 'Cyber / Dark Mode', value: 'urban', icon: '🖤' },
        ]
    },
    {
        id: 'brand',
        emoji: '🏷️',
        question: 'Lealtad a la Marca',
        subtitle: 'Filtrado inteligente basado en tu afinidad real.',
        options: [
            { label: 'Nike / Swoosh', value: 'nike', icon: '✓' },
            { label: 'Adidas / Stripes', value: 'adidas', icon: '≡' },
            { label: 'Jordan / Jumpman', value: 'jordan', icon: '🏀' },
            { label: 'Curaduría Mixta', value: 'all', icon: '✨' },
        ]
    },
    {
        id: 'budget',
        emoji: '💰',
        question: 'Nivel de Inversión',
        subtitle: 'Ajustamos el algoritmo a tu capacidad de adquisición.',
        options: [
            { label: 'Acceso (— $90k)', value: 'low', icon: '💵' },
            { label: 'Intermedio ($90-160k)', value: 'mid', icon: '💳' },
            { label: 'High-End ($160k+)', value: 'high', icon: '💎' },
            { label: 'Uncapped / Elite', value: 'unlimited', icon: '🚀' },
        ]
    },
    {
        id: 'priority',
        emoji: '🎯',
        question: 'Factor Crítico',
        subtitle: 'Sintonía final del motor de recomendación.',
        options: [
            { label: 'Confort Supremo', value: 'comfort', icon: '☁️' },
            { label: 'Impacto Estético', value: 'design', icon: '👁️' },
            { label: 'Rareza / Exclusividad', value: 'exclusivity', icon: '👑' },
            { label: 'Oportunidad / Precio', value: 'price', icon: '📊' },
        ]
    },
]

export function AuraQuiz({ onComplete }: { onComplete?: () => void }) {
    const isQuizOpen = useAuraStore((s) => s.isQuizOpen)
    const openQuiz = useAuraStore((s) => s.openQuiz)
    const closeQuiz = useAuraStore((s) => s.closeQuiz)
    const hasCompletedQuiz = useAuraStore((s) => s.hasCompletedQuiz)
    const setProfile = useAuraStore((s) => s.setProfile)

    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Partial<AuraProfile>>({})
    const [isFinishing, setIsFinishing] = useState(false)

    // Removed auto-open logic to prevent intrusive pop-ups
    /* 
    useEffect(() => {
        if (!hasCompletedQuiz) {
            openQuiz()
        }
    }, [hasCompletedQuiz, openQuiz])
    */

    if (!isQuizOpen) return null

    const currentQuestion = questions[step]

    const handleOptionSelect = (value: string) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value }
        setAnswers(newAnswers)
        
        // Auto-advance logic for better UX
        setTimeout(() => {
            if (step < questions.length - 1) {
                setStep(s => s + 1)
            } else {
                handleFinish(newAnswers)
            }
        }, 300)
    }

    const handleFinish = (finalAnswers: Partial<AuraProfile>) => {
        setIsFinishing(true)
        const profile: AuraProfile = {
            occasion: finalAnswers.occasion || 'casual',
            brand: finalAnswers.brand || 'all',
            style: finalAnswers.style || 'minimal',
            budget: finalAnswers.budget || 'mid',
            priority: finalAnswers.priority || 'design',
            completedAt: new Date().toISOString(),
        }
        
        setTimeout(() => {
            setProfile(profile)
            closeQuiz()
            if (onComplete) onComplete()
        }, 1500)
    }

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1)
        } else {
            closeQuiz()
            if (onComplete) onComplete()
        }
    }

    return (
        <AnimatePresence mode="wait">
            {isQuizOpen && (
                <motion.div
                    key="aura-quiz-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-4 md:p-8"
                >
                    <button
                        onClick={() => {
                            closeQuiz()
                            if (onComplete) onComplete()
                        }}
                        className="absolute top-6 right-6 z-[110] text-white/30 hover:text-[#00E5FF] transition-all hover:rotate-90 duration-300"
                    >
                        <X size={28} />
                    </button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -30 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-3xl rounded-[2.5rem] border border-white/5 bg-black/40 p-8 md:p-14 shadow-2xl overflow-hidden glassmorphism"
                    >
                        {/* Animated background energy */}
                        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-[#C6FF00]/5 blur-[80px] rounded-full" />
                        
                        <div className="relative z-10">
                            {isFinishing ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="relative mb-10 h-24 w-24">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#00E5FF]" 
                                        />
                                        <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-[#00E5FF]" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">Sincronizando Aura</h2>
                                    <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white/40">Calibrando algoritmos de recomendación...</p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="mb-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                                <Sparkles size={18} className="text-[#00E5FF]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E5FF]">Personalización Pro</p>
                                                <p className="text-[9px] font-bold text-white/30 uppercase">Fase {step + 1} de {questions.length}</p>
                                            </div>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                                className="h-full bg-[#00E5FF]"
                                            />
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentQuestion.id}
                                            initial={{ opacity: 0, x: 25 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -25 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="mb-10 text-center">
                                                <span className="block mb-4 text-5xl">{currentQuestion.emoji}</span>
                                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-3">
                                                    {currentQuestion.question}
                                                </h2>
                                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                                                    {currentQuestion.subtitle}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentQuestion.options.map((option) => {
                                                    const isSelected = answers[currentQuestion.id] === option.value;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleOptionSelect(option.value)}
                                                            className={`group relative flex items-center gap-4 rounded-3xl border px-6 py-5 text-left transition-all duration-300 ${
                                                                isSelected
                                                                    ? 'bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_40px_rgba(0,229,255,0.2)]'
                                                                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        >
                                                            {option.icon && (
                                                                <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{option.icon}</span>
                                                            )}
                                                            <span className="text-[11px] font-black uppercase tracking-[0.1em]">
                                                                {option.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Footer */}
                                    <div className="mt-12 flex justify-start">
                                        <button
                                            onClick={handlePrevious}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#00E5FF] transition-colors"
                                        >
                                            {step > 0 ? 'Regresar' : 'Saltar quiz'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
