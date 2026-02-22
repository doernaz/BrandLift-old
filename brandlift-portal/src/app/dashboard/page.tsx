
import Link from "next/link"
import { getRecentJobs } from "@/lib/server/services/job-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Rocket, ArrowRight, Clock } from "lucide-react"

export default async function DashboardPage() {
    const jobs = await getRecentJobs(10)

    // Calculate stats
    const totalMissions = jobs.length
    const activeDeployments = jobs.filter(j => j.status === 'completed').length
    const scanning = jobs.filter(j => ['scanning', 'analyzing', 'generating_identity'].includes(j.status)).length

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mission Control</h2>
                    <p className="text-muted-foreground mt-2">
                        Real-time surveillance and deployment status across all active sectors.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                        <Link href="/dashboard/scanner">
                            <Rocket className="mr-2 h-4 w-4" />
                            Launch Single Protocol
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                        <Link href="/dashboard/master-search">
                            <Rocket className="mr-2 h-4 w-4" />
                            Master Search Orchestrator
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMissions}</div>
                        <p className="text-xs text-muted-foreground">Historical data points</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                        <Rocket className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{activeDeployments}</div>
                        <p className="text-xs text-muted-foreground">Successfully provisioned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{scanning}</div>
                        <p className="text-xs text-muted-foreground">Currently engaging</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Operations</h3>
                {jobs.length === 0 ? (
                    <div className="p-12 border border-dashed rounded-lg text-center text-muted-foreground">
                        No mission data found. Initiate a scan to begin.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <Link key={job.id} href={`/dashboard/scanner?id=${job.id}`} className="block group">
                                <Card className="transition-all hover:bg-muted/50 hover:border-primary/50">
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                                                    className={job.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    {job.status.toUpperCase()}
                                                </Badge>
                                                <span className="font-mono text-xs text-muted-foreground">#{job.id.slice(0, 8)}</span>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center md:gap-2 mt-1">
                                                <h4 className="font-semibold text-lg">
                                                    {job.industry}
                                                </h4>
                                                <span className="hidden md:inline text-muted-foreground">in</span>
                                                <span className="text-muted-foreground">{job.location}</span>
                                            </div>

                                            {job.result?.domain && (
                                                <p className="text-sm text-green-600 dark:text-green-400 font-mono mt-1">
                                                    {job.result.domain}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
                                            <span className="text-xs hidden md:inline-block">
                                                {job.createdAt instanceof Date ? job.createdAt.toLocaleDateString() : 'Unknown Date'}
                                            </span>
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
