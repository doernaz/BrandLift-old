import React, { useState } from 'react';
import { SeoAnalysisResult } from '../types';
import { SparklesIcon, ChartBarIcon, ServerIcon, UserGroupIcon, GlobeAltIcon, DocumentTextIcon, CogIcon, BeakerIcon, XMarkIcon } from '../components/icons/Icons';
import { LeadEnrichmentView } from './LeadEnrichmentView';
import { HealthSentinel } from './dashboard/HealthSentinel';
import { MetricsHud } from './dashboard/MetricsHud';
import { MetricStrip } from './dashboard/MetricStrip';
import { ClientMap } from './dashboard/ClientMap';
import { BlueprintManager } from './dashboard/BlueprintManager';
import { PricingConfigurator } from './dashboard/PricingConfigurator';
import { AddonManager } from './dashboard/AddonManager';

// Import All Tiles
import { WalkTheFlowTile } from './dashboard/tiles/WalkTheFlowTile';
import { SandboxManagerTile } from './dashboard/tiles/SandboxManagerTile';
import { ClientManagementTile } from './dashboard/tiles/ClientManagementTile';
import { FinancialSentinelTile } from './dashboard/tiles/FinancialSentinelTile';
import { IntegritySentinelTile } from './dashboard/tiles/IntegritySentinelTile';
import { EmailEngineTile } from './dashboard/tiles/EmailEngineTile';
import { ClientDeployTile } from './dashboard/tiles/ClientDeployTile';
import { DomainDiscoveryTile } from './dashboard/tiles/DomainDiscoveryTile';
import { DomainPortingTile } from './dashboard/tiles/DomainPortingTile';
import { ClientExperienceTile } from './dashboard/tiles/ClientExperienceTile';
import { KnowledgeBaseTile } from './dashboard/tiles/KnowledgeBaseTile';
import { RestoreTile } from './dashboard/tiles/RestoreTile';
import { SecurityTile } from './dashboard/tiles/SecurityTile';
import { PerformanceTile } from './dashboard/tiles/PerformanceTile';
import { FinancialOverviewTile } from './dashboard/tiles/FinancialOverviewTile';
import { ChatbotDeployerTile } from './dashboard/tiles/ChatbotDeployerTile';
import { CapabilitySyncTile } from './dashboard/tiles/CapabilitySyncTile';
import { BundleArchitectTile } from './dashboard/tiles/BundleArchitectTile';
import { StorefrontPreviewTile } from './dashboard/tiles/StorefrontPreviewTile';
import { VariantConfigTile } from './dashboard/tiles/VariantConfigTile';
import { AddonPricingTile } from './dashboard/tiles/AddonPricingTile';

interface DashboardProps {
    onNavigate: (page: any) => void;
    recentSeoScore: number | null;
    onReimagine: (target: any) => void;
}

const AppTile = ({ title, description, icon: Icon, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`text-left p-6 min-[2400px]:p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden h-full w-full ${active
            ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
            }`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-24 h-24 text-slate-400" />
        </div>
        <div className="relative z-10">
            <div className={`p-3 min-[2400px]:p-2 rounded-lg w-fit mb-4 min-[2400px]:mb-2 transition-colors ${active ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                }`}>
                <Icon className="w-6 h-6 min-[2400px]:w-5 min-[2400px]:h-5" />
            </div>
            <h3 className={`text-lg min-[2400px]:text-base font-bold mb-2 min-[2400px]:mb-1 ${active ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                {title}
            </h3>
            <p className="text-sm min-[2400px]:text-xs text-slate-500 leading-relaxed font-mono">
                {description}
            </p>
        </div>
        {active && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        )}
    </button>
);

export default function Dashboard({ onNavigate, recentSeoScore, onReimagine }: DashboardProps) {
    const [isTestProcess, setIsTestProcess] = useState(false);

    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden flex flex-col font-sans relative">

            {/* Header - Fixed Height */}
            <div className="flex-none h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 flex items-center justify-between z-50">
                <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">
                    COMMAND<span className="text-cyan-500">_CENTER</span>
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsTestProcess(!isTestProcess)}
                        className={`px-3 py-1.5 border rounded text-xs font-mono font-bold flex items-center gap-2 transition-all ${isTestProcess
                                ? 'bg-cyan-950 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                            }`}
                    >
                        <BeakerIcon className="w-4 h-4" />
                        TEST PROCESS
                    </button>

                    <div className="hidden min-[1200px]:flex px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-cyan-500 animate-pulse">
                        SYSTEM OPTIMAL
                    </div>
                    <div className="text-xs text-slate-600 font-mono">v2.6.0 // VIEWPORT LOCKED</div>
                </div>
            </div>

            {/* TEST PROCESS MODE OVERLAY */}
            {isTestProcess && (
                <div className="absolute inset-0 top-16 z-40 bg-slate-950 flex overflow-hidden animate-in fade-in duration-300">
                    {/* LEFT PANEL: LEAD ENRICHMENT (25%) */}
                    <div className="w-1/4 h-full border-r border-slate-800 flex flex-col bg-slate-900/50 overflow-hidden relative">
                        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <UserGroupIcon className="w-4 h-4" /> Lead Enrichment
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            {/* Passing onReimagine is critical for the flow to work */}
                            <LeadEnrichmentView onReimagine={onReimagine} />
                        </div>
                    </div>

                    {/* RIGHT PANEL: WALK THE FLOW (75%) */}
                    <div className="w-3/4 h-full flex flex-col bg-slate-950 overflow-hidden relative">
                        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" /> Workflow Execution
                            </div>
                            <button onClick={() => setIsTestProcess(false)} className="text-slate-500 hover:text-white transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden relative p-4">
                            <div className="h-full w-full rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden relative">
                                <div className="absolute inset-0 overflow-y-auto no-scrollbar">
                                    <WalkTheFlowTile />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Standard Dashboard */}
            <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">

                {/* COLUMN 1: GLOBAL STATUS (Fixed Width ~ 20%) */}
                <div className="w-[320px] 2xl:w-[400px] shrink-0 flex flex-col gap-4 h-full overflow-hidden border-r border-slate-800/50 pr-4">
                    <div className="flex items-center gap-2 text-cyan-500 uppercase tracking-widest text-xs font-bold font-mono border-b border-slate-800/50 pb-2">
                        <ChartBarIcon className="w-4 h-4" /> Global Status
                    </div>

                    {/* Metrics Strip */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                            <div className="text-[10px] uppercase text-slate-500 font-mono">Total Sites</div>
                            <div className="text-lg font-bold font-mono text-cyan-400">100+</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded flex justify-between items-center group hover:border-green-500/30 transition-all">
                            <div className="text-[10px] uppercase text-slate-500 font-mono">AI Audits</div>
                            <div className="text-lg font-bold font-mono text-green-400">LIVE</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded flex justify-between items-center group hover:border-purple-500/30 transition-all">
                            <div className="text-[10px] uppercase text-slate-500 font-mono">SEO Wins</div>
                            <div className="text-lg font-bold font-mono text-purple-400">842</div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
                        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded border border-slate-700 text-[9px] text-cyan-400 font-mono flex items-center gap-2">
                            <GlobeAltIcon className="w-3 h-3" /> LIVE MAP
                        </div>
                        <ClientMap />
                    </div>
                </div>

                {/* COLUMN 2: COMMAND CORE (Moved here from Col 3) */}
                <div className="w-[320px] 2xl:w-[400px] shrink-0 flex flex-col gap-4 h-full overflow-hidden border-r border-slate-800/50 pr-4">
                    <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-xs font-bold font-mono border-b border-slate-800/50 pb-2">
                        <ServerIcon className="w-4 h-4" /> Command Core
                    </div>
                    {/* Sandbox Manager */}
                    <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 relative">
                        <div className="absolute inset-0 overflow-y-auto no-scrollbar">
                            <SandboxManagerTile />
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: SYSTEM MODULES (Rest of Width) */}
                <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-xs font-bold font-mono border-b border-slate-800/50 pb-2">
                        <CogIcon className="w-4 h-4" /> Operational Modules
                    </div>

                    {/* Horizontal Scrolling Grid */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                        <div className="grid grid-rows-2 grid-flow-col gap-4 h-full auto-cols-[320px]">

                            {/* System Modules */}
                            <div className="h-full w-full"><BlueprintManager /></div>
                            <div className="h-full w-full"><HealthSentinel /></div>
                            <div className="h-full w-full"><PricingConfigurator /></div>
                            <div className="h-full w-full"><ClientManagementTile /></div>
                            <div className="h-full w-full"><AddonManager /></div>
                            <div className="h-full w-full"><FinancialSentinelTile /></div>
                            <div className="h-full w-full"><IntegritySentinelTile /></div>
                            <div className="h-full w-full"><EmailEngineTile /></div>
                            <div className="h-full w-full"><ClientDeployTile /></div>
                            <div className="h-full w-full"><DomainDiscoveryTile /></div>
                            <div className="h-full w-full"><DomainPortingTile /></div>
                            <div className="h-full w-full"><ClientExperienceTile /></div>
                            <div className="h-full w-full"><KnowledgeBaseTile /></div>
                            <div className="h-full w-full"><RestoreTile /></div>
                            <div className="h-full w-full"><SecurityTile /></div>
                            <div className="h-full w-full"><PerformanceTile /></div>
                            <div className="h-full w-full"><FinancialOverviewTile /></div>
                            <div className="h-full w-full"><ChatbotDeployerTile /></div>
                            <div className="h-full w-full"><CapabilitySyncTile /></div>
                            <div className="h-full w-full"><BundleArchitectTile /></div>
                            <div className="h-full w-full"><StorefrontPreviewTile /></div>
                            <div className="h-full w-full"><VariantConfigTile /></div>
                            <div className="h-full w-full"><AddonPricingTile /></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
