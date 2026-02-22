
// ... (previous audit types)

export interface SEOAudit {
    technicalScore: number
    contentScore: number
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
    painPoints: string[]
    technicalIssues: string[]
    contentGaps: string[]
    keywordsMissing: string[]
    marketOpportunity: string
    monetization?: {
        estimatedLostRevenue: string // e.g., "$15,000 - $20,000 / mo"
        potentialUplift: string // e.g., "300% increase in qualified leads"
        recommendedPackage: 'Starter' | 'Growth' | 'Enterprise'
        packageJustification: string
    }
}

export interface CompetitorAnalysis {
    localCompetitors: Array<{ name: string; weakness: string }>
    nationalBenchmarks: Array<{ brand: string; strength: string }>
    comparison: string
}

export interface Palette {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
}

export interface Typography {
    headingFont: string
    bodyFont: string
}

export interface UnifiedIdentity {
    theme?: string // "Desert Modernist", "Minimalist Tech", "The Disruptor"
    variantUrl?: string // The deployed URL for this specific variant
    name: string
    tagline: string
    voice: string
    missionStatement: string
    palette: Palette
    typography: Typography
    logoConcept: string
    imageStyle: string
    // State 48 Format Extensions
    heroHeadline?: string
    bodyCopy?: string
    seoScore?: number
    strategy?: string // "E-E-A-T", "Contrast", "Mirroring"
    targetAudience?: string
    copy?: { // Legacy / Alternative
        headline?: string
        subheadline?: string
        body?: string
    }
}

export interface GenericAuditor {
    id: string
    name: string
    email: string
    active: boolean
    assignedCount: number
}

// Audit Workflow Status
export type AuditStatus = 'pending_assignment' | 'assigned' | 'in_review' | 'issues_found' | 'approved' | 'closed'

export interface AntigravityJob {
    id: string
    status: 'pending' | 'scanning' | 'awaiting_selection' | 'analyzing' | 'generating_identity' | 'provisioning' | 'completed' | 'failed'

    // Auditor Workflow Fields
    auditorId?: string
    auditStatus?: AuditStatus
    auditIssues?: string[] // List of documented issues
    emailDraft?: string // The generated email content ready for sending

    industry: string
    location: string
    goldMineFilter?: 'all' | 'high_value' | 'commoner'
    platforms?: string[]
    strategy?: string // 'generic' or other future strategies
    progress: number
    logs: string[]
    createdAt: Date
    updatedAt: Date
    result?: {
        vacuumCandidates: number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidates?: any[] // List of potential candidates found during scan
        topCandidate: unknown
        seoAudit?: SEOAudit
        competitorAnalysis?: CompetitorAnalysis
        identity?: UnifiedIdentity
        variants?: UnifiedIdentity[] // Supported Multi-Page Variants
        variantDomains?: string[] // Array of full domains for lookup
        domain: string
        provisionedUrl: string
        staticSiteCode?: string // The raw HTML for the "Legacy Static Site" export
    }
}

export type JobStatus = AntigravityJob['status']
