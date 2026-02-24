import React from 'react';
import type { Place } from '../../types';
import { ResultsTable } from './ResultsTable';

interface TerminalFeedProps {
    leads: Place[];
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
    marketSize?: number | null;
    searchStats?: { scanned: number, noWebsite: number } | null;
    onReimagine?: (target: string | Place) => void;
    reimaginingId?: string | null;
    reimagineSuccessId?: string | null;
}

export const LeadResultFeed: React.FC<TerminalFeedProps> = ({ leads, isLoading, error, hasSearched, marketSize, searchStats, onReimagine, reimaginingId, reimagineSuccessId }) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="font-mono text-cyan-400 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                        <span className="animate-pulse tracking-widest text-sm">SCANNING MARKET DATA...</span>
                        <span className="text-[10px] text-slate-500 animate-pulse delay-75">ESTIMATING AUDIENCE SIZE</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return <p className="font-mono text-red-400 text-center mt-10 p-4 border border-red-900/50 bg-red-950/20 rounded-md">ERROR: {error}</p>;
        }

        if (!hasSearched) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 font-mono space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <p className="text-xs">// SELECT FILTERS AND EXECUTE SEARCH.</p>
                </div>
            );
        }

        if (leads.length === 0) {
            return <p className="font-mono text-[10px] text-slate-500 text-center mt-10">// NO RESULTS FOUND FOR CURRENT FILTERS.</p>;
        }

        const withWebsite = leads.filter(l => l.website).length;
        const withoutWebsite = leads.length - withWebsite;

        return (
            <div className="flex flex-col h-full">
                <div className="mb-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800 shadow-sm font-mono text-[10px] text-slate-400 space-y-1">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-2">
                        <div>
                            <span className="block text-cyan-400 font-bold tracking-wider mb-1">// SCAN METRICS_</span>
                            <div className="flex flex-col text-[10px] text-slate-500 space-y-1">
                                {/* Market Estimation Logic Removed via User Request */}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-slate-200 text-xs font-bold bg-slate-800 px-2 py-0.5 rounded-md inline-block mb-1">{leads.length} LEADS EXTRACTED</span>
                            {searchStats && <span className="text-[9px] text-slate-600 block">SCANNED: {searchStats.scanned} | MATCH RATE: {Math.round((leads.length / searchStats.scanned) * 100)}%</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <span className="text-slate-300 block text-[9px] uppercase tracking-widest mb-1">Website Status</span>
                            <div className="flex gap-4 text-slate-500">
                                <span className={withWebsite > 0 ? "text-green-500" : ""}>HAS WEB: {withWebsite}</span>
                                <span className={withoutWebsite > 0 ? "text-red-400 font-bold" : ""}>NO WEB: {withoutWebsite}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-slate-300 block text-[9px] uppercase tracking-widest mb-1">Social Channels</span>
                            <span className="text-slate-500">FACEBOOK, LINKEDIN, INSTAGRAM, X</span>
                        </div>
                    </div>
                </div>
                <ResultsTable leads={leads} onReimagine={onReimagine} reimaginingId={reimaginingId} reimagineSuccessId={reimagineSuccessId} />
            </div >
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

            <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-950/50 text-slate-500 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    </div>
                    <span className="ml-2 text-slate-400">brandlift.enrichment</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-cyan-500">leads_view</span>
                </div>
                <div className="text-[10px] text-slate-600">
                    READY
                </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};
