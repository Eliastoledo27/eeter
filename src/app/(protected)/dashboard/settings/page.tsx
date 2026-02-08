import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from '@/components/dashboard/ProfileSettingsForm'

export default async function SettingsPage() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <ProfileSettingsForm profile={profile} />
    </div>
  )
}
