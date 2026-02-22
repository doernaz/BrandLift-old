
import { AntigravityJob } from "@/lib/types/job"

export function generateAuditEmail(job: AntigravityJob, issues: string[]) {
    const siteUrl = job.result?.provisionedUrl || "https://brandlift-demo.com"
    const businessName = (job.result?.topCandidate as { displayName: { text: string } })?.displayName?.text || "Valued Client"

    if (issues.length > 0) {
        return `Subject: Action Required: BrandLift Identity Review for ${businessName}

Dear ${businessName} Team,

We have completed the initial deployment of your autonomous brand infrastructure. During our quality assurance review, we identified a few items that require attention to ensure optimal performance:

${issues.map(i => `- ${i}`).join('\n')}

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
