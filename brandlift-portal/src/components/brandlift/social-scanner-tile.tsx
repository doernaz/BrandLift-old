
"use client"

import * as React from "react"
import { Search, Loader2, Linkedin, Instagram, Facebook, Users, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// Ensure imports work. If strict path fails, we can inline or use absolute.
// But "@/lib/data/scanner-options" is correct from previous context.
import { INDUSTRIES, US_STATES } from "@/lib/data/scanner-options"

// Minimalist Tech aesthetic: #0A0A0B, Inter font, sharp corners
const TECH_BG = "bg-[#0A0A0B]"
const TECH_BORDER = "border-zinc-800"
const TECH_TEXT_PRIMARY = "text-zinc-100"

const CHANNELS = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: Users, color: 'text-zinc-100' },
]

export function SocialScannerTile() {
    const [selectedChannels, setSelectedChannels] = React.useState<string[]>(['linkedin', 'instagram'])
    const [scanDepth, setScanDepth] = React.useState(50)
    const [filters, setFilters] = React.useState({
        activityGap: true,
        visualDelta: false,
        linkIntegrity: true,
        founderVerification: true
    })

    // Updated State for Selects
    const [industry, setIndustry] = React.useState("")
    const [state, setState] = React.useState("")

    const [isScanning, setIsScanning] = React.useState(false)
    const [scanResults, setScanResults] = React.useState<any[] | null>(null)
    const [debugLog, setDebugLog] = React.useState<string[]>([])

    const addLog = (msg: string) => {
        console.log(msg)
        setDebugLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} ${msg}`])
    }

    const toggleChannel = (id: string) => {
        setSelectedChannels(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleScan = async () => {
        addLog(`[INIT] Scanning... Ind:${industry} St:${state} Depth:${scanDepth}`)

        if (!industry || !state) {
            alert("Please select both Industry and State.")
            addLog("[ERROR] Missing inputs")
            return
        }

        setIsScanning(true)
        setScanResults(null)

        try {
            // REMOVED DELAY FOR DEBUGGING
            // await new Promise(resolve => setTimeout(resolve, 2500))

            addLog("[PROCESS] Executing Generation Logic...")

            // Ensure we generate results even if scanDepth is low
            const resultCount = Math.max(5, Math.floor(scanDepth / 5))
            addLog(`[PROCESS] Generating ${resultCount} items...`)

            const mockResults = Array.from({ length: resultCount }).map((_, i) => {
                const platform = selectedChannels.length > 0
                    ? selectedChannels[i % selectedChannels.length]
                    : CHANNELS[i % CHANNELS.length].id

                return {
                    id: i,
                    name: `${industry} Pro ${i + 1}`,
                    platform: platform,
                    handle: `@${industry.toLowerCase().replace(/\s/g, '').replace(/[&]/g, '')}_${state.toLowerCase()}_${i}`,
                    followers: Math.floor(Math.random() * 5000) + 500,
                    lastPost: Math.floor(Math.random() * 120),
                    engagement: (Math.random() * 5).toFixed(1),
                    bioLink: Math.random() > 0.5 ? null : `http://linktr.ee/${i}`,
                    status: Math.random() > 0.7 ? 'CRITICAL_GAP' : 'STABLE'
                }
            })

            addLog(`[SUCCESS] Generated ${mockResults.length} items.`)
            setScanResults(mockResults)
        } catch (error) {
            addLog(`[FATAL] Error: ${error}`)
            alert("Scan Failed due to an internal error.")
        } finally {
            setIsScanning(false)
            addLog("[DONE] Scan Complete.")
        }
    }

    return (
        <div className={cn("w-full max-w-4xl mx-auto font-sans antialiased text-sm", TECH_BG, "text-zinc-300 rounded-none border", TECH_BORDER)}>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div className="space-y-1">
                    <h2 className={cn("text-lg font-bold tracking-tight uppercase flex items-center gap-2", TECH_TEXT_PRIMARY)}>
                        <Search className="w-5 h-5 text-zinc-400" />
                        Social Source Scanner <span className="text-red-500 text-xs ml-2">[DEBUG MODE v2]</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono">SIGNAL_DISCOVERY_MODULE // AUTHORITY_GAP_DETECTION</p>
                </div>
                <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800 rounded-none px-3 py-1 font-mono text-xs">
                    {isScanning ? <span className="flex items-center gap-2 text-yellow-500"><Loader2 className="w-3 h-3 animate-spin" /> SCANNING...</span> : "STATUS: READY"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 min-h-[400px]">

                {/* Configuration Panel (Left) */}
                <div className="lg:col-span-1 p-6 space-y-8 bg-zinc-950/30">

                    {/* Channel Selection */}
                    <div className="space-y-4">
                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Vectors</Label>
                        <div className="flex gap-2">
                            {CHANNELS.map(channel => {
                                const active = selectedChannels.includes(channel.id)
                                const Icon = channel.icon
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => toggleChannel(channel.id)}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center border transition-all duration-200",
                                            active ? "bg-zinc-900 border-zinc-600 text-white" : "bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700"
                                        )}
                                        title={channel.name}
                                    >
                                        <Icon className={cn("w-5 h-5", active && channel.color)} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Target Inputs replaced with Selects */}
                    <div className="space-y-4">
                        <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Search Syntax</Label>
                        <div className="space-y-2">
                            {/* Industry Select */}
                            <select
                                aria-label="Select Industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 placeholder:text-zinc-700 rounded-none focus:border-zinc-600 h-9 text-xs px-2 appearance-none cursor-pointer hover:border-zinc-700"
                            >
                                <option value="" disabled className="text-zinc-500">Select Industry</option>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind} value={ind} className="bg-zinc-950 text-zinc-300">{ind}</option>
                                ))}
                            </select>

                            {/* State Select */}
                            <select
                                aria-label="Select State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 placeholder:text-zinc-700 rounded-none focus:border-zinc-600 h-9 text-xs px-2 appearance-none cursor-pointer hover:border-zinc-700"
                            >
                                <option value="" disabled className="text-zinc-500">Select State</option>
                                {US_STATES.map(st => (
                                    <option key={st.value} value={st.value} className="bg-zinc-950 text-zinc-300">{st.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Scan Depth Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <Label className="font-bold text-zinc-500 uppercase tracking-widest">Scan Depth</Label>
                            <span className="font-mono text-zinc-400">{scanDepth}%</span>
                        </div>
                        <input
                            type="range"
                            min="10" max="100"
                            value={scanDepth}
                            onChange={(e) => setScanDepth(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:rounded-none hover:[&::-webkit-slider-thumb]:bg-white transition-all"
                        />
                        <p className="text-[10px] text-zinc-600">Deep scan increases latency. Max results: {scanDepth}.</p>
                    </div>

                    {/* Action Button */}
                    <Button
                        type="button"
                        onClick={handleScan}
                        disabled={!industry || !state || isScanning}
                        className="w-full bg-zinc-100 text-zinc-950 hover:bg-white rounded-none font-bold tracking-widest h-10 text-xs border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "INITIATE SEQUENCE"}
                    </Button>

                    {/* Debug Log Area */}
                    <div className="mt-4 p-2 bg-black border border-zinc-800 h-24 overflow-y-auto font-mono text-[10px] text-green-500/80">
                        {debugLog.length === 0 ? <span className="text-zinc-700 opacity-50">// System Logs...</span> : debugLog.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>

                {/* Logic & Results Panel (Right) */}
                <div className="lg:col-span-2 flex flex-col">

                    {/* Logic Gates (Top Bar) */}
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase">Activity Gap</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={filters.activityGap}
                                        onCheckedChange={(c) => setFilters(prev => ({ ...prev, activityGap: c }))}
                                        className="scale-75 origin-left data-[state=checked]:bg-zinc-200"
                                    />
                                    <span className="text-xs font-mono text-zinc-400">{filters.activityGap ? "> 90 DAYS" : "OFF"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase">Visual Delta</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={filters.visualDelta}
                                        onCheckedChange={(c) => setFilters(prev => ({ ...prev, visualDelta: c }))}
                                        className="scale-75 origin-left data-[state=checked]:bg-zinc-200"
                                    />
                                    <span className="text-xs font-mono text-zinc-400">{filters.visualDelta ? "HIGH_FOL/LOW_ENG" : "OFF"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase">Link Integrity</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={filters.linkIntegrity}
                                        onCheckedChange={(c) => setFilters(prev => ({ ...prev, linkIntegrity: c }))}
                                        className="scale-75 origin-left data-[state=checked]:bg-zinc-200"
                                    />
                                    <span className="text-xs font-mono text-zinc-400">{filters.linkIntegrity ? "NULL/INSECURE" : "OFF"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-bold text-zinc-500 uppercase">Founder Verify</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={filters.founderVerification}
                                        onCheckedChange={(c) => setFilters(prev => ({ ...prev, founderVerification: c }))}
                                        className="scale-75 origin-left data-[state=checked]:bg-zinc-200"
                                    />
                                    <span className="text-xs font-mono text-zinc-400">{filters.founderVerification ? "EXEC_ONLY" : "OFF"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Stream / Results Area */}
                    <div className="flex-1 bg-black/40 p-0 overflow-hidden relative">
                        {!scanResults && !isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 pointer-events-none p-8 text-center">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-mono text-sm">AWAITING TARGET VECTORS</p>
                                <p className="text-xs mt-2 max-w-sm">Configure scan parameters on the left to initialize the Social Signal Scanner.</p>
                            </div>
                        )}

                        {isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
                                <div className="w-64 h-1 bg-zinc-800 rounded-none overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-zinc-200 animate-[shimmer_1s_infinite_linear]" />
                                </div>
                                <p className="mt-4 font-mono text-xs text-zinc-400 animate-pulse">DECRYPTING SOCIAL GRAPHS...</p>
                                <p className="text-[10px] text-zinc-500 font-mono mt-2">Targeting: {industry} in {state}...</p>
                            </div>
                        )}

                        {scanResults && (
                            <div className="h-full overflow-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-900/50 text-zinc-500 font-mono uppercase text-[10px] sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="p-4 font-medium tracking-wider">Identity</th>
                                            <th className="p-4 font-medium tracking-wider">Reach</th>
                                            <th className="p-4 font-medium tracking-wider">Health</th>
                                            <th className="p-4 font-medium tracking-wider text-right">Signal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {scanResults.map((result) => (
                                            <tr key={result.id} className="hover:bg-zinc-900/30 transition-colors group cursor-pointer">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-8 h-8 flex items-center justify-center rounded-none bg-zinc-900 text-zinc-500 border border-zinc-800 group-hover:bg-zinc-800", result.platform === 'instagram' ? 'group-hover:text-pink-500' : 'group-hover:text-blue-500')}>
                                                            {result.platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                                                            {result.platform === 'instagram' && <Instagram className="w-4 h-4" />}
                                                            {result.platform === 'facebook' && <Facebook className="w-4 h-4" />}
                                                            {result.platform === 'tiktok' && <Users className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-zinc-300">{result.name}</div>
                                                            <div className="font-mono text-[10px] text-zinc-600">{result.handle}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-zinc-400">
                                                    <div>{result.followers.toLocaleString()} fol.</div>
                                                    <div className="text-[10px] text-zinc-600">Active: {result.lastPost}d ago</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            <TrendingUp className="w-3 h-3 text-zinc-600" />
                                                            <span className={Number(result.engagement) < 1.0 ? "text-red-500" : "text-zinc-400"}>{result.engagement}% Eng.</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px]">
                                                            {result.bioLink ? (
                                                                <span className="text-green-500/50 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {result.bioLink}</span>
                                                            ) : (
                                                                <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> LINK MISSING</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Badge variant="outline" className={cn("rounded-none font-mono text-[10px] border", result.status === 'CRITICAL_GAP' ? "bg-red-950/20 text-red-500 border-red-900/50" : "bg-zinc-900 text-zinc-600 border-zinc-800")}>
                                                        {result.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="border-t border-zinc-800 p-2 px-6 bg-zinc-950 text-[10px] font-mono text-zinc-600 flex justify-between items-center">
                <span>SYSTEM: READY</span>
                <span>SECURE_CONNECTION: ENCRYPTED // NODE_48</span>
            </div>
        </div>
    )
}
