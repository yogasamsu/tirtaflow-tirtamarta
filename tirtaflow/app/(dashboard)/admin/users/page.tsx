'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { updateUserAction } from '@/app/actions/update-user'
import { useRouter } from 'next/navigation'

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ full_name: '', role: '' })
    const [saveLoading, setSaveLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchUsers()
    }, [supabase])

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true })
        if (data) setUsers(data)
        setLoading(false)
    }

    const startEdit = (user: any) => {
        setEditingId(user.id)
        setEditForm({ full_name: user.full_name || '', role: user.role || 'umum' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ full_name: '', role: '' })
    }

    const saveEdit = async () => {
        if (!editingId) return
        setSaveLoading(true)

        const result = await updateUserAction(editingId, editForm)
        if (result.success) {
            setUsers(users.map(u => u.id === editingId ? { ...u, ...editForm } : u))
            setEditingId(null)
        } else {
            alert(result.error)
        }
        setSaveLoading(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage system users, roles, and access.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Accounts</CardTitle>
                    <CardDescription>Assign roles correctly to ensure dispositions reach the right department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role / Department</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            {editingId === user.id ? (
                                                <Input
                                                    value={editForm.full_name}
                                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                />
                                            ) : (
                                                <span className="font-medium">{user.full_name || '-'}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {editingId === user.id ? (
                                                <Select value={editForm.role} onValueChange={val => setEditForm({ ...editForm, role: val })}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="umum">Umum (Staff)</SelectItem>
                                                        <SelectItem value="admin">Admin System</SelectItem>
                                                        <SelectItem value="direktur">Direktur</SelectItem>
                                                        <SelectItem value="keuangan">Keuangan</SelectItem>
                                                        <SelectItem value="teknis">Teknis</SelectItem>
                                                        <SelectItem value="sdm">SDM</SelectItem>
                                                        <SelectItem value="legal">Legal</SelectItem>
                                                        <SelectItem value="operasional">Operasional</SelectItem>
                                                        <SelectItem value="komersial">Komersial</SelectItem>
                                                        <SelectItem value="secretary">Secretary</SelectItem>
                                                        <SelectItem value="spi">SPI</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="capitalize px-2 py-1 bg-secondary rounded-md inline-block text-xs font-medium border border-secondary-foreground/20">
                                                    {user.role}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingId === user.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saveLoading}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={saveEdit} disabled={saveLoading}>
                                                        {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => startEdit(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
