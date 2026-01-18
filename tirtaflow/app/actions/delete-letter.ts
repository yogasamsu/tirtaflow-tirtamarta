'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteLetterAction(id: string) {
    const supabase = await createClient()

    // 1. Check permission (only admin or umum)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'umum'].includes(profile.role)) {
        return { success: false, error: 'Access denied. Only Admin or Bagian Umum can delete.' }
    }

    // 2. Get file url to delete from storage
    const { data: letter } = await supabase.from('letters').select('file_url').eq('id', id).single()

    // 3. Delete record (Dispositions cascade delete due to foreign key)
    const { error } = await supabase.from('letters').delete().eq('id', id)

    if (error) {
        console.error('Delete DB Error:', error)
        return { success: false, error: 'Failed to delete letter record.' }
    }

    // 4. Delete file from storage (Optional cleanup)
    if (letter && letter.file_url) {
        // Extract filename from public URL (Requires parsing)
        // URL format: .../storage/v1/object/public/letters/fileName.ext
        try {
            const urlParts = letter.file_url.split('/letters/')
            if (urlParts.length > 1) {
                const fileName = urlParts[1]
                await supabase.storage.from('letters').remove([fileName])
            }
        } catch (e) {
            console.warn('Failed to cleanup file from storage:', e)
        }
    }

    revalidatePath('/letters')
    return { success: true }
}
