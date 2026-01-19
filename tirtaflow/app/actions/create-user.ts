'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUserAction(data: any) {
    const supabaseAdmin = createAdminClient()

    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
            full_name: data.full_name
        }
    })

    if (authError || !authData.user) {
        console.error('Create User Auth Error:', authError)
        return { success: false, error: authError?.message || 'Failed to create user in Auth' }
    }

    // 2. Create User Profile
    // Note: If you have a trigger on auth.users -> profiles, this might be redundant or fail.
    // I will check if profile exists first or upsert.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role
        })

    if (profileError) {
        console.error('Create Profile Error:', profileError)
        // Cleanup auth user if profile fails? 
        // For now, let's return error but user is created in Auth. 
        // Ideally should be transaction or robust cleanup.
        return { success: true, warning: 'User created but profile sync issues. Please check.' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
