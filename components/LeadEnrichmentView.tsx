import React, { useState, useCallback } from 'react';
import type { Place } from '../types';
import { FilterOptions } from '../types';
import { LeadFilters } from './enrichment/LeadFilters';
import { LeadResultFeed } from './enrichment/LeadResultFeed';
import { searchLeads } from '../services/placesService';
import { getEstimatedMarketSize } from '../services/searchEngine';

// NOTE: This component replaces the previous LeadEnrichmentView logic 
// with the functionality from the standalone lead-generation-dashboard.

interface LeadEnrichmentViewProps {
    onReimagine?: (target: string | Place) => void;
}

export const LeadEnrichmentView: React.FC<LeadEnrichmentViewProps> = ({ onReimagine }) => {
    const [filters, setFilters] = useState<FilterOptions>({
        industry: 'HVAC',
        state: 'AZ',
        city: 'Phoenix',
        noWebsiteOnly: true,
        deepScan: false,
        maxResults: 10,
    });
    const [leads, setLeads] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [marketSize, setMarketSize] = useState<number | null>(null);
    const [searchStats, setSearchStats] = useState<{ scanned: number, noWebsite: number } | null>(null);
    const [reimaginingId, setReimaginingId] = useState<string | null>(null);
    const [reimagineSuccessId, setReimagineSuccessId] = useState<string | null>(null);

    const fetchLeads = useCallback(async () => {
        setHasSearched(true);
        setIsLoading(true);
        setError(null);
        setLeads([]); // Clear previous leads
        setMarketSize(null);
        setSearchStats(null);
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

    const handleReimagine = async (target: string | Place) => {
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
        }

        try {
            if (onReimagine) {
                // Ensure spinner shows for at least 2 seconds for feedback
                await Promise.all([
                    onReimagine(target),
                    new Promise(resolve => setTimeout(resolve, 2000))
                ]);
            }
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
        // Using min-h-[calc(100vh-theme(spacing.16))] or similar to fit within the dashboard layout if needed.
        // The original App.tsx had min-h-screen. We might want to adjust for the main app container.
        // We'll keep the flex layout.
        <div className="font-sans bg-deep-charcoal text-white flex flex-col md:flex-row h-full overflow-hidden">
            <LeadFilters filters={filters} setFilters={setFilters} onSearch={fetchLeads} />
            <main className="flex-1 p-4 md:p-8 overflow-auto h-full">
                <LeadResultFeed
                    leads={leads}
                    isLoading={isLoading}
                    error={error}
                    hasSearched={hasSearched}
                    marketSize={marketSize}
                    searchStats={searchStats}
                    onReimagine={handleReimagine}
                    reimaginingId={reimaginingId}
                    reimagineSuccessId={reimagineSuccessId}
                />
            </main>
        </div>
    );
};
