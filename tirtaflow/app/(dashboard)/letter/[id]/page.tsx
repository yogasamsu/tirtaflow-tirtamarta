'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Send } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createDispositionAction } from '@/app/actions/create-disposition'

export default function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [letter, setLetter] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])
    const supabase = createClient()
    const router = useRouter()

    // Disposition Form State
    const [targetUser, setTargetUser] = useState('')
    const [notes, setNotes] = useState('')
    const [dispLoading, setDispLoading] = useState(false)

    useEffect(() => {
        const fetchLetter = async () => {
            console.log("FETCHING LETTER ID:", id)
            if (!id) {
                console.error("No ID param found")
                return
            }

            const { data, error } = await supabase
                .from('letters')
                .select(`
            *,
            classification_codes (description),
            dispositions (
                id,
                notes,
                created_at,
                from:from_user_id (full_name, role),
                to:to_user_id (full_name, role)
            )
        `)
                .eq('id', id)
                .single()


            if (error) {
                console.error('Error fetching letter (DB):', error)
            } else {
                console.log("Letter Loaded:", data)
                setLetter(data)
            }
            setLoading(false)
        }

        const fetchProfiles = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role')
            if (data) setProfiles(data)
        }

        fetchLetter()
        fetchProfiles()
    }, [supabase, id])

    const handleDisposition = async () => {
        if (!targetUser) return
        setDispLoading(true)

        const result = await createDispositionAction(letter.id, targetUser, notes)

        if (result.success) {
            // Re-fetch to show new disposition
            // For now just reload
            window.location.reload()
        } else {
            alert('Disposition failed')
        }
        setDispLoading(false)
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!letter) return <div className="p-8">Letter not found</div>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Letter Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Letter Info & File */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{letter.subject}</CardTitle>
                                    <CardDescription>
                                        {letter.classification_code} - {letter.classification_codes?.description}
                                    </CardDescription>
                                </div>
                                <Badge variant={letter.status === 'new' ? 'default' : 'secondary'}>
                                    {letter.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-muted-foreground">Sender:</span>
                                    <p>{letter.sender}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground">Date Received:</span>
                                    <p>{letter.date_received}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <span className="font-semibold text-muted-foreground">Summary (AI Extracted):</span>
                                <p className="mt-1 text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                                    {letter.summary}
                                </p>
                            </div>

                            {letter.file_url && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Original File:</p>
                                    <iframe
                                        src={letter.file_url}
                                        className="w-full h-96 border rounded-md"
                                        title="Letter PDF"
                                    />
                                    <div className="mt-2 text-right">
                                        <a href={letter.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                                            Open in new tab
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Disposition Flow */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Disposition Action</CardTitle>
                            <CardDescription>Forward this letter to another department.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Assign To</Label>
                                <Select value={targetUser} onValueChange={setTargetUser}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff/director..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.full_name || p.role} ({p.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Instructions / Notes</Label>
                                <Textarea
                                    placeholder="Please update... / Mohon tindak lanjut..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleDisposition} disabled={dispLoading || !targetUser}>
                                <Send className="mr-2 h-4 w-4" />
                                Send Disposition
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Disposition History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                {letter.dispositions && letter.dispositions.length > 0 ? (
                                    <div className="space-y-4">
                                        {letter.dispositions.map((d: any) => (
                                            <div key={d.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-semibold">{d.from?.full_name || 'Unknown'} ➔ {d.to?.full_name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(d.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{d.notes}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No dispositions yet.
                                    </p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
