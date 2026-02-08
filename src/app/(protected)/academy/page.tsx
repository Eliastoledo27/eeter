
import { createClient } from '@/utils/supabase/server'
import { getAcademyJourney } from '@/app/actions/academy'
import { AcademyStats } from '@/components/academy/AcademyStats'
import { CourseJourney } from '@/components/academy/CourseJourney'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings } from 'lucide-react'

const LEVELS = [
  { level: 1, xp: 0, title: 'Novato' },
  { level: 2, xp: 500, title: 'Aprendiz' },
  { level: 3, xp: 1500, title: 'Vendedor Junior' },
  { level: 4, xp: 3000, title: 'Vendedor Pro' },
  { level: 5, xp: 5000, title: 'Maestro del Éter' },
]

function getLevelInfo(points: number) {
  // Find the highest level where points >= xp_required
  let current = LEVELS[0]
  let next = LEVELS[1]

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].xp) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || { ...LEVELS[i], xp: Infinity, title: 'Max Level' }
    }
  }

  return { current, next }
}

export default async function AcademyPage() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Fetch Profile (for XP/Role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('points, role')
    .eq('id', user.id)
    .single()

  const courses = await getAcademyJourney()
  
  const points = profile?.points || 0
  const { current, next } = getLevelInfo(points)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'support'

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Academia VIP
            </h1>
            <p className="text-gray-500">Completa cursos, gana XP y desbloquea premios exclusivos.</p>
        </div>
        
        {isAdmin && (
            <Link 
                href="/academy/admin" 
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
                <Settings className="w-4 h-4" />
                Gestionar Academia
            </Link>
        )}
      </div>

      {/* Stats / Gamification Banner */}
      <AcademyStats 
        level={current.level} 
        currentXP={points} 
        nextLevelXP={next.xp} 
        levelTitle={current.title}
      />

      {/* Course Map */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl font-bold">Tu Ruta de Aprendizaje</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
        </div>
        
        <CourseJourney courses={courses || []} />
      </div>
    </div>
  )
}
