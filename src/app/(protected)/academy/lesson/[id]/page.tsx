
import { getLesson } from '@/app/actions/academy'
import { LessonView } from '@/components/academy/LessonView'
import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function LessonPage({ params }: PageProps) {
  const lesson = await getLesson(params.id)

  if (!lesson) {
    redirect('/academy')
  }

  return <LessonView lesson={lesson} />
}
