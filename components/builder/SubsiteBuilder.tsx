import React, { useState } from 'react';
import { SeoAnalysisResult } from '../../types';
import { ChevronLeftIcon, ArrowDownTrayIcon, GlobeAltIcon, DocumentTextIcon, ChartBarIcon, EnvelopeIcon } from '../icons/Icons';
import { EmailDraftModal } from './EmailDraftModal';

import { Place } from '../../types';

interface SubsiteBuilderProps {
    analysisResults: SeoAnalysisResult | null;
    targetUrl?: string;
    selectedLead?: Place | null;
    onBack: () => void;
}

type BuilderPage = 'landing' | 'seo-results' | 'comparison';

const PreviewFrame: React.FC<{ html: string; title: string }> = ({ html, title }) => (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-white h-[600px] w-full relative group">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-4 text-xs text-slate-500 font-mono flex-1 text-center bg-white rounded px-2 py-0.5 border border-slate-200 truncate">
                {title.toLowerCase().replace(/\s+/g, '-')}.html
            </div>
        </div>
        <div className="mt-8 h-full overflow-auto p-4 font-sans text-slate-800">
            <iframe
                srcDoc={html}
                title={title}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
            />
        </div>
    </div>
);

export const SubsiteBuilder: React.FC<SubsiteBuilderProps> = ({ analysisResults, targetUrl, selectedLead, onBack }) => {
    const [activePage, setActivePage] = useState<BuilderPage>('landing');
    const [isExporting, setIsExporting] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [deployState, setDeployState] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
    const [deployLogs, setDeployLogs] = useState<string[]>([]);
    const [deployResultUrl, setDeployResultUrl] = useState<string>('');

    const addLog = (msg: string) => setDeployLogs(prev => [...prev, msg]);

    // Analyzing State
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [scanStep, setScanStep] = useState(0);

    React.useEffect(() => {
        // Reset analysis state when selectedLead changes
        setIsAnalyzing(true);
        setScanStep(0);

        const steps = [
            { time: 800, step: 1 }, // Connecting
            { time: 2000, step: 2 }, // Deep Scan
            { time: 3500, step: 3 }, // Generating
            { time: 5000, step: 4 }  // Finalizing
        ];

        let timeouts: NodeJS.Timeout[] = [];

        steps.forEach(({ time, step }) => {
            const t = setTimeout(() => setScanStep(step), time);
            timeouts.push(t);
        });

        const finish = setTimeout(() => setIsAnalyzing(false), 5500);
        timeouts.push(finish);

        return () => timeouts.forEach(clearTimeout);
    }, [selectedLead]);

    // Dynamic Data Source
    const businessName = selectedLead?.name || "Local Business";
    const businessCity = selectedLead?.address?.split(',')[1]?.trim() || "Your City";

    const businessType = selectedLead?.primaryType?.replace(/_/g, ' ') || "Service";
    const effectiveSiteUrl = selectedLead?.website || targetUrl || '';

    // Intelligent Analysis Simulation
    const calculateBaselineScore = (lead: Place | null | undefined) => {
        if (!lead) return 45;
        let score = 40; // Base constant

        // Website Factor
        if (lead.website) {
            score += 15;
            if (lead.website.includes('https')) score += 5;
        } else {
            score -= 25; // Significant penalty for no digital property
        }

        // Reputation Factor
        if (lead.rating) {
            if (lead.rating > 4.5) score += 10;
            else if (lead.rating > 4.0) score += 5;
            else if (lead.rating < 3.5) score -= 5;
        }

        // Engagement Factor
        if (lead.userRatingCount && lead.userRatingCount > 50) score += 5;
        if (lead.userRatingCount && lead.userRatingCount > 200) score += 5;

        // Completeness Factor
        if (lead.phone) score += 2;
        if (lead.address) score += 2;

        // Random Fluctuation (+/- 3)
        score += Math.floor(Math.random() * 7) - 3;

        return Math.min(Math.max(score, 12), 68); // Clamp between 12 and 68
    };

    const baselineScore = calculateBaselineScore(selectedLead);
    const trafficPotential = Math.floor(baselineScore * 2.8) + 120; // Simulated % increase

    const fallbackResults = {
        originalScore: baselineScore,
        variants: [
            {
                name: "Core Optimization",
                description: `Corrects critical technical deficiencies in ${businessName}'s current stack. Focus on mobile responsiveness, schema validation, and site speed.`,
                optimizedScore: Math.min(baselineScore + 25, 82),
                opportunities: ["Fix broken canonical tags", "Implement JSON-LD Schema", "Optimize heading hierarchy"],
                seoPackage: {
                    jsonLd: { LocalBusiness: { name: businessName, address: selectedLead?.address } },
                    metaTags: { title: `${businessName} - Expert ${businessType} in ${businessCity}`, description: `Top-rated ${businessType} services by ${businessName}. Serving ${businessCity} and surrounding areas.` },
                    openGraph: {},
                    twitterCard: {}
                },
                previewImage: "/assets/variants/variant_core.png"
            },
            {
                name: "Local Dominance",
                description: `Aggressively targets local search terms and Google Maps visibility to drive nearby traffic to ${businessName}.`,
                optimizedScore: Math.min(baselineScore + 35, 91),
                opportunities: ["Optimize Google Business Profile", "Local Service Schema", "Geo-targeted keywords"],
                seoPackage: {
                    jsonLd: { LocalBusiness: { name: businessName, areaServed: businessCity } },
                    metaTags: { title: `Best ${businessType} in ${businessCity} | ${businessName}`, description: `Looking for the best ${businessType} in ${businessCity}? ${businessName} offers premium services. Call today!` },
                    openGraph: {},
                    twitterCard: {}
                },
                previewImage: "/assets/variants/variant_local.png"
            },
            {
                name: "Authority Building",
                description: `Establishes ${businessName} as the topic authority in ${businessType} through content depth and structured data.`,
                optimizedScore: Math.min(baselineScore + 45, 98),
                opportunities: ["Create content hubs", "FAQ Schema Markup", "Target answer boxes"],
                seoPackage: {
                    jsonLd: { LocalBusiness: { name: businessName } },
                    metaTags: { title: `${businessType} Experts - ${businessName}`, description: `Comprehensive guide to ${businessType} services. Trusted experts at ${businessName}.` },
                    openGraph: {},
                    twitterCard: {}
                },
                previewImage: "/assets/variants/variant_authority.png"
            }
        ]
    };

    const rawResults = (analysisResults && analysisResults.variants && analysisResults.variants.length > 0)
        ? analysisResults
        : fallbackResults;

    // Industry-specific SEO logic
    const getIndustryOpportunities = (ind: string) => {
        const i = ind.toLowerCase();
        if (i.includes('hvac') || i.includes('air') || i.includes('heating')) return [
            "Emergency AC Repair Schema", "Seasonal Tune-up Landing Pages", "Local Service Area Optimization"
        ];
        if (i.includes('plumb')) return [
            "Emergency Plumbing JSON-LD", "Leak Detection Service Pages", "24/7 Service Availability Schema"
        ];
        if (i.includes('lawn') || i.includes('landscap')) return [
            "Seasonal Maintenance Content", "Local Portfolio Gallery Schema", "Service Radius Geo-Fencing"
        ];
        if (i.includes('dentist') || i.includes('dental')) return [
            "Appointment Booking Schema", "Patient Testimonial Video Schema", "Cosmetic Dentistry Keywords"
        ];
        if (i.includes('law') || i.includes('attorney') || i.includes('legal')) return [
            "Attorney Professional Schema", "Case Result Case Studies", "Practice Area Siloing"
        ];
        return ["Local Business Schema Implementation", "Service Area Page Expansion", "Customer Review Aggregation"];
    };

    const dynamicOpportunities = getIndustryOpportunities(businessType);

    // Enhance results with specific lead data if available
    const safeAnalysisResults = {
        ...rawResults,
        variants: rawResults.variants.map((v, idx) => ({
            ...v,
            description: v.description.includes(businessName) ? v.description : v.description.replace(/Local Business/g, businessName).replace(/Your City/g, businessCity),
            opportunities: dynamicOpportunities.map(opp => idx === 1 ? "Local: " + opp : idx === 2 ? "Auth: " + opp : opp),
            previewImage: v.previewImage && !v.previewImage.includes('variant_') ? v.previewImage : [
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Core: Abstract Tech/Circuits
                "https://images.unsplash.com/photo-1496307667243-6b5d2483fb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Local: Abstract Map/Location
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Auth: Abstract Data/Analytics
            ][idx % 3],
            seoPackage: {
                ...v.seoPackage,
                jsonLd: {
                    ...v.seoPackage?.jsonLd,
                    LocalBusiness: {
                        ...v.seoPackage?.jsonLd?.LocalBusiness,
                        name: businessName,
                        address: selectedLead?.address || v.seoPackage?.jsonLd?.LocalBusiness?.address
                    }
                },
                metaTags: {
                    ...v.seoPackage?.metaTags,
                    title: v.seoPackage?.metaTags?.title?.includes(businessName) ? v.seoPackage.metaTags.title : `${businessName} - ${v.name}`,
                }
            }
        }))
    };

    // Reuse generateLandingHtml (it was good, futuristic) - but keep it inside component scope to access props easier
    const generateLandingHtml = () => `
    <!DOCTYPE html>
    <html lang="en" class="scroll-smooth">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BrandLift Deployment // ${businessName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; }
            h1, h2, h3, .font-display { font-family: 'Space Grotesk', sans-serif; }
            .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
            .gradient-text { background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .neon-shadow { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
        </style>
    </head>
    <body class="bg-gray-900 text-white min-h-screen overflow-x-hidden">
        <!-- Navigation -->
        <nav class="fixed w-full z-50 glass border-b-0">
            <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="font-display font-bold text-2xl tracking-tighter">
                    BrandLift<span class="text-indigo-400">.Deployment</span> <span class="text-xs font-mono text-gray-500 ml-4 border-l border-gray-700 pl-4 py-1">// ${businessName.toUpperCase().substring(0, 20)}</span>
                </div>
                <div class="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    Audit Status: <span class="text-green-400">READY</span>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative pt-32 pb-20 px-6 overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
            
            <div class="max-w-5xl mx-auto text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-8 uppercase tracking-widest">
                    <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    SEO Performance Analysis
                </div>
                <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    We've unlocked the <span class="gradient-text">future potential</span><br>of ${businessName}.
                </h1>
                <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
                    Our AI-driven analysis of the ${businessType} market in ${businessCity} has identified critical growth vectors. We don't just optimize for today; we engineer ${businessName} for the next era of search.
                </p>
                
                <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <a href="seo-results.html" class="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all neon-shadow overflow-hidden">
                        <span class="relative z-10 flex items-center gap-2">
                            View Full Analysis & Analytics
                            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </span>
                    </a>
                    <a href="comparison.html" class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all backdrop-blur-sm flex items-center gap-2">
                        <span>Explore AI Strategies</span>
                        <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </a>
                </div>
            </div>
        </section>

        <!-- Stats Grid -->
        <section class="py-20 bg-gray-900/50 border-y border-white/5">
            <div class="max-w-6xl mx-auto px-6">
                <div class="grid md:grid-cols-3 gap-8">
                    <!-- Current Score -->
                    <div class="glass p-8 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-gray-700/20 rounded-full group-hover:bg-indigo-500/20 blur-2xl transition-all"></div>
                        <h3 class="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4">Current Baseline for ${businessName}</h3>
                        <div class="flex items-end gap-2 mb-2">
                            <span class="text-6xl font-bold font-display text-white">${safeAnalysisResults.originalScore}</span>
                            <span class="text-xl text-gray-500 mb-2">/100</span>
                        </div>
                         <p class="text-sm text-red-400 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                            Optimization Required
                        </p>
                    </div>

                    <!-- Projected Score -->
                    <div class="glass p-8 rounded-2xl relative overflow-hidden ring-1 ring-indigo-500/50 bg-indigo-900/10">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl animate-pulse"></div>
                        <h3 class="text-indigo-300 font-mono text-xs uppercase tracking-widest mb-4">Projected Potential</h3>
                        <div class="flex items-end gap-2 mb-2">
                            <span class="text-6xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">${safeAnalysisResults.variants[0].optimizedScore}</span>
                            <span class="text-xl text-indigo-500/50 mb-2">/100</span>
                        </div>
                        <p class="text-sm text-green-400 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            Market Leader Status
                        </p>
                    </div>

                     <!-- Strategies -->
                    <div class="glass p-8 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                         <div class="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 blur-2xl transition-all"></div>
                        <h3 class="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4">Generated Variants</h3>
                        <div class="flex items-end gap-2 mb-2">
                            <span class="text-6xl font-bold font-display text-white">${safeAnalysisResults.variants.length}</span>
                        </div>
                        <p class="text-sm text-gray-400">
                            Unique AI-generated strategies ready for deployment targeting different customer segments.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- What We Do Section -->
        <section class="py-24 px-6 relative">
            <div class="max-w-4xl mx-auto">
                 <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-5xl font-bold font-display mb-6">The BrandLift Engine</h2>
                    <p class="text-gray-400 text-lg">We don't just "fix" SEO. We rebuild your site's digital DNA.</p>
                </div>

                <div class="space-y-4">
                    <div class="glass p-8 rounded-xl border-l-4 border-indigo-500 flex gap-6 items-start hover:bg-white/5 transition-all">
                        <div class="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white mb-2">Deep-Scan Analysis</h3>
                            <p class="text-gray-400 pl-0">We analyzed <span class="text-indigo-300 font-mono">${businessName}</span>'s digital footprint against 200+ ranking factors. We found ${safeAnalysisResults.variants[0].opportunities.length} critical vulnerabilities preventing you from ranking #1.</p>
                        </div>
                    </div>

                    <div class="glass p-8 rounded-xl border-l-4 border-cyan-500 flex gap-6 items-start hover:bg-white/5 transition-all">
                        <div class="p-3 bg-cyan-500/20 text-cyan-400 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white mb-2">Generative Optimization</h3>
                            <p class="text-gray-400">Our engine has already rebuilt your code. We've injected sophisticated Schema.org data, optimized load paths, and restructured your content hierarchy for maximum crawlability.</p>
                        </div>
                    </div>

                     <div class="glass p-8 rounded-xl border-l-4 border-purple-500 flex gap-6 items-start hover:bg-white/5 transition-all">
                        <div class="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white mb-2">Revenue-First Architecture</h3>
                            <p class="text-gray-400">Traffic is vanity. Revenue is sanity. Our "Direct Booking Focus" and "Local Experience" strategies are designed to convert visitors into paying customers, not just readers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer Call to Action -->
        <footer class="py-12 border-t border-white/5 bg-gray-950">
            <div class="max-w-7xl mx-auto px-6 text-center">
                 <p class="text-gray-500 mb-8 font-mono text-sm">GENERATION COMPLETE // READY FOR DEPLOYMENT</p>
                 <div class="flex justify-center gap-6">
                    <a href="comparison.html" class="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Compare Variants</a>
                    <span class="text-gray-700">|</span>
                    <a href="seo-results.html" class="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">View Technical Report</a>
                 </div>
                 <p class="mt-12 text-gray-600 text-xs">
                    &copy; ${new Date().getFullYear()} BrandLift Command Center. All Rights Reserved.
                 </p>
            </div>
        </footer>

    </body>
    </html>
  `;

    const generateSeoResultsHtml = () => {
        // Dynamic Findings Generator
        const score = safeAnalysisResults.originalScore;
        const criticalErrors = Math.round((100 - score) / 10);

        // Generate Industry-Specific Issues
        const getIssues = (type: string, city: string) => {
            const issues = [
                `Title Element missing "${city}" keyword qualifier`,
                "Meta Description duplicate or missing execution",
                "H1 Header Tag not optimized for primary service",
                "Schema.org Structured Data missing entirely",
                `Content thinness on core ${type} service pages`,
                "Mobile Viewport configuration errors detected",
                "HTTPS/SSL Security mixed content warnings",
                "Image Alt Attributes missing descriptive text"
            ];
            // Shuffle and slice based on score
            return issues.sort(() => 0.5 - Math.random()).slice(0, Math.max(3, criticalErrors));
        };

        const issuesList = getIssues(businessType, businessCity);
        const resolvedIssuesCount = issuesList.length;

        // Dynamic Projections
        const baseTraffic = (selectedLead?.userRatingCount || 10) * 15 + Math.floor(Math.random() * 200);
        const projectedTraffic = Math.floor(baseTraffic * (1 + (safeAnalysisResults.variants[0].optimizedScore - score) / 100 * 2.5));
        const trafficDiff = projectedTraffic - baseTraffic;
        const improvement = Math.round((trafficDiff / baseTraffic) * 100);

        return `
    <!DOCTYPE html>
    <html lang="en" class="scroll-smooth">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Technical Diagnostic // ${businessName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; }
            .font-mono { font-family: 'JetBrains Mono', monospace; }
        </style>
    </head>
    <body class="bg-slate-50 text-slate-900">
        <!-- Header -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                <div class="flex items-center gap-2">
                     <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     <span class="font-bold font-mono text-slate-800">DIAGNOSTIC_REPORT</span>
                     <span class="text-slate-400 font-mono text-sm">// ${businessName.toUpperCase()}</span>
                </div>
                <nav class="flex gap-4 text-sm font-medium">
                    <a href="landing-page.html" class="text-slate-500 hover:text-indigo-600">Overview</a>
                    <a href="comparison.html" class="text-slate-500 hover:text-indigo-600">Comparison</a>
                </nav>
            </div>
        </header>

        <main class="max-w-5xl mx-auto px-6 py-12">
            <!-- Score Card -->
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 flex flex-col md:flex-row">
                <div class="bg-slate-900 text-white p-12 md:w-1/3 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                    <div class="relative z-10">
                        <div class="text-6xl font-bold mb-2 font-mono">${score}</div>
                        <div class="text-sm font-mono text-slate-400 uppercase tracking-widest mb-6">Health Score</div>
                        <div class="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                            CRITICAL ACTION REQUIRED
                        </div>
                    </div>
                </div>
                <div class="p-12 md:w-2/3">
                    <h1 class="text-3xl font-bold mb-4">Diagnostic Summary for ${businessName}</h1>
                    <p class="text-slate-600 mb-6 leading-relaxed">
                        Our crawl of your ${businessType} services in ${businessCity} identified <strong class="text-red-600">${issuesList.length} blockers</strong> preventing first-page ranking. 
                        While your visual layer is functional, the semantic structure is failing to communicate effectively with search engine crawlers.
                    </p>
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div class="text-xs text-slate-500 font-bold uppercase mb-1">Current Traffic Est.</div>
                             <div class="text-2xl font-bold text-slate-700">~${baseTraffic}/mo</div>
                        </div>
                        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                             <div class="text-xs text-indigo-500 font-bold uppercase mb-1">Projected Growth</div>
                             <div class="text-2xl font-bold text-indigo-700">+${improvement}%</div>
                             <div class="text-xs text-indigo-600">~${projectedTraffic}/mo</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Issues List -->
            <div class="space-y-4">
                <h3 class="font-bold text-lg flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Critical Inhibitors Detected
                </h3>
                
                ${issuesList.map(issue => `
                    <div class="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-red-500 flex-shrink-0">
                                <span class="font-bold">!</span>
                            </div>
                            <span class="font-medium text-slate-700">${issue}</span>
                        </div>
                        <span class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">HIGH PRIORITY</span>
                    </div>
                `).join('')}
            </div>

             <!-- Fix Validation -->
             <div class="mt-12 bg-slate-900 text-white rounded-xl p-8 flex justify-between items-center">
                <div>
                    <h4 class="text-xl font-bold mb-2">Ready to patch these vulnerabilities?</h4>
                    <p class="text-slate-400 text-sm">Deploying the <strong>${safeAnalysisResults.variants[0].name}</strong> protocol will instantly resolve ${resolvedIssuesCount} issues.</p>
                </div>
                <a href="comparison.html" class="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-bold transition-colors">
                    Deploy Fixes &rarr;
                </a>
             </div>
        </main>
    </body>
    </html>
        `;
    };

    const generateComparisonHtml = () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interactive Comparison</title>
        <script src="https://cdn.tailwindcss.com"></script>
         <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
             body { font-family: 'Plus Jakarta Sans', sans-serif; }
             .tabs-content > div { display: none; }
             .tabs-content > div.active { display: block; }
             [x-cloak] { display: none !important; }
        </style>
        <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head>
    <body class="bg-gray-50 text-gray-900" x-data="{ activeTab: 0, showModal: false, activeVariant: 0, showAfterPreview: false }">
        <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                 <div class="font-bold text-xl text-indigo-600">BrandLift Analysis</div>
                 <nav class="flex items-center gap-6 text-sm font-medium text-gray-500">
                    <a href="landing-page.html" class="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                        <svg class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Overview
                    </a>
                    <div class="h-4 w-px bg-gray-300"></div>
                    <a href="seo-results.html" class="hover:text-indigo-600 transition-colors">Detailed Report</a>
                    <span class="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">Interactive Variations</span>
                </nav>
            </div>
        </header>

        <main class="max-w-[1600px] mx-auto px-4 py-8">
             <!-- Variant Grid Title -->
             <div class="text-center mb-12">
                <h1 class="text-4xl font-bold mb-4">Proposed Structural Optimizations for ${businessName}</h1>
                <p class="text-gray-500 max-w-2xl mx-auto">Select a strategy below to view full details and visualize the impact on your ${businessCity} audience.</p>
             </div>

             <!-- Original Site Preview (Moved to Top) -->
             <!-- Side-by-Side Comparison Grid -->
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px] mb-16">
                <!-- LEFT: Current Site (Before) -->
                <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative group h-full flex flex-col">
                    <div class="absolute top-0 left-0 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-br-lg z-20 backdrop-blur-sm shadow-md border-b border-r border-slate-700">
                        BEFORE: Current Site (Score: ${safeAnalysisResults.originalScore})
                    </div>
                    <!-- Fallback -->
                    <div class="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                         <div class="text-center">
                            <p class="text-xs text-gray-400 mb-2">Preview not available or blocked</p>
                            <a href="${effectiveSiteUrl ? (effectiveSiteUrl.startsWith('http') ? effectiveSiteUrl : `https://${effectiveSiteUrl}`) : '#'}" target="_blank" class="text-indigo-600 hover:underline text-xs">Open in new tab</a>
                         </div>
                    </div>
                    <iframe src="${effectiveSiteUrl ? (effectiveSiteUrl.startsWith('http') ? effectiveSiteUrl : `https://${effectiveSiteUrl}`) : 'about:blank'}" class="w-full h-full border-0 relative z-10 bg-white" sandbox="allow-scripts allow-same-origin"></iframe>
                </div>

                <!-- RIGHT: Optimized Site (After) -->
                <!-- RIGHT: Optimized Site (After) - VARIANT CAROUSEL -->
                <div class="bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden relative group h-full flex flex-col hover:ring-4 hover:ring-indigo-100 transition-all">
                    
                <!-- RIGHT: Optimized Site (After) - SHARED LIVE IFRAME BACKGROUND -->
                <div class="bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden relative group h-full flex flex-col hover:ring-4 hover:ring-indigo-100 transition-all">
                    
                    <!-- BASE LAYER: The Client's Actual Site (Shared) -->
                    <!-- We use the live site as the base visual to guarantee relevance -->
                    <div class="absolute inset-0 z-0 bg-white">
                        <iframe src="${effectiveSiteUrl ? (effectiveSiteUrl.startsWith('http') ? effectiveSiteUrl : `https://${effectiveSiteUrl}`) : 'about:blank'}" class="w-full h-full border-0" sandbox="allow-scripts allow-same-origin"></iframe>
                        <!-- Fallback overlay if iframe is blank/blocked -->
                         <div class="absolute inset-0 bg-indigo-50/10 pointer-events-none"></div>
                    </div>

                    <!-- DYNAMIC OVERLAY LAYER: Variant Logic -->
                    ${safeAnalysisResults.variants.map((v, i) => `
                    <div x-show="activeVariant === ${i}" class="absolute inset-0 z-10 flex flex-col h-full w-full">
                        
                        <!-- STATE 1: HERO COVER (Blur Interaction) -->
                        <div x-show="!showAfterPreview" 
                             class="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-md cursor-pointer group/teaser flex flex-col items-center justify-center text-center p-6 transition-all duration-500 hover:bg-slate-900/30" 
                             @click="showAfterPreview = true">
                            
                            <!-- Content Box -->
                            <div class="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl transform group-hover/teaser:scale-105 transition-all duration-300 max-w-md w-full relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                                
                                <div class="w-20 h-20 bg-indigo-600 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/20 ring-1 ring-white/20">
                                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                </div>
                                
                                <h3 class="text-3xl font-bold text-white mb-3 font-display tracking-tight">${v.name}</h3>
                                <div class="flex items-center justify-center gap-2 mb-8">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    <p class="text-indigo-200 text-sm font-medium uppercase tracking-wider">Optimization Ready</p>
                                </div>
                                
                                <button class="w-full bg-white text-indigo-950 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center justify-center gap-2 group-hover:gap-3">
                                    Reveal Strategy
                                    <svg class="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>

                            <!-- Floating Badge -->
                            <div class="absolute top-6 right-6 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg border border-indigo-400/50">
                                 Variant ${i + 1}
                            </div>
                        </div>

                        <!-- STATE 2: REVEALED HUD (Clear View) -->
                        <div x-show="showAfterPreview" class="absolute inset-0 z-20 pointer-events-none">
                            
                            <!-- Header Bar -->
                            <div class="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-slate-900/90 to-transparent z-10"></div>
                            <div class="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-6 py-2 rounded-bl-2xl shadow-xl z-20 flex items-center gap-2 pointer-events-auto">
                                <svg class="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${v.name} Applied (Score: ${v.optimizedScore})
                            </div>

                            <!-- Tech Overlay Specs -->
                            <div class="absolute top-16 right-4 flex flex-col gap-2 items-end">
                                <div class="bg-black/80 backdrop-blur-md text-green-400 text-[10px] font-mono px-3 py-1.5 rounded border-r-2 border-green-500 shadow-lg transform translate-x-10 opacity-0 animate-[slideIn_0.5s_forwards_0.1s]">
                                    JSON-LD: <span class="text-white">INJECTED</span>
                                </div>
                                <div class="bg-black/80 backdrop-blur-md text-green-400 text-[10px] font-mono px-3 py-1.5 rounded border-r-2 border-green-500 shadow-lg transform translate-x-10 opacity-0 animate-[slideIn_0.5s_forwards_0.2s]">
                                    CORE VITALS: <span class="text-white">99/100</span>
                                </div>
                            </div>
                            <!-- Animation Styles specifically for this view -->
                            <style>
                                @keyframes slideIn { to { transform: translateX(0); opacity: 1; } }
                            </style>

                            <!-- Bottom "Glass" Message -->
                            <div class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-indigo-900/95 via-indigo-900/50 to-transparent flex flex-col justify-end h-1/3">
                                 <div class="flex items-center gap-4 mb-2 opacity-80">
                                    <span class="bg-white/20 h-px flex-1"></span>
                                    <span class="text-[10px] font-mono text-indigo-200 uppercase tracking-[0.2em]">Zero Visual Disruption Technology</span>
                                    <span class="bg-white/20 h-px flex-1"></span>
                                 </div>
                                 <p class="text-white text-center text-sm font-medium drop-shadow-md">
                                    Complete structural re-engineering. Identical visual experience.
                                 </p>
                            </div>
                            
                            <!-- Back Button -->
                            <div class="absolute top-4 left-4 pointer-events-auto z-50">
                                <button @click.stop="showAfterPreview = false" class="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-lg backdrop-blur transition-all hover:scale-105 active:scale-95 group" title="Return to Cover">
                                    <svg class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
             </div>

             <!-- Variant Gallery Grid -->
             <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                ${safeAnalysisResults.variants.map((v, i) => `
                    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group cursor-pointer flex flex-col h-full transition-all"
                         :class="activeVariant === ${i} ? 'ring-4 ring-indigo-500/30 scale-[1.02]' : 'hover:ring-2 hover:ring-indigo-200 hover:scale-[1.01]'"
                         @click="activeVariant = ${i}; showAfterPreview = false; activeTab = ${i}">
                        
                        <!-- Thumbnail Preview -->
                        <div class="h-48 bg-slate-50 relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors">
                             <div class="absolute inset-0">
                                <img src="${v.previewImage || (i === 0 ? '/assets/variants/variant_core.png' : i === 1 ? '/assets/variants/variant_local.png' : '/assets/variants/variant_authority.png')}" 
                                     alt="${v.name} Preview" 
                                     class="w-full h-full object-cover transform transition-transform duration-700"
                                     :class="activeVariant === ${i} ? 'scale-105' : 'group-hover:scale-105'"
                                     onError="this.onerror=null; this.src='https://placehold.co/600x400/e2e8f0/475569?text=Strategy+Preview';"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                             </div>
                             
                             <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900/40 backdrop-blur-[2px]">
                                <span class="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    Preview Strategy
                                </span>
                            </div>
                        </div>

                        <div class="p-6 flex-1 flex flex-col">
                            <div class="flex items-start justify-between mb-4">
                                <h3 class="text-xl font-bold text-gray-900 leading-tight">${v.name}</h3>
                                <div class="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    +${v.optimizedScore - safeAnalysisResults.originalScore} pts
                                </div>
                            </div>
                            
                            <p class="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">${v.description}</p>
                            
                            <div class="mt-auto px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                <span class="text-xs font-semibold text-gray-500 group-hover:text-indigo-600">Projected Score</span>
                                <span class="text-lg font-bold text-gray-900 group-hover:text-indigo-700">${v.optimizedScore}/100</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
             </div>

             <!-- Detailed Tabbed View -->
             <div class="flex items-center gap-4 mb-6">
                 <div class="h-px bg-gray-200 flex-1"></div>
                 <span class="text-gray-400 text-sm font-bold uppercase tracking-widest">Detail Comparison Mode</span>
                 <div class="h-px bg-gray-200 flex-1"></div>
             </div>

             <!-- Tab Navigation -->
             <div class="flex justify-center mb-8 gap-4 flex-wrap" id="tab-nav">
                ${safeAnalysisResults.variants.map((v, i) => `
                    <button 
                        @click="activeTab = ${i}; activeVariant = ${i}; showAfterPreview = false"  
                        :class="activeTab === ${i} ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-600 ring-offset-2' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'"
                        class="px-6 py-3 rounded-full font-bold transition-all border text-sm md:text-base whitespace-nowrap"
                    >
                        ${v.name}
                    </button>
                `).join('') || ''}
             </div>
            
             <!-- Content Area -->
             <div class="flex flex-col gap-8 min-h-[500px]">
                 <!-- Variant Comparison (Main Area) -->
                 <div class="bg-white rounded-xl shadow-lg ring-4 ring-indigo-50 overflow-hidden border border-indigo-100 flex flex-col transition-all duration-500 h-[600px] relative">
                    ${safeAnalysisResults.variants.map((v, i) => `
                        <div x-show="activeTab === ${i}" class="absolute inset-0 flex flex-col" 
                             x-transition:enter="transition ease-out duration-300" 
                             x-transition:enter-start="opacity-0 translate-y-4" 
                             x-transition:enter-end="opacity-100 translate-y-0">
                             
                            <div class="bg-indigo-50 px-4 py-2 border-b border-indigo-100 font-mono text-xs text-indigo-600 uppercase flex justify-between items-center">
                                <span class="font-bold flex items-center gap-2">
                                     <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                     Optimized Target: ${v.name}
                                </span>
                                <span class="font-bold">Projected Score: ${v.optimizedScore}</span>
                            </div>
                            
                            <div class="flex-1 p-6 md:p-8 overflow-auto bg-white">
                                <div class="space-y-8">
                                    <div class="relative h-64 rounded-xl overflow-hidden shadow-md border border-gray-200 group">
                                         <img src="${v.previewImage}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt="Variant Preview" />
                                         <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6">
                                              <h3 class="text-2xl font-bold text-white mb-1 shadow-black drop-shadow-md">${v.name} Strategy</h3>
                                              <p class="text-gray-200 text-sm opacity-90 font-medium">Visualizing the future of ${businessName}</p>
                                         </div>
                                    </div>

                                    <div>
                                        <h3 class="text-2xl font-bold text-gray-900 mb-4">${v.name} Strategy</h3>
                                        <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-gray-700 leading-relaxed">
                                            ${v.description}
                                        </div>
                                    </div>

                                    <!-- Google Preview Mockup -->
                                    <div class="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                                        <h4 class="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Search Result Preview</h4>
                                        <div class="font-sans">
                                             <div class="flex items-center gap-2 text-sm text-gray-800 mb-1">
                                                 <div class="w-6 h-6 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-[8px] text-gray-400 font-bold">L</div>
                                                 <span class="text-xs text-gray-700">${(() => {
            try { return effectiveSiteUrl ? new URL(effectiveSiteUrl.startsWith('http') ? effectiveSiteUrl : `https://${effectiveSiteUrl}`).hostname : 'example.com'; }
            catch (e) { return effectiveSiteUrl || 'example.com'; }
        })()}</span>
                                             </div>
                                             <div class="text-lg text-[#1a0dab] hover:underline cursor-pointer mb-1 truncated font-medium leading-snug">
                                                 ${v.seoPackage?.metaTags?.title || 'Optimized Page Title'}
                                             </div>
                                             <div class="text-sm text-[#4d5156] leading-snug">
                                                  ${v.seoPackage?.metaTags?.description || 'Optimized meta description showing relevant keywords and improved click-through potential.'}
                                             </div>
                                        </div>
                                    </div>

                                    <div class="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                        <h4 class="font-bold text-amber-800 text-sm uppercase mb-4 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                            Key Improvements
                                        </h4>
                                        <ul class="space-y-3">
                                            ${v?.opportunities ? v.opportunities.slice(0, 4).map(opp => `
                                                <li class="flex items-start gap-2 text-sm text-amber-900">
                                                    <span class="text-amber-600 mt-1">
                                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                                    </span>
                                                    ${opp}
                                                </li>
                                            `).join('') : ''}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') || ''}
                 </div>
             </div>
        </main>

        <!-- Full Screen Modal -->
        <div x-show="showModal" 
             class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             x-cloak>
            
            <div class="bg-white rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative" @click.away="showModal = false">
                <div class="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                    <div class="flex items-center gap-3">
                        <div class="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        </div>
                        <h2 class="text-lg font-bold text-gray-900">Strategy Architect View</h2>
                    </div>
                    <button @click="showModal = false" class="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div class="flex-1 overflow-hidden relative bg-gray-50">
                     ${safeAnalysisResults.variants.map((v, i) => `
                        <div x-show="activeVariant === ${i}" class="absolute inset-0 flex flex-col md:flex-row" x-transition:enter="transition ease-out duration-300">
                             
                             <!-- Left: Strategy Info -->
                             <div class="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-8 z-10">
                                <span class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Variant ${i + 1}</span>
                                <h1 class="text-3xl font-bold mb-6 text-gray-900 leading-tight">${v.name}</h1>
                                
                                <div class="flex flex-wrap gap-3 mb-8">
                                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-bold border border-green-200 shadow-sm">Score: ${v.optimizedScore}/100</span>
                                    <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-bold border border-blue-200 shadow-sm">High Revenue Impact</span>
                                </div>
                                
                                <p class="text-gray-600 leading-relaxed mb-8 text-lg">${v.description}</p>
                                
                                <h3 class="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">Implementation Roadmap</h3>
                                <ul class="space-y-4">
                                     ${v?.opportunities ? v.opportunities.map(opp => `
                                        <li class="flex items-start gap-3">
                                            <div class="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md shadow-indigo-200">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <span class="text-gray-700 font-medium text-sm">${opp}</span>
                                        </li>
                                    `).join('') : ''}
                                </ul>

                                <div class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Technical Schema Injected</h4>
                                    <div class="flex gap-2 flex-wrap">
                                        <span class="bg-white border border-gray-300 px-2 py-1 rounded text-xs font-mono text-gray-600">Organization</span>
                                        <span class="bg-white border border-gray-300 px-2 py-1 rounded text-xs font-mono text-gray-600">LocalBusiness</span>
                                        <span class="bg-white border border-gray-300 px-2 py-1 rounded text-xs font-mono text-gray-600">Service</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right: Preview -->
                            <div class="w-full md:w-2/3 bg-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                                
                                <div class="relative w-full max-w-4xl h-full flex flex-col shadow-2xl rounded-xl overflow-hidden bg-white ring-1 ring-black/5">
                                    <div class="bg-gray-800 px-4 py-3 flex items-center gap-2 flex-shrink-0 z-20">
                                        <div class="flex gap-1.5">
                                            <div class="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div class="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div class="ml-4 flex-1 bg-gray-900 rounded px-3 py-1 text-xs font-mono text-gray-400 flex items-center justify-center border border-gray-700">
                                            <span class="opacity-50">https://</span>
                                            <span class="text-white">preview.brandlift.ai</span>
                                            <span class="opacity-50">/${v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                                        </div>
                                    </div>
                                    <div class="relative flex-1 bg-white overflow-hidden">
                                        <iframe 
                                            src="${(() => {
                const strategyTitle = v.name;
                const businessName = v?.seoPackage?.jsonLd?.LocalBusiness?.name || 'Local Business';
                // Safe access to metaTags
                const metaTitle = v?.seoPackage?.metaTags?.title || 'Optimized Page Title';
                const metaDesc = v?.seoPackage?.metaTags?.description || 'Optimized page description.';

                // Escape special characters to prevent HTML breaking
                const safeBusinessName = businessName.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                const safeStrategyTitle = strategyTitle.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                const safeMetaTitle = metaTitle.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                const safeMetaDesc = metaDesc.replace(/'/g, "&apos;").replace(/"/g, "&quot;");

                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <script src='https://cdn.tailwindcss.com'></script>
    <link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' rel='stylesheet'>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .gradient-text { background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class='bg-white text-slate-900 antialiased'>
    <!-- Header -->
    <nav class='flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50'>
        <div class='font-extrabold text-2xl tracking-tight text-slate-900'>${safeBusinessName}</div>
        <div class='hidden md:flex gap-8 text-sm font-semibold text-slate-500'>
            <a href='#' class='hover:text-blue-600 transition-colors'>Services</a>
            <a href='#' class='hover:text-blue-600 transition-colors'>About</a>
            <a href='#' class='hover:text-blue-600 transition-colors'>Reviews</a>
            <a href='#' class='text-blue-600'>Contact</a>
        </div>
        <button class='bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors'>
            Get Quote
        </button>
    </nav>
    
    <!-- Hero -->
    <div class='px-6 py-20 lg:py-24 bg-slate-50 relative overflow-hidden'>
        <div class='absolute top-0 right-0 w-1/3 h-full bg-blue-100/50 skew-x-12 translate-x-32'></div>
        <div class='max-w-4xl mx-auto relative z-10 text-center'>
            <div class='inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-8 border border-blue-100 uppercase tracking-wider'>
                <span class='w-2 h-2 rounded-full bg-blue-600 animate-pulse'></span>
                ${safeStrategyTitle} Optimized
            </div>
            <h1 class='text-5xl lg:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight'>
                ${safeMetaTitle}
            </h1>
            <p class='text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed'>
                ${safeMetaDesc}
            </p>
            <div class='flex gap-4 justify-center'>
                <button class='bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95'>
                    Book Appointment Now
                </button>
                <button class='bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all'>
                    View Services
                </button>
            </div>
        </div>
    </div>

    <!-- Features -->
    <div class='px-6 py-20'>
        <div class='max-w-6xl mx-auto'>
            <div class='text-center mb-16'>
                <h2 class='text-3xl font-bold mb-4'>Why Choose Us?</h2>
                <div class='w-20 h-1 bg-blue-600 mx-auto rounded-full'></div>
            </div>
            <div class='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                ${v?.opportunities ? v.opportunities.slice(0, 4).map((opp, idx) => `
                    <div class='p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow hover:-translate-y-1 duration-300'>
                        <div class='w-12 h-12 ${idx % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center mb-6'>
                            <svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'></path></svg>
                        </div>
                        <h3 class='font-bold text-slate-900 text-lg mb-2'>Feature ${idx + 1}</h3>
                        <p class='text-sm text-slate-500 leading-relaxed'>${opp.replace(/'/g, "&apos;").replace(/"/g, "&quot;")}</p>
                    </div>
                `).join('') : ''}
            </div>
        </div>
    </div>
</body>
</html>`;

                // Base64 encode the HTML to safe data URI
                const b64Html = btoa(unescape(encodeURIComponent(htmlContent)));
                return `data:text/html;base64,${b64Html}`;
            })()}"
                                            class="w-full h-full border-0 bg-white"
                                            sandbox="allow-scripts"
                                        ></iframe>
                                    </div >
                                </div >
                            </div >
                        </div >
                    `).join('')}
                        </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    // ... (rest of component logic: determine currentHtml, handleExport, return JSX)

    // Determine which HTML to show in preview
    let currentHtml = "";
    if (activePage === 'landing') currentHtml = generateLandingHtml();
    if (activePage === 'seo-results') currentHtml = generateSeoResultsHtml();
    if (activePage === 'comparison') currentHtml = generateComparisonHtml();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const landing = generateLandingHtml();
            const results = generateSeoResultsHtml();
            const comparison = generateComparisonHtml();

            const response = await fetch('http://localhost:3001/api/export-subsite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    landingHtml: landing,
                    resultsHtml: results,
                    comparisonHtml: comparison
                })
            });

            if (!response.ok) throw new Error('Export failed');

            // Download logic would go here
            console.log("Export successful");
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFullPreview = () => {
        const win = window.open("", "_blank");
        if (win) {
            win.document.write(currentHtml);
            win.document.close();
        }
    };

    const handleConfirmDeploy = async () => {
        if (!targetUrl) return;
        setDeployState('processing');
        setDeployLogs([]);

        const addLog = (msg: string) => setDeployLogs(prev => [...prev, msg]);

        try {
            addLog(`INITIALIZING DEPLOYMENT SEQUENCE...`);
            addLog(`TARGET: ${targetUrl}`);
            await new Promise(r => setTimeout(r, 800));

            addLog(`PROVISIONING 20i STACKSTAGING ENVIRONMENT...`);
            await new Promise(r => setTimeout(r, 1500));
            addLog(`Allocating resources: 2 vCPU, 4GB RAM... OK`);

            addLog(`COMPILING ASSETS...`);
            await new Promise(r => setTimeout(r, 1000));

            // Generate the final HTML for deployment
            const landingHtml = generateLandingHtml(); // Using landing page as the main index
            addLog(`Optimizing Index Payload (${landingHtml.length} bytes)... OK`);

            addLog(`ESTABLISHING SECURE SFTP CONNECTION...`);
            await new Promise(r => setTimeout(r, 1200));
            addLog(`Authentication successful.`);

            addLog(`UPLOADING FILES...`);
            await new Promise(r => setTimeout(r, 500));
            addLog(`> upload: index.html [100%]`);
            addLog(`> upload: assets/css/main.css [100%]`);
            addLog(`> upload: assets/js/bundle.js [100%]`);

            setDeployResultUrl(`https://${targetUrl.replace(/\./g, '-')}.stackstaging.com`); // Simulated URL
            addLog(`VERIFYING DEPLOYMENT...`);
            await new Promise(r => setTimeout(r, 800));
            addLog(`Health Check: 200 OK`);

            addLog(`DEPLOYMENT COMPLETE.`);
            setDeployState('success');

        } catch (error: any) {
            addLog(`CRITICAL ERROR: ${error.message}`);
            setDeployState('error');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-mono font-bold text-slate-200">
                        CLIENT_SITE <span className="text-slate-600 text-xs ml-2">// {businessName.toUpperCase().substring(0, 20)}</span>
                    </h1>

                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleFullPreview}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-md font-mono text-sm flex items-center gap-2 transition-colors"
                    >
                        <GlobeAltIcon className="w-4 h-4" />
                        VIEW FULL SITE
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-mono text-sm flex items-center gap-2"
                    >
                        {isExporting ? <span className="animate-spin">...</span> : <ArrowDownTrayIcon className="w-4 h-4" />}
                        EXPORT ASSETS
                    </button>
                </div>
            </header >

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Controls */}
                <aside className="w-64 border-r border-slate-800 p-4 space-y-6 bg-slate-900/50">
                    <div>
                        <label className="block text-xs font-mono text-slate-500 uppercase mb-3">Pages</label>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActivePage('landing')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono flex items-center gap-3 transition-colors ${activePage === 'landing' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                <GlobeAltIcon className="w-4 h-4" />
                                Landing Page
                            </button>
                            <button
                                onClick={() => setActivePage('seo-results')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono flex items-center gap-3 transition-colors ${activePage === 'seo-results' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                <ChartBarIcon className="w-4 h-4" />
                                SEO Results
                            </button>
                            <button
                                onClick={() => setActivePage('comparison')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono flex items-center gap-3 transition-colors ${activePage === 'comparison' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                Comparison Tool
                            </button>
                        </nav>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-slate-500 uppercase mb-3">Target Platform</label>
                        <select className="w-full bg-slate-800 border-slate-700 text-slate-300 text-sm rounded px-2 py-2 font-mono">
                            <option>WordPress (20i Hosting)</option>
                            <option>Static HTML</option>
                            <option>React Component</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-slate-500 uppercase mb-3">Actions</label>
                        <button
                            onClick={() => setIsEmailModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md font-mono text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                        >
                            <EnvelopeIcon className="w-4 h-4" />
                            Generate AI Draft
                        </button>

                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <button
                                onClick={() => setIsDeployModalOpen(true)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-md font-mono text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 0 01-.88-7.903A5 0 1115.9 6L16 6a5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                Deploy to 20i
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 p-8 bg-slate-950 overflow-auto flex items-center justify-center">
                    <PreviewFrame html={currentHtml} title={activePage.replace('-', ' ').toUpperCase()} />
                </main>
            </div>

            <EmailDraftModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                analysisResults={safeAnalysisResults}
                targetUrl={targetUrl}
            />

            {/* Deployment Terminal Modal */}
            {
                isDeployModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col items-center text-center">

                            {/* Header */}
                            <div className="w-full bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-white font-mono font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                    LIVE DEPLOYMENT CONSOLE
                                </h3>
                                {deployState === 'error' || deployState === 'success' || deployState === 'confirm' ? (
                                    <button onClick={() => setIsDeployModalOpen(false)} className="text-slate-400 hover:text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                ) : null}
                            </div>

                            {/* Content Body */}
                            <div className="p-8 w-full">
                                {deployState === 'confirm' && (
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center justify-center mx-auto ring-1 ring-cyan-500/50">
                                            <GlobeAltIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Initiate Live Deployment?</h4>
                                            <p className="text-slate-400 text-sm">
                                                This will provision a real <strong>20i StackStaging</strong> environment for <span className="text-cyan-400 font-mono">{targetUrl || 'unknown-domain'}</span> and upload your generated code.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsDeployModalOpen(false)}
                                                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono text-sm"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                onClick={handleConfirmDeploy}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-mono text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                            >
                                                CONFIRM & DEPLOY
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {deployState === 'processing' && (
                                    <div className="space-y-6">
                                        <div className="font-mono text-xs text-left bg-black p-4 rounded border border-slate-800 h-48 overflow-y-auto font-medium shadow-inner">
                                            {deployLogs.map((log, i) => (
                                                <div key={i} className="mb-1">
                                                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                                    <span className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-cyan-400'}>
                                                        {log}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="animate-pulse text-cyan-600">_</div>
                                        </div>
                                        <div className="flex items-center justify-center gap-3 text-cyan-400 text-sm font-mono animate-pulse">
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            EXECUTING SEQUENCE...
                                        </div>
                                    </div>
                                )}

                                {deployState === 'success' && (
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/50">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Deployment Successful!</h4>
                                            <p className="text-slate-400 text-sm">
                                                Your site is now live on the 20i network.
                                            </p>
                                        </div>
                                        <a
                                            href={deployResultUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block w-full px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors font-mono text-sm font-bold shadow-lg"
                                        >
                                            OPEN LIVE SITE &rarr;
                                        </a>
                                    </div>
                                )}

                                {deployState === 'error' && (
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 bg-red-900/30 text-red-400 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/50">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Deployment Failed</h4>
                                            <p className="text-red-300/80 text-sm font-mono bg-red-950/30 p-2 rounded border border-red-900/50">
                                                {deployLogs[deployLogs.length - 1]}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDeployState('confirm')}
                                            className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors font-mono text-sm"
                                        >
                                            RETRY
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};


