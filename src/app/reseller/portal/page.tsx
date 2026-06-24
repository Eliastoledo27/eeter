'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Crown, LogOut, ExternalLink, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { ResellerCatalogBuilder } from '@/components/reseller/ResellerCatalogBuilder'
import { ResellerOnboardingWizard } from '@/components/reseller/ResellerOnboardingWizard'

function PortalContent() {
  const { isInitialized, isAuthenticated, isLoading, user, checkSession } = useAuthStore()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  // Auth Guard redirect
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push('/reseller/login')
    }
  }, [isInitialized, isAuthenticated, isLoading, router])

  // Fetch reseller profile details
  useEffect(() => {
    async function fetchProfile() {
      if (isAuthenticated && user) {
        setLoadingProfile(true)
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
          } else {
            setProfile(data)
          }
        } catch (err) {
          console.error('Error in fetchProfile:', err)
        } finally {
          setLoadingProfile(false)
        }
      }
    }

    fetchProfile()
  }, [isAuthenticated, user])

  // Show wizard if profile is incomplete and not already dismissed
  useEffect(() => {
    if (!profile || loadingProfile) return
    const alreadyCompleted = localStorage.getItem('eter-onboarding-complete') === 'true'
    const profileComplete = profile.reseller_slug && (profile.bank_cbu || profile.bank_alias)
    if (!alreadyCompleted && !profileComplete) {
      setShowWizard(true)
    }
  }, [profile, loadingProfile])

  const handleWizardComplete = async (slug: string) => {
    setShowWizard(false)
    // Reload profile after wizard completes
    if (user) {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('eter-reseller-logged-in')
        window.sessionStorage.removeItem('eter-reseller-session-temp')
      }
      await checkSession()
      toast.success('Sesión cerrada correctamente')
      router.push('/reseller/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Error al cerrar sesión')
    }
  }

  // Loading state
  if (!isInitialized || (isLoading && !isAuthenticated) || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-4 mx-auto animate-pulse">
              <Crown className="text-[#00E5FF]" size={32} />
            </div>
            <div className="absolute -inset-4 bg-[#00E5FF]/5 blur-2xl rounded-full -z-10 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
            Cargando Panel de Control...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#00E5FF]/20 overflow-x-hidden relative flex flex-col texture-grain">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#FF007A]/3 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Glassmorphic Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#222222] px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007A]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center shadow-md shadow-cyan-500/5">
            <Crown className="text-[#00E5FF]" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">
              Mi Tienda
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              {profile?.full_name || 'Revendedor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile?.reseller_slug && (
            <>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/c/${profile.reseller_slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success('¡Enlace de tienda copiado al portapapeles!');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 to-[#FF007A]/10 border border-[#00E5FF]/20 hover:border-[#00E5FF]/40 text-xs text-[#00E5FF] hover:text-white transition-all duration-200"
                title="Copiar el enlace de tu tienda"
              >
                <Copy size={13} />
                <span className="hidden sm:inline">Compartir enlace tienda</span>
              </button>

              <Link
                href={`/c/${profile.reseller_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-[#222222] hover:border-white/20 text-xs text-gray-300 hover:text-white transition-all duration-200"
              >
                <span className="hidden sm:inline">Ver Mi Tienda</span>
                <ExternalLink size={13} />
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-all duration-200"
            aria-label="Cerrar Sesión"
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
        <div className="bg-[#0A0A0A]/50 border border-[#181818] rounded-[2rem] p-6 md:p-8 backdrop-blur-xl shadow-3xl">
          <ResellerCatalogBuilder isDashboard={true} />
        </div>
      </main>

      {/* Onboarding Wizard — aparece si el perfil está incompleto */}
      {showWizard && (
        <ResellerOnboardingWizard onComplete={handleWizardComplete} />
      )}
    </div>
  )
}

export default function ResellerPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    }>
      <PortalContent />
    </Suspense>
  )
}
