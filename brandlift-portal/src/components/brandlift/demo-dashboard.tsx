
import { UnifiedIdentity, SEOAudit } from "@/lib/types/job"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Layout, Monitor, Smartphone, Zap, TrendingUp, AlertTriangle } from "lucide-react"

interface DemoDashboardProps {
    clientName: string
    slug: string
    variants: UnifiedIdentity[]
    seoAudit?: SEOAudit
}

export function DemoDashboard({ clientName, variants, seoAudit, slug }: DemoDashboardProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Layout className="h-5 w-5" />
                        </div>
                        <h1 className="font-semibold text-lg">BrandLift <span className="text-slate-400 font-normal">| Client Review</span></h1>
                    </div>
                    {/* Direct Report Link in Header */}
                    <div className="hidden md:block">
                        <Button asChild variant="ghost" size="sm">
                            <a href={`/demo/${slug}/report`} target="_blank" className="text-slate-500 hover:text-slate-900">
                                View Full Mission Report
                            </a>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                        <Zap className="h-4 w-4" />
                        Identity Generation Complete
                    </div>

                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Review Proposals for {clientName}
                    </h2>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                        Our AI has generated {variants.length} distinct strategic directions based on the initial Deep Scan.
                        Each variant is tailored to capture specific market segments identified in the audit.
                    </p>

                    {/* Monetization Highlights */}
                    {seoAudit && seoAudit.monetization && (
                        <div className="flex flex-col md:flex-row justify-center gap-6 mb-10 text-left">
                            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 min-w-[280px]">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-red-100 p-2 rounded-full text-red-600 dark:bg-red-900/50 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-red-600/80 mb-1">Estimated Leakage</p>
                                        <p className="text-xl font-bold text-red-700 dark:text-red-400">{seoAudit.monetization.estimatedLostRevenue}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 min-w-[280px]">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600/80 mb-1">Projected ROI</p>
                                        <p className="text-xl font-bold text-green-700 dark:text-green-400">{seoAudit.monetization.potentialUplift}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        <Button asChild variant="outline" className="h-12 px-6">
                            <a href={`/demo/${slug}/report`} target="_blank">
                                View Full Mission Report <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {variants.map((variant, index) => (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="h-48 w-full relative" style={{ backgroundColor: variant.palette.primary }}>
                                {/* Mock UI Preview */}
                                <div className="absolute inset-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm p-4 flex flex-col gap-2">
                                    <div className="h-2 w-1/3 bg-white/40 rounded-full" />
                                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                                    <div className="mt-auto h-8 w-24 bg-white rounded-md shadow-sm" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                                    <span className="text-xs uppercase tracking-widest opacity-80 font-semibold">{variant.theme || 'Variant ' + (index + 1)}</span>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    {variant.theme || `Option ${index + 1}`}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {variant.tagline}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    {Object.values(variant.palette).slice(0, 4).map((color, i) => (
                                        <div key={i} className="h-6 w-6 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: color }} title={color} />
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button asChild className="w-full" variant="outline">
                                        <a href={variant.variantUrl} target="_blank" rel="noopener noreferrer">
                                            Launch Live Preview <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
