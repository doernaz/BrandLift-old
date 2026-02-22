import React from 'react';
import { SeoAnalysisResult } from '../types';
import { SparklesIcon, ChartBarIcon, ServerIcon, UserGroupIcon, GlobeAltIcon, DocumentTextIcon, CogIcon } from '../components/icons/Icons';
import { LeadEnrichmentView } from './LeadEnrichmentView';
// import { SubsiteBuilder } from './builder/SubsiteBuilder'; // Stored for rewrite
import { SeoAuditResults } from './dashboard/SeoAuditResults';
import { LeadFilters } from './enrichment/LeadFilters';
import { LeadResultFeed } from './enrichment/LeadResultFeed';
import { searchLeads } from '../services/placesService';
import { getEstimatedMarketSize } from '../services/searchEngine';
import { Place, FilterOptions } from '../types';
import { HealthSentinel } from './dashboard/HealthSentinel';
import { MetricsHud } from './dashboard/MetricsHud'; // We'll keep this available if needed, but user wants the 3 rotating indicators
import { MetricStrip } from './dashboard/MetricStrip'; // The 3 rotating indicators
import { ClientMap } from './dashboard/ClientMap'; // The requested map
import { BlueprintManager } from './dashboard/BlueprintManager';
import { PricingConfigurator } from './dashboard/PricingConfigurator';
import { AddonManager } from './dashboard/AddonManager';
import { sessionStore } from '../services/sessionStore';

// Import All Tiles
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
import { VariantConfigTile, VariantConfig } from './dashboard/tiles/VariantConfigTile';
import { AddonPricingTile } from './dashboard/tiles/AddonPricingTile';
import { AuditorWorkflowTile } from './dashboard/AuditorWorkflowTile';

interface DashboardProps {
    onNavigate: (page: any) => void;
    recentSeoScore: number | null;
    analysisResult?: SeoAnalysisResult | null;
    targetUrl?: string; // for urlValue
    onReimagine?: (target: any) => void;
    activePanel: 'flow' | 'enrichment' | 'builder';
    setActivePanel: (panel: 'flow' | 'enrichment' | 'builder') => void;
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

export default function Dashboard({ onNavigate, recentSeoScore, analysisResult, targetUrl, onReimagine, activePanel, setActivePanel }: DashboardProps) {
    const [filters, setFilters] = React.useState<FilterOptions>({
        industry: 'HVAC',
        state: 'AZ',
        city: 'Phoenix',
        websiteStatus: 'no_website',
        deepScan: false,
        maxResults: 10,
    });
    const [leads, setLeads] = React.useState<Place[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [marketSize, setMarketSize] = React.useState<number | null>(null);
    const [searchStats, setSearchStats] = React.useState<{ scanned: number, noWebsite: number } | null>(null);
    const [reimaginingId, setReimaginingId] = React.useState<string | null>(null);
    const [reimagineSuccessId, setReimagineSuccessId] = React.useState<string | null>(null);
    const [selectedLead, setSelectedLead] = React.useState<Place | null>(null);
    const [antigravityReport, setAntigravityReport] = React.useState<any>(null); // New State

    // Config state
    const [variantConfig, setVariantConfig] = React.useState<VariantConfig>(() =>
        sessionStore.getVariantConfig() || { count: 3, themes: ['modern_minimal', 'dark_saas', 'corporate_trust'] }
    );

    const fetchLeads = React.useCallback(async () => {
        setActivePanel('enrichment'); // Force view back to results
        setHasSearched(true);
        setIsLoading(true);
        setError(null);
        setLeads([]);
        setMarketSize(null);
        setSearchStats(null);
        setAntigravityReport(null); // Clear previous reports
        try {
            const [data, size] = await Promise.all([
                searchLeads(filters),
                getEstimatedMarketSize(filters.industry, filters.city, filters.state)
            ]);
            setLeads(data.leads);
            setSearchStats(data.stats);
            setMarketSize(size);
        } catch (err) {
            setError((err as Error).message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const handleDashboardReimagine = async (target: string | Place) => {
        let id = '';
        if (typeof target === 'string') {
            const found = leads.find(l => l.website === target);
            if (found) id = found.id;
        } else {
            id = target.id;
        }

        if (id) {
            setReimaginingId(id);
            setReimagineSuccessId(null);
            setAntigravityReport(null);

            // Set selected lead for the builder
            if (typeof target === 'string') {
                // Already found 'found' above but scope issue. Let's re-find or optimize.
                const found = leads.find(l => l.website === target);
                if (found) setSelectedLead(found);
            } else {
                setSelectedLead(target);
            }
        }

        try {
            // ANTIGRAVITY EXECUTIVE TRIGGER
            // "Retrieve the category and location from the result whic reimaged is selected"
            const category = filters.industry;
            const location = `${filters.city}, ${filters.state}`;

            console.log(`[Antigravity] Selected Context: ${category} in ${location}`);
            console.log(`[Antigravity] Initiating Master Command Sequence...`);

            // Execute the Master Command in the background
            // We do not await this to allow the UI to transition immediately to the builder view
            fetch('/api/antigravity/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry: category, location: location })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("[Antigravity] Mission Report:", data);
                    setAntigravityReport(data); // Pass data to UI
                })
                .catch(err => console.error("[Antigravity] Protocol Failure:", err));

            if (onReimagine) {
                // Trigger the reimagine flow in App.tsx (which sets up builder state)
                onReimagine(target);
            }
            setActivePanel('builder');
        } catch (e) {
            console.error("Reimagine failed", e);
        } finally {
            if (id) {
                setReimaginingId(null);
                setReimagineSuccessId(id);
                setTimeout(() => setReimagineSuccessId(null), 3000);
            }
        }
    };

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

            {/* 3. Active Workflow (Lead Search & Results) */}
            <section className="pt-8 min-h-[800px]">
                <div className="flex items-center gap-2 mb-4">
                    <UserGroupIcon className="w-5 h-5 text-cyan-500" />
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lead Enhancement & Generation</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
                    {/* Left Panel: Search (25%) */}
                    <div className="xl:col-span-1 h-full min-h-[600px] border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 flex flex-col">
                        <LeadFilters filters={filters} setFilters={setFilters} onSearch={fetchLeads} isLoading={isLoading} />
                    </div>

                    {/* Right Panel: Results / Builder (75%) */}
                    <div className="xl:col-span-3 h-full min-h-[600px] bg-slate-950/30 rounded-xl border border-slate-800/50 overflow-hidden relative">
                        {activePanel === 'enrichment' && (
                            <div className="h-full w-full absolute inset-0">
                                <LeadResultFeed
                                    leads={leads}
                                    isLoading={isLoading}
                                    error={error}
                                    hasSearched={hasSearched}
                                    marketSize={marketSize}
                                    searchStats={searchStats}
                                    onReimagine={handleDashboardReimagine}
                                    reimaginingId={reimaginingId}
                                    reimagineSuccessId={reimagineSuccessId}
                                />
                            </div>
                        )}

                        {activePanel === 'builder' && (
                            <div className="h-full w-full absolute inset-0 overflow-y-auto custom-scrollbar bg-slate-950">
                                <SeoAuditResults
                                    analysisResults={analysisResult || null}
                                    targetUrl={targetUrl}
                                    selectedLead={selectedLead}
                                    onBack={() => setActivePanel('enrichment')}
                                    variantConfig={variantConfig}
                                    antigravityReport={antigravityReport} // Pass the report
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 3.5. Auditor Workflow Module */}
            <section className="pt-8 border-t border-slate-800/50">
                <AuditorWorkflowTile />
            </section>

            {/* 4. Main Command Grid: All Functional Tiles */}
            <section className="pt-8 border-t border-slate-800/50">
                <div className="flex items-center gap-2 mb-6">
                    <CogIcon className="w-5 h-5 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Modules</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    <VariantConfigTile config={variantConfig} setConfig={setVariantConfig} />
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
                    <AddonPricingTile />
                </div>
            </section>
        </div>
    );
}
