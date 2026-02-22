
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase-admin"
import { AuditReport } from "@/components/brandlift/audit-report"
import { SEOAudit, CompetitorAnalysis } from "@/lib/types/job"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
    if (!db) return notFound()

    const { slug } = await params
    const domainQuery = `${slug}.brandlift.ai`

    const snapshot = await db.collection("antigravity_jobs")
        .where("result.domain", "==", domainQuery)
        .limit(1)
        .get()

    if (snapshot.empty) {
        return notFound()
    }

    const job = snapshot.docs[0].data()
    const seoAudit = job.result?.seoAudit as SEOAudit
    const competition = job.result?.competitorAnalysis as CompetitorAnalysis
    const targetName = job.result?.topCandidate?.displayName?.text || slug

    if (!seoAudit || !competition) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Audit data not available.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto mb-8">
                <Button asChild variant="ghost" className="mb-6">
                    <a href={`/demo/${slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
                    </a>
                </Button>
                <h1 className="text-3xl font-bold mb-2">Detailed Mission Report</h1>
                <p className="text-muted-foreground">Comprehensive analysis and findings for {targetName}.</p>
            </div>

            <div className="max-w-5xl mx-auto">
                <AuditReport
                    audit={seoAudit}
                    competition={competition}
                    targetName={targetName}
                />
            </div>
        </div>
    )
}
