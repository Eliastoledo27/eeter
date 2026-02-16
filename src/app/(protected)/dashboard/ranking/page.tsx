'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Medal, TrendingUp, TrendingDown, Star, Crown, Loader2 } from 'lucide-react'
import { getRanking, getPersonalStats, type RankingEntry } from '@/app/actions/ranking-actions'
import { usePermissions } from '@/hooks/usePermissions'
import Image from 'next/image'

const POSITION_STYLES: Record<number, { icon: React.ElementType; color: string; bg: string }> = {
    1: { icon: Crown, color: 'text-amber-400', bg: 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/30' },
    2: { icon: Medal, color: 'text-gray-300', bg: 'bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/30' },
    3: { icon: Medal, color: 'text-orange-400', bg: 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/30' },
}

export default function RankingPage() {
    const [ranking, setRanking] = useState<RankingEntry[]>([])
    const [personalStats, setPersonalStats] = useState<{
        current: RankingEntry | null
        history: RankingEntry[]
        trend: number
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7))
    const { isAdmin, isReseller } = usePermissions()

    const loadData = useCallback(async () => {
        setLoading(true)
        const [rankingRes, statsRes] = await Promise.all([
            getRanking(period),
            getPersonalStats(),
        ])
        if (rankingRes.data) setRanking(rankingRes.data)
        if (statsRes.data) setPersonalStats(statsRes.data)
        setLoading(false)
    }, [period])

    useEffect(() => { loadData() }, [loadData])

    // Generate last 6 months for period selector
    const periods = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return d.toISOString().slice(0, 7)
    })

    return (
        <div className="animate-in fade-in duration-700 pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl border border-amber-500/20">
                        <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Ranking Global</h1>
                        <p className="text-sm text-gray-500">Tabla de posiciones de ventas</p>
                    </div>
                </div>
                {/* Period Selector */}
                <select
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/30"
                >
                    {periods.map(p => (
                        <option key={p} value={p}>
                            {new Date(p + '-01').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </option>
                    ))}
                </select>
            </div>

            {/* Personal Stats (for resellers) */}
            {(isReseller || isAdmin) && personalStats?.current && (
                <div className="bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4" />
                        Tu Rendimiento
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Posición</p>
                            <p className="text-2xl font-bold text-amber-400">#{personalStats.current.position || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Ventas</p>
                            <p className="text-2xl font-bold text-white">${Number(personalStats.current.total_sales).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Pedidos</p>
                            <p className="text-2xl font-bold text-white">{personalStats.current.total_orders}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Tendencia</p>
                            <p className={`text-2xl font-bold flex items-center gap-1 ${personalStats.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {personalStats.trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {Math.abs(personalStats.trend).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Ranking Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Trophy className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">Sin datos de ranking</p>
                        <p className="text-xs text-gray-600 mt-1">Los datos se generan con las ventas del período</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-mono bg-white/[0.02]">
                            <span className="col-span-1">#</span>
                            <span className="col-span-4">Revendedor</span>
                            <span className="col-span-2">Ventas</span>
                            <span className="col-span-2">Pedidos</span>
                            <span className="col-span-3">Ganancias</span>
                        </div>

                        {ranking.map((entry, idx) => {
                            const pos = idx + 1
                            const style = POSITION_STYLES[pos]
                            const PositionIcon = style?.icon || Star

                            return (
                                <div
                                    key={entry.id}
                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/[0.02] ${style ? `border-l-2 ${style.bg}` : ''
                                        }`}
                                >
                                    <div className="col-span-1">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${style ? `${style.bg} border` : 'bg-white/5'
                                            }`}>
                                            {pos <= 3 ? (
                                                <PositionIcon className={`w-4 h-4 ${style?.color || 'text-gray-500'}`} />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-400">{pos}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10 flex items-center justify-center">
                                            {entry.avatar_url ? (
                                                <Image src={entry.avatar_url} alt="" width={32} height={32} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">
                                                    {(entry.user_name || '?').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${style ? style.color : 'text-white'}`}>
                                                {entry.user_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm font-semibold text-white">${Number(entry.total_sales).toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-300">{entry.total_orders}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-sm font-semibold text-emerald-400">${Number(entry.total_profit).toLocaleString()}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
