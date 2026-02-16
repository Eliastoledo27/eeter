'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { UserRole } from '@/config/roles'

export async function syncUserRole() {
    const supabase = createServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: 'User not authenticated' }
    }

    // 1. Get role from public.profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return { success: false, error: 'Profile not found' }
    }

    const dbRole = profile.role as UserRole
    const metaRole = user.app_metadata?.role

    // 2. If mismatch, update auth.users
    if (dbRole !== metaRole) {
        // We need service_role key to update auth.users
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

        if (!serviceRoleKey || !supabaseUrl) {
            return {
                success: false,
                error: 'Missing service role key. Please run the SQL migration manually or add SUPABASE_SERVICE_ROLE_KEY to .env'
            }
        }

        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            user.id,
            { app_metadata: { role: dbRole } }
        )

        if (updateError) {
            return { success: false, error: 'Failed to update user metadata: ' + updateError.message }
        }

        // Refresh the user session in the current client if possible (middleware will pick it up on next request)
        return { success: true, role: dbRole, updated: true }
    }

    return { success: true, role: dbRole, updated: false }
}
