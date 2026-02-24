import React, { useState, useEffect } from 'react';
import { Search, Globe, ShoppingCart, Settings, Loader, Check } from 'lucide-react';

interface DomainResult {
    name: string;
    status: 'available' | 'taken';
    price: number;
    buyUrl: string;
}

export const DomainDiscoveryTile = () => {
    const [view, setView] = useState<'search' | 'admin'>('search');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DomainResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Admin Markup
    const [markup, setMarkup] = useState(20);
    const [markupSaving, setMarkupSaving] = useState(false);

    // Initial Load Logic
    useEffect(() => {
        // Fetch current markup
        fetch('/api/admin/domain/markup').then(r => r.json()).then(d => setMarkup(d.markup));

        // Simulate "Initial Load" checks (e.g. if we had a passed-in brand context)
        // For this Tile, we'll auto-suggest if empty
        if (results.length === 0) {
            handleRecommend('BrandLift');
        }
    }, []);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/domain/search?q=${query}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRecommend = async (brand: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/domain/recommendations?brand=${brand}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveMarkup = async () => {
        setMarkupSaving(true);
        try {
            await fetch('/api/admin/domain/markup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ percentage: parseFloat(markup.toString()) })
            });
            // Re-run search to update prices if results exist
            if (query) handleSearch();
            else handleRecommend('BrandLift');
        } catch (e) {
            alert('Failed to save markup');
        } finally {
            setMarkupSaving(false);
        }
    };

    // Buy Handler
    const handleBuy = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Domain Discovery
                </h3>
                <button
                    onClick={() => setView(view === 'search' ? 'admin' : 'search')}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors ${view === 'admin' ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {view === 'search' ? (
                <>
                    {/* Search Bar */}
                    <div className="flex gap-2 mb-4">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Find your perfect domain..."
                            className="flex-1 bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-cyan-500 outline-none"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded"
                        >
                            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] scrollbar-thin scrollbar-thumb-slate-700">
                        {loading ? (
                            <div className="text-center text-slate-500 py-8 text-xs">Scanning Registrar...</div>
                        ) : results.length > 0 ? (
                            results.map((domain, i) => (
                                <div key={i} className={`p-3 rounded border flex justify-between items-center ${domain.status === 'available' ? 'bg-slate-950/50 border-slate-800' : 'bg-red-950/10 border-red-900/20 opacity-60'}`}>
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">{domain.name}</div>
                                        <div className={`text-[10px] uppercase font-bold ${domain.status === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                                            {domain.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-mono text-cyan-400">${domain.price}</div>
                                        {domain.status === 'available' && (
                                            <button
                                                onClick={() => handleBuy(domain.buyUrl)}
                                                className="mt-1 text-[10px] bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded uppercase flex items-center gap-1"
                                            >
                                                Purchase <ShoppingCart className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8 text-xs">No domains found.</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="animate-fadeIn">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 border-b border-slate-800 pb-2">Global Pricing Rules</h4>
                    <div className="bg-slate-950/50 p-4 rounded border border-slate-800 mb-4">
                        <label className="text-[10px] uppercase text-slate-500 block mb-2">Domain Markup Percentage</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={markup}
                                onChange={(e) => setMarkup(Number(e.target.value))}
                                className="w-20 bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-cyan-500 outline-none"
                            />
                            <span className="text-slate-400 font-mono">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                            This percentage is applied on top of the base 20i reseller cost for all domain searches and automated suggestions.
                        </p>
                    </div>
                    <button
                        onClick={saveMarkup}
                        disabled={markupSaving}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded text-xs uppercase transition-all flex items-center justify-center gap-2 border border-slate-600"
                    >
                        {markupSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save Configuration
                    </button>
                </div>
            )}
        </div>
    );
};
