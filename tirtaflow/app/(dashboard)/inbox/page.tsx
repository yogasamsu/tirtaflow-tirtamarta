import { Button } from "@/components/ui/button"

export default function InboxPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inbox</h2>
                    <p className="text-muted-foreground">
                        Overview of your incoming letters and dispositions.
                    </p>
                </div>
            </div>
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                No letters found.
            </div>
        </div>
    )
}
