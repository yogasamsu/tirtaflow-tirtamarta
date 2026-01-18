'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmailAction({ to, subject, html }: EmailPayload) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Tirtaflow <onboarding@resend.dev>', // Use default until domain verified
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email Send Exception:', error);
        return { success: false, error };
    }
}
