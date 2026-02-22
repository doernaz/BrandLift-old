"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trash2, Loader2, CheckCircle2, Copy, Download, Code, FileJson, UploadCloud, Rocket, ExternalLink } from "lucide-react"
import { JobViewer } from "@/components/brandlift/job-viewer"
import { AuditReport } from "@/components/brandlift/audit-report"
import { IdentityProposal } from "@/components/brandlift/identity-proposal"
import { SEOAudit, CompetitorAnalysis, UnifiedIdentity } from "@/lib/types/job"
import { useAppStore } from "@/lib/store"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { INDUSTRIES, US_STATES, MAJOR_CITIES_BY_STATE } from "@/lib/data/scanner-options"

import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocialScannerTile } from "@/components/brandlift/social-scanner-tile"

// Form schema updated
const formSchema = z.object({
    industry: z.string().min(2, "Industry is required"),
    state: z.string().length(2, "State is required"),
    city: z.string().optional(),
    limit: z.string(),
    auditorId: z.string().optional(),
    goldMineFilter: z.enum(["all", "high_value", "commoner"]),
    websiteFilter: z.enum(["all", "no_website", "has_website"]),
    platforms: z.array(z.string()).min(1, "Select at least one platform"),
})

export default function ScannerPage() {
    const queryClient = useQueryClient()
    const [loading, setLoading] = React.useState(false)
    const [jobId, setJobId] = React.useState<string | null>(null)
    const [isProcessing, setIsProcessing] = React.useState(false)
    const [auditData, setAuditData] = React.useState<{
        audit: SEOAudit,
        competition: CompetitorAnalysis,
        identity?: UnifiedIdentity,
        domain?: string,
        provisionedUrl?: string,
        variants?: UnifiedIdentity[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidate?: any,
        name: string
    } | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [candidates, setCandidates] = React.useState<any[]>([])
    const [previewData, setPreviewData] = React.useState<{ html: string, name: string, lead?: any } | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewRawData, setViewRawData] = React.useState<any | null>(null)
    const [uploading, setUploading] = React.useState(false)
    const [uploadSuccess, setUploadSuccess] = React.useState<{ webUrl: string, localUrl: string } | null>(null)
    const { mode } = useAppStore()

    // Generation state per candidate index
    const [generatingMap, setGeneratingMap] = React.useState<Record<number, boolean>>({})
    const [analyzingMap, setAnalyzingMap] = React.useState<Record<number, boolean>>({})


    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limit: "10",
            auditorId: "auto",
            city: "all",
            goldMineFilter: "all",
            websiteFilter: "all",
            platforms: ["google_maps"]
        }
    })

    const selectedState = watch("state")
    const availableCities = selectedState ? MAJOR_CITIES_BY_STATE[selectedState] || [] : []

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setCandidates([])
        setAuditData(null)
        setJobId(null)
        setIsProcessing(false)

        // Construct location string
        const locationString = values.city && values.city !== "all"
            ? `${values.city}, ${values.state}`
            : values.state

        try {
            const response = await fetch('/api/antigravity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry: values.industry,
                    location: locationString,
                    limit: values.limit,
                    auditorId: values.auditorId,
                    mode,
                    goldMineFilter: values.goldMineFilter,
                    websiteFilter: values.websiteFilter,
                    platforms: values.platforms
                }),
            })
            const data = await response.json()
            if (data.jobId) {
                setJobId(data.jobId)
            }
        } catch (error) {
            console.error("Scanning failed", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleGeneratePackage(candidate: any, index: number) {
        setGeneratingMap(prev => ({ ...prev, [index]: true }))
        try {
            const res = await fetch('/api/generate-package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead: candidate })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            if (!data.html || data.html.length < 50) {
                throw new Error("Generated HTML is empty or invalid.")
            }

            console.log("Setting Preview Data:", data.html.length);
            setPreviewData({ html: data.html, name: candidate.displayName?.text || candidate.name, lead: candidate })
            // Wait for render? No need.
            alert("Package Generated! Check for the preview window.")
        } catch (e: any) {
            console.error(e)
            alert(`Failed to generate package: ${e.message}`)
        } finally {
            setGeneratingMap(prev => ({ ...prev, [index]: false }))
        }
    }

    async function handleGenerateData(candidate: any, index: number) {
        setAnalyzingMap(prev => ({ ...prev, [index]: true }))
        try {
            const values = getValues()
            const locationString = values.city && values.city !== "all"
                ? `${values.city}, ${values.state}`
                : values.state

            const res = await fetch('/api/analyze-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate,
                    industry: values.industry,
                    location: locationString
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Update candidate in list with new data
            setCandidates(prev => {
                const updated = [...prev]
                updated[index] = {
                    ...updated[index],
                    seoAudit: data.audit,
                    competitorAnalysis: data.competition,
                    staticSiteCode: data.staticSiteCode
                }
                return updated
            })

            alert("Data Generated & Stored Successfully! Click 'VIEW REPORT' to see details.")

        } catch (e) {
            console.error(e)
            alert('Failed to generate data')
        } finally {
            setAnalyzingMap(prev => ({ ...prev, [index]: false }))
        }
    }

    const handleUploadToHost = async () => {
        if (!previewData) return
        setUploading(true)
        try {
            // Generate SEO Report HTML
            const seoHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Market Intelligence - ${previewData.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 p-8 font-sans">
    <div class="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        <header class="bg-slate-900 text-white p-8">
            <div class="text-xs font-mono text-emerald-400 mb-2">ACCESS GRANTED // LEVEL 4 CLEARANCE</div>
            <h1 class="text-3xl font-bold tracking-tight">Market Intelligence Report</h1>
            <p class="text-slate-400 mt-2 text-lg">${previewData.name}</p>
        </header>
        <div class="p-8 space-y-8">
            <section class="grid grid-cols-2 gap-6">
                <div class="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-xs font-bold text-slate-500 tracking-wider uppercase">Baseline SEO Score</span>
                    <div class="text-4xl font-black text-red-500 mt-2">18<span class="text-xl text-slate-400 font-normal">/100</span></div>
                    <div class="text-xs text-slate-400 mt-2">Unoptimized digital presence detected.</div>
                </div>
                <div class="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span class="text-xs font-bold text-emerald-600 tracking-wider uppercase">Projected Lift</span>
                    <div class="text-4xl font-black text-emerald-600 mt-2">94<span class="text-xl text-emerald-400 font-normal">/100</span></div>
                    <div class="text-xs text-emerald-600/70 mt-2">Post-deployment theoretical maximum.</div>
                </div>
            </section>
            
            <section>
                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-4">Core Metrics</h3>
                <dl class="grid grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                        <dt class="text-xs text-slate-400 uppercase">Google Rating</dt>
                        <dd class="text-xl font-medium text-slate-900">${previewData.lead?.rating || 'N/A'} ★</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-slate-400 uppercase">Review Volume</dt>
                        <dd class="text-xl font-medium text-slate-900">${previewData.lead?.userRatingCount || 'N/A'} Reviews</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-slate-400 uppercase">Business Status</dt>
                        <dd class="text-xl font-medium text-slate-900">${previewData.lead?.businessStatus || 'OPERATIONAL'}</dd>
                    </div>
                    <div>
                         <dt class="text-xs text-slate-400 uppercase">Generated</dt>
                         <dd class="text-xl font-medium text-slate-900">${new Date().toLocaleDateString()}</dd>
                    </div>
                </dl>
            </section>
        </div>
        <div class="bg-slate-50 p-4 text-center border-t border-slate-100">
            <a href="index.html" class="text-sm font-bold text-blue-600 hover:underline">← Return to Main Site</a>
        </div>
    </div>
</body>
</html>`

            const res = await fetch('/api/deploy-vps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subdomain: previewData.name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    files: [
                        { path: 'index.html', content: previewData.html },
                        { path: 'seo-report.html', content: seoHtml }
                    ]
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setUploadSuccess({ webUrl: data.webUrl, localUrl: data.localUrl })
        } catch (e: any) {
            alert(`Upload Error: ${e.message}`)
        } finally {
            setUploading(false)
        }
    }

    async function handleCandidateSelection(index: number) {
        // INSTANT AUDIT VIEW (Comprehensive Scan Data)
        const candidate = candidates[index]
        if (candidate.seoAudit) {
            setAuditData({
                audit: candidate.seoAudit,
                competition: candidate.competitorAnalysis,
                name: candidate.displayName.text,
                candidate: candidate,
                // Identity not generated yet in this quick view, but audit is.
                // We can set identity to undefined or a mock if needed.
                identity: undefined,
                variants: undefined,
                domain: `${candidate.displayName.text.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.brandlift.ai`,
                provisionedUrl: `http://localhost:3000/demo/${candidate.displayName?.text?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
            })
            // Scroll will happen via useEffect
            return
        }

        if (!jobId) {
            console.error("CRITICAL ERROR: Job ID is missing. Cannot probe candidate.", { index, candidatesLength: candidates.length });
            alert("System Error: Active Job ID lost. Please re-run the scan.");
            return;
        }
        setLoading(true)
        setIsProcessing(true) // Show JobViewer to track progress
        try {
            const res = await fetch(`/api/antigravity/${jobId}/select-candidate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateIndex: index })
            })
            if (res.ok) {
                await queryClient.removeQueries({ queryKey: ['antigravity-job', jobId] })
            }
        } catch (e) {
            console.error("Selection failed", e)
            alert("Probe Failed to Initiate: " + (e as Error).message) // Explicit user feedback
            setIsProcessing(false)
        } finally {
            setLoading(false)
        }
    }

    // ...

    // Job Viewer Status Logic
    // If Job fails, JobViewer handles it visibly.
    // We only hide JobViewer if user explicitly resets or success.
    // If API failed to initiate, we alert and hide.


    const PLATFORM_OPTIONS = [
        { id: "google_maps", label: "Google Maps" },
        { id: "yelp", label: "Yelp" },
        { id: "tripadvisor", label: "TripAdvisor" },
        { id: "foursquare", label: "Foursquare" },
        { id: "facebook", label: "Facebook Recs" },
        { id: "bbb", label: "BBB" },
        { id: "opentable", label: "OpenTable" },
        { id: "angi", label: "Angi" },
    ]

    const reportRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (auditData && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [auditData])

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">SYSTEM: AGNOSTIC_DATA_ENGINE</h2>
                <p className="text-muted-foreground font-mono text-xs mt-1">
                    [MODE: MINIMALIST_TECH_VECTOR] [WATERFALL_LOGIC: ENABLED]
                </p>
            </div>

            <Tabs defaultValue="master" className="w-full space-y-4">
                <TabsList className="bg-background/50 border border-border">
                    <TabsTrigger value="master" className="font-mono">MASTER SEARCH</TabsTrigger>
                    <TabsTrigger value="social" className="font-mono">SOCIAL SIGNALS</TabsTrigger>
                </TabsList>

                <TabsContent value="master" className="space-y-6">
                    <Card className="border-border/50 bg-background/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="font-mono">INPUT INTERFACE CONFIGURATION</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* 1. Platform Selector */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold font-mono">1. PLATFORM CHECKBOXES [ALL]</label>
                                    <div className="flex items-center space-x-2 mb-3 max-w-fit">
                                        <Checkbox
                                            id="select-all-platforms"
                                            checked={getValues("platforms").length === PLATFORM_OPTIONS.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue("platforms", PLATFORM_OPTIONS.map(p => p.id));
                                                } else {
                                                    setValue("platforms", []);
                                                }
                                            }}
                                        />
                                        <label htmlFor="select-all-platforms" className="text-xs font-mono font-bold cursor-pointer uppercase text-primary">SELECT ALL</label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/20 p-4 rounded-md">
                                        {PLATFORM_OPTIONS.map((platform) => (
                                            <div key={platform.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={platform.id}
                                                    checked={watch("platforms").includes(platform.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = getValues("platforms");
                                                        if (checked) {
                                                            setValue("platforms", [...current, platform.id]);
                                                        } else {
                                                            setValue("platforms", current.filter(p => p !== platform.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={platform.id} className="text-xs font-mono cursor-pointer uppercase">{platform.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Gold Mines & Industry */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Industry */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">TARGET VECTOR [INDUSTRY]</label>
                                        <Select onValueChange={(val) => setValue("industry", val)}>
                                            <SelectTrigger className={errors.industry ? "border-red-500 font-mono" : "font-mono"}>
                                                <SelectValue placeholder="SELECT VECTOR" />
                                            </SelectTrigger>
                                            <SelectContent className="h-[300px]">
                                                {INDUSTRIES.map((ind) => (
                                                    <SelectItem key={ind} value={ind} className="font-mono">{ind}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">2. GOLD MINES [FILTER]</label>
                                        <Select onValueChange={(val) => setValue("goldMineFilter", val as "all" | "high_value" | "commoner")} defaultValue="all">
                                            <SelectTrigger className="font-mono">
                                                <SelectValue placeholder="SELECT FILTER" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all" className="font-mono">ALL (Agnostic)</SelectItem>
                                                <SelectItem value="high_value" className="font-mono">HIGH VALUE (Authority &gt; 40)</SelectItem>
                                                <SelectItem value="commoner" className="font-mono">COMMONER (Emerging, &lt; 20 Reviews)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Website Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">WEBSITE STATUS</label>
                                        <Select onValueChange={(val) => setValue("websiteFilter", val as "all" | "no_website" | "has_website")} defaultValue="all">
                                            <SelectTrigger className="font-mono">
                                                <SelectValue placeholder="SELECT STATUS" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all" className="font-mono">ALL ENTITIES</SelectItem>
                                                <SelectItem value="no_website" className="font-mono text-green-500">NO WEBSITE (High Priority)</SelectItem>
                                                <SelectItem value="has_website" className="font-mono text-red-400">HAS WEBSITE (Low Priority)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">TARGET STATE</label>
                                        <Select onValueChange={(val) => {
                                            setValue("state", val)
                                            setValue("city", "all")
                                        }}>
                                            <SelectTrigger className="font-mono bg-blue-900/40 border-blue-700/50 text-blue-100 focus:ring-blue-500">
                                                <SelectValue placeholder="SELECT STATE" />
                                            </SelectTrigger>
                                            <SelectContent className="h-[300px]">
                                                {US_STATES.map((state) => (
                                                    <SelectItem key={state.value} value={state.value} className="font-mono">{state.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">TARGET CITY</label>
                                        <Select
                                            disabled={!selectedState || availableCities.length === 0}
                                            onValueChange={(val) => setValue("city", val)}
                                            defaultValue="all"
                                        >
                                            <SelectTrigger className="font-mono">
                                                <SelectValue placeholder="ALL CITIES" />
                                            </SelectTrigger>
                                            <SelectContent className="h-[300px]">
                                                <SelectItem value="all" className="font-mono">All (Entire State)</SelectItem>
                                                {availableCities.map((city) => (
                                                    <SelectItem key={city} value={city} className="font-mono">{city}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">NUMBER OF RESULTS</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            defaultValue="50"
                                            {...register("limit", { valueAsNumber: false })}
                                            className="bg-background font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-mono">AUDITOR ASSIGNMENT</label>
                                        <Select onValueChange={(val) => register("auditorId", { value: val })} defaultValue="auto">
                                            <SelectTrigger className="font-mono">
                                                <SelectValue placeholder="AUTO" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto" className="font-mono">AUTO-ASSIGN</SelectItem>
                                                <SelectItem value="me" className="font-mono">SELF-ASSIGN</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full font-mono bg-primary/90 hover:bg-primary" disabled={loading}>
                                    {loading ? "INITIALIZING SEARCH..." : "EXECUTE SEARCH_AND_EXTRACT"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Grid */}
                    {
                        candidates.length > 0 && (
                            <div className="space-y-4 mt-8 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-xl font-bold font-mono">OUTPUT ARCHITECTURE</h3>
                                    <span className="font-mono text-xs bg-secondary px-2 py-1">{candidates.length} ENTITIES EXTRACTED</span>
                                </div>

                                <div className="overflow-x-auto border rounded-md bg-background/50">
                                    <table className="w-full text-xs font-mono text-left">
                                        <thead className="bg-secondary/50 text-[10px] uppercase">
                                            <tr>
                                                <th className="px-2 py-2">Action</th>
                                                <th className="px-2 py-2">Entity</th>
                                                <th className="px-2 py-2">Industry</th>
                                                <th className="px-2 py-2">Contact Vector [Phone]</th>
                                                <th className="px-2 py-2">Physical Vector [Address]</th>
                                                <th className="px-2 py-2">Score [G_Mine]</th>
                                                <th className="px-2 py-2">Email [Verified]</th>
                                                <th className="px-2 py-2">Source</th>
                                                <th className="px-2 py-2">Other Platforms</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {candidates.map((c, i) => (
                                                <tr key={i} className="hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleCandidateSelection(i)}>
                                                    <td className="px-2 py-2 text-[10px]">
                                                        <div className="flex gap-2 items-center">
                                                            <Button
                                                                size="sm"
                                                                disabled={analyzingMap[i]}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleGenerateData(c, i)
                                                                }}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 font-bold text-[10px] tracking-widest border border-emerald-400 shadow-md"
                                                            >
                                                                {analyzingMap[i] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                                {analyzingMap[i] ? "ANALYZING..." : "GENERATE DATA"}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                disabled={generatingMap[i]}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleGeneratePackage(c, i)
                                                                }}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-4 font-bold text-[10px] tracking-widest border border-indigo-400 shadow-md"
                                                            >
                                                                {generatingMap[i] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                                {generatingMap[i] ? "GENERATING..." : "GENERATE PACKAGE"}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant={c.seoAudit ? "destructive" : "outline"} // Highlight if audit exists
                                                                className="h-8 text-[10px] border-primary/50 font-mono tracking-tighter"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (c.seoAudit) {
                                                                        handleCandidateSelection(i);
                                                                    } else {
                                                                        alert("Please Generate Data first.")
                                                                    }
                                                                }}
                                                                disabled={!c.seoAudit}
                                                            >
                                                                {c.seoAudit?.monetization?.estimatedLostRevenue
                                                                    ? `📉 ${c.seoAudit.monetization.estimatedLostRevenue}`
                                                                    : "VIEW RESULTS"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 hover:bg-muted"
                                                                title="View Raw Data JSON"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewRawData(c);
                                                                }}
                                                            >
                                                                <FileJson className="h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2 font-bold max-w-[150px] truncate" title={c.displayName?.text}>
                                                        {c.websiteUri ? (
                                                            <a
                                                                href={c.websiteUri}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 hover:text-blue-500 hover:underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {c.displayName?.text}
                                                                <ExternalLink className="h-3 w-3 opacity-50" />
                                                            </a>
                                                        ) : (
                                                            <span>{c.displayName?.text}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 opacity-70 truncate max-w-[100px]" title={c.primaryTypeDisplayName?.text}>
                                                        {c.primaryTypeDisplayName?.text || "Agonostic"}
                                                    </td>
                                                    <td className="px-2 py-2 font-mono text-[10px] opacity-80 whitespace-nowrap">
                                                        {c.internationalPhoneNumber || "--"}
                                                    </td>
                                                    <td className="px-2 py-2 font-mono text-[10px] opacity-70 truncate max-w-[150px]" title={c.formattedAddress}>
                                                        {c.formattedAddress}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {c.rating > 4.5 && c.userRatingCount > 40 ? (
                                                            <span className="text-yellow-500 font-bold">HIGH_VAL</span>
                                                        ) : c.rating < 4.0 ? (
                                                            <span className="text-blue-400">COMMONER</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">STANDARD</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        {c.contactEmail ? (
                                                            <span className="text-green-500 font-bold">{c.contactEmail}</span>
                                                        ) : (
                                                            <span className="text-red-500 opacity-50">--</span>
                                                        )}
                                                    </td>
                                                    <td className="px-2 py-2 text-[10px] opacity-60">
                                                        {c.enrichmentSource || "WEB_CRAWL"}
                                                    </td>
                                                    <td className="px-2 py-2 text-[10px] flex gap-2">
                                                        {/* Mock Links for now */}
                                                        <a href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(c.displayName?.text)}`} target="_blank" onClick={(e) => e.stopPropagation()} className="hover:text-red-500">Yelp</a>
                                                        <a href={`https://www.facebook.com/search/top?q=${encodeURIComponent(c.displayName?.text)}`} target="_blank" onClick={(e) => e.stopPropagation()} className="hover:text-blue-600">FB</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {/* Existing Job Viewer & Reports ... */}
                    {
                        jobId && !auditData && (candidates.length === 0 || isProcessing) && (
                            <div className="mt-6 border-t pt-6">
                                <p className="font-mono text-xs text-muted-foreground mb-4">PROTOCOL STATUS: RUNNING...</p>
                                <JobViewer
                                    jobId={jobId}
                                    onAuditComplete={(audit, competition, identity, name, provisionedUrl, variants, candidate) => {
                                        setAuditData({ audit, competition, identity, domain: name, provisionedUrl, name: name.split('.')[0], variants, candidate })
                                        setIsProcessing(false)
                                    }}
                                    onSelectionRequired={setCandidates}
                                />
                            </div>
                        )
                    }

                    {
                        auditData && (
                            <div className="mt-8" ref={reportRef}>
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Rocket className="h-6 w-6 text-green-500" />
                                    Mission Report: {auditData.name}
                                </h2>
                                <AuditReport
                                    audit={auditData.audit}
                                    competition={auditData.competition}
                                    targetName={auditData.name}
                                />

                                {auditData.identity && auditData.domain && (
                                    <div className="mt-12 border-t pt-8">
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                            <Rocket className="h-6 w-6 text-purple-500" />
                                            Generated Identity System
                                        </h2>
                                        <IdentityProposal
                                            identity={auditData.identity}
                                            domain={auditData.domain}
                                            liveUrl={auditData.provisionedUrl}
                                            variants={auditData.variants}
                                            candidate={auditData.candidate}
                                        />
                                    </div>
                                )}

                            </div>
                        )
                    }

                </TabsContent>

                <TabsContent value="social">
                    <SocialScannerTile />
                </TabsContent>

            </Tabs>

            {/* Code Preview Modal */}
            {
                previewData && (
                    <div
                        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setPreviewData(null)}
                    >
                        <div
                            className="bg-background w-full h-full max-w-[1400px] max-h-[90vh] rounded-lg border border-border flex flex-col shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b bg-muted/50 gap-4">
                                <div className="flex items-center gap-3 shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <h3 className="font-mono font-bold text-green-500 text-sm md:text-base truncate max-w-[200px] md:max-w-none">
                                        PACKAGE GENERATED: {previewData.name}
                                    </h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(previewData.html)
                                            alert("Code copied to clipboard!")
                                        }}
                                        className="flex-1 md:flex-none text-xs"
                                    >
                                        COPY
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            const blob = new Blob([previewData.html], { type: 'text/html' })
                                            const url = window.URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `${previewData.name.replace(/\s+/g, '-').toLowerCase()}-package.html`
                                            document.body.appendChild(a)
                                            a.click()
                                            document.body.removeChild(a)
                                            window.URL.revokeObjectURL(url)
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none text-xs"
                                    >
                                        <Download className="h-4 w-4 mr-1 md:mr-2" />
                                        <span className="hidden sm:inline">DOWNLOAD</span>
                                        <span className="sm:hidden">SAVE</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleUploadToHost()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none text-xs"
                                        disabled={uploading}
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1 md:mr-2" /> : <UploadCloud className="h-4 w-4 mr-1 md:mr-2" />}
                                        UPLOAD
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPreviewData(null)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </div>

                            {/* Iframe Preview */}
                            <div className="flex-1 bg-white relative">
                                <iframe
                                    srcDoc={previewData.html}
                                    title="Site Preview"
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts" // Allow Tailwind CDN execution
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Upload Success Modal */}
            {
                uploadSuccess && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setUploadSuccess(null)}>
                        <div className="bg-background max-w-md w-full rounded-lg border border-border flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-2 text-green-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <h3 className="text-xl font-bold">Deployment Successful</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">The package has been successfully deployed to the Sandbox environment.</p>

                                <div className="space-y-3 pt-2">
                                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                        <label className="text-xs font-mono text-slate-500 uppercase">Public Web URL</label>
                                        <a href={uploadSuccess.webUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline font-mono text-sm break-all">
                                            {uploadSuccess.webUrl}
                                        </a>
                                    </div>

                                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                                        <label className="text-xs font-mono text-slate-500 uppercase">Direct IP Link (Internal)</label>
                                        <a href={uploadSuccess.localUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline font-mono text-sm break-all">
                                            {uploadSuccess.localUrl}
                                        </a>
                                    </div>

                                    <div className="bg-emerald-900/20 p-3 rounded border border-emerald-900/50">
                                        <label className="text-xs font-mono text-emerald-500 uppercase">Market Intelligence Report</label>
                                        <a href={`${uploadSuccess.webUrl}/seo-report.html`} target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:underline font-mono text-sm break-all">
                                            {uploadSuccess.webUrl}/seo-report.html
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 border-t flex justify-end">
                                <Button onClick={() => setUploadSuccess(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Raw Data Modal */}
            {
                viewRawData && (
                    <div
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setViewRawData(null)}
                    >
                        <div
                            className="bg-background w-full h-full max-w-[1000px] max-h-[90vh] rounded-lg border border-border flex flex-col shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                                <h3 className="font-mono font-bold">RAW ENTITY DATA: {viewRawData.displayName?.text}</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setViewRawData(null)}
                                >
                                    ✕
                                </Button>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-slate-950 text-green-400 font-mono text-xs">
                                <pre>{JSON.stringify(viewRawData, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
