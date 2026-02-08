
'use client'

import { AcademyLesson } from "@/types/academy"
import { completeLesson } from "@/app/actions/academy"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface LessonViewProps {
  lesson: AcademyLesson
}

export function LessonView({ lesson }: LessonViewProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(lesson.completed)
  const router = useRouter()
  const { toast } = useToast()

  const handleComplete = async () => {
    if (completed) return
    setLoading(true)
    try {
      const result = await completeLesson(lesson.id)
      if (result.success) {
        setCompleted(true)
        toast("¡Lección Completada!", {
          description: `Has ganado +${result.xpGained} XP`,
        })
        router.refresh()
      }
    } catch {
      toast.error("No se pudo completar la lección")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link href="/academy" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Volver a la Academia
      </Link>

      <div className="glass rounded-2xl overflow-hidden shadow-xl mb-8">
        {/* Video Player / Content Viewer */}
        <div className="aspect-video bg-black relative">
          {lesson.type === 'video' ? (
            <iframe
              src={lesson.url.replace('watch?v=', 'embed/')}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white p-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Material de Lectura</h3>
              <a
                href={lesson.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                Abrir {lesson.type.toUpperCase()}
              </a>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-gray-500">{lesson.description}</p>
            </div>

            <Button
              onClick={handleComplete}
              disabled={loading || !!completed}
              className={cn(
                "min-w-[200px] h-12 text-lg font-bold transition-all transform hover:scale-105",
                completed
                  ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-orange-500/20"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : completed ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Completado
                </>
              ) : (
                "Marcar como Visto"
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-100 pt-6">
            <span>Duración aprox: {lesson.duration_minutes || 10} min</span>
            <span>•</span>
            <span className="text-orange-500 font-bold">+{lesson.xp_reward} XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}
