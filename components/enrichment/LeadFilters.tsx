
import React, { useMemo } from 'react';
import type { FilterOptions } from '../../types';
import { INDUSTRIES } from '../../constants';
import { US_STATES, CITIES_BY_STATE } from '../../data/geo';
import { BrandLiftIcon } from './icons/BrandLiftIcon';

interface SidebarProps {
    filters: FilterOptions;
    setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
    onSearch: () => void;
}

export const LeadFilters: React.FC<SidebarProps> = ({ filters, setFilters, onSearch }) => {
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === 'state') {
            // When state changes, reset city to the first available city for that state.
            const firstCity = CITIES_BY_STATE[value]?.[0] || '';
            setFilters((prev) => ({ ...prev, state: value, city: firstCity }));
        } else {
            setFilters((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleToggleChange = (field: keyof FilterOptions) => {
        setFilters((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const citiesForSelectedState = useMemo(() => {
        return CITIES_BY_STATE[filters.state] || [];
    }, [filters.state]);


    return (
        <aside className="w-full md:w-80 bg-black/30 md:border-r border-neutral-800 p-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-10">
                <BrandLiftIcon className="w-8 h-8 text-neon-mint" />
                <h1 className="font-space-grotesk text-2xl font-bold tracking-tighter">BrandLift</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <label htmlFor="industry" className="block text-sm font-roboto-mono text-neutral-400 mb-2">INDUSTRY_</label>
                    <select
                        id="industry"
                        name="industry"
                        value={filters.industry}
                        onChange={handleFilterChange}
                        className="w-full bg-deep-charcoal border border-neutral-700 rounded-sm p-2 font-roboto-mono focus:ring-1 focus:ring-neon-mint focus:border-neon-mint focus:outline-none"
                    >
                        {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-roboto-mono text-neutral-400 mb-2">STATE_</label>
                    <select
                        id="state"
                        name="state"
                        value={filters.state}
                        onChange={handleFilterChange}
                        className="w-full bg-deep-charcoal border border-neutral-700 rounded-sm p-2 font-roboto-mono focus:ring-1 focus:ring-neon-mint focus:border-neon-mint focus:outline-none"
                    >
                        {US_STATES.map((state) => (
                            <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-roboto-mono text-neutral-400 mb-2">CITY_</label>
                    <select
                        id="city"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        disabled={citiesForSelectedState.length === 0}
                        className="w-full bg-deep-charcoal border border-neutral-700 rounded-sm p-2 font-roboto-mono focus:ring-1 focus:ring-neon-mint focus:border-neon-mint focus:outline-none disabled:opacity-50"
                    >
                        {citiesForSelectedState.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="maxResults" className="block text-sm font-roboto-mono text-neutral-400 mb-2">MAX_RESULTS_</label>
                    <select
                        id="maxResults"
                        name="maxResults"
                        value={filters.maxResults}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value, 10) }))}
                        className="w-full bg-deep-charcoal border border-neutral-700 rounded-sm p-2 font-roboto-mono focus:ring-1 focus:ring-neon-mint focus:border-neon-mint focus:outline-none"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div className="border-t border-neutral-800 pt-6 space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-roboto-mono text-white text-sm">Target: No Website</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.noWebsiteOnly}
                                onChange={() => handleToggleChange('noWebsiteOnly')}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.noWebsiteOnly ? 'bg-neon-mint' : 'bg-neutral-700'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.noWebsiteOnly ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-roboto-mono text-white text-sm">Mode: Deep Scan</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={!!filters.deepScan}
                                onChange={() => handleToggleChange('deepScan')}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.deepScan ? 'bg-indigo-500' : 'bg-neutral-700'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.deepScan ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                    <p className="text-[10px] text-neutral-500 font-roboto-mono">
                        Deep Scan splits the city into 5 sub-regions for maximum coverage. Slower but more thorough.
                    </p>
                </div>
            </div>

            <button
                onClick={onSearch}
                className="w-full mt-8 bg-neon-mint text-deep-charcoal font-bold font-space-grotesk py-2 rounded-sm hover:bg-white transition-colors"
            >
                EXECUTE SEARCH
            </button>

            <div className="mt-8 border-t border-neutral-800 pt-6">
                <h3 className="font-roboto-mono text-neutral-400 text-xs mb-3">ACTIVE_INTEGRATIONS_</h3>
                <div className="space-y-2 font-roboto-mono text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Google Places API</span>
                        <span className={import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? "text-neon-mint" : "text-neutral-600"}>
                            {import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Custom Search API</span>
                        <span className={import.meta.env.VITE_SEARCH_ENGINE_API_KEY ? "text-neon-mint" : "text-neutral-600"}>
                            {import.meta.env.VITE_SEARCH_ENGINE_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Hunter.io API</span>
                        <span className={import.meta.env.VITE_HUNTER_API_KEY ? "text-neon-mint" : "text-neutral-600"}>
                            {import.meta.env.VITE_HUNTER_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
