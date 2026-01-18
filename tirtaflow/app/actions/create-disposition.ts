'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmailAction } from './send-email'

export async function createDispositionAction(letterId: string, targetUserId: string, notes: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Insert disposition
    const { error } = await supabase
        .from('dispositions')
        .insert({
            letter_id: letterId,
            from_user_id: user.id,
            to_user_id: targetUserId,
            notes: notes,
            status: 'pending'
        })

    if (error) {
        console.error('Disposition Error:', error)
        return { success: false, error: 'Failed to create disposition' }
    }

    // Update letter status
    await supabase.from('letters').update({ status: 'dispositioned' }).eq('id', letterId)

    // Send Email Notification
    // 1. Fetch details
    const { data: targetUser } = await supabase.from('profiles').select('email, full_name').eq('id', targetUserId).single()
    const { data: letter } = await supabase.from('letters').select('subject, sender, summary').eq('id', letterId).single()
    const { data: fromUser } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    if (targetUser && targetUser.email && letter) {
        const emailHtml = `
            <h2>New Disposition Received</h2>
            <p><strong>From:</strong> ${fromUser?.full_name || 'Admin'}</p>
            <p><strong>Letter Subject:</strong> ${letter.subject}</p>
            <p><strong>Sender:</strong> ${letter.sender}</p>
            <p><strong>Notes:</strong></p>
            <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
                ${notes}
            </blockquote>
            <p>Please login to Tirtaflow to review details.</p>
        `

        await sendEmailAction({
            to: targetUser.email,
            subject: `[Tirtaflow] Disposition: ${letter.subject}`,
            html: emailHtml
        })
    }

    revalidatePath(`/letter/${letterId}`)
    return { success: true }
}
