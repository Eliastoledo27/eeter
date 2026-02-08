import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Award, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/dashboard/GlassCard'

export default async function ProfilePage() {
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

  if (!profile) {
    return <div>Perfil no encontrado</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mi Perfil</h1>
      
      <div className="glass p-8 rounded-2xl border-white/5 space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <Badge variant="blue" className="mt-2 capitalize">{profile.role}</Badge>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
            <Mail className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
            <Award className="text-accent-gold" />
            <div>
              <p className="text-xs text-gray-400">Puntos Totales</p>
              <p className="font-medium text-accent-gold">{profile.points}</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
            <TrendingUp className="text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Racha Actual</p>
              <p className="font-medium">{profile.streak_days} días</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
