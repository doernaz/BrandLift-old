import React, { useState, useEffect } from 'react';
import { Tag, Loader, RefreshCw, Eye, EyeOff, CheckCircle, TrendingUp, Zap } from 'lucide-react';

interface Addon {
    id: string;
    name: string;
    base_cost: number;
    retail_price: number;
    visible: boolean;
}

export const AddonPricingTile = () => {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedForInclusion, setSelectedForInclusion] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [provisioning, setProvisioning] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resAddons, resClients] = await Promise.all([
                fetch('/api/reseller/addons'),
                fetch('/api/sandbox/clients')
            ]);

            const dataAddons = await resAddons.json();
            if (Array.isArray(dataAddons)) setAddons(dataAddons);

            const dataClients = await resClients.json();
            if (Array.isArray(dataClients)) setClients(dataClients);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (id: string, val: string) => {
        const num = parseFloat(val);
        setAddons(prev => prev.map(a =>
            a.id === id ? { ...a, retail_price: isNaN(num) ? 0 : num } : a
        ));
    };

    const toggleVisible = (id: string) => {
        setAddons(prev => prev.map(a =>
            a.id === id ? { ...a, visible: !a.visible } : a
        ));
    };

    const toggleInclusion = (id: string) => {
        setSelectedForInclusion(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSync = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/reseller/addons/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: addons })
            });
            const data = await res.json();
            setMsg(data.message);
            setTimeout(() => setMsg(''), 4000);
        } catch (e) { alert("Sync Failed"); } finally { setSaving(false); }
    };

    const handleProvision = async () => {
        if (!selectedClient || selectedForInclusion.length === 0) return;
        setProvisioning(true);
        try {
            const res = await fetch('/api/sandbox/addons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: selectedClient, addons: selectedForInclusion })
            });
            const data = await res.json();
            alert(data.message);
            setSelectedForInclusion([]);
        } catch (e) { alert('Provisioning Failed'); }
        setProvisioning(false);
    };

    const getMargin = (retail: number, cost: number) => {
        if (retail === 0) return '0%';
        const margin = ((retail - cost) / retail) * 100;
        return `${margin.toFixed(0)}%`;
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[450px]">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Tag className="w-4 h-4" /> Upgrades & Add-ons
            </h3>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader className="w-6 h-6 animate-spin text-slate-500" />
                </div>
            ) : (
                <div className="flex-1 overflow-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-700 mb-4 h-[200px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                                <th className="pb-2 pl-2">Use</th>
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Retail</th>
                                <th className="pb-2 text-right">Margin</th>
                                <th className="pb-2 text-center">Vis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addons.map((addon) => {
                                const marginNum = parseFloat(getMargin(addon.retail_price, addon.base_cost));
                                const marginColor = marginNum > 50 ? 'text-green-400' : marginNum > 20 ? 'text-yellow-400' : 'text-red-400';
                                const selected = selectedForInclusion.includes(addon.id);

                                return (
                                    <tr key={addon.id} className={`border-b border-slate-800/50 transition-colors ${selected ? 'bg-yellow-900/10' : 'hover:bg-slate-800/20'}`}>
                                        <td className="py-2 pl-2">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => toggleInclusion(addon.id)}
                                                className="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-0"
                                            />
                                        </td>
                                        <td className="py-2 text-xs font-bold text-slate-300">{addon.name}</td>
                                        <td className="py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={addon.retail_price}
                                                onChange={(e) => handlePriceChange(addon.id, e.target.value)}
                                                className="w-16 bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-xs font-mono focus:border-yellow-500 outline-none text-right"
                                            />
                                        </td>
                                        <td className={`py-2 text-right text-xs font-mono font-bold ${marginColor}`}>
                                            {getMargin(addon.retail_price, addon.base_cost)}
                                        </td>
                                        <td className="py-2 text-center">
                                            <button
                                                onClick={() => toggleVisible(addon.id)}
                                                className={`p-1.5 rounded transition-colors ${addon.visible ? 'text-green-400 hover:bg-green-900/20' : 'text-slate-600 hover:bg-slate-800'}`}
                                            >
                                                {addon.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="space-y-3 mt-auto border-t border-slate-800 pt-3">
                <button
                    onClick={handleSync}
                    disabled={saving || loading}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs uppercase flex items-center justify-center gap-2 border border-slate-700/50 transition-all"
                >
                    {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                    Update Pricing (Global)
                </button>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-slate-900 border border-slate-700 text-white px-2 py-2 rounded text-xs outline-none focus:border-yellow-500"
                            value={selectedClient}
                            onChange={e => setSelectedClient(e.target.value)}
                        >
                            <option value="">Select Sandbox Filter...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button
                            onClick={handleProvision}
                            disabled={!selectedClient || selectedForInclusion.length === 0 || provisioning}
                            className={`bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-3 rounded text-xs uppercase transition-all flex items-center justify-center gap-2 ${(!selectedClient || selectedForInclusion.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {provisioning ? <Loader className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            Deploy
                        </button>
                    </div>
                </div>

                {msg && (
                    <div className="text-[10px] text-green-400 text-center animate-fadeIn flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {msg}
                    </div>
                )}
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-4 -left-4 p-8 opacity-5 pointer-events-none">
                <Tag className="w-32 h-32 text-yellow-500" />
            </div>
        </div>
    );
};
