import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardCatalog } from '@/components/dashboard/DashboardCatalog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo Mayorista | Éter Store',
  description: 'Explora nuestro catálogo de productos premium. Precios mayoristas para revendedores.',
}

export default async function CataloguePage() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('No se pudo cargar el perfil del usuario.')
  }

  // Simplified query
  const { data: productsData, error: productsFetchError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (productsFetchError) {
    console.error('Error fetching products:', productsFetchError)
    throw new Error('Error al cargar el catálogo.')
  }

  return (
    <DashboardCatalog 
      user={profile} 
      products={productsData || []} 
    />
  )
}
