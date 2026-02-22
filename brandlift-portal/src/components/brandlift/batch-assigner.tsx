
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AntigravityJob, GenericAuditor } from "@/lib/types/job"
import { useState } from "react"
import { assignJobsAction } from "@/app/actions/auditor-actions"
import { Users } from "lucide-react"

interface BatchAssignerProps {
    jobs: AntigravityJob[]
    auditors: GenericAuditor[]
}

export function BatchAssigner({ jobs, auditors }: BatchAssignerProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
    const [selectedAuditor, setSelectedAuditor] = useState<string>("")
    const [loading, setLoading] = useState(false)

    function toggleJob(id: string) {
        setSelectedJobIds(curr =>
            curr.includes(id) ? curr.filter(j => j !== id) : [...curr, id]
        )
    }

    async function handleAssign() {
        if (!selectedAuditor || selectedJobIds.length === 0) return
        setLoading(true)
        try {
            await assignJobsAction(selectedJobIds, selectedAuditor)
            setSelectedJobIds([])
            setSelectedAuditor("")
        } catch (e) {
            console.error("Assignment failed", e)
        } finally {
            setLoading(false)
        }
    }

    if (jobs.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">No unassigned jobs ready for audit.</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <Users className="h-5 w-5 text-muted-foreground" />
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAuditor}
                    onChange={(e) => setSelectedAuditor(e.target.value)}
                >
                    <option value="">Select Auditor for Batch...</option>
                    {auditors.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                    ))}
                </select>
                <Button onClick={handleAssign} disabled={!selectedAuditor || selectedJobIds.length === 0 || loading}>
                    {loading ? "Assigning..." : `Assign ${selectedJobIds.length} Jobs`}
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <Checkbox
                                    checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                                    onCheckedChange={(checked) => setSelectedJobIds(checked ? jobs.map(j => j.id) : [])}
                                />
                            </th>
                            <th className="p-4 text-left font-medium">Job ID</th>
                            <th className="p-4 text-left font-medium">Target</th>
                            <th className="p-4 text-left font-medium">Industry</th>
                            <th className="p-4 text-left font-medium">Location</th>
                            <th className="p-4 text-right font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="p-4 text-center">
                                    <Checkbox
                                        checked={selectedJobIds.includes(job.id)}
                                        onCheckedChange={() => toggleJob(job.id)}
                                    />
                                </td>
                                <td className="p-4 font-mono text-muted-foreground">#{job.id.slice(0, 8)}</td>
                                <td className="p-4 font-semibold">
                                    {(job.result?.topCandidate as { displayName: { text: string } })?.displayName?.text || 'Unknown'}
                                </td>
                                <td className="p-4">{job.industry}</td>
                                <td className="p-4">{job.location}</td>
                                <td className="p-4 text-right text-muted-foreground">
                                    {job.createdAt instanceof Date ? job.createdAt.toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
