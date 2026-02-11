import React, { useState, useEffect } from 'react';
import { Package, Plus, Check, Loader, ExternalLink, Calculator } from 'lucide-react';

interface Tier {
    id: string;
    name: string;
    specs: any;
    // Mocking cost for frontend logic since it wasn't in original API
    wholesale_cost?: number;
}

interface Addon {
    id: string;
    name: string;
    base_cost: number;
}

export const BundleArchitectTile = () => {
    const [step, setStep] = useState<'build' | 'success'>('build');
    const [loading, setLoading] = useState(false);

    // Data
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);

    // Form State
    const [bundleName, setBundleName] = useState('');
    const [selectedTier, setSelectedTier] = useState<string>('');
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [includeDomain, setIncludeDomain] = useState(false);
    const [retailPrice, setRetailPrice] = useState<number>(0);

    // Result
    const [result, setResult] = useState<{ buyUrl: string, bundleId: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [tRes, aRes] = await Promise.all([
                    fetch('/api/reseller/tiers'),
                    fetch('/api/reseller/addons')
                ]);
                const tData = await tRes.json();
                const aData = await aRes.json();

                // Hydrate Tiers with mock wholesale costs for the calculator
                const hydratedTiers = Array.isArray(tData) ? tData.map((t: any) => ({
                    ...t,
                    wholesale_cost: t.name === 'Basic' ? 5 : t.name === 'Pro' ? 15 : 30
                })) : [];

                setTiers(hydratedTiers);
                setAddons(Array.isArray(aData) ? aData : []);

                if (hydratedTiers.length > 0) setSelectedTier(hydratedTiers[0].id);
            } catch (e) {
                console.error("Failed to load bundle data", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Calculations
    const calculateWholesale = () => {
        let total = 0;

        // Tier Cost
        const tier = tiers.find(t => t.id === selectedTier);
        if (tier) total += (tier.wholesale_cost || 0);

        // Addons Cost
        selectedAddons.forEach(id => {
            const addon = addons.find(a => a.id === id);
            if (addon) total += addon.base_cost;
        });

        // Domain Credit Cost (Estimated)
        if (includeDomain) total += 10.00;

        return total;
    };

    const wholesaleCost = calculateWholesale();
    const margin = retailPrice > 0 ? ((retailPrice - wholesaleCost) / retailPrice) * 100 : 0;

    const handleCreate = async () => {
        if (!bundleName || !retailPrice) return;
        setLoading(true);
        try {
            const res = await fetch('/api/reseller/bundles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: bundleName,
                    tierId: selectedTier,
                    addonIds: selectedAddons,
                    includeDomain,
                    price: retailPrice
                })
            });
            const data = await res.json();
            setResult(data);
            setStep('success');
        } catch (e) {
            alert('Creation Failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Package className="w-4 h-4" /> Bundle Architect
            </h3>

            {step === 'build' ? (
                <div className="flex-1 flex flex-col gap-4">
                    {/* Name & Tier */}
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Bundle Name</label>
                        <input
                            value={bundleName}
                            onChange={e => setBundleName(e.target.value)}
                            placeholder="e.g. The Growth Starter"
                            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Hosting Tier</label>
                            <select
                                value={selectedTier}
                                onChange={e => setSelectedTier(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded px-2 py-2 text-xs outline-none focus:border-orange-500"
                            >
                                {tiers.map(t => <option key={t.id} value={t.id}>{t.name} (${t.wholesale_cost}/mo)</option>)}
                            </select>
                        </div>
                        <div className="flex items-center pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeDomain}
                                    onChange={e => setIncludeDomain(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-xs text-slate-300">Domain Credit (+$10)</span>
                            </label>
                        </div>
                    </div>

                    {/* Addons */}
                    <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                        <label className="text-[10px] uppercase text-slate-500 block mb-2">Include Add-ons</label>
                        <div className="space-y-2 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 pr-2">
                            {addons.map(a => (
                                <label key={a.id} className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedAddons.includes(a.id)}
                                            onChange={() => toggleAddon(a.id)}
                                            className="w-3 h-3 rounded border-slate-700 bg-slate-900 text-orange-500"
                                        />
                                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{a.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-mono">+${a.base_cost}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Engine */}
                    <div className="mt-auto bg-slate-800/30 p-3 rounded border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase text-slate-500">True Cost</span>
                            <span className="text-xs font-mono text-slate-400">${wholesaleCost.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase text-orange-400 block mb-1">Bundle Price</label>
                                <input
                                    type="number"
                                    value={retailPrice}
                                    onChange={e => setRetailPrice(parseFloat(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-600 text-white px-2 py-1 rounded text-sm font-mono text-right focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] uppercase text-slate-500 block mb-1">Margin</label>
                                <div className={`text-lg font-bold font-mono ${margin > 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {margin.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={loading || !bundleName}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded text-xs uppercase transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Virtual Product
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">Bundle Live!</h4>
                        <p className="text-xs text-slate-400">Virtual Product ID: {result?.bundleId}</p>
                    </div>

                    <div className="w-full bg-slate-950 p-3 rounded border border-slate-800 break-all text-[10px] text-orange-400 font-mono">
                        {result?.buyUrl}
                    </div>

                    <div className="flex gap-2 w-full">
                        <a
                            href={result?.buyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-xs flex items-center justify-center gap-2"
                        >
                            Test Link <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                            onClick={() => { setStep('build'); setBundleName(''); setRetailPrice(0); }}
                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded text-xs"
                        >
                            Build Another
                        </button>
                    </div>
                </div>
            )}
            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <Package className="w-40 h-40 text-orange-500" />
            </div>
        </div>
    );
};
