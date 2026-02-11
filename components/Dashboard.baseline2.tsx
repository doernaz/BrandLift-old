import React from 'react';
import { SeoAnalysisResult } from '../types';
import { SparklesIcon, ChartBarIcon, ServerIcon, UserGroupIcon, GlobeAltIcon, DocumentTextIcon, CogIcon } from '../components/icons/Icons';
import { HealthSentinel } from './dashboard/HealthSentinel';
import { MetricsHud } from './dashboard/MetricsHud'; // We'll keep this available if needed, but user wants the 3 rotating indicators
import { MetricStrip } from './dashboard/MetricStrip'; // The 3 rotating indicators
import { ClientMap } from './dashboard/ClientMap'; // The requested map
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
}

const AppTile = ({ title, description, icon: Icon, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`text-left p-6 rounded-xl border transition-all duration-300 group relative overflow-hidden h-full ${active
                ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
            }`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-24 h-24 text-slate-400" />
        </div>
        <div className="relative z-10">
            <div className={`p-3 rounded-lg w-fit mb-4 transition-colors ${active ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                }`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${active ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                {title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed font-mono">
                {description}
            </p>
        </div>
        {active && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        )}
    </button>
);

export default function Dashboard({ onNavigate, recentSeoScore }: DashboardProps) {
    return (
        <div className="p-6 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">

            {/* Header + Version */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-4xl font-bold text-white font-mono tracking-tighter">
                        COMMAND<span className="text-cyan-500">_CENTER</span>
                    </h2>
                </div>
                <div className="hidden md:block">
                    <div className="text-right text-xs text-slate-600 font-mono">v2.5.0-beta</div>
                </div>
            </div>

            {/* 1. TOP SECTION: 3 Rotating Indicators */}
            <section>
                <MetricStrip />
            </section>

            {/* 2. MAP SECTION: Nationwide Command View */}
            <section>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4" />
                        Nationwide Command View
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time Visualization // ZOOM LvL 4</span>
                </div>
                <ClientMap />
            </section>

            {/* 3. Active Workflow (Walk The Flow & Key Actions) */}
            <section className="pt-8">
                <div className="flex items-center gap-2 mb-4">
                    <CogIcon className="w-5 h-5 text-cyan-500 animate-spin-slow" />
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Workflow</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Walk The Flow Tile (Primary Visualizer) */}
                    <div className="xl:col-span-2">
                        <WalkTheFlowTile />
                    </div>

                    {/* Key Actions */}
                    <div className="grid grid-cols-1 gap-6">
                        <AppTile
                            title="Lead Enrichment"
                            description="Deep-dive business intelligence. Scrape, enrich, and qualify leads from Google Maps."
                            icon={UserGroupIcon}
                            onClick={() => onNavigate('enrichment')}
                            active={true}
                        />
                        <AppTile
                            title="Subsite Builder"
                            description="Architecture studio for managing blueprints and deploying new variant themes."
                            icon={SparklesIcon}
                            onClick={() => onNavigate('builder')}
                        />
                    </div>
                </div>
            </section>

            {/* 4. Main Command Grid: All Functional Tiles */}
            <section className="pt-8 border-t border-slate-800/50">
                <div className="flex items-center gap-2 mb-6">
                    <CogIcon className="w-5 h-5 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Modules</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    <SandboxManagerTile />
                    <BlueprintManager />
                    <HealthSentinel />
                    <PricingConfigurator />
                    <AddonManager />

                    {/* Deep Stack Modules */}
                    <ClientManagementTile />
                    <FinancialSentinelTile />
                    <IntegritySentinelTile />
                    <EmailEngineTile />
                    <ClientDeployTile />
                    <DomainDiscoveryTile />
                    <DomainPortingTile />
                    <ClientExperienceTile />
                    <KnowledgeBaseTile />
                    <RestoreTile />
                    <SecurityTile />
                    <PerformanceTile />
                    <FinancialOverviewTile />
                    <ChatbotDeployerTile />
                    <CapabilitySyncTile />
                    <BundleArchitectTile />
                    <StorefrontPreviewTile />
                    <VariantConfigTile />
                    <AddonPricingTile />
                </div>
            </section>
        </div>
    );
}
