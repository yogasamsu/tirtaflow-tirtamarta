'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, UploadCloud } from 'lucide-react'
import { uploadLetterAction } from '@/app/actions/upload-letter'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [classifications, setClassifications] = useState<{ code: string, description: string }[]>([])
    const [selectedCode, setSelectedCode] = useState<string>('')
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchClassifications = async () => {
            const { data, error } = await supabase
                .from('classification_codes')
                .select('code, description')
                .order('code', { ascending: true })

            if (data) {
                setClassifications(data)
            }
        }
        fetchClassifications()
    }, [supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file.' })
            return
        }

        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('classification_code', selectedCode)

        try {
            const result = await uploadLetterAction(formData)

            if (result.success) {
                setMessage({ type: 'success', text: 'Letter uploaded and processed successfully!' })
                // Reset form
                setFile(null)
                setSelectedCode('')
                // Redirect to detail page eventually
                router.refresh()
            } else {
                setMessage({ type: 'error', text: result.error || 'Upload failed.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Upload Surat</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Inbound Mail Entry</CardTitle>
                        <CardDescription>
                            Upload scan surat masuk untuk diproses oleh AI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* File Input Section - Now First */}
                            <div className="space-y-2">
                                <Label htmlFor="file">File Surat (PDF/Image)</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="dropzone-file"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PDF, PNG, JPG (MAX. 5MB)
                                            </p>
                                            {file && (
                                                <p className="mt-2 text-sm font-semibold text-primary">
                                                    Selected: {file.name}
                                                </p>
                                            )}
                                        </div>
                                        <Input
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*,application/pdf"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Classification Section - Now Second (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="classification">Kode Klasifikasi (Opsional)</Label>
                                <Select value={selectedCode} onValueChange={setSelectedCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kode (atau biarkan kosong untuk Auto-Detect)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classifications.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.code} - {c.description.substring(0, 50)}...
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Biarkan kosong. AI akan memberikan rekomendasi kode klasifikasi berdasarkan isi surat.
                                </p>
                            </div>

                            {message && (
                                <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-green-500 text-green-500' : ''}>
                                    <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{message.text}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" disabled={loading || !file} className="w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing with AI...
                                    </>
                                ) : (
                                    'Upload & Process'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Instruction</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>1. Pilih kode klasifikasi surat yang sesuai.</p>
                            <p>2. Upload file surat yang jelas.</p>
                            <p>3. Sistem akan otomatis mengekstrak:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li>Pengirim</li>
                                <li>Perihal</li>
                                <li>Tanggal Surat</li>
                                <li>Ringkasan</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
