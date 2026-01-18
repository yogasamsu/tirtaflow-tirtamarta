'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserAction(userId: string, data: { full_name?: string, role?: string }) {
    const supabase = await createClient()

    // 1. Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Access denied. Only Admins can manage users.' }
    }

    // 2. Update target user
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

    if (error) {
        console.error('Update User Error:', error)
        return { success: false, error: 'Failed to update user.' }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
