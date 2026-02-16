import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Award, TrendingUp, Shield, MapPin } from 'lucide-react'

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
    return (
      <div className="flex items-center justify-center h-full text-white font-mono">
        PROFILE_DATA_NOT_FOUND {'//'} ERROR_404
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-light text-white font-mono tracking-tighter">
            OPERATOR PROFILE <span className="text-primary">{'//'}</span> {profile.role?.toUpperCase() || 'USER'}
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-2 tracking-widest uppercase">
            ID: {user.id.split('-')[0]}...
          </p>
        </div>
        <div className="px-4 py-1 bg-green-500/10 border border-green-500/50 rounded text-green-500 text-[10px] font-bold font-mono uppercase tracking-widest animate-pulse">
          SYSTEM ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: ID Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
            <div className="w-32 h-32 rounded-full border-2 border-primary/30 p-1 mb-6 relative">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                {/* Placeholder Avatar */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                <span className="text-4xl text-gray-600 font-bold relative z-10">{profile.full_name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="absolute bottom-0 right-2 w-6 h-6 bg-primary rounded-full border-4 border-black z-20"></div>
            </div>

            <h2 className="text-xl font-bold text-white font-heading relative z-10">{profile.full_name}</h2>
            <span className="text-xs text-primary font-mono mt-1 relative z-10 uppercase tracking-widest">{profile.role || 'Member'}</span>

            <div className="mt-8 w-full space-y-4 relative z-10">
              <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-gray-500 font-mono">STATUS</span>
                <span className="text-green-500 font-mono">ONLINE</span>
              </div>
              <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-gray-500 font-mono">JOINED</span>
                <span className="text-white font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-gray-500 font-mono">LEVEL</span>
                <span className="text-primary font-mono">TIER 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-primary pl-3 mb-6 font-mono">Performance Metrics</h3>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <Award className="text-primary group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] text-gray-500 font-mono">TOTAL</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{profile.points || 0}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Points Earned</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-green-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <TrendingUp className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] text-gray-500 font-mono">STREAK</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{profile.streak_days || 0}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Active Days</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-blue-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <Shield className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] text-gray-500 font-mono">AUTH</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Verified</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-l-2 border-primary pl-3 mb-6 font-mono">Contact Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Email Address</label>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/5">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-white font-mono">{profile.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Location</label>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/5">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-white font-mono">Argentina (AR)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
