
'use client'

import { AcademyCourse } from "@/types/academy"
import { CheckCircle, Play, FileText, ChevronRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from 'next/image'

interface CourseJourneyProps {
  courses: AcademyCourse[]
}

export function CourseJourney({ courses }: CourseJourneyProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-gray-500">No hay cursos disponibles aún.</h3>
        <p className="text-gray-400">Vuelve pronto para ver nuevo contenido.</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {courses.map((course, index) => (
        <div key={course.id} className="relative">
          {/* Connector Line */}
          {index < courses.length - 1 && (
            <div className="absolute left-8 top-16 bottom-[-48px] border-l-2 border-dashed border-gray-300 dark:border-gray-800 -z-10" />
          )}

          <div className="glass rounded-2xl overflow-hidden border border-white/20 shadow-xl transition-all hover:shadow-2xl">
            {/* Course Header */}
            <div className="relative h-48 bg-gray-900">
              {course.thumbnail_url && (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-300 max-w-xl text-sm">{course.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-accent-gold">{course.progress}%</div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Completado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="p-6 space-y-6">
              {course.modules?.map((module) => (
                <div key={module.id} className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      {module.order}
                    </span>
                    {module.title}
                  </h4>

                  <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-4">
                    {module.lessons?.map((lesson) => {
                      // Logic to determine if locked: 
                      // Previous lesson in module must be completed? 
                      // For now, assume unlocked if previous modules done? 
                      // Let's keep it simple: everything visible but tracks completion.
                      const isCompleted = lesson.completed

                      return (
                        <Link
                          href={`/academy/lesson/${lesson.id}`}
                          key={lesson.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg group transition-all",
                            isCompleted ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                            )}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                lesson.type === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                              <h5 className={cn("font-medium text-sm", isCompleted && "text-gray-500 line-through")}>
                                {lesson.title}
                              </h5>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span className="uppercase">{lesson.type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-orange-500 font-bold">
                                  <Star className="w-3 h-3 fill-orange-500" /> +{lesson.xp_reward} XP
                                </span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
