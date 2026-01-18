'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsersAction() {
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('role', { ascending: true }) // Group roughly by role
        .order('full_name', { ascending: true })

    if (error) {
        console.error('Error fetching users:', error)
        return { success: false, users: [] }
    }

    return { success: true, users: data }
}
