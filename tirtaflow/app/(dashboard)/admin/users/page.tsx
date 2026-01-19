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
import { Check, Loader2, Pencil, X, Trash2, Plus } from 'lucide-react'
import { updateUserAction } from '@/app/actions/update-user'
import { createUserAction } from '@/app/actions/create-user'
import { deleteUserAction } from '@/app/actions/delete-user'
import { useRouter } from 'next/navigation'
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

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ full_name: '', role: '' })
    const [saveLoading, setSaveLoading] = useState(false)

    // Create User State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', role: 'umum' })
    const [createLoading, setCreateLoading] = useState(false)
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

    const handleCreateUser = async () => {
        setCreateLoading(true)
        const result = await createUserAction(createForm)
        if (result.success) {
            if (result.warning) alert(result.warning)
            setIsCreateOpen(false)
            setCreateForm({ email: '', password: '', full_name: '', role: 'umum' })
            fetchUsers()
            router.refresh()
        } else {
            alert(result.error)
        }
        setCreateLoading(false)
    }

    const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        const result = await deleteUserAction(id)
        if (result.success) {
            setUsers(users.filter(u => u.id !== id))
            router.refresh()
        } else {
            alert(result.error)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Manage system users, roles, and access.</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>
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
                                                <div className="flex justify-end gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => startEdit(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteUser(user.id, e)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new account for staff or directors.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={createForm.email}
                                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                placeholder="user@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={createForm.full_name}
                                onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={createForm.password}
                                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                placeholder="******"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={createForm.role} onValueChange={val => setCreateForm({ ...createForm, role: val })}>
                                <SelectTrigger>
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
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser} disabled={createLoading}>
                            {createLoading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
