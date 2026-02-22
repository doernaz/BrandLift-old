
"use client"

import { useState } from "react"
import { AntigravityJob } from "@/lib/types/job"
import { updateAuditStatusAction } from "@/app/actions/auditor-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ListChecks, Send, AlertCircle, CheckCircle2 } from "lucide-react"
import { IdentityProposal } from "@/components/brandlift/identity-proposal"

function generateEmailDraft(job: AntigravityJob, customIssues: string[]) {
    const siteUrl = job.result?.provisionedUrl || "https://brandlift-demo.com"
    const businessName = (job.result?.topCandidate as { displayName: { text: string } })?.displayName?.text || "Valued Client"

    if (customIssues.length > 0) {
        return `Subject: Action Required: BrandLift Identity Review for ${businessName}

Dear ${businessName} Team,

We have completed the initial deployment of your autonomous brand infrastructure. During our quality assurance review, we identified the following items:

${customIssues.map(i => `- ${i}`).join('\n')}

Please review these items at your earliest convenience. We have paused the final activation until these are resolved.

Best regards,

BrandLift Quality Assurance Team`
    }

    return `Subject: Your BrandLift Autonomous Infrastructure is Live!

Dear ${businessName} Team,

We are thrilled to announce that your new autonomous brand identity system has been successfully generated and provisioned.

You can view your live sandbox environment here:
${siteUrl}

**System Highlights:**
- SEO Audit Grade: ${job.result?.seoAudit?.overallGrade || 'N/A'}
- Visual Identity: ${job.result?.identity?.tagline || 'Custom'}
- Market Positioning: Optimized for ${job.industry} in ${job.location}

No further action is required on your part. We will continue to monitor performance and optimize for local market dominance.

Welcome to the future of brand automation.

Best regards,

BrandLift Command Center`
}

interface AuditReviewProps {
    job: AntigravityJob
}

export function AuditReview({ job }: AuditReviewProps) {
    const [issues, setIssues] = useState<string[]>(job.auditIssues || [])
    const [newIssue, setNewIssue] = useState("")
    const [emailContent, setEmailContent] = useState(job.emailDraft || generateEmailDraft(job, issues))
    const [isSaving, setIsSaving] = useState(false)
    const [status, setStatus] = useState(job.auditStatus || 'assigned')

    const hasIssues = issues.length > 0

    const handleAddIssue = () => {
        if (!newIssue.trim()) return
        const updatedIssues = [...issues, newIssue]
        setIssues(updatedIssues)
        setNewIssue("")
        // Auto-update email when issues change
        setEmailContent(generateEmailDraft(job, updatedIssues))
    }

    const handleRemoveIssue = (index: number) => {
        const updatedIssues = issues.filter((_, i) => i !== index)
        setIssues(updatedIssues)
        setEmailContent(generateEmailDraft(job, updatedIssues))
    }

    const handleSave = async (newStatus: 'issues_found' | 'approved') => {
        setIsSaving(true)
        try {
            await updateAuditStatusAction(job.id, newStatus, issues)
            // If there was an email drafted, we might want to save it too, but the action signature needs update
            // For now, let's assume we update status and issues. 
            // If email saving is needed, we need to update the server action signature first.
            setStatus(newStatus)
        } catch (e) {
            console.error("Save failed", e)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Review Toolkit */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-blue-500" />
                            Quality Assurance Checklist
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Document Issues Found</Label>
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="Describe any issues (e.g., color clash, typo in tagline)..."
                                    value={newIssue}
                                    onChange={(e) => setNewIssue(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <Button onClick={handleAddIssue} variant="secondary" className="h-auto">Add</Button>
                            </div>
                        </div>

                        {issues.length > 0 && (
                            <div className="bg-muted/30 rounded-md p-4 space-y-2 border">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Detected Issues ({issues.length})
                                </h4>
                                <ul className="space-y-2">
                                    {issues.map((issue, idx) => (
                                        <li key={idx} className="flex justify-between items-start text-sm bg-background p-2 rounded border">
                                            <span>{issue}</span>
                                            <button
                                                onClick={() => handleRemoveIssue(idx)}
                                                className="text-muted-foreground hover:text-red-500 ml-2"
                                            >
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={hasIssues ? "border-orange-200 bg-orange-50/50 dark:bg-orange-950/10" : "border-green-200 bg-green-50/50 dark:bg-green-950/10"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Client Communication Draft
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            className="font-mono text-sm min-h-[300px] bg-background"
                        />
                    </CardContent>
                    <CardFooter className="justify-between border-t p-4 bg-background/50">
                        <div className="text-xs text-muted-foreground">
                            Status: <Badge variant="outline" className="ml-2">{status.toUpperCase()}</Badge>
                        </div>
                        <div className="flex gap-2">
                            {hasIssues ? (
                                <Button
                                    onClick={() => handleSave('issues_found')}
                                    disabled={isSaving}
                                    variant="destructive"
                                >
                                    {isSaving ? "Saving..." : "Flag Issues & Save Draft"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleSave('approved')}
                                    disabled={isSaving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isSaving ? "Sending..." : "Approve & Send Email"}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Right Column: Visual Reference */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                            <div className="space-y-1">
                                <div className="font-semibold">Live Sandbox Environment</div>
                                <div className="text-sm text-muted-foreground">{job.result?.provisionedUrl}</div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <a href={job.result?.provisionedUrl} target="_blank" rel="noopener noreferrer">
                                    Open Site <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-4">Identity System Preview</h4>
                            {/* Reusing existing component for visualization */}
                            {job.result?.identity && job.result.domain ? (
                                <IdentityProposal
                                    identity={job.result.identity}
                                    domain={job.result.domain}
                                />
                            ) : (
                                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded">
                                    Identity data not available for preview.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
