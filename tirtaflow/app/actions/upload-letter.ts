'use server'

import { createClient } from '@/utils/supabase/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function uploadLetterAction(formData: FormData) {
    const file = formData.get('file') as File
    const classification_code = formData.get('classification_code') as string

    if (!file) {
        return { success: false, error: 'No file uploaded' }
    }

    const supabase = await createClient()

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('letters')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        return { success: false, error: 'Failed to upload file to storage.' }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('letters')
        .getPublicUrl(filePath)

    // 2. OCR with OCR.Space
    // We use base64 because the bucket might be private
    let extractedWithAI: any = {}
    let ocrText = ""

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString('base64')
        // Fix: Use actual file type or fallback to detected extension
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png')
        const dataUri = `data:${mimeType};base64,${base64Image}`

        const formDataOCR = new FormData()
        formDataOCR.append('base64Image', dataUri)
        formDataOCR.append('apikey', process.env.OCR_SPACE_API_KEY!)
        formDataOCR.append('language', 'eng') // Or 'ind' (Indonesian) if supported/needed, trying mixed/eng first usually works for basic fields
        formDataOCR.append('isOverlayRequired', 'false')

        // OCR.Space expects form-urlencoded or multipart. 
        // Fetch with FormData automatically sets multipart/form-data
        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formDataOCR,
        })

        const ocrResult = await ocrResponse.json()

        // Check for errors, but handle "page limit" as a warning if we got some text
        if (ocrResult.IsErroredOnProcessing) {
            const errorMessage = String(ocrResult.ErrorMessage || "")
            // Check if it's just the page limit warning and we actually have results
            if (errorMessage.includes("maximum page limit") && ocrResult.ParsedResults?.length > 0) {
                console.warn("OCR Warning: Page limit reached. Proceeding with partial text.", errorMessage)
            } else {
                console.error("OCR Error:", ocrResult.ErrorMessage)
                throw new Error(ocrResult.ErrorMessage?.[0] || "OCR Failed")
            }
        }

        if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
            // Join text from all parsed pages
            ocrText = ocrResult.ParsedResults
                .map((page: any) => page.ParsedText)
                .join("\n\n--- PAGE BREAK ---\n\n")
        }

        console.log("OCR Text Preview:", ocrText.substring(0, 100))

        // 3. Parse with Groq (Llama3-70b or similar)
        if (ocrText && ocrText.trim().length > 10) {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an assistant that extracts structured data from letter text. 
                    Extract: 
                    - sender (who sent the letter)
                    - subject (perihal)
                    - date_received (YYYY-MM-DD)
                    - summary (2-3 sentences)
                    - recommended_pic (Suggest the most relevant department/role based on content: "Direktur", "Keuangan", "Teknis", "SDM", "Umum", "Legal", "Operasional", "Komersial").
                    
                    Return valid JSON only. No markdown block. keys: sender, subject, date_received, summary, recommended_pic.`
                    },
                    {
                        role: "user",
                        content: `Analyze this text:\n\n${ocrText}`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" }
            });

            const content = chatCompletion.choices[0]?.message?.content || "{}"
            extractedWithAI = JSON.parse(content)
        } else {
            console.warn("OCR returned empty or too short text.")
            extractedWithAI = {
                summary: `OCR Issue: Text too short (${ocrText.length} chars). File might be blurry or empty.`,
                sender: 'Unknown (OCR Failed)',
                subject: 'OCR Failed'
            }
        }

    } catch (error) {
        console.error('AI Processing Error:', error)
        // Fallback
        extractedWithAI = {
            sender: 'Unknown (AI Failed)',
            subject: 'Review Manually',
            date_received: new Date().toISOString().split('T')[0],
            summary: `Extraction failed: ${(error as Error).message}`,
            recommended_pic: 'Umum'
        }
    }

    // Determine final classification code: User selected > AI detected > Default
    let finalCode = classification_code || extractedWithAI.classification_code || '000.1.1'

    // Validate that the code exists in the database to prevent FK constraint errors
    const { data: codeExists } = await supabase
        .from('classification_codes')
        .select('code')
        .eq('code', finalCode)
        .single()

    if (!codeExists) {
        // Fallback if AI hallucinates a non-existent code
        console.warn(`Classification code ${finalCode} not found, falling back to 000.1.1`)
        finalCode = '000.1.1'

        // Double check fallback
        const { data: fallbackExists } = await supabase.from('classification_codes').select('code').eq('code', finalCode).single()
        if (!fallbackExists) {
            // If even fallback is missing (seed failed?), set to null to avoid crash
            finalCode = null
        }
    }

    // Get User for created_by
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user has permission (optional here, but good for debugging)
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        console.log(`User Role: ${profile?.role}`)
    }

    // 3. Save to Database
    // Get next agenda number
    const { data: maxResult } = await supabase
        .from('letters')
        .select('agenda_number')
        .order('agenda_number', { ascending: false })
        .limit(1)
        .single()

    const nextAgendaNumber = (maxResult?.agenda_number || 0) + 1

    const { data, error } = await supabase
        .from('letters')
        .insert({
            date_received: extractedWithAI.date_received || new Date().toISOString(),
            classification_code: finalCode,
            agenda_number: nextAgendaNumber, // Save the generated number
            subject: extractedWithAI.subject || "No Subject",
            sender: extractedWithAI.sender || "Unknown",
            file_url: publicUrl,
            file_path: filePath, // Added file_path
            status: 'new',
            summary: extractedWithAI.summary || null,
            extracted_text: ocrText || null, // Renamed extracted_data to extracted_text and stored raw ocr
            recommended_pic: extractedWithAI.recommended_pic || 'Umum',
            created_by: user?.id // Ensure user exists before using .id
        })
        .select()
        .single()

    if (error) {
        console.error('Database Error:', error)
        // Cleanup file if DB insert fails
        await supabase.storage.from('letters').remove([filePath])
        return { success: false, error: `Database Error: ${error.message} (${error.details || ''}). Hint: Check RLS or Foreign Key.` }
    }

    return { success: true }
}
