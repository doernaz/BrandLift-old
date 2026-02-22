"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Palette, PenTool, Layout, Monitor, Globe, ExternalLink, Mail, Phone, MapPin, Star } from "lucide-react"
import { UnifiedIdentity } from "@/lib/types/job"

interface IdentityProposalProps {
    identity: UnifiedIdentity
    domain: string
    liveUrl?: string
    variants?: UnifiedIdentity[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    candidate?: any
}

export function IdentityProposal({ identity, domain, liveUrl, variants, candidate }: IdentityProposalProps) {
    const finalUrl = liveUrl || `https://${domain}`
    const isReady = domain && domain.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 font-mono">

            {/* 1. Header & Tagline (HUD Style) */}
            <Card className="bg-black/80 backdrop-blur-xl border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50"></div>

                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardDescription className="text-xs text-cyan-500/70 tracking-[0.2em] mb-2 uppercase">
                                {"// Target Identity Identified"}
                            </CardDescription>
                            <CardTitle className="text-4xl font-black tracking-tight text-white uppercase group-hover:text-cyan-50 transition-colors">
                                {identity.name}
                            </CardTitle>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-cyan-500/50 flex items-center justify-center animate-pulse">
                            <div className="h-2 w-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                        </div>
                    </div>
                    <CardDescription className="text-xl text-gray-400 mt-2 border-l-2 border-cyan-500/50 pl-4 py-1 italic">
                        &quot;{identity.tagline}&quot;
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 leading-relaxed max-w-3xl">{identity.missionStatement}</p>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/30 border border-cyan-800/50 rounded text-cyan-400 text-xs uppercase tracking-wider">
                            <Monitor className="h-3 w-3" /> Digital Native
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/30 border border-purple-800/50 rounded text-purple-400 text-xs uppercase tracking-wider">
                            <PenTool className="h-3 w-3" /> {identity.voice} Voice
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Candidate Intelligence (Scraped Data) */}
            {candidate && (
                <Card className="bg-black/60 border-yellow-500/20 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-yellow-500">
                            <Globe className="h-4 w-4" /> Intercepted Comm Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-2">
                        {candidate.contactEmail && (
                            <div className="flex items-center gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/10">
                                <Mail className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase">Email Protocol</div>
                                    <div className="text-sm text-gray-300 font-mono break-all">{candidate.contactEmail}</div>
                                </div>
                            </div>
                        )}
                        {candidate.internationalPhoneNumber && (
                            <div className="flex items-center gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/10">
                                <Phone className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase">Voice Line</div>
                                    <div className="text-sm text-gray-300 font-mono">{candidate.internationalPhoneNumber}</div>
                                </div>
                            </div>
                        )}
                        {candidate.formattedAddress && (
                            <div className="flex items-center gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/10 md:col-span-2">
                                <MapPin className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase">Physical Vector</div>
                                    <div className="text-sm text-gray-300 font-mono truncate">{candidate.formattedAddress}</div>
                                </div>
                            </div>
                        )}
                        {(candidate.rating || candidate.userRatingCount) && (
                            <div className="flex items-center gap-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/10">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase">Reputation Metric</div>
                                    <div className="text-sm text-gray-300 font-mono">{candidate.rating || 'N/A'} / 5.0 ({candidate.userRatingCount || 0})</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 3. Visual DNA (Data Grid) */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Palette */}
                <Card className="bg-black/60 border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                            <Palette className="h-4 w-4" /> Chromatic Coordinates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full h-24 rounded border border-white/10 overflow-hidden">
                            {[
                                { label: 'PRI', color: identity.palette.primary },
                                { label: 'SEC', color: identity.palette.secondary },
                                { label: 'ACC', color: identity.palette.accent },
                                { label: 'SUR', color: identity.palette.surface }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex-1 flex flex-col justify-end p-2 transition-all hover:flex-[2] relative group/color cursor-crosshair"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <span className="absolute top-2 left-2 text-[8px] opacity-0 group-hover/color:opacity-100 bg-black/50 px-1 rounded text-white font-mono">
                                        {item.color}
                                    </span>
                                    <span className={`text-[10px] font-bold ${item.label === 'SUR' ? 'text-black' : 'text-white/90'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Typography */}
                <Card className="bg-black/60 border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                            <Layout className="h-4 w-4" /> Typographic Matrix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] text-cyan-500/70 uppercase">Header Font</span>
                                <p className="text-xl font-bold text-white tracking-tight">{identity.typography.headingFont}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-cyan-500/70 uppercase">Body Matrix</span>
                                <p className="text-sm text-gray-300">{identity.typography.bodyFont}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-white/10 text-xs text-gray-500 flex justify-between">
                            <span>ART DIRECTION</span>
                            <span className="text-gray-300">{identity.imageStyle}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. Deployment Interface (The "Get Results" Button) */}
            <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute -right-10 -top-10 h-32 w-32 bg-green-500/20 blur-3xl rounded-full"></div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                        <Globe className="h-5 w-5" />
                        DEPLOYMENT READY
                    </CardTitle>
                    <CardDescription className="text-green-500/60 font-mono text-xs">
                        Secure connection established. Assets provisioned on edge network.
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                    {isReady ? (
                        <a
                            href={finalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-none border border-green-500/50 bg-green-500/10 px-8 py-4 text-sm font-bold text-green-400 uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] group"
                        >
                            <span className="group-hover:translate-x-1 transition-transform">Initialize Client Dashboard</span>
                            <ExternalLink className="h-4 w-4 transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs animate-pulse">
                            Wait... Domain Provisioning in Progress
                        </div>
                    )}

                    <div className="mt-4 text-[10px] text-green-500/40 font-mono">
                        DESTINATION: {finalUrl}
                    </div>
                </CardContent>
            </Card>

            {/* 5. Variant Selectors */}
            {variants && variants.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Strategic Branch Lines
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        {variants.map((variant, i) => (
                            <a
                                key={i}
                                href={variant.variantUrl || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative p-1 rounded-sm bg-gradient-to-b from-white/10 to-transparent hover:from-purple-500/50 hover:to-blue-500/50 transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-black/90 m-[1px] rounded-sm group-hover:bg-black/80 transition-all" />
                                <div className="relative p-4 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-[10px] text-purple-400 mb-1 uppercase tracking-wider">Variant 0{i + 1}</div>
                                        <div className="font-bold text-white group-hover:text-purple-200 transition-colors">
                                            {variant.theme || `Concept ${i + 1}`}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-[10px] text-gray-500 group-hover:text-gray-300 line-clamp-2">
                                        {variant.tagline}
                                    </div>

                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
