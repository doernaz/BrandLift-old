import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, FileText, Mail, ArrowRight, Zap, CheckCircle, Smartphone, Loader2, ExternalLink, Play } from 'lucide-react';
import { sessionStore } from '../../../services/sessionStore';

interface FlowState {
    originalUrl: string;
    seoScore: number | null;
    variants: any[]; // Changed to any[] to support objects
    emailCampaigns: string[];
    deploymentId: string | null;
    isVirtual?: boolean;
    status?: string;
    progressStep?: number;
    virtualSource?: any;
}

export const WalkTheFlowTile = () => {
    const [flowState, setFlowState] = useState<FlowState | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [previewEmail, setPreviewEmail] = useState<string | null>(null);

    useEffect(() => {
        loadSession();
        // Poll for updates (simulated reactive state)
        const interval = setInterval(loadSession, 1000); // Faster polling for progress bar
        return () => clearInterval(interval);
    }, []);

    const loadSession = () => {
        // Fetch from our singleton service
        const session = sessionStore.getActiveSession();
        if (session) {
            setFlowState({ ...session }); // Spread to force re-render
        }
    };

    const handleSimulateVirtual = () => {
        // Dev Tool: Simulate a non-website lead
        const mockSource = sessionStore.createVirtualSourceObject({
            businessName: "Desert Air HVAC",
            industry: "HVAC",
            keywords: ["ac repair phoenix", "emergency cooling", "hvac maintenance"],
            location: "Phoenix, AZ"
        });
        sessionStore.startReimagineSession({ virtualSource: mockSource });
    };

    const handlePreviewEmail = (campaign: string) => {
        const body = `Subject: Quick Question regarding ${flowState?.virtualSource?.metadata.business_name || 'your website'}\n\nHi there,\n\nI noticed you're doing great work in the ${flowState?.virtualSource?.metadata.industry || 'local'} space. \n\nI created a mockup of how we could potentially increase your lead velocity by 30% using our high-conversion blueprints.\n\nWould you be open to a 5-minute loom video walking through it?\n\nBest,\nBrandLift AI`;
        setPreviewEmail(body);
    };

    if (!flowState) {
        return (
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-lg flex items-center justify-center min-h-[300px] relative group">
                <div className="text-center">
                    <Sparkles className="w-16 h-16 text-slate-700 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-slate-500 font-mono text-lg uppercase tracking-widest">Awaiting Reimagine Event</h3>
                    <p className="text-slate-600 text-sm mt-2 max-w-sm mx-auto">
                        Initiate a "Reimagine" workflow from the Lead Enrichment module to populate this flow.
                    </p>
                </div>

                {/* Hidden Dev Trigger */}
                <button
                    onClick={handleSimulateVirtual}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 bg-slate-800 text-xs text-slate-400 px-2 py-1 rounded border border-slate-700 hover:text-white transition-all"
                >
                    <Play className="w-3 h-3 inline mr-1" /> Dev: Simulate Virtual Lead
                </button>
            </div>
        );
    }

    // Progress Mode (Virtual Hand-off)
    if (flowState.isVirtual && flowState.status !== 'complete') {
        return (
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Globe className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold text-white mb-2">Virtual Hand-off in Progress</h2>
                        <p className="text-slate-400 text-sm font-mono">{flowState.virtualSource?.metadata.business_name}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Step 1 */}
                        <div className={`p-4 rounded border flex items-center justify-between transition-all ${flowState.progressStep && flowState.progressStep >= 1 ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-950 border-slate-800 opacity-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                {flowState.progressStep === 1 ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> :
                                    flowState.progressStep! > 1 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border border-slate-600" />}
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Analyzing Scrape</span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`p-4 rounded border flex items-center justify-between transition-all ${flowState.progressStep && flowState.progressStep >= 2 ? 'bg-slate-800 border-indigo-500/50' : 'bg-slate-950 border-slate-800 opacity-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                {flowState.progressStep === 2 ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /> :
                                    flowState.progressStep! > 2 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border border-slate-600" />}
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Provisioning Variants</span>
                            </div>
                            {flowState.progressStep === 2 && <span className="text-[10px] text-indigo-400 font-mono animate-pulse">20i API: /addWeb...</span>}
                        </div>

                        {/* Step 3 */}
                        <div className={`p-4 rounded border flex items-center justify-between transition-all ${flowState.progressStep && flowState.progressStep >= 3 ? 'bg-slate-800 border-pink-500/50' : 'bg-slate-950 border-slate-800 opacity-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                {flowState.progressStep === 3 ? <Loader2 className="w-5 h-5 text-pink-400 animate-spin" /> :
                                    flowState.status === 'complete' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border border-slate-600" />}
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Injecting SEO Schema</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                    <Globe className="w-4 h-4" /> The Flow
                </h3>

                {[
                    { id: 'overview', label: 'Overview', icon: Zap },
                    { id: 'original', label: flowState.isVirtual ? 'Virtual Source' : 'Original Site', icon: Globe },
                    { id: 'seo', label: 'SEO Injection', icon: Sparkles },
                    { id: 'variants', label: 'Subsite Variants', icon: Smartphone },
                    { id: 'email', label: 'Email Engine', icon: Mail },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`text-left px-4 py-3 rounded text-xs font-bold uppercase flex items-center gap-3 transition-colors ${activeTab === item.id
                            ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {previewEmail && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setPreviewEmail(null)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Preview
                        </h3>
                        <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                            {previewEmail}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setPreviewEmail(null)} className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white transition-colors">Close</button>
                            <button className="bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Send Test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-6 bg-slate-900 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {flowState.isVirtual
                                        ? flowState.virtualSource?.metadata.business_name
                                        : new URL(flowState.originalUrl).hostname}
                                </h2>
                                <span className="text-xs text-slate-500 font-mono uppercase">
                                    {flowState.isVirtual ? 'Virtual Hand-off Complete' : 'Reimagination in Progress'}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-cyan-400">{flowState.seoScore || '--'}</div>
                                <span className="text-[10px] text-slate-500 uppercase">Current SEO Velocity</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase block mb-2">Source Type</span>
                                <div className="text-white font-mono text-sm truncate">
                                    {flowState.isVirtual ? 'Virtual Object' : 'Live Website'}
                                </div>
                            </div>
                            <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase block mb-2">Generated Variants</span>
                                <div className="text-white font-mono text-sm">{flowState.variants.length} Layouts</div>
                            </div>
                            <div className="bg-slate-950 p-4 rounded border border-slate-800">
                                <span className="text-[10px] text-slate-500 uppercase block mb-2">Outreach</span>
                                <div className="text-white font-mono text-sm">{flowState.emailCampaigns.length} Campaigns</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'original' && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        {flowState.isVirtual ? (
                            <div className="bg-slate-950 border border-slate-800 rounded p-6">
                                <h3 className="text-lg text-white font-bold mb-4">Virtual Source Object</h3>
                                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap bg-black p-4 rounded border border-slate-800">
                                    {JSON.stringify(flowState.virtualSource, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg text-white font-bold">Original Asset</h3>
                                    <a href={flowState.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 flex items-center gap-1 hover:underline">
                                        Open Source <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="flex-1 bg-white rounded overflow-hidden relative">
                                    <iframe
                                        src={flowState.originalUrl}
                                        className="w-full h-full border-0 absolute inset-0"
                                        title="Original Site"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="animate-fadeIn space-y-4">
                        <h3 className="text-lg text-white font-bold mb-4">SEO Injection Matrix</h3>
                        <div className="bg-slate-950 border border-slate-800 rounded p-4">
                            <h4 className="text-xs text-green-400 font-bold uppercase mb-2">Optimizations Applied</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle className="w-3 h-3 text-green-500" /> Semantic HTML Structure Restructured</li>
                                <li className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle className="w-3 h-3 text-green-500" /> Meta Tags & OpenGraph Data Injected</li>
                                <li className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle className="w-3 h-3 text-green-500" /> Contrast Ratios Normalized (WCAG 2.1)</li>
                                <li className="flex items-center gap-2 text-xs text-slate-300"><CheckCircle className="w-3 h-3 text-green-500" /> Core Web Vitals Optimized (LCP, CLS)</li>
                            </ul>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded p-4 mt-4">
                            <h4 className="text-xs text-yellow-400 font-bold uppercase mb-2">Keyword Density Map</h4>
                            <div className="flex flex-wrap gap-2">
                                {(flowState.virtualSource?.metadata.target_keywords || ['HVAC Phoenix', 'AC Repair', 'Emergency Cooling']).map((k: string) => (
                                    <span key={k} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'variants' && (
                    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flowState.variants.map((variant, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded overflow-hidden hover:border-cyan-500 transition-all group">
                                <div className="aspect-video bg-slate-900 relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-xs uppercase">
                                        {typeof variant === 'string' ? `Preview ${idx + 1}` : variant.name}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={typeof variant === 'string' ? variant : variant.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1 hover:bg-cyan-400"
                                        >
                                            Expand <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-slate-800">
                                    <span className="text-xs text-white font-bold block mb-1">
                                        {typeof variant === 'string' ? `Variant ${idx + 1}` : variant.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase block">
                                        {typeof variant === 'string' ? 'Standard Layout' : `${variant.type} Blueprint`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="animate-fadeIn space-y-3">
                        <h3 className="text-lg text-white font-bold mb-4">Outreach Sequences</h3>
                        {flowState.emailCampaigns.map((camp, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-3 flex justify-between items-center group hover:border-pink-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-pink-500" />
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">{camp}</div>
                                        <div className="text-[10px] text-slate-500">Automated Sequence</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePreviewEmail(camp)}
                                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded uppercase border border-slate-700 hover:border-slate-500 transition-all"
                                >
                                    Preview
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
