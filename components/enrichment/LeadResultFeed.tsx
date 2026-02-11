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
                    <div className="font-roboto-mono text-neon-mint">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-mint mr-3 inline-block"></div>
                        CONNECTING...
                    </div>
                </div>
            );
        }

        if (error) {
            return <p className="font-roboto-mono text-red-500 text-center">ERROR: {error}</p>;
        }

        if (!hasSearched) {
            return <p className="font-roboto-mono text-neutral-500 text-center">// SELECT FILTERS AND EXECUTE SEARCH.</p>;
        }

        if (leads.length === 0) {
            return <p className="font-roboto-mono text-neutral-500 text-center">// NO RESULTS FOUND FOR CURRENT FILTERS.</p>;
        }

        const withWebsite = leads.filter(l => l.website).length;
        const withoutWebsite = leads.length - withWebsite;

        return (
            <div className="flex flex-col h-full">
                <div className="mb-4 bg-black/20 p-3 border-l-2 border-neon-mint font-roboto-mono text-xs text-neutral-400 space-y-1">
                    <div className="flex justify-between items-end border-b border-neutral-700 pb-2 mb-2">
                        <div>
                            <span className="block text-neon-mint font-bold">// SCAN RESULTS_</span>
                            <div className="flex flex-col text-[10px] text-neutral-500">
                                <span>EST. TOTAL MARKET VOLUME: {marketSize ? `~${marketSize.toLocaleString()}` : <span className="animate-pulse">CALCULATING...</span>}</span>
                                {marketSize && searchStats && searchStats.scanned > 0 ? (
                                    <span className="text-neon-mint">
                                        POTENTIAL NO-WEB LEADS: ~{Math.round(marketSize * (searchStats.noWebsite / searchStats.scanned)).toLocaleString()}
                                        {' '}({Math.round((searchStats.noWebsite / searchStats.scanned) * 100)}% of market)
                                    </span>
                                ) : (
                                    <span className="text-neutral-600 h-4 block">Analyzing market structure...</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-white text-sm">{leads.length} LEADS EXTRACTED</span>
                            {searchStats && <span className="text-[10px] text-neutral-600 block">SCANNED: {searchStats.scanned} | MATCH RATE: {Math.round((leads.length / searchStats.scanned) * 100)}%</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <span className="text-white block">WEBSITE STATUS:</span>
                            <div className="flex gap-4 text-neutral-500">
                                <span className={withWebsite > 0 ? "text-green-400" : ""}>HAS WEB: {withWebsite}</span>
                                <span className={withoutWebsite > 0 ? "text-red-400" : ""}>NO WEB: {withoutWebsite}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-white block">SOCIAL CHANNELS SCANNED:</span>
                            <span className="text-neutral-500">FACEBOOK, LINKEDIN, INSTAGRAM, X</span>
                        </div>
                    </div>
                </div>
                <ResultsTable leads={leads} onReimagine={onReimagine} reimaginingId={reimaginingId} reimagineSuccessId={reimagineSuccessId} />
            </div >
        );
    };

    return (
        <div className="bg-[#0f0f0f] border border-neon-mint/30 rounded-sm h-full flex flex-col">
            <div className="flex items-center p-3 border-b border-neon-mint/30 text-neutral-500 text-xs font-roboto-mono">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-4"></div>
                <span>brandlift-terminal:/leads/</span>
            </div>
            <div className="p-4 flex-1 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};
