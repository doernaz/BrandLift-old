"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { AntigravityJob, SEOAudit, CompetitorAnalysis, UnifiedIdentity } from "@/lib/types/job"
import { cn } from "@/lib/utils"

async function fetchJobStatus(jobId: string): Promise<AntigravityJob> {
    const res = await fetch(`/api/antigravity/${jobId}`)
    if (!res.ok) {
        throw new Error('Failed to fetch job status')
    }
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data as AntigravityJob // Assuming data matches type
}

interface JobViewerProps {
    jobId: string
    onAuditComplete?: (
        audit: SEOAudit,
        competition: CompetitorAnalysis,
        identity: UnifiedIdentity | undefined,
        jobName: string,
        provisionedUrl?: string,
        variants?: UnifiedIdentity[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidate?: any
    ) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelectionRequired?: (candidates: any[]) => void
}

const statusSteps = [
    { id: 'pending', label: 'Initialization' },
    { id: 'scanning', label: 'Deep Scan (Google Places)' },
    { id: 'awaiting_selection', label: 'Candidate Selection' },
    { id: 'analyzing', label: 'Efficiency Analysis' },
    { id: 'provisioning', label: 'Infrastructure Deployment' },
    { id: 'generating_identity', label: 'Identity Generation Protocol' },
    { id: 'completed', label: 'Protocol Complete' }
]

// Helper to parse Firestore Timestamps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDate(dateInput: any): Date {
    if (!dateInput) return new Date()
    if (dateInput instanceof Date) return dateInput
    if (typeof dateInput === 'string') return new Date(dateInput)
    if (typeof dateInput === 'object' && '_seconds' in dateInput) {
        return new Date(dateInput._seconds * 1000) // Convert seconds to milliseconds
    }
    return new Date()
}

export function JobViewer({ jobId, onAuditComplete, onSelectionRequired }: JobViewerProps) {
    // Poll every 2 seconds
    const { data: job, error, isLoading } = useQuery({
        queryKey: ['antigravity-job', jobId],
        queryFn: () => fetchJobStatus(jobId),
        refetchInterval: (data) =>
            // @ts-expect-error - Complex return type mismatch in react-query
            (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'awaiting_selection') ? false : 2000,
    })

    // React effect to pass audit data up when complete
    React.useEffect(() => {
        if (job?.status === 'completed' && job.result?.seoAudit && job.result?.competitorAnalysis && onAuditComplete) {
            onAuditComplete(
                job.result.seoAudit,
                job.result.competitorAnalysis,
                job.result.identity,
                job.result.domain,
                job.result.provisionedUrl,
                job.result.variants,
                job.result.topCandidate
            )
        }

        if (job?.status === 'awaiting_selection' && job.result?.candidates && onSelectionRequired) {
            onSelectionRequired(job.result.candidates)
        }
    }, [job, onAuditComplete, onSelectionRequired])

    // Auto-scroll logs logic (simplified)
    const logsEndRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [job?.logs])

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (error) return <div className="text-red-500 p-4">Error loading job: {(error as Error).message}</div>
    if (!job) return null

    // Determine active step index
    const currentStepIndex = statusSteps.findIndex(s => s.id === job.status)

    return (
        <div className="grid gap-6 md:grid-cols-2 mt-8">
            {/* Left: Status Pipeline */}
            <div className="space-y-6">
                <h3 className="font-semibold text-lg">Protocol Status</h3>
                <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                        const isCompleted = index < currentStepIndex || job.status === 'completed'
                        const isCurrent = step.id === job.status && job.status !== 'completed' && job.status !== 'failed'
                        const isFailed = job.status === 'failed' && index === currentStepIndex

                        return (
                            <div key={step.id} className="flex items-center gap-3">
                                {isCompleted ? (
                                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                                ) : isCurrent ? (
                                    <Loader2 className="animate-spin text-blue-500 h-5 w-5" />
                                ) : isFailed ? (
                                    <XCircle className="text-red-500 h-5 w-5" />
                                ) : (
                                    <Circle className="text-muted-foreground h-5 w-5" />
                                )}
                                <span className={cn(
                                    "text-sm",
                                    isCurrent ? "font-bold text-blue-600 dark:text-blue-400" :
                                        isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Result Summary Box used to be here, but now we delegate full report via callback */}
                {/* We keep a mini summary here anyway for quick context */}
                {job.result && (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 p-4 rounded-lg mt-4">
                        <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Success: Vacuum Identified</h4>
                        <p className="text-sm">Top Candidate: <strong>{(job.result.topCandidate as { displayName: { text: string } })?.displayName?.text}</strong></p>
                        <p className="text-sm">Provisioned URL: <a href={job.result.provisionedUrl} target="_blank" className="underline">{job.result.provisionedUrl}</a></p>
                    </div>
                )}
            </div>

            {/* Right: Terminal Logs */}
            <div className="bg-black/95 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-800 shadow-inner h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                    {job.logs?.map((log, i) => (
                        <div key={i} className="break-words">
                            <span className="text-gray-500">[{parseDate(job.createdAt).toLocaleTimeString()}]</span> {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
                {(job.status === 'scanning' || job.status === 'generating_identity') && (
                    <div className="mt-2 animate-pulse">_ Processing sector...</div>
                )}
            </div>
        </div>
    )
}
