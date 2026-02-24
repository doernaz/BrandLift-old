
import React, { useMemo } from 'react';
import type { FilterOptions } from '../../types';
import { INDUSTRIES } from '../../constants';
import { US_STATES, CITIES_BY_STATE } from '../../.../data/geo';
import { BrandLiftIcon } from './icons/BrandLiftIcon';

interface SidebarProps {
    filters: FilterOptions;
    setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
    onSearch: () => void;
    isLoading: boolean;
}

export const LeadFilters: React.FC<SidebarProps> = ({ filters, setFilters, onSearch, isLoading }) => {
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'state') {
            // When state changes, reset city to the first available city for that state.
            const firstCity = CITIES_BY_STATE[value as string]?.[0] || '';
            setFilters((prev) => ({ ...prev, state: value as string, city: firstCity }));
        } else {
            setFilters((prev) => ({ ...prev, [name]: finalValue }));
        }
    };

    const citiesForSelectedState = useMemo(() => {
        return CITIES_BY_STATE[filters.state] || [];
    }, [filters.state]);


    return (
        <aside className="w-full h-full bg-slate-900 border-none p-4 flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-800">
                <BrandLiftIcon className="w-5 h-5 text-cyan-500" />
                <h1 className="text-lg font-bold tracking-tight text-cyan-400">
                    BrandLift<span className="text-white opacity-50 font-normal">.Enrich</span>
                </h1>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="industry" className="block text-[10px] font-mono font-bold text-slate-500 mb-1 uppercase tracking-wider">INDUSTRY_</label>
                    <select
                        id="industry"
                        name="industry"
                        value={filters.industry}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                    >
                        {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="state" className="block text-[10px] font-mono font-bold text-slate-500 mb-1 uppercase tracking-wider">STATE_</label>
                    <select
                        id="state"
                        name="state"
                        value={filters.state}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                    >
                        {US_STATES.map((state) => (
                            <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="city" className="block text-[10px] font-mono font-bold text-slate-500 mb-1 uppercase tracking-wider">CITY_</label>
                    <select
                        id="city"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        disabled={citiesForSelectedState.length === 0}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {citiesForSelectedState.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="maxResults" className="block text-[10px] font-mono font-bold text-slate-500 mb-1 uppercase tracking-wider">MAX_RESULTS_</label>
                    <select
                        id="maxResults"
                        name="maxResults"
                        value={filters.maxResults}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value, 10) }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 cursor-pointer group p-2 rounded-md hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700 relative">
                        <input
                            type="checkbox"
                            name="goldMine"
                            checked={filters.goldMine || false}
                            onChange={handleFilterChange}
                            className="w-4 h-4 text-cyan-500 bg-slate-950 border-slate-700 rounded focus:ring-cyan-500 focus:ring-offset-0"
                        />
                        <div className="flex flex-col flex-1">
                            <span className={`font-mono text-xs font-bold transition-all ${filters.goldMine ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-300 group-hover:text-cyan-400'}`}>
                                GOLD_MINE_FILTER
                            </span>
                            <span className="text-[10px] text-slate-500">High-LTV / No-Web / 4.2+ Stars</span>
                        </div>

                        {/* Minimalist Info Trigger */}
                        <div className="group/tooltip relative ml-2">
                            <div className="w-4 h-4 rounded-full border border-slate-600 text-[10px] text-slate-500 flex items-center justify-center cursor-help hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                                i
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                                <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                                    <strong className="text-cyan-400 block mb-1">Gold Mine Strategy:</strong>
                                    Automates the discovery of high-LTV businesses (ATV &gt; $1,000) that possess strong social proof (4.2+ Stars) but lack a digital destination (Website = NULL). Prioritizes industries with stagnant local competition to maximize BrandLift SEO ROI.
                                </p>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
                            </div>
                        </div>
                    </label>
                </div>
                <div>
                    <label className="flex items-center gap-2 cursor-pointer group p-2 rounded-md hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                        <input
                            type="checkbox"
                            name="deepScan"
                            checked={filters.deepScan}
                            onChange={handleFilterChange}
                            className="w-4 h-4 text-cyan-500 bg-slate-950 border-slate-700 rounded focus:ring-cyan-500 focus:ring-offset-0"
                        />
                        <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">DEEP_SCAN_MODE</span>
                            <span className="text-[10px] text-slate-500">Force extensive sub-region search</span>
                        </div>
                    </label>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-3">
                    <label className="block text-[10px] font-mono font-bold text-slate-500 mb-2 uppercase tracking-wider">WEBSITE STATUS_</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="websiteStatus"
                                value="all"
                                checked={filters.websiteStatus === 'all'}
                                onChange={handleFilterChange}
                                className="w-3 h-3 text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500 focus:ring-offset-0"
                            />
                            <span className={`font-mono text-xs transition-colors ${filters.websiteStatus === 'all' ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'}`}>All Businesses</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="websiteStatus"
                                value="has_website"
                                checked={filters.websiteStatus === 'has_website'}
                                onChange={handleFilterChange}
                                className="w-3 h-3 text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500 focus:ring-offset-0"
                            />
                            <span className={`font-mono text-xs transition-colors ${filters.websiteStatus === 'has_website' ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'}`}>Has Website</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="websiteStatus"
                                value="no_website"
                                checked={filters.websiteStatus === 'no_website'}
                                onChange={handleFilterChange}
                                className="w-3 h-3 text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500 focus:ring-offset-0"
                            />
                            <span className={`font-mono text-xs transition-colors ${filters.websiteStatus === 'no_website' ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'}`}>No Website</span>
                        </label>
                    </div>
                </div>
            </div >

            <button
                onClick={onSearch}
                disabled={isLoading}
                className={`w-full mt-6 text-white font-bold font-mono py-2.5 text-xs rounded-md transition-all shadow-lg ${isLoading
                    ? 'bg-slate-700 cursor-not-allowed opacity-75'
                    : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/20 active:scale-[0.98]'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-b-transparent"></span>
                        SCANNING...
                    </span>
                ) : (
                    "EXECUTE SEARCH"
                )}
            </button>

            <div className="mt-auto border-t border-slate-800 pt-6 pb-2">
                <h3 className="font-mono text-slate-500 text-[10px] mb-3 uppercase tracking-widest font-bold">ACTIVE_INTEGRATIONS_</h3>
                <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Google Places API</span>
                        <span className={import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? "text-cyan-400" : "text-slate-600"}>
                            {import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Custom Search API</span>
                        <span className={import.meta.env.VITE_SEARCH_ENGINE_API_KEY ? "text-cyan-400" : "text-slate-600"}>
                            {import.meta.env.VITE_SEARCH_ENGINE_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hunter.io API</span>
                        <span className={import.meta.env.VITE_HUNTER_API_KEY ? "text-cyan-400" : "text-slate-600"}>
                            {import.meta.env.VITE_HUNTER_API_KEY ? "CONNECTED" : "OFFLINE"}
                        </span>
                    </div>
                </div>
            </div>
        </aside >
    );
};
