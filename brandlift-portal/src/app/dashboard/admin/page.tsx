
import { getAuditors, getJobsPendingAssignment } from "@/lib/server/services/auditor-service"
import { addAuditorAction } from "@/app/actions/auditor-actions"
import { BatchAssigner } from "@/components/brandlift/batch-assigner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { UserPlus, Briefcase } from "lucide-react"

export const dynamic = 'force-dynamic'

async function AddAuditorForm() {
    "use server"
    return (
        <form action={addAuditorAction} className="flex gap-2 items-end">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" placeholder="Auditor Name" required />
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" placeholder="auditor@brandlift.ai" required />
            </div>
            <Button type="submit">
                <UserPlus className="mr-2 h-4 w-4" /> Add Auditor
            </Button>
        </form>
    )
}

export default async function AdminDashboardPage() {
    const auditors = await getAuditors()
    const pendingJobs = await getJobsPendingAssignment()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Admin & Auditor Management</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* 1. Auditor List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-purple-500" />
                            Auditor Roster
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {auditors.map(a => (
                                <div key={a.id} className="flex justify-between items-center p-2 rounded bg-muted/30 border">
                                    <div>
                                        <div className="font-medium">{a.name}</div>
                                        <div className="text-xs text-muted-foreground">{a.email}</div>
                                    </div>
                                    <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                        {a.assignedCount} Active
                                    </div>
                                </div>
                            ))}
                            {auditors.length === 0 && <p className="text-sm text-muted-foreground">No auditors registered.</p>}
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2">Register New Auditor</h4>
                            <AddAuditorForm />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Batch Assignment */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Assignment Queue</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Assign generated identities to auditors for quality assurance review.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <BatchAssigner jobs={pendingJobs} auditors={auditors} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
