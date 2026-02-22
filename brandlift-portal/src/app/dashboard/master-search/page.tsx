"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Rocket, History, ShieldAlert, Loader2, CheckCircle2, XCircle, FileCode, ExternalLink, X, Download } from "lucide-react"

const STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY"
]

const INDUSTRIES = [
    "Auto Body", "Auto Detailing", "Auto Repair", "Car Dealership", "Car Wash",
    "Custom Restoration", "Fleet Repair", "RV Repair", "Tire Shop", "Window Tinting",
    "Asphalt Paving", "Bathroom Remodeler", "Concrete", "Decks & Patios", "Drywall",
    "Electrician", "Excavation", "Fencing", "Flooring", "Foundation Repair",
    "General Contractor", "Glass & Mirror", "Home Builder", "Kitchen Remodeler",
    "Masonry", "Painting", "Plumbing", "Roofing", "Septic Service", "Siding", "Welding",
    "Appliance Repair", "Carpet Cleaning", "Garage Door Repair", "House Cleaning",
    "HVAC", "Junk Removal", "Landscaping", "Locksmith", "Moving Company",
    "Pest Control", "Pool Service", "Pressure Washing", "Security Systems",
    "Solar Installer", "Water Softener", "Window Cleaning",
    "Bookkeeping", "Chiropractor", "Cosmetic Surgery", "CPA", "Dentist",
    "Estate Planning", "Family Law", "Financial Advisor", "Insurance Agency",
    "Personal Injury Lawyer", "Physical Therapy", "Property Management",
    "Real Estate Agency", "Veterinarian",
    "Asbestos Removal", "Fire Damage", "Mold Remediation", "Water Damage",
    "Caretaker", "Digital Marketing", "Event Planner", "Funeral Home",
    "Photography", "Print Shop", "Sign Shop", "Video Production", "Web Design"
].sort()

const formSchema = z.object({
    state: z.string().min(2, "Select a state"),
    industry: z.string().min(2, "Select an industry"),
    mode: z.enum(["test", "production"]),
    websiteFilter: z.enum(["all", "no_website", "has_website"]),
    limit: z.number().min(1).max(50).optional(),
})

type SearchHistory = {
    id: string
    state: string
    industry: string
    block: string
    count: number
    mode: string
    status: string
    timestamp: string
}

export default function MasterSearchPage() {
    const [history, setHistory] = React.useState<SearchHistory[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedHistory, setSelectedHistory] = React.useState<SearchHistory | null>(null)
    const [leads, setLeads] = React.useState<any[]>([])
    const [generatedCode, setGeneratedCode] = React.useState<string | null>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            state: "",
            industry: "",
            mode: "test",
            websiteFilter: "all",
            limit: 50
        }
    })

    const mode = form.watch("mode")
    const websiteFilter = form.watch("websiteFilter")
    const selectedIndustry = form.watch("industry")

    React.useEffect(() => {
        fetchHistory()
        const interval = setInterval(fetchHistory, 5000)
        return () => clearInterval(interval)
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/master-search/history')
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (error) {
            console.error("Failed to fetch history", error)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/master-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })
            const data = await res.json()
            if (!res.ok) {
                if (data.error === "Sector already harvested") {
                    alert("ABORTED: SECTOR HARVESTED\nThis sector has already been harvested in Production mode.")
                } else {
                    alert(`Execution Failed: ${data.details || "Unknown error"}`)
                }
            } else {
                alert(`ALCUBIERRE DRIVE INITIATED\nLaunched 3 Execution Blocks for ${values.industry} in ${values.state}.\n\nResults will stream into the History Log below.`)
                fetchHistory()
            }
        } catch (error) {
            alert("Network Error: Failed to reach Master Search Command.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewResults = async (h: SearchHistory) => {
        setSelectedHistory(h)
        setLeads([]) // clear previous
        try {
            const res = await fetch(`/api/master-search/leads?id=${h.id}`)
            if (res.ok) {
                const data = await res.json()
                setLeads(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleGeneratePackage = async (lead: any) => {
        setIsGenerating(true)
        setGeneratedCode(null)
        try {
            const res = await fetch('/api/generate-package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead })
            })
            const data = await res.json()
            if (data.code) {
                setGeneratedCode(data.code)
            } else {
                alert("Generation Failed: " + (data.error || "Unknown Error"))
            }
        } catch (err) {
            alert("Generation Network Error")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownloadCode = () => {
        if (!generatedCode) return
        const blob = new Blob([generatedCode], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `brandlift-package-${Date.now()}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handlePreviewCode = () => {
        if (!generatedCode) return
        const blob = new Blob([generatedCode], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
    }

    // Helper Function
    const renderFilterBadge = (filter: string) => {
        if (filter === 'no_website') return <span className="text-red-400 font-bold">NO WEBSITE</span>
        if (filter === 'has_website') return <span className="text-green-400 font-bold">HAS WEBSITE</span>
        return <span className="text-blue-400 font-bold">ALL</span>
    }

    const getBlockConfig = (industry: string | undefined) => {
        if (!industry) return null
        switch (industry) {
            case "Caretaker": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Private Duty", "Live-in", "Luxury"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Medical Staffing", "Nurse Registry", "Facility"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["Caregiver", "Home Health", "Elder Care"] } }
            case "Fleet Repair": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Emergency Roadside", "Mobile Diesel", "Heavy Duty"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Fleet Maintenance", "Truck Center", "Logistics"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["Diesel Repair", "Truck Repair", "Trailer Repair"] } }
            case "Custom Restoration": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Classic Restoration", "Vintage Auto", "Concours"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Custom Fabrication", "Upholstery", "Paint Shop"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["Hot Rod", "Restomod", "Muscle Car"] } }
            case "HVAC": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Emergency AC", "High Efficiency", "Geothermal"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Commercial HVAC", "Chiller Repair", "Ventilation"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["AC Repair", "Heating Service", "Furnace"] } }
            case "Plumbing": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Emergency Plumber", "Luxury Bath", "Tankless"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Commercial Plumbing", "Backflow", "Industrial"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["Plumber", "Drain Cleaning", "Water Heater"] } }
            case "Roofing": return { A: { title: "BLOCK A (SPECIALTY)", keywords: ["Slate Roofing", "Tile Roofing", "Luxury Roof"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: ["Commercial Roof", "Flat Roof", "Industrial"] }, C: { title: "BLOCK C (VOLUME)", keywords: ["Roof Replacement", "Roof Leaks", "Shingles"] } }
            default: return { A: { title: "BLOCK A (SPECIALTY)", keywords: [`Best ${industry}`, `Luxury ${industry}`, "Specialty"] }, B: { title: "BLOCK B (COMMERCIAL)", keywords: [`Commercial ${industry}`, `Industrial ${industry}`, "Fleet"] }, C: { title: "BLOCK C (VOLUME)", keywords: [`${industry} Service`, `${industry} Near Me`, "Local"] } }
        }
    }
    const blocks = getBlockConfig(selectedIndustry)

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle2 className="h-3 w-3 text-green-500" />
        if (status === 'failed') return <XCircle className="h-3 w-3 text-red-500" />
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
    }

    return (
        <div className="container mx-auto p-4 space-y-8 max-w-5xl relative">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Rocket className="h-8 w-8 text-primary animate-pulse" />
                <div>
                    <h1 className="text-3xl font-mono font-bold tracking-tighter">MASTER SEARCH ORCHESTRATOR</h1>
                    <p className="text-muted-foreground font-mono text-xs">ALCUBIERRE DRIVE // SYSTEM STATUS: ONLINE</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <Card className="md:col-span-1 bg-card/50 border-primary/20 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="font-mono text-sm uppercase text-primary">Mission Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-xs font-mono font-bold">TARGET STATE</Label>
                                <Select onValueChange={(val) => form.setValue("state", val)} defaultValue={form.getValues("state")}>
                                    <SelectTrigger className="font-mono h-10 border-primary/30 focus:border-primary">
                                        <SelectValue placeholder="SELECT STATE" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {STATES.map(s => <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-mono font-bold">TARGET INDUSTRY</Label>
                                <Select onValueChange={(val) => form.setValue("industry", val)} defaultValue={form.getValues("industry")}>
                                    <SelectTrigger className="font-mono h-10 border-primary/30 focus:border-primary">
                                        <SelectValue placeholder="SELECT INDUSTRY" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="font-mono">{i}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-mono font-bold">WEBSITE FILTER</Label>
                                <Select onValueChange={(val: any) => form.setValue("websiteFilter", val)} defaultValue={form.getValues("websiteFilter")}>
                                    <SelectTrigger className="font-mono h-10 border-primary/30 focus:border-primary">
                                        <SelectValue placeholder="SELECT FILTER" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="font-mono">ALL ENTITIES</SelectItem>
                                        <SelectItem value="no_website" className="font-mono">NO WEBSITE (VACUUM)</SelectItem>
                                        <SelectItem value="has_website" className="font-mono">HAS WEBSITE (ESTABLISHED)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-mono font-bold">SEARCH LIMIT (PER BLOCK)</Label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="flex h-10 w-full rounded-md border border-primary/30 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                    placeholder="50"
                                    {...form.register("limit", { valueAsNumber: true })}
                                />
                                {form.formState.errors.limit && <p className="text-red-500 text-xs font-mono">{form.formState.errors.limit.message}</p>}
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-black/20">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-mono font-bold">OPERATION MODE</Label>
                                    <div className={`text-[10px] font-mono font-bold ${mode === 'production' ? 'text-red-500' : 'text-green-500'}`}>
                                        {mode === 'production' ? 'PRODUCTION (LIVE)' : 'TEST (SIMULATION)'}
                                    </div>
                                </div>
                                <Switch checked={mode === 'production'} onCheckedChange={(checked) => form.setValue("mode", checked ? "production" : "test")} />
                            </div>

                            <div className="space-y-2">
                                <Button type="submit" className="w-full font-mono font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-12" disabled={isLoading}>
                                    {isLoading ? "EXECUTING PROTOCOLS... (DO NOT CLOSE)" : "INITIALIZE ALCUBIERRE DRIVE"}
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center font-mono">
                                    ESTIMATED COMPLETION: 3-5 MINUTES (BACKGROUND EXECUTION)
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Execution Blocks & history */}
                <div className="md:col-span-2 space-y-6">
                    {/* Active Blocks Visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Blocks Visualization (Use 'blocks' variable) */}
                        {blocks ? (
                            <>
                                <Card className="bg-black/40 border-primary/10">
                                    <CardHeader className="p-4 py-3 border-b border-border/50">
                                        <CardTitle className="text-xs font-mono text-muted-foreground">{blocks.A.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 text-[10px] font-mono text-primary/80 space-y-1">
                                        {blocks.A.keywords.map(k => <p key={k}>KEYWORD: "{k}"</p>)}
                                        <p className="mt-2">FILTER: {renderFilterBadge(websiteFilter)}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-black/40 border-primary/10">
                                    <CardHeader className="p-4 py-3 border-b border-border/50">
                                        <CardTitle className="text-xs font-mono text-muted-foreground">{blocks.B.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 text-[10px] font-mono text-primary/80 space-y-1">
                                        {blocks.B.keywords.map(k => <p key={k}>KEYWORD: "{k}"</p>)}
                                        <p className="mt-2">FILTER: {renderFilterBadge(websiteFilter)}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-black/40 border-primary/10">
                                    <CardHeader className="p-4 py-3 border-b border-border/50">
                                        <CardTitle className="text-xs font-mono text-muted-foreground">{blocks.C.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 text-[10px] font-mono text-primary/80 space-y-1">
                                        {blocks.C.keywords.map(k => <p key={k}>KEYWORD: "{k}"</p>)}
                                        <p className="mt-2">FILTER: {renderFilterBadge(websiteFilter)}</p>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card className="col-span-3 border-dashed border-muted bg-transparent">
                                <CardContent className="p-8 text-center text-muted-foreground font-mono text-sm">
                                    SELECT AN INDUSTRY TO PREVIEW PROTOCOLS
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Historical Table */}
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-mono font-bold flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    SEARCH HISTORY LOG
                                </CardTitle>
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full overflow-auto">
                                <table className="w-full text-xs font-mono">
                                    <thead className="bg-muted/50 uppercase text-[10px]">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Action</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">State</th>
                                            <th className="px-4 py-2 text-left">Industry</th>
                                            <th className="px-4 py-2 text-left">Block</th>
                                            <th className="px-4 py-2 text-left">Results</th>
                                            <th className="px-4 py-2 text-left">Mode</th>
                                            <th className="px-4 py-2 text-left">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                                    NO HISTORICAL DATA FOUND
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((h) => (
                                                <tr key={h.id} className="hover:bg-muted/30">
                                                    <td className="px-4 py-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 text-[10px] border-primary/50 text-primary hover:bg-primary/10"
                                                            onClick={() => handleViewResults(h)}
                                                        >
                                                            VIEW RESULTS
                                                        </Button>
                                                    </td>
                                                    <td className="px-4 py-2 flex items-center gap-1.5">
                                                        {getStatusIcon(h.status)}
                                                        <span className="capitalize">{h.status || 'unknown'}</span>
                                                    </td>
                                                    <td className="px-4 py-2 font-bold">{h.state}</td>
                                                    <td className="px-4 py-2">{h.industry}</td>
                                                    <td className="px-4 py-2">{h.block}</td>
                                                    <td className="px-4 py-2 text-primary font-bold">{h.count}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] ${h.mode === 'production' ? 'bg-red-950/50 text-red-500' : 'bg-green-950/50 text-green-500'}`}>
                                                            {h.mode.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground text-[10px]">
                                                        {new Date(h.timestamp).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Leads Modal */}
            {selectedHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background border-primary/20 shadow-2xl">
                        <CardHeader className="border-b border-border flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="font-mono text-lg font-bold flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-primary" />
                                    AGNOSTIC RESULT SCANNER ({leads.length} LEADS FOUND)
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                    SOURCE: {selectedHistory.block} // {selectedHistory.industry} // {selectedHistory.state}
                                </p>
                                {leads.length === 0 && (
                                    <p className="text-xs text-red-500 font-bold mt-2 animate-pulse">
                                        WARNING: NO LEADS FOUND. RUN NEW SEARCH TO POPULATE.
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedHistory(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                            <table className="w-full text-xs font-mono">
                                <thead className="bg-muted/50 uppercase text-[10px] sticky top-0 z-10 glass-panel">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Action</th>
                                        <th className="px-4 py-3 text-left">Entity Name</th>
                                        <th className="px-4 py-3 text-left">Address</th>
                                        <th className="px-4 py-3 text-left">Phone</th>
                                        <th className="px-4 py-3 text-left">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {leads.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                NO LEADS FOUND FOR THIS RUN.<br />
                                                (Note: Runs executed before the latest system update may not have accessible lead details. Please run a new search.)
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-muted/10">
                                                <td className="px-4 py-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleGeneratePackage(lead); }}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-4 shadow-md font-bold text-[10px] tracking-widest border border-indigo-400"
                                                    >
                                                        GENERATE PACKAGE
                                                    </Button>
                                                </td>
                                                <td className="px-4 py-2 font-bold text-sm">{lead.displayName?.text || 'Unknown'}</td>
                                                <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">{lead.formattedAddress}</td>
                                                <td className="px-4 py-2">{lead.nationalPhoneNumber}</td>
                                                <td className="px-4 py-2 flex items-center gap-1">
                                                    <span className="text-yellow-500 font-bold">{lead.rating}</span>
                                                    <span className="text-muted-foreground">({lead.userRatingCount})</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Generated Code Modal */}
            {isGenerating && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur">
                    <div className="text-center space-y-4 animate-pulse">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                        <h2 className="text-xl font-mono font-bold text-primary">GENERATING PACKAGE...</h2>
                        <p className="text-sm text-muted-foreground font-mono">Engaging Gemini 1.5 Flash // Semantic Architecture // JSON-LD Schema</p>
                    </div>
                </div>
            )}

            {generatedCode && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur p-4">
                    <Card className="w-full max-w-4xl h-[80vh] flex flex-col bg-background border-primary/20 shadow-2xl">
                        <CardHeader className="border-b border-border flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="font-mono text-lg font-bold text-green-500 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    PACKAGE GENERATED SUCCESSFULLY
                                </CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handlePreviewCode}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    PREVIEW IN BROWSER
                                </Button>
                                <Button size="sm" onClick={handleDownloadCode} className="bg-green-600 hover:bg-green-700">
                                    <Download className="h-4 w-4 mr-2" />
                                    DOWNLOAD CODE
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setGeneratedCode(null)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0 bg-muted/20 relative group">
                            <pre className="p-4 text-xs font-mono overflow-auto h-full text-muted-foreground w-full">
                                {generatedCode}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
