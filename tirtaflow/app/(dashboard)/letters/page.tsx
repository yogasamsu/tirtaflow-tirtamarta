'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Trash2, SendHorizontal, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { deleteLetterAction } from '@/app/actions/delete-letter'
import { useRouter } from 'next/navigation'
import { getUsersAction } from '@/app/actions/get-users'
import { createDispositionAction } from '@/app/actions/create-disposition'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AllLettersPage() {
    const [letters, setLetters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const supabase = createClient()
    const router = useRouter()

    // Quick Disposition State
    const [selectedLetter, setSelectedLetter] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [targetUser, setTargetUser] = useState('')
    const [notes, setNotes] = useState('')
    const [dispLoading, setDispLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Fetch Letters
            const { data: lettersData, error } = await supabase
                .from('letters')
                .select(`
            *,
            classification_codes (description)
        `)
                .order('created_at', { ascending: false })

            if (lettersData) {
                setLetters(lettersData)
            }

            // Fetch Users for Disposition
            const usersResult = await getUsersAction()
            if (usersResult.success) {
                setUsers(usersResult.users || [])
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        if (!confirm('Are you sure you want to delete this letter?')) return

        const result = await deleteLetterAction(id)
        if (result.success) {
            setLetters(letters.filter(l => l.id !== id))
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    const openDisposition = (letter: any, e: React.MouseEvent) => {
        e.preventDefault()
        setSelectedLetter(letter)
        setTargetUser('')
        setNotes('')
        setIsDialogOpen(true)
    }

    const handleQuickDisposition = async () => {
        if (!selectedLetter || !targetUser) return
        setDispLoading(true)

        const result = await createDispositionAction(selectedLetter.id, targetUser, notes || "Quick Disposition from Dashboard")

        if (result.success) {
            setIsDialogOpen(false)
            // Optionally update UI specific letter status to 'dispositioned' without reload
            setLetters(letters.map(l => l.id === selectedLetter.id ? { ...l, status: 'dispositioned' } : l))
            alert('Disposition sent successfully!')
            router.refresh()
        } else {
            alert('Disposition failed')
        }
        setDispLoading(false)
    }

    const handleDownloadExcel = () => {
        const dataToExport = filteredLetters.map(l => ({
            Date: new Date(l.date_received).toLocaleDateString(),
            Code: `${l.classification_code}/${l.agenda_number || '-'}`,
            Subject: l.subject,
            Sender: l.sender,
            Summary: l.summary || '',
            Status: l.status,
            RecommendedPIC: l.recommended_pic || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Letters");

        // Write file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, `Tirtaflow_Letters_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    const filteredLetters = letters.filter(l =>
        l.subject.toLowerCase().includes(search.toLowerCase()) ||
        l.sender.toLowerCase().includes(search.toLowerCase()) ||
        l.classification_code?.toLowerCase().includes(search.toLowerCase()) ||
        (l.summary && l.summary.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Archives & Letters</h1>
                    <p className="text-muted-foreground">Master data of all inbound correspondence.</p>
                </div>
                <div className="flex w-full max-w-lg items-center space-x-2 justify-end">
                    <Button variant="outline" onClick={handleDownloadExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            placeholder="Search subject, sender, summary..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button type="submit" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Letters</CardTitle>
                    <CardDescription>Total {filteredLetters.length} records found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead className="w-[80px]">Code</TableHead>
                                <TableHead className="w-[200px]">Subject</TableHead>
                                <TableHead className="w-[400px]">Summary (AI)</TableHead>
                                <TableHead>Sender</TableHead>
                                <TableHead className="w-[120px]">Rec. PIC</TableHead>
                                <TableHead className="w-[80px]">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredLetters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">No letters found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredLetters.map((l) => (
                                    <TableRow key={l.id}>
                                        <TableCell className="font-medium text-xs">
                                            {new Date(l.date_received).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {l.classification_code} / {l.agenda_number?.toString().padStart(3, '0') || 'New'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-sm" title={l.subject}>
                                            {l.subject}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-[400px]">
                                            <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed" title={l.summary}>{l.summary || '-'}</p>
                                        </TableCell>
                                        <TableCell className="text-sm max-w-[150px] truncate" title={l.sender}>
                                            {l.sender}
                                        </TableCell>
                                        <TableCell>
                                            {l.recommended_pic ? (
                                                <Badge variant="secondary" className="text-xs">{l.recommended_pic}</Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={l.status === 'new' ? 'default' : 'secondary'} className="text-xs capitalize">
                                                {l.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Quick Disposition" onClick={(e) => openDisposition(l, e)}>
                                                    <SendHorizontal className="h-4 w-4" />
                                                </Button>
                                                <Link href={`/letter/${l.id}`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete" onClick={(e) => handleDelete(l.id, e)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Quick Disposition Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quick Disposition</DialogTitle>
                        <DialogDescription>
                            Forward letter "{selectedLetter?.subject}" to a department/person.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Recommended PIC</Label>
                            <div className="p-2 bg-muted rounded-md text-sm font-medium">
                                {selectedLetter?.recommended_pic || "No recommendation available"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={targetUser} onValueChange={setTargetUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff/director..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.full_name || p.role} ({p.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add instructions..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleQuickDisposition} disabled={dispLoading || !targetUser}>
                            {dispLoading ? 'Sending...' : 'Send Disposition'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
