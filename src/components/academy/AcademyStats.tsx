
'use client'

import { Trophy, Star } from "lucide-react"

interface AcademyStatsProps {
  level: number
  currentXP: number
  nextLevelXP: number
  levelTitle: string
}

export function AcademyStats({ level, currentXP, nextLevelXP, levelTitle }: AcademyStatsProps) {
  const progress = Math.min(100, Math.max(0, (currentXP / nextLevelXP) * 100))

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy className="w-32 h-32" />
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg text-white font-bold text-3xl">
          {level}
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{levelTitle}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {currentXP} XP Totales
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {nextLevelXP - currentXP} XP para el siguiente nivel
              </span>
            </div>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
                <div></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-600 transition-all duration-1000 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
