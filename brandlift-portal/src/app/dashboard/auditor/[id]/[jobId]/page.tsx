
import { notFound } from "next/navigation"
import { getJobsForAuditor } from "@/lib/server/services/auditor-service"
import { AuditReview } from "@/components/brandlift/audit-review"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function JobReviewPage({ params }: { params: { id: string, jobId: string } }) {
    // Ideally use getJobById but we can reuse getJobsForAuditor and filter for now
    const jobs = await getJobsForAuditor(params.id)
    const job = jobs.find(j => j.id === params.jobId)

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/auditor/${params.id}`}> <ChevronLeft className="mr-2 h-4 w-4" /> Back to Workspace</Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Audit Review: {(job.result?.topCandidate as { displayName: { text: string } })?.displayName?.text || 'Target'}</h2>
                    <p className="text-sm text-muted-foreground font-mono">Job ID: {job.id}</p>
                </div>
            </div>

            <AuditReview job={job} />
        </div>
    )
}
