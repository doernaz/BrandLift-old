import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Loader, Mail, Folder, Activity, Server, FileText, CheckCircle, Zap } from 'lucide-react';

interface FeatureParams {
    id: string;
    name: string;
    enabled: boolean;
}

export const ClientExperienceTile = () => {
    const [tier, setTier] = useState('Basic');
    const [features, setFeatures] = useState<FeatureParams[]>([]);

    // Sandbox State
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchFeatures(tier);
        fetchSandboxClients();
    }, [tier]);

    const fetchFeatures = async (tierId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reseller/features/${tierId}`);
            const data = await res.json();
            if (data.features) {
                setFeatures(data.features);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchSandboxClients = async () => {
        try {
            const res = await fetch('/api/sandbox/clients');
            const data = await res.json();
            if (Array.isArray(data)) setClients(data);
        } catch (e) { /* ignore */ }
    };

    const toggleFeature = (id: string) => {
        setFeatures(prev => prev.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled } : f
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');

        // Calculate disabled list (inverse of enabled)
        const disabled = features.filter(f => !f.enabled).map(f => f.id);

        try {
            if (selectedClient) {
                // Apply to Specific Sandbox
                await fetch('/api/sandbox/portal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: selectedClient,
                        config: { tier, disabledFeatures: disabled, features }
                    })
                });
                setSuccessMsg(`Applied to Sandbox: ${selectedClient}`);
            } else {
                // Apply Global Tier Config
                const res = await fetch(`/api/reseller/features/${tier}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ disabledFeatures: disabled })
                });
                const data = await res.json();
                setSuccessMsg(data.message);
            }
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (e) {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const getIcon = (id: string) => {
        switch (id) {
            case 'email': return <Mail className="w-4 h-4" />;
            case 'file_manager': return <Folder className="w-4 h-4" />;
            case 'backups': return <Activity className="w-4 h-4" />;
            case 'stats': return <Server className="w-4 h-4" />;
            case 'billing': return <FileText className="w-4 h-4" />;
            default: return <LayoutTemplate className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[450px]">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" /> Client Experience
                </h3>
                <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-xs outline-none focus:border-pink-500"
                >
                    <option value="Basic">Basic Tier</option>
                    <option value="Pro">Pro Tier</option>
                    <option value="Ultimate">Ultimate Tier</option>
                </select>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader className="w-6 h-6 animate-spin text-slate-500" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 h-[200px]">
                    {features.map(f => (
                        <div
                            key={f.id}
                            onClick={() => toggleFeature(f.id)}
                            className={`p-3 rounded border flex justify-between items-center cursor-pointer transition-all ${f.enabled ? 'bg-pink-950/30 border-pink-900/50' : 'bg-slate-950 border-slate-800 opacity-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={f.enabled ? 'text-pink-400' : 'text-slate-500'}>
                                    {getIcon(f.id)}
                                </span>
                                <span className={`text-xs font-bold ${f.enabled ? 'text-white' : 'text-slate-500'}`}>
                                    {f.name}
                                </span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${f.enabled ? 'bg-pink-600' : 'bg-slate-700'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${f.enabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
                <select
                    className="w-full bg-slate-950 border border-slate-700 text-white px-2 py-2 rounded text-xs outline-none focus:border-pink-500"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                >
                    <option value="">Global Default (All Clients)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} (Override)</option>)}
                </select>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all"
                >
                    {saving ? <Loader className="w-3 h-3 animate-spin" /> : (
                        selectedClient ? (
                            <>Apply to Sandbox <Zap className="w-3 h-3" /></>
                        ) : (
                            <>Save Global Tier <CheckCircle className="w-3 h-3" /></>
                        )
                    )}
                </button>

                {successMsg && (
                    <div className="mt-2 text-[10px] text-green-400 text-center animate-fadeIn flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {successMsg}
                    </div>
                )}
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-4 -right-4 p-8 opacity-5 pointer-events-none">
                <LayoutTemplate className="w-32 h-32 text-pink-500" />
            </div>
        </div>
    );
};
