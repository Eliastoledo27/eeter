'use server'

import { createClient } from '@/utils/supabase/server'
import { AcademyCourse, AcademyModule, AcademyLesson } from '@/types/academy'
import { revalidatePath } from 'next/cache'

// --- Public / User Actions ---

export async function getAcademyJourney() {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return []
    }

    const { data: courses, error: coursesError } = await supabase
      .from('academy_courses')
      .select(`
        *,
        modules:academy_modules(
            *,
            lessons:academy_content(*)
        )
        `)
      .eq('is_published', true)
      .order('created_at', { ascending: true })

    if (coursesError || !courses) {
      return []
    }

    const { data: progress } = await supabase
      .from('academy_progress')
      .select('content_id')
      .eq('user_id', user.id)

    const completedIds = new Set(progress?.map(p => p.content_id) || [])

    const formattedCourses: AcademyCourse[] = courses.map((course) => {
      let totalLessons = 0
      let completedLessons = 0

      const modules: AcademyModule[] = (course.modules || [])
        .sort((a: AcademyModule, b: AcademyModule) => (a.order || 0) - (b.order || 0))
        .map((mod: AcademyModule) => {
          const lessons: AcademyLesson[] = (mod.lessons || [])
            .sort((a: AcademyLesson, b: AcademyLesson) => (a.order || 0) - (b.order || 0))
            .map((lesson: AcademyLesson) => {
              totalLessons++
              const isCompleted = completedIds.has(lesson.id)
              if (isCompleted) completedLessons++

              return {
                ...lesson,
                completed: isCompleted
              } as AcademyLesson
            })

          return {
            ...mod,
            lessons
          } as AcademyModule
        })

      return {
        ...course,
        modules,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      } as AcademyCourse
    })

    return formattedCourses

  } catch (err) {
    console.error('Academy Error:', err)
    return []
  }
}

export async function completeLesson(lessonId: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authorized')
    }

    const { data: existing } = await supabase
      .from('academy_progress')
      .select('content_id')
      .eq('user_id', user.id)
      .eq('content_id', lessonId)
      .single()

    if (existing) return { success: true, message: 'Already completed' }

    const { data: lesson } = await supabase
      .from('academy_content')
      .select('xp_reward')
      .eq('id', lessonId)
      .single()

    if (!lesson) throw new Error('Lesson not found')

    const { error: insertError } = await supabase
      .from('academy_progress')
      .insert({ user_id: user.id, content_id: lessonId })

    if (insertError) throw insertError

    const { error: updateError } = await supabase.rpc('increment_points', {
      user_id: user.id,
      points_to_add: lesson.xp_reward
    })

    if (updateError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

      await supabase
        .from('profiles')
        .update({ points: (profile?.points || 0) + (lesson.xp_reward || 0) })
        .eq('id', user.id)
    }

    revalidatePath('/academy')
    return { success: true, xpGained: lesson.xp_reward }
  } catch (err) {
    console.error('Academy complete error:', err)
    return { success: false, error: 'Failed to complete lesson' }
  }
}

export async function getLesson(id: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: lesson, error } = await supabase
      .from('academy_content')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !lesson) {
      return null
    }

    const { data: progress } = await supabase
      .from('academy_progress')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('content_id', id)
      .single()

    return {
      ...lesson,
      completed: !!progress
    } as AcademyLesson
  } catch (err) {
    console.error('Academy get lesson error:', err)
    return null
  }
}

// --- Admin Actions ---

export async function createCourse(data: { title: string; description: string; slug: string; thumbnail_url?: string }) {
  const supabase = createClient()
  const { error } = await supabase.from('academy_courses').insert(data)
  if (error) throw error
  revalidatePath('/academy')
  return { success: true }
}

export async function createModule(data: { course_id: string; title: string; order: number }) {
  const supabase = createClient()
  const { error } = await supabase.from('academy_modules').insert(data)
  if (error) throw error
  revalidatePath('/academy')
  return { success: true }
}

export async function createLesson(data: Omit<AcademyLesson, 'id' | 'completed'>) {
  const supabase = createClient()
  const { error } = await supabase.from('academy_content').insert(data)
  if (error) throw error
  revalidatePath('/academy')
  return { success: true }
}
