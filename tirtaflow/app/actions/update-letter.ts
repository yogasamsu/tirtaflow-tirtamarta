'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLetterAction(id: string, data: { summary: string, date_received: string, status: string }) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('letters')
        .update({
            summary: data.summary,
            date_received: data.date_received,
            status: data.status
        })
        .eq('id', id)

    if (error) {
        console.error('Update Letter Error:', error)
        return { success: false, error: 'Failed to update letter' }
    }

    revalidatePath('/letters')
    revalidatePath(`/letter/${id}`)
    return { success: true }
}
