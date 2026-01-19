'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteUserAction(userId: string) {
    const supabaseAdmin = createAdminClient()

    // Delete from Auth (this should cascade if configured, but profiles is separate usually)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
        console.error('Delete User Auth Error:', authError)
        return { success: false, error: authError.message }
    }

    // Delete from profiles (if not cascaded)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)

    // Check profile error but prioritize success if auth deletion worked
    if (profileError) {
        console.error('Delete Profile Error:', profileError)
    }

    revalidatePath('/admin/users')
    return { success: true }
}
