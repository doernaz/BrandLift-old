"use client"

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Phone, CheckCircle, Grid, Cpu, Activity, Zap, Box, Terminal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UnifiedIdentity } from "@/lib/types/job"

// --- Image Generation Helper ---
// --- Image Generation Helper ---
// --- Image Generation Helper ---
const getThemeImage = (theme: string, industry: string, seed: string = '') => {
    // 1. Determine Broad Category for visual relevance
    let category = 'tech'
    if (/Home|Trade|Construction|HVAC|Plumber/i.test(industry)) category = 'trade'
    if (/Wellness|Health|Yoga|Medical|Beauty/i.test(industry)) category = 'wellness'
    if (/Legal|Law|Consulting|Finance/i.test(industry)) category = 'pro'

    // 2. Select optimized image for Theme + Category from Curated Minimalist Tech Collection
    const map: any = {
        'The Kinetic': {
            'trade': '1504917595217-d4dc5e980619', // Sparks/welding - dynamic
            'wellness': '1518609878319-a162a091a569', // Sunlight/active
            'pro': '1486406140926-c627a92ad1aa', // Abstract city motion
            'tech': '1519389950476-29a5e7e53271' // Circuitry/light
        },
        'The Essentialist': {
            'trade': '1581094794329-c8112a89af12', // Clean tools/white
            'wellness': '1545205597-3d9d02c29597', // Plant/stone
            'pro': '1497366216548-37526070297c', // Clean office
            'tech': '1460925895917-afdab827c52f' // Minimal desk
        },
        'The Architect': {
            'trade': '1504328345606-18bbc8c9d7d1', // Blueprint/structure
            'wellness': '1576426863863-1fa511858460', // Lab/Clean
            'pro': '1451187580459-43490279c0fa', // Metal grid
            'tech': '1558494949-efc68158e3f9' // Server/dark
        }
    }

    const id = map[theme]?.[category] || '1451187580459-43490279c0fa'

    // Append auto=format and quality parameters
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1920`
}

// --- Industry Artifacts Helper ---
const IndustryArtifacts = ({ industry, palette }: { industry: string, palette: any }) => {
    const isHomeServices = /Home|Trade|Construction|HVAC|Plumber|Electrician/i.test(industry)
    const isWellness = /Wellness|Health|Yoga|Spa/i.test(industry)
    const isLegal = /Legal|Law|Attorney|Consulting/i.test(industry)
    const isTech = /Tech|SaaS|IT|Software/i.test(industry)

    if (isHomeServices) {
        return (
            <div className="absolute top-8 right-8 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl"
                style={{ borderColor: palette.accent }}>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full animate-ping" style={{ backgroundColor: palette.accent }} />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Emergency Dispatch: ACTIVE</span>
                </div>
                <div className="mt-2 text-xs text-white/70">Avg. Response: 12m</div>
            </div>
        )
    }

    if (isWellness) {
        return (
            <div className="absolute top-1/2 -right-12 rotate-90 origin-left flex items-center gap-4 text-xs tracking-[0.3em] uppercase opacity-60 mix-blend-difference"
                style={{ color: palette.primary }}>
                <span>Balance</span>
                <span className="h-px w-12" style={{ backgroundColor: palette.primary }} />
                <span>Harmony</span>
            </div>
        )
    }

    if (isLegal) {
        return (
            <div className="absolute bottom-12 left-12 border-l-2 pl-4" style={{ borderColor: palette.accent }}>
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: palette.secondary }}>Confidentiality</div>
                <div className="text-sm font-serif italic" style={{ color: palette.primary }}>"Privilege Attached."</div>
            </div>
        )
    }

    // Default Tech Artifact
    return (
        <div className="absolute top-24 right-12 hidden md:block">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1 h-8 animate-pulse"
                        style={{
                            backgroundColor: palette.accent,
                            opacity: 0.2 * i,
                            animationDelay: `${i * 0.1}s`
                        }} />
                ))}
            </div>
        </div>
    )
}

interface HeroProps {
    identity: UnifiedIdentity
    industry: string
}

// --- THEME 1: "THE KINETIC" (Dynamic & Bold) ---
export const HeroKinetic = ({ identity, industry }: HeroProps) => {
    const { scrollY } = useScroll()
    const { palette } = identity

    return (
        <section className="relative min-h-screen w-full overflow-hidden flex items-center text-white"
            style={{ backgroundColor: palette.background || '#18181b' }}>
            <IndustryArtifacts industry={industry} palette={palette} />
            {/* Diagonal Background Slice */}
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url(${getThemeImage('The Kinetic', industry, identity.name)})` }} />

            <div className="absolute inset-0 z-10"
                style={{ background: `linear-gradient(to right, ${palette.background || '#000'} 0%, ${palette.background || '#000'}80 50%, transparent 100%)` }} />

            {/* Kinetic Diagonal Overlay */}
            <div className="absolute bottom-0 right-0 w-2/3 h-full skew-x-[-12deg] origin-bottom z-10 backdrop-blur-[2px]"
                style={{ backgroundColor: `${palette.surface || '#ffffff'}0D` }} />

            <div className="relative z-20 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 font-bold uppercase tracking-wider text-xs mb-6 transform -skew-x-12"
                        style={{ backgroundColor: palette.primary || '#fff', color: palette.background || '#000' }}>
                        <Zap className="h-3 w-3" /> {identity.strategy || "High Performance"}
                    </div>

                    <h1 className="text-6xl md:text-8xl font-extrabold uppercase leading-[0.9] tracking-tighter mb-6">
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(to right, ${palette.surface || '#fff'}, ${palette.primary || '#fff'}aa)` }}>
                            {identity.tagline}
                        </span>
                    </h1>

                    <div className="text-xl md:text-2xl text-white/80 max-w-lg mb-8"
                        style={{ borderLeft: `4px solid ${palette.accent || '#ef4444'}` }}>
                        <span className="pl-4 block">{identity.missionStatement}</span>
                    </div>

                    <Button size="lg" className="h-16 px-10 text-xl font-bold uppercase tracking-widest hover:-translate-y-1 transition-all"
                        style={{ backgroundColor: palette.primary || '#fff', color: palette.background || '#000' }}>
                        Initiate <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}

// --- THEME 2: "THE ESSENTIALIST" (Zen & Minimalist) ---
export const HeroEssentialist = ({ identity, industry }: HeroProps) => {
    const { palette } = identity

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center p-6 md:p-12 font-serif"
            style={{ backgroundColor: palette.background || '#fafaf9', color: palette.primary || '#1c1917' }}>
            <IndustryArtifacts industry={industry} palette={palette} />
            {/* Thin Border Frame */}
            <div className="absolute inset-4 md:inset-8 border-[0.5px] pointer-events-none z-20"
                style={{ borderColor: palette.secondary || '#d6d3d1' }} />

            <div className="max-w-4xl mx-auto text-center z-10">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: 'easeOut' }}>
                    <div className="mx-auto h-px w-24 mb-8" style={{ backgroundColor: palette.primary || '#1c1917' }} />

                    <h1 className="text-5xl md:text-7xl font-serif font-light mb-8 leading-tight tracking-wide"
                        style={{ color: palette.primary || '#1c1917' }}>
                        {identity.tagline}
                    </h1>

                    <div className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed italic"
                        style={{ color: palette.secondary || '#57534e' }}>
                        {identity.missionStatement}
                    </div>

                    <div className="flex justify-center gap-8">
                        <Button variant="outline" className="h-14 px-8 border-[0.5px] rounded-none uppercase text-sm tracking-[0.2em] transition-colors font-sans"
                            style={{
                                borderColor: palette.primary || '#1c1917',
                                color: palette.primary || '#1c1917',
                                backgroundColor: 'transparent'
                            }}>
                            Discover
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Soft Background Image (Very Low Opacity) */}
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-multiply pointer-events-none"
                style={{ backgroundImage: `url(${getThemeImage('The Essentialist', industry, identity.name)})`, backgroundSize: 'cover' }} />
        </section>
    )
}

// --- THEME 3: "THE ARCHITECT" (Structured & Tech-Forward) ---
export const HeroArchitect = ({ identity, industry }: HeroProps) => {
    const { palette } = identity

    return (
        <section className="relative min-h-screen w-full font-mono overflow-hidden"
            style={{ backgroundColor: palette.background || '#020617', color: palette.surface || '#f1f5f9' }}>
            <IndustryArtifacts industry={industry} palette={palette} />
            {/* Grid Background */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, ${palette.secondary || '#1e293b'} 1px, transparent 1px), linear-gradient(to bottom, ${palette.secondary || '#1e293b'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                opacity: 0.2
            }} />

            <div className="container mx-auto px-6 py-24 relative z-10 grid grid-cols-12 gap-6 h-full items-center">
                {/* Data Column */}
                <div className="col-span-12 md:col-span-3 border-r h-full pt-12 hidden md:block"
                    style={{ borderColor: palette.secondary || '#1e293b' }}>
                    <div className="space-y-6 text-xs" style={{ color: palette.surface || '#94a3b8' }}>
                        <div className="p-4 border bg-opacity-50" style={{ borderColor: palette.secondary || '#1e293b', backgroundColor: `${palette.background}80` }}>
                            <div className="mb-2 opacity-70">SEO_SCORE</div>
                            <div className="text-2xl font-bold" style={{ color: palette.accent || '#4ade80' }}>{identity.seoScore || 92} / 100</div>
                        </div>
                        <div className="p-4 border bg-opacity-50" style={{ borderColor: palette.secondary || '#1e293b', backgroundColor: `${palette.background}80` }}>
                            <div className="mb-2 opacity-70">STATUS</div>
                            <div className="flex items-center gap-2" style={{ color: palette.primary || '#60a5fa' }}>
                                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: palette.primary || '#60a5fa' }} /> OPERATIONAL
                            </div>
                        </div>
                        <div className="p-4 border bg-opacity-50 mt-12" style={{ borderColor: palette.secondary || '#1e293b', backgroundColor: `${palette.background}80` }}>
                            <Terminal className="h-4 w-4 mb-2 opacity-70" />
                            <div className="font-mono text-xs whitespace-pre-wrap" style={{ color: palette.primary || '#60a5fa' }}>
                                {`> INITIATING_PROTOCOL
> LOADING_ASSETS...
> SYSTEM_READY`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 md:col-span-9 pl-0 md:pl-12 pt-12">
                    <div className="mb-4 text-xs tracking-widest border-b w-fit pb-1"
                        style={{ borderColor: palette.secondary || '#1e293b', color: palette.surface || '#64748b' }}>
                        PROJECT: {identity.name.toUpperCase()}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
                        <span className="mr-2" style={{ color: palette.primary || '#3b82f6' }}>{'>'}</span>{identity.tagline}
                    </h1>

                    <div className="grid md:grid-cols-2 gap-12 mt-12">
                        <div className="p-6 border relative group backdrop-blur-sm transition-colors hover:border-opacity-100"
                            style={{
                                borderColor: palette.secondary || '#1e293b',
                                backgroundColor: `${palette.background}60`
                            }}>
                            {/* Technical Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: palette.primary || '#3b82f6' }} />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: palette.primary || '#3b82f6' }} />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: palette.primary || '#3b82f6' }} />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: palette.primary || '#3b82f6' }} />

                            <h3 className="text-xs mb-2 uppercase tracking-wider" style={{ color: palette.accent || '#94a3b8' }}>[STRATEGY_VECTOR]</h3>
                            <p className="leading-relaxed text-sm font-light" style={{ color: palette.surface || '#cbd5e1' }}>
                                {identity.missionStatement}
                            </p>
                        </div>

                        <div className="flex flex-col justify-end">
                            <Button className="w-full h-14 rounded-none border font-mono text-sm tracking-widest uppercase shadow-lg hover:brightness-110 transistion-all"
                                style={{
                                    backgroundColor: palette.primary || '#2563eb',
                                    borderColor: palette.accent || '#60a5fa',
                                    color: '#ffffff',
                                    boxShadow: `0 0 20px ${palette.primary}40`
                                }}>
                                [ DEPLOY_SOLUTION ]
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// --- Main Hero Controller ---
export const IdentityHero = ({ identity, industry = "Service" }: HeroProps) => {
    const theme = identity.theme || 'default'

    // Direct mapping to new themes
    if (theme === 'The Kinetic') return <HeroKinetic identity={identity} industry={industry} />
    if (theme === 'The Essentialist') return <HeroEssentialist identity={identity} industry={industry} />
    if (theme === 'The Architect') return <HeroArchitect identity={identity} industry={industry} />

    // Fallbacks for transitional states or older data
    if (theme.includes('Specialist') || theme.includes('Tech')) return <HeroArchitect identity={identity} industry={industry} />
    if (theme.includes('Innovator') || theme.includes('Disruptor')) return <HeroKinetic identity={identity} industry={industry} />
    if (theme.includes('Regional') || theme.includes('Modernist')) return <HeroEssentialist identity={identity} industry={industry} />

    return <HeroKinetic identity={identity} industry={industry} />
}
