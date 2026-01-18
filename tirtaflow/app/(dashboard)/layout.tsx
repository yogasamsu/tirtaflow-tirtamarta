'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    Bell,
    FileText,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Search,
    Settings,
    Upload,
    User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            } else {
                setUser(user)
            }
            setLoading(false)
        }
        getUser()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const navItems = [
        { name: 'Inbox', href: '/inbox', icon: Home },
        { name: 'Upload Surat', href: '/upload', icon: Upload }, // Typically for Bagian Umum only, but showing for MVP structure
        { name: 'All Letters', href: '/letters', icon: FileText },
        { name: 'Admin: Users', href: '/admin/users', icon: User },
        // { name: 'Dispositions', href: '/dispositions', icon: MessageSquare },
    ]

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        <nav className="grid gap-2 text-lg font-medium">
                            <Link
                                href="#"
                                className="flex items-center gap-2 text-lg font-semibold"
                            >
                                <span className="sr-only">Tirtaflow</span>
                            </Link>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${pathname === item.href
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial flex items-center justify-end">
                        <div className="flex h-10 items-center gap-2 bg-blue-600 px-4 py-1 rounded-full text-white shadow-sm">
                            <div className="bg-white p-0.5 rounded-full flex items-center justify-center">
                                <NextImage
                                    src="/assets/logo.png"
                                    width={20}
                                    height={20}
                                    alt="Logo PDAM"
                                    className="h-5 w-auto"
                                />
                            </div>
                            <span className="font-bold tracking-wide text-sm">Tirtaflow</span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1">
                <aside className="hidden w-[220px] flex-col border-r bg-background md:flex">
                    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4 py-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 ${pathname === item.href
                                    ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600'
                                    : 'text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div >
    )
}
