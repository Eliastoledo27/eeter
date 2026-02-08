
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminAcademyManager } from '@/components/academy/admin/AdminAcademyManager'

export default async function AdminAcademyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'support') {
    redirect('/academy')
  }

  // Fetch all data for management
  const { data: courses } = await supabase.from('academy_courses').select('*').order('created_at')
  const { data: modules } = await supabase.from('academy_modules').select('*').order('created_at')
  
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Academia</h1>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm">
            Modo Admin
        </div>
      </div>

      <AdminAcademyManager 
        initialCourses={courses || []} 
        initialModules={modules || []} 
      />
    </div>
  )
}
