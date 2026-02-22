
import { getJobsForAuditor } from "@/lib/server/services/auditor-service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListChecks, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function AuditorDashboardPage({ params }: { params: { id: string } }) {
    const jobs = await getJobsForAuditor(params.id)

    // Filter jobs by status
    const pendingJobs = jobs.filter(j => !j.auditStatus || j.auditStatus === 'assigned')
    const inReview = jobs.filter(j => j.auditStatus === 'in_review')
    const completed = jobs.filter(j => ['approved', 'issues_found'].includes(j.auditStatus || ''))

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Auditor Workspace</h2>
                <Badge variant="outline" className="font-mono">{jobs.length} Assignments</Badge>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                        <AlertCircle className="w-4 h-4 mr-2" /> Pending ({pendingJobs.length})
                    </TabsTrigger>
                    <TabsTrigger value="in_review">
                        <ListChecks className="w-4 h-4 mr-2" /> In Review ({inReview.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        <CheckCircle className="w-4 h-4 mr-2" /> Completed ({completed.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {pendingJobs.map(job => (
                        <Card key={job.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-lg">{job.industry} in {job.location}</h4>
                                    <div className="text-sm text-muted-foreground font-mono">#{job.id.slice(0, 8)} • {(job.result?.topCandidate as { displayName: { text: string } })?.displayName?.text || 'Target Unknown'}</div>
                                </div>
                                <Button asChild size="sm">
                                    <Link href={`/dashboard/auditor/${params.id}/${job.id}`}>Start Review &rarr;</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {pendingJobs.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">No pending assignments.</div>}
                </TabsContent>

                <TabsContent value="in_review" className="mt-6 space-y-4">
                    {/* Similar list for In Review */}
                    {inReview.map(job => (
                        <Card key={job.id} className="hover:bg-muted/50 transition-colors border-blue-500/20">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-lg">{job.industry} in {job.location}</h4>
                                    <div className="text-sm text-muted-foreground font-mono">#{job.id.slice(0, 8)}</div>
                                </div>
                                <Button asChild size="sm" variant="secondary">
                                    <Link href={`/dashboard/auditor/${params.id}/${job.id}`}>Continue Review &rarr;</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {inReview.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">No reviews in progress.</div>}
                </TabsContent>

                <TabsContent value="completed" className="mt-6 space-y-4">
                    {completed.map(job => (
                        <Card key={job.id} className={`hover:bg-muted/50 transition-colors ${job.auditStatus === 'approved' ? 'border-green-500/20' : 'border-orange-500/20'}`}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-lg">{job.industry} in {job.location}</h4>
                                        <Badge variant={job.auditStatus === 'approved' ? 'default' : 'destructive'}>
                                            {job.auditStatus?.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground font-mono">#{job.id.slice(0, 8)}</div>
                                </div>
                                <Button asChild size="sm" variant="ghost">
                                    <Link href={`/dashboard/auditor/${params.id}/${job.id}`}>View Details &rarr;</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {completed.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">No completed audits yet.</div>}
                </TabsContent>
            </Tabs>
        </div>
    )
}
