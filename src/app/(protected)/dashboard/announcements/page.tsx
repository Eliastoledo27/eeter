'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useSettingsStore } from '@/store/settings-store'
import { useAnnouncements, Announcement } from '@/hooks/useAnnouncements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
    Plus, Pencil, Trash2, Megaphone, Calendar, Tag, Image as ImageIcon,
    Eye, EyeOff, Sparkles, Layout, Zap, Share2, Rocket, Palette,
    TrendingUp, Shield, Cpu, ExternalLink, ChevronRight, Copy, Wand2,
    Type, MousePointer2, Target, Hash, MessageSquare, AlertCircle
} from 'lucide-react'
import { processAITool } from '@/app/actions/ai-tools'
import { toast } from 'sonner'
import Image from 'next/image'

// --- TEMPLATES SYSTEM v2.0 ---
const TEMPLATES = [
    {
        name: 'CYBER LAUNCH',
        icon: Rocket,
        description: 'Estética futurista con bordes neón y glitch effects.',
        data: {
            title: 'NUEVA ERA: [MODELO] v2.0',
            category: 'FUTURO',
            content: 'Equipamiento de alto rendimiento para la vida urbana. Tecnología y diseño fusionados.',
            image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1200',
            designConfig: {
                layout: 'cyber',
                accent_color: '#00F2FF',
                overlay_opacity: 0.7,
                blur_amount: 0,
                glass_intensity: 0.2,
                font_style: 'black',
                text_align: 'left',
                grain_effect: true,
                border_style: 'tech',
                font_scale: 'xl',
                texture: 'grid',
                promo_badge: 'NEW DROP'
            }
        }
    },
    {
        name: 'LUXURY MINIMAL',
        icon: Sparkles,
        description: 'Elegancia pura con mucho espacio negativo y tipografía fina.',
        data: {
            title: 'COLECCIÓN ETERNA',
            category: 'SIGNATURE',
            content: 'La definición de lujo silencioso. Materiales premium y confección artesanal.',
            image_url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200',
            designConfig: {
                layout: 'minimal',
                accent_color: '#FFFFFF',
                overlay_opacity: 0.4,
                blur_amount: 2,
                glass_intensity: 0.5,
                font_style: 'bold',
                text_align: 'center',
                grain_effect: true,
                border_style: 'none',
                font_scale: 'md',
                texture: 'none',
                promo_badge: ''
            }
        }
    },
    {
        name: 'BRUTALIST BOLD',
        icon: Zap,
        description: 'Alto impacto visual, tipografía gigante y contrastes fuertes.',
        data: {
            title: 'SOLO 24 HORAS',
            category: 'FLASH SALE',
            content: 'Oportunidad única. Descuentos exclusivos en modelos seleccionados. No te duermas.',
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200',
            designConfig: {
                layout: 'bold',
                accent_color: '#FF0055',
                overlay_opacity: 0.8,
                blur_amount: 0,
                glass_intensity: 0,
                font_style: 'black',
                text_align: 'left',
                grain_effect: true,
                border_style: 'solid',
                font_scale: '2xl',
                texture: 'noise',
                promo_badge: '-50% OFF'
            }
        }
    },
    {
        name: 'ETHEREAL GLOW',
        icon: Palette,
        description: 'Suavidad y estilo con degradados y efectos de vidrio.',
        data: {
            title: 'ARTE EN MOVIMIENTO',
            category: 'LIMITED',
            content: 'Cada par es una obra maestra. Descubre la fusión entre arte y moda urbana.',
            image_url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200',
            designConfig: {
                layout: 'classic',
                accent_color: '#C88A04',
                overlay_opacity: 0.5,
                blur_amount: 4,
                glass_intensity: 0.3,
                font_style: 'bold',
                text_align: 'center',
                grain_effect: true,
                border_style: 'double',
                font_scale: 'lg',
                texture: 'gradient',
                promo_badge: 'PREMIUM'
            }
        }
    }
]

// --- ADVANCED FLYER ENGINE v2.5 ---
const LivePreview = ({ data, design }: { data: any, design: any }) => {
    // Dynamic styles based on layout
    const layoutConfig: any = {
        classic: "flex-col justify-end p-10",
        minimal: "flex-col justify-center items-center p-12 text-center",
        cyber: "flex-col justify-between p-6",
        bold: "flex-col justify-end p-6"
    }

    const fontScales: any = {
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl",
        '2xl': "text-5xl md:text-6xl"
    }

    return (
        <div className={`relative group overflow-hidden rounded-[2rem] bg-[#050505] aspect-[3/4] flex shadow-2xl transition-all duration-500 ${layoutConfig[design.layout] || layoutConfig.classic}`}>

            {/* --- LAYERS SYSTEM --- */}

            {/* 1. Base Texture/Effect */}
            {design.grain_effect && <div className="absolute inset-0 z-30 opacity-[0.15] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />}
            {design.texture === 'grid' && <div className="absolute inset-0 z-20 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />}

            {/* 2. Background Image */}
            <div className="absolute inset-0 z-0">
                {data.image_url ? (
                    <Image
                        src={data.image_url}
                        alt="Background"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        style={{
                            filter: `blur(${design.blur_amount}px) contrast(1.1)`,
                            opacity: 1 - (design.overlay_opacity * 0.8) // Smart opacity
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                        <ImageIcon className="text-white/5 w-24 h-24" />
                    </div>
                )}

                {/* 3. Gradient Overlays */}
                <div className="absolute inset-0 z-10"
                    style={{
                        background: design.layout === 'minimal'
                            ? `radial-gradient(circle at center, transparent 0%, #000000 120%)`
                            : `linear-gradient(to top, #000000 ${design.layout === 'bold' ? '90%' : '50%'}, transparent 100%)`
                    }}
                />
                <div className="absolute inset-0 z-10 opacity-60 mix-blend-overlay" style={{ backgroundColor: design.accent_color }} />
            </div>

            {/* --- DECORATIVE ELEMENTS (HUD) --- */}
            {design.border_style === 'tech' && (
                <div className="absolute inset-4 z-40 border border-white/20 rounded-xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: design.accent_color }} />
                    <div className="absolute top-1/2 left-0 w-2 h-8 -translate-y-1/2 bg-white/10" />
                    <div className="absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 bg-white/10" />
                </div>
            )}

            {design.border_style === 'double' && (
                <div className="absolute inset-6 z-40 border-4 border-double border-white/20 rounded-xl pointer-events-none" />
            )}

            {design.border_style === 'solid' && (
                <div className="absolute inset-0 z-40 border-[12px] pointer-events-none" style={{ borderColor: design.accent_color }} />
            )}

            {/* --- CONTENT LAYER --- */}
            <div className={`relative z-50 flex flex-col gap-4 ${design.text_align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>

                {/* Badge / Category */}
                <div className="flex items-center gap-2 mb-2">
                    {design.promo_badge && (
                        <span className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest transform -skew-x-12">
                            {design.promo_badge}
                        </span>
                    )}
                    <span
                        className="px-3 py-1 border text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-sm"
                        style={{
                            borderColor: `${design.accent_color}60`,
                            color: design.accent_color,
                            backgroundColor: `${design.accent_color}10`
                        }}
                    >
                        {data.category || 'COLLECTION'}
                    </span>
                </div>

                {/* Main Title */}
                <h2
                    className={`${fontScales[design.font_scale || 'lg']} font-black leading-[0.9] tracking-tighter text-white uppercase break-words w-full`}
                    style={{
                        textShadow: design.layout === 'cyber' ? `3px 3px 0px ${design.accent_color}80` : '0 10px 30px rgba(0,0,0,0.5)',
                        fontFamily: design.layout === 'minimal' ? 'serif' : 'inherit'
                    }}
                >
                    {data.title || 'YOUR TITLE HERE'}
                </h2>

                {/* Divider */}
                {design.layout !== 'bold' && (
                    <div className="w-12 h-1 rounded-full" style={{ backgroundColor: design.accent_color }} />
                )}

                {/* Content */}
                <p
                    className="text-sm text-gray-300 font-medium leading-relaxed max-w-[90%] line-clamp-4"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                    {data.content || 'Escribe una descripción impactante para tu anuncio. Describe los beneficios y la exclusividad...'}
                </p>

                {/* Footer / CTA Mockup */}
                <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-between items-center opacity-80">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">DISPONIBLE EN</span>
                        <span className="text-[10px] font-bold text-white uppercase">ETER-STORE.COM</span>
                    </div>
                    <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">
                        <span className="text-[8px] text-gray-500 font-bold">QR</span>
                    </div>
                </div>
            </div>

            {/* Brand Watermark */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 opacity-30 mix-blend-screen">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">ÉTER STUDIO</p>
            </div>
        </div>
    )
}

export default function AnnouncementsAdminPage() {
    const { role } = useAuthStore()
    const { announcements, loading, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)

    // AI and Form states
    const { geminiApiKey, setGeminiApiKey } = useSettingsStore()
    const [isApiKeyValid, setIsApiKeyValid] = useState(!!geminiApiKey)
    const [activeTab, setActiveTab] = useState<'content' | 'design'>('content')
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        image_url: '',
        is_active: true
    })

    const [designConfig, setDesignConfig] = useState({
        layout: 'cyber', // classic, minimal, cyber, bold
        accent_color: '#00F2FF',
        overlay_opacity: 0.7,
        blur_amount: 0,
        glass_intensity: 0.2,
        font_style: 'black', // normal, bold, black
        text_align: 'left', // left, center
        grain_effect: true,
        border_style: 'tech', // none, solid, double, tech
        font_scale: 'xl', // md, lg, xl, 2xl
        texture: 'grid', // none, noise, grid, gradient
        promo_badge: 'NEW DROP'
    })

    // Load API Key status
    useEffect(() => {
        if (geminiApiKey) {
            setIsApiKeyValid(true)
        }
    }, [geminiApiKey])

    if (role !== 'admin' && role !== 'support') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <Shield className="text-red-500 w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">Protección Activa</h1>
                <p className="text-gray-400 max-w-sm text-center">Tus credenciales no permiten el acceso a este arsenal estratégico de marketing.</p>
                <Button variant="outline" className="mt-4 border-white/10" onClick={() => window.location.href = '/dashboard'}>Volver al Cuartel</Button>
            </div>
        )
    }

    const [isAiLoading, setIsAiLoading] = useState(false)

    const testConnection = async () => {
        if (!geminiApiKey) {
            toast.error('Ingresa una API Key primero')
            return
        }
        setIsAiLoading(true)
        try {
            const result = await processAITool('testConnection', {}, geminiApiKey)
            if (result.text?.includes('SISTEMA_OPERATIVO_ACTIVO')) {
                setIsApiKeyValid(true)
                toast.success('¡Conexión Exitosa! Gemini 2.5 Flash está activo.')
            } else {
                throw new Error(result.error || 'Respuesta inesperada')
            }
        } catch (err: any) {
            setIsApiKeyValid(false)
            toast.error(`Error de Conexión: ${err.message || 'Verifica tu API Key'}`)
        } finally {
            setIsAiLoading(false)
        }
    }

    const runAiTool = async (tool: string) => {
        setIsAiLoading(true)
        try {
            const result = await processAITool(tool, formData, geminiApiKey)
            if (result.error) {
                toast.error(result.error)
            } else if (result.text) {
                // Herramientas que modifican directamente
                if (tool === 'generateTitle') {
                    const firstTitle = result.text.split('\n')[0].replace(/^\d+\.\s*/, '')
                    setFormData(prev => ({ ...prev, title: firstTitle.toUpperCase() }))
                    toast.success('¡Título generado con éxito!')
                } else if (tool === 'enhanceContent') {
                    setFormData(prev => ({ ...prev, content: result.text }))
                    toast.success('Narrativa enriquecida por la IA')
                } else {
                    // Herramientas que informan
                    DialogAiResult(result.text, tool)
                }
            }
        } catch (err) {
            toast.error('Error de conexión con la IA')
        } finally {
            setIsAiLoading(false)
        }
    }

    const DialogAiResult = (text: string, title: string) => {
        toast(title.toUpperCase(), {
            description: text,
            duration: 10000,
            action: { label: 'Copiar', onClick: () => navigator.clipboard.writeText(text) }
        })
    }

    const applyManualTool = (type: string) => {
        switch (type) {
            case 'upper':
                setFormData(prev => ({ ...prev, title: prev.title.toUpperCase() }))
                break
            case 'urgency':
                setFormData(prev => ({ ...prev, title: `🚨 EXCLUSIVO: ${prev.title}` }))
                break
            case 'clean':
                setFormData(prev => ({ ...prev, content: prev.content.trim() }))
                break
            case 'reading':
                const words = formData.content.split(' ').length
                toast.info(`Tiempo est. lectura: ${Math.ceil(words / 3)} seg.`)
                break
        }
    }

    const applyTemplate = (templateData: any) => {
        setFormData(prev => ({
            ...prev,
            ...templateData
        }))
        toast.info('Template aplicado correctamente')
    }

    const handleCreate = async () => {
        if (!formData.title) {
            toast.error('El título es obligatorio')
            return
        }
        const success = await createAnnouncement(formData)
        if (success) {
            setIsCreateOpen(false)
            resetForm()
        }
    }

    const handleUpdate = async () => {
        if (!currentAnnouncement) return
        await updateAnnouncement(currentAnnouncement.id, formData)
        setIsEditOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: '',
            image_url: '',
            is_active: true
        })
        setCurrentAnnouncement(null)
    }

    const openEdit = (announcement: Announcement) => {
        setCurrentAnnouncement(announcement)
        setFormData({
            title: announcement.title,
            content: announcement.content || '',
            category: announcement.category || '',
            image_url: announcement.image_url || '',
            is_active: announcement.is_active
        })
        setIsEditOpen(true)
    }

    return (
        <div className="min-h-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* API Key Manager Banner */}
            <div className={`p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 ${isApiKeyValid ? 'bg-green-500/5 border border-green-500/10' : 'bg-[#C88A04]/10 border border-[#C88A04]/20'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isApiKeyValid ? 'bg-green-500/20 text-green-500' : 'bg-[#C88A04]/20 text-[#C88A04]'}`}>
                        <Cpu size={20} className={isAiLoading ? 'animate-spin' : ''} />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tighter text-white">
                            {isApiKeyValid ? 'Motor Gemini 2.5 Flash Conectado' : 'Configurar Cerebro Gemini 2.5'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {isApiKeyValid ? 'Listo para crear campañas de alto impacto' : 'Ingresa tu API Key para activar la inteligencia artificial'}
                        </p>
                    </div>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    <Input
                        type="password"
                        placeholder="AIzaSy..."
                        className="h-10 bg-black/50 border-white/5 focus:border-[#C88A04] text-xs font-mono w-full md:w-64"
                        value={geminiApiKey}
                        onChange={(e) => {
                            setGeminiApiKey(e.target.value)
                            setIsApiKeyValid(false)
                        }}
                    />
                    <Button
                        onClick={testConnection}
                        disabled={isAiLoading}
                        className={`h-10 px-6 font-black text-[10px] uppercase rounded-lg transition-all ${isApiKeyValid ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#C88A04] hover:bg-[#D97706] text-black'}`}
                    >
                        {isAiLoading ? 'PROBANDO...' : isApiKeyValid ? 'RE-VERIFICAR' : 'PROBAR CONEXIÓN'}
                    </Button>
                </div>
            </div>

            {/* --- HERO ARSENAL SECTION --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-[#111] to-[#050505] p-8 md:p-12 mb-12">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-[#C88A04]/5 blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-[#C88A04]/10 border border-[#C88A04]/30 text-[#C88A04] text-[10px] font-black tracking-widest uppercase rounded">Marketing v2.0</span>
                            <div className="flex -space-x-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#111] bg-[#C88A04]/20" />
                                ))}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
                            Arsenal de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C88A04] to-[#FFD900]">Ventas</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-light leading-relaxed">
                            Crea anuncios que impacten. Usa nuestras herramientas de diseño y templates estratégicos para convertir cada novedad en una oportunidad de venta masiva.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-14 px-8 bg-[#C88A04] hover:bg-[#D97706] text-black font-black text-lg rounded-full shadow-2xl shadow-[#C88A04]/20 flex gap-3 transition-transform hover:scale-105 active:scale-95">
                                        <Plus size={24} />
                                        CREAR NUEVA CAMPAÑA
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-5xl h-[90vh] md:h-auto overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic">Laboratorio de Anuncios</DialogTitle>
                                        <DialogDescription className="text-gray-500">
                                            Equipa tu marca con contenido visualmente impactante.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex border-b border-white/5 mb-6">
                                        <button
                                            onClick={() => setActiveTab('content')}
                                            className={`pb-3 px-6 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'content' ? 'text-[#C88A04] border-b-2 border-[#C88A04]' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            1. Estrategia & Contenido
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('design')}
                                            className={`pb-3 px-6 text-xs font-black tracking-widest uppercase transition-all ${activeTab === 'design' ? 'text-[#C88A04] border-b-2 border-[#C88A04]' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            2. Diseño Pro / Flyer
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Editor Side */}
                                        <div className="space-y-6">
                                            {activeTab === 'content' ? (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                                    <div className="space-y-4 p-6 rounded-2xl border border-[#C88A04]/20 bg-[#C88A04]/5 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88A04]/10 blur-3xl rounded-full -mr-16 -mt-16" />
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <Wand2 size={18} className="text-[#C88A04] animate-pulse" />
                                                                <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white">Laboratorio AI</h4>
                                                            </div>
                                                            {isAiLoading && <div className="w-4 h-4 border-2 border-[#C88A04] border-t-transparent rounded-full animate-spin" />}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button onClick={() => runAiTool('generateTitle')} disabled={isAiLoading} variant="outline" className="h-9 text-[10px] font-black border-white/5 bg-black/40 hover:border-[#C88A04]/50 justify-start gap-2">
                                                                <Type size={14} className="text-[#C88A04]" /> TÍTULOS
                                                            </Button>
                                                            <Button onClick={() => runAiTool('enhanceContent')} disabled={isAiLoading} variant="outline" className="h-9 text-[10px] font-black border-white/5 bg-black/40 hover:border-[#C88A04]/50 justify-start gap-2">
                                                                <MessageSquare size={14} className="text-[#C88A04]" /> NARRATIVA
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Título</label>
                                                            <Input
                                                                className="h-12 bg-black border-white/10 font-black uppercase text-white"
                                                                value={formData.title}
                                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contenido</label>
                                                            <Textarea
                                                                className="min-h-[120px] bg-black border-white/10"
                                                                value={formData.content}
                                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">

                                                    {/* 1. LAYOUT & STRUCTURE */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Layout size={12} /> Estructura Base
                                                        </h5>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {['classic', 'minimal', 'cyber', 'bold'].map(l => (
                                                                <button
                                                                    key={l}
                                                                    onClick={() => setDesignConfig(prev => ({ ...prev, layout: l }))}
                                                                    className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${designConfig.layout === l ? 'bg-[#C88A04] text-black border-[#C88A04]' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
                                                                >
                                                                    <div className={`w-6 h-4 border ${l === 'minimal' ? 'rounded-full' : 'rounded-sm'} ${designConfig.layout === l ? 'border-black' : 'border-gray-500'}`} />
                                                                    <span className="text-[8px] font-black uppercase">{l}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* 2. VISUAL FX */}
                                                    <div className="bg-[#111] border border-white/5 rounded-[1.5rem] p-6 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Laboratorio Visual</h5>
                                                            <Badge variant="outline" className="border-[#C88A04]/20 text-[#C88A04] text-[9px]">FX PRO</Badge>
                                                        </div>

                                                        {/* Sliders Grid */}
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500"><span>Darkness</span><span>{Math.round(designConfig.overlay_opacity * 100)}%</span></div>
                                                                <input type="range" min="0" max="0.95" step="0.05" value={designConfig.overlay_opacity} onChange={(e) => setDesignConfig({ ...designConfig, overlay_opacity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C88A04]" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500"><span>Blur</span><span>{designConfig.blur_amount}px</span></div>
                                                                <input type="range" min="0" max="10" step="1" value={designConfig.blur_amount} onChange={(e) => setDesignConfig({ ...designConfig, blur_amount: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C88A04]" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500"><span>Glass</span><span>{Math.round(designConfig.glass_intensity * 100)}%</span></div>
                                                                <input type="range" min="0" max="1" step="0.1" value={designConfig.glass_intensity} onChange={(e) => setDesignConfig({ ...designConfig, glass_intensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C88A04]" />
                                                            </div>
                                                        </div>

                                                        {/* Toggles */}
                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                onClick={() => setDesignConfig(prev => ({ ...prev, grain_effect: !prev.grain_effect }))}
                                                                className={`flex-1 py-3 rounded-lg border text-[9px] font-black uppercase transition-all ${designConfig.grain_effect ? 'bg-white text-black border-white' : 'bg-transparent text-gray-600 border-white/10'}`}
                                                            >
                                                                NOISE FX
                                                            </button>
                                                            <button
                                                                onClick={() => setDesignConfig(prev => ({ ...prev, texture: prev.texture === 'grid' ? 'none' : 'grid' }))}
                                                                className={`flex-1 py-3 rounded-lg border text-[9px] font-black uppercase transition-all ${designConfig.texture === 'grid' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-600 border-white/10'}`}
                                                            >
                                                                TECH GRID
                                                            </button>
                                                        </div>

                                                        {/* Color Palette */}
                                                        <div className="space-y-2 pt-2">
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase">Acento de Marca</span>
                                                            <div className="flex flex-wrap gap-3">
                                                                {['#00F2FF', '#C88A04', '#FF0055', '#FFFFFF', '#10B981', '#8B5CF6'].map(c => (
                                                                    <button
                                                                        key={c}
                                                                        onClick={() => setDesignConfig({ ...designConfig, accent_color: c })}
                                                                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${designConfig.accent_color === c ? 'border-white ring-2 ring-white/20' : 'border-transparent ring-1 ring-white/5'}`}
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 3. TYPOGRAPHY & DETAILS */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Type size={12} /> Detox & Detalles
                                                        </h5>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Escala Texto</label>
                                                                <div className="flex border border-white/10 rounded-lg bg-black/50 p-1">
                                                                    {['md', 'lg', 'xl', '2xl'].map((s) => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => setDesignConfig({ ...designConfig, font_scale: s })}
                                                                            className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase transition-all ${designConfig.font_scale === s ? 'bg-white/10 text-white' : 'text-gray-600'}`}
                                                                        >
                                                                            {s}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-bold text-gray-500 uppercase">Estilo Borde</label>
                                                                <select
                                                                    className="w-full h-8 bg-black/50 border border-white/10 rounded-lg text-[10px] text-white px-2 font-bold uppercase focus:border-[#C88A04]"
                                                                    value={designConfig.border_style}
                                                                    onChange={(e) => setDesignConfig({ ...designConfig, border_style: e.target.value })}
                                                                >
                                                                    <option value="none">SIN BORDE</option>
                                                                    <option value="solid">SÓLIDO</option>
                                                                    <option value="double">DOBLE</option>
                                                                    <option value="tech">TECH HUD</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-bold text-gray-500 uppercase">Badge Promocional</label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    className="h-9 bg-black/50 border-white/10 text-xs font-bold uppercase text-white placeholder:text-gray-700"
                                                                    placeholder="EJ: NEW DROP"
                                                                    value={designConfig.promo_badge}
                                                                    onChange={(e) => setDesignConfig({ ...designConfig, promo_badge: e.target.value })}
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    className="h-9 w-9 p-0 border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                                                    onClick={() => setDesignConfig({ ...designConfig, promo_badge: '' })}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-bold text-gray-500 uppercase">Imagen de Fondo (URL)</label>
                                                            <Input
                                                                className="h-9 bg-black/50 border-white/10 text-[10px] text-gray-400"
                                                                value={formData.image_url}
                                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Side */}
                                        <div className="space-y-6">
                                            <div className="sticky top-0 bg-[#0F0F0F] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                                                <label className="text-xs font-black tracking-[0.4em] text-[#C88A04] uppercase mb-6 block text-center">Éter Studio Preview</label>
                                                <LivePreview data={formData} design={designConfig} />
                                            </div>

                                            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-4">
                                                <Zap className="text-[#C88A04]" size={20} />
                                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Tip: Las imágenes con alto contraste y fondo oscuro funcionan mejor en móvil.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="border-t border-white/5 pt-6 mt-6">
                                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-full px-8 text-xs font-black">DESCARTAR</Button>
                                        <Button
                                            onClick={handleCreate}
                                            className="bg-[#C88A04] hover:bg-[#D97706] text-black font-black rounded-full px-10 h-12 shadow-xl shadow-[#C88A04]/20"
                                        >
                                            PUBLICAR CAMPAÑA
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="h-14 px-8 border-white/10 text-white font-bold rounded-full hover:bg-white/5">
                                <Share2 size={20} className="mr-2" />
                                COMPARTIR ARDIENDO
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-2 group hover:border-[#C88A04]/30 transition-all">
                            <TrendingUp className="text-[#C88A04]" />
                            <p className="text-2xl font-black text-white">{announcements.length}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Activos</p>
                        </div>
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-2 group hover:border-green-500/30 transition-all">
                            <Zap className="text-green-500" />
                            <p className="text-2xl font-black text-white">94%</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase">CTR Est.</p>
                        </div>
                    </div>
                </div >
            </div >

            {/* --- INVENTORY LIST SECTION --- */}
            < div className="space-y-6" >
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                        <Layout className="text-[#C88A04]" />
                        Historial de Campañas
                    </h2>
                    <Badge variant="outline" className="text-[10px] border-white/10 font-bold uppercase text-gray-500">
                        {announcements.length} ARCHIVADOS
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : announcements.length === 0 ? (
                        <Card className="bg-[#111] border-white/5 py-12 text-center">
                            <Megaphone size={48} className="mx-auto text-gray-700 mb-4" />
                            <p className="text-gray-500">No hay municición de marketing disponible aún.</p>
                        </Card>
                    ) : (
                        <AnimatePresence>
                            {announcements.map((ann, idx) => (
                                <motion.div
                                    key={ann.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative flex items-center gap-6 p-4 rounded-3xl border border-white/5 bg-[#111] hover:border-[#C88A04]/20 transition-all hover:translate-x-1"
                                >
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                                        {ann.image_url ? (
                                            <Image src={ann.image_url} alt={ann.title} fill className="object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-700">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            {ann.is_active ?
                                                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" /> :
                                                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                                            }
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#C88A04] uppercase tracking-widest">{ann.category || 'NOVEDAD'}</span>
                                            <span className="text-[10px] text-gray-600">•</span>
                                            <span className="text-[10px] text-gray-500 font-bold">{new Date(ann.published_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-[#C88A04] transition-colors">{ann.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1 max-w-xl italic">{ann.content}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-10 h-10 rounded-full hover:bg-white/5 text-gray-500 hover:text-white"
                                            onClick={() => openEdit(ann)}
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-10 h-10 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500"
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de eliminar este anuncio?')) {
                                                    deleteAnnouncement(ann.id)
                                                }
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-10 h-10 rounded-full hover:bg-blue-500/10 text-gray-500 hover:text-blue-500"
                                            onClick={() => window.open('/', '_blank')}
                                        >
                                            <ExternalLink size={18} />
                                        </Button>
                                    </div>

                                    {/* Accent line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#C88A04] opacity-0 group-hover:opacity-100 transition-opacity rounded-full ml-[-1px]" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div >

            {/* --- EDIT DRAWER/DIALOG --- */}
            < Dialog open={isEditOpen} onOpenChange={setIsEditOpen} >
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">Recalibrar Estrategia</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        <div className="space-y-4">
                            <div className="flex border-b border-white/5 mb-4">
                                <button onClick={() => setActiveTab('content')} className={`pb-2 px-4 text-xs font-black uppercase transition-all ${activeTab === 'content' ? 'text-[#C88A04] border-b-2 border-[#C88A04]' : 'text-gray-500'}`}>Contenido</button>
                                <button onClick={() => setActiveTab('design')} className={`pb-2 px-4 text-xs font-black uppercase transition-all ${activeTab === 'design' ? 'text-[#C88A04] border-b-2 border-[#C88A04]' : 'text-gray-500'}`}>Diseño</button>
                            </div>

                            {activeTab === 'content' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Título</label>
                                        <Input
                                            className="bg-black/50 border-white/10 focus:border-[#C88A04] font-bold uppercase"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Categoría</label>
                                            <Input
                                                className="bg-black/50 border-white/10 focus:border-[#C88A04]"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                            <Button
                                                variant="ghost"
                                                className={`w-full h-10 border border-white/5 ${formData.is_active ? 'text-green-500 bg-green-500/5' : 'text-gray-500 bg-white/5'}`}
                                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            >
                                                {formData.is_active ? 'PÚBLICO' : 'OCULTO'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">URL Imagen</label>
                                        <Input
                                            className="bg-black/50 border-white/10 focus:border-[#C88A04]"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Narrativa</label>
                                        <Textarea
                                            className="bg-black/50 border-white/10 focus:border-[#C88A04] min-h-[100px]"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {['classic', 'minimal', 'cyber', 'bold'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setDesignConfig(prev => ({ ...prev, layout: l }))}
                                                className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${designConfig.layout === l ? 'bg-[#C88A04] text-black' : 'bg-white/5 text-gray-500'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 py-2">
                                        {['#C88A04', '#00F2FF', '#FF0055', '#FFFFFF'].map(c => (
                                            <button key={c} onClick={() => setDesignConfig(prev => ({ ...prev, accent_color: c }))} className={`w-8 h-8 rounded-full ${designConfig.accent_color === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        className="w-full accent-[#C88A04]"
                                        value={designConfig.overlay_opacity}
                                        onChange={(e) => setDesignConfig(prev => ({ ...prev, overlay_opacity: parseFloat(e.target.value) }))}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className={`flex-1 text-[9px] ${designConfig.grain_effect ? 'border-[#C88A04]' : 'opacity-40'}`} onClick={() => setDesignConfig(prev => ({ ...prev, grain_effect: !prev.grain_effect }))}>FILM GRAIN</Button>
                                        <Button size="sm" variant="outline" className={`flex-1 text-[9px] ${designConfig.text_align === 'center' ? 'border-[#C88A04]' : 'opacity-40'}`} onClick={() => setDesignConfig(prev => ({ ...prev, text_align: prev.text_align === 'center' ? 'left' : 'center' }))}>CENTER</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block text-center">Prevista Flyer Pro</label>
                                <LivePreview data={formData} design={designConfig} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>CANCELAR</Button>
                        <Button onClick={handleUpdate} className="bg-[#C88A04] hover:bg-[#D97706] text-black font-black px-8">GUARDAR CAMBIOS</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}
