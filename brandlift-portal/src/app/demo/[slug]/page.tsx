
import { notFound } from "next/navigation"
import { db } from "@/lib/firebase-admin"
import { UnifiedIdentity } from "@/lib/types/job"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, MapPin, Phone, Star } from "lucide-react"
import { DemoDashboard } from "@/components/brandlift/demo-dashboard"
import { IdentityHero } from "@/components/brandlift/hero-variants"

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
    if (!db) return notFound()

    const { slug } = await params

    const domainQuery = `${slug}.brandlift.ai`

    // 1. Try finding by Main Domain (for Dashboard)
    const snapshotMain = await db.collection("antigravity_jobs")
        .where("result.domain", "==", domainQuery)
        .get()

    if (!snapshotMain.empty) {
        // Sort in memory to avoid index requirement
        const docs = snapshotMain.docs.map(d => d.data())
        // Sort by updatedAt descending (if available) or createdAt
        /* eslint-disable @typescript-eslint/no-explicit-any */
        docs.sort((a: any, b: any) => {
            const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0)
            const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0)
            return dateB.getTime() - dateA.getTime()
        })

        const job = docs[0]

        // Handle In-Progress States
        if (['analyzing', 'generating_identity'].includes(job.status)) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 font-sans">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <h1 className="text-2xl font-bold mb-2">Building Brand Identity...</h1>
                    <p className="text-muted-foreground">The AI is currently generating this site. Please refresh in a moment.</p>
                </div>
            )
        }

        // Handle Failed State
        if (job.status === 'failed') {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 font-sans text-red-600">
                    <h1 className="text-2xl font-bold mb-2">Generation Failed</h1>
                    <p>The system encountered an error while building this site.</p>
                </div>
            )
        }

        // Check for Variants (Dashboard Mode)
        // If variants exist, use them. If only single identity exists, wrap it as a variant.
        const effectiveVariants = (job.result?.variants && job.result.variants.length > 0)
            ? job.result.variants
            : (job.result?.identity ? [job.result.identity as UnifiedIdentity] : [])

        if (effectiveVariants.length > 0) {
            return <DemoDashboard
                clientName={job.result.topCandidate?.displayName?.text || slug}
                variants={effectiveVariants}
                seoAudit={job.result.seoAudit}
                slug={slug}
            />
        }

        // Job exists but no identity data (Data corruption?)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 font-sans">
                <h1 className="text-2xl font-bold mb-2">Data Incomplete</h1>
                <p className="text-muted-foreground">The site record exists but contains no identity data.</p>
            </div>
        )
    }

    // 2. Try finding by Variant Domain
    const snapshotVariant = await db.collection("antigravity_jobs")
        .where("result.variantDomains", "array-contains", domainQuery)
        .limit(1)
        .get()

    if (!snapshotVariant.empty) {
        const job = snapshotVariant.docs[0].data()
        // Find the specific variant identity
        const variantIdentity = (job.result?.variants as UnifiedIdentity[]).find(v => {
            return v.variantUrl?.includes(slug) || false
        })

        if (variantIdentity) {
            console.log(`[DemoPage] Rendering Variant: ${slug}`, variantIdentity.theme)
            return renderLandingPage(variantIdentity)
        }
    }

    // 3. Not Found (Custom 404)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
            <p className="text-muted-foreground">The requested demo site ({slug}) does not exist or has not been fully provisioned.</p>
            <p className="text-xs text-muted-foreground mt-4">Searched for: {domainQuery}</p>
        </div>
    )
}

function renderLandingPage(identity: UnifiedIdentity) {
    if (!identity) return notFound()

    return (
        <div className="min-h-screen font-sans" style={{
            fontFamily: identity.typography.bodyFont,
            backgroundColor: identity.palette.background,
            color: '#1a1a1a' // improved contrast default
        }}>

            {/* Header / Nav */}
            <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{
                borderColor: identity.palette.secondary + '40',
                backgroundColor: identity.palette.surface + 'E6'
            }}>
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="font-bold text-2xl flex items-center gap-2" style={{ fontFamily: identity.typography.headingFont, color: identity.palette.primary }}>
                        {/* Logo Concept would go here */}
                        {identity.name}
                    </div>
                    <Button style={{ backgroundColor: identity.palette.accent, color: '#fff' }}>
                        Get a Quote
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <IdentityHero identity={identity} industry="Service" />

            {/* "Why Choose Us" Grid */}
            <section className="py-20" style={{ backgroundColor: identity.palette.surface }}>
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Expert Technicians", desc: "Certified professionals dedicated to precision and quality in every job." },
                            { title: "Upfront Pricing", desc: "No hidden fees. You get honest quotes and transparent billing." },
                            { title: "Satisfaction Guaranteed", desc: "We stand by our work with industry-leading warranties and support." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl shadow-sm border" style={{ backgroundColor: identity.palette.background, borderColor: identity.palette.secondary + '20' }}>
                                <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: identity.palette.primary + '20', color: identity.palette.primary }}>
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: identity.typography.headingFont }}>{feature.title}</h3>
                                <p className="opacity-70">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t" style={{ backgroundColor: identity.palette.background, borderColor: identity.palette.secondary + '20' }}>
                <div className="container mx-auto px-4 text-center opacity-60">
                    <p>© {new Date().getFullYear()} {identity.name}. All rights reserved.</p>
                    <p className="mt-2 text-sm">Powered by BrandLift Antigravity Engine</p>
                </div>
            </footer>

        </div>
    )
}
