'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(prevState: unknown, formData: FormData) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado', success: '' }
  }

  const fullName = formData.get('fullName') as string
  const whatsappNumber = formData.get('whatsappNumber') as string

  // Basic validation
  if (!fullName) {
    return { error: 'El nombre es requerido', success: '' }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        whatsapp_number: whatsappNumber,
        // Add other fields if necessary
      })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard/settings')

    return { success: 'Perfil actualizado correctamente', error: '' }
  } catch {
    // console.error('Error updating profile:', error)
    return { error: 'Error al actualizar el perfil', success: '' }
  }
}
