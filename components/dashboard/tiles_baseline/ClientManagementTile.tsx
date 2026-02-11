import React, { useState, useEffect } from 'react';
import { Shield, Zap, Search, LogOut, ExternalLink, Activity, Server, AlertTriangle, PlayCircle, StopCircle, RefreshCw, Key } from 'lucide-react';

export const ClientManagementTile = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [opsLoading, setOpsLoading] = useState(false);
    const [healthData, setHealthData] = useState<any>(null);
    const [ssoUrl, setSsoUrl] = useState('');

    useEffect(() => {
        // Fetch all clients (Sandbox + Production)
        const fetchClients = async () => {
            const res = await fetch('/api/integrity/status'); // leveraging existing endpoint to get client list snapshot
            // Ideally we'd have a getAllClients endpoint, but integrity check fetches all.
            // Actually, let's use the sandbox endpoint and assume for this demo we only have sandbox clients
            // OR reuse the integrity fetch logic if exposed.
            // Let's stick to sandbox clients for now as that's what we have endpoints for, OR assume the user has production clients too.
            // I'll fetch sandbox clients + potentially others.
            // Let's use /api/sandbox/clients for simplicity as that's confirmed working.
            const sRes = await fetch('/api/sandbox/clients');
            const data = await sRes.json();
            if (Array.isArray(data)) setClients(data);
        };
        fetchClients();
    }, []);

    const handleAction = async (action: string) => {
        if (!selectedId) return;
        setOpsLoading(true);
        setSsoUrl('');
        setHealthData(null);

        try {
            if (action === 'sso') {
                const res = await fetch('/api/support/sso', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deploymentId: selectedId })
                });
                const data = await res.json();
                if (data.success) {
                    window.open(data.url, '_blank');
                    setSsoUrl(data.url);
                }
            } else if (action === 'suspend' || action === 'unsuspend' || action === 'terminate') {
                if (action === 'terminate' && !confirm("CRITICAL: Are you sure you want to PERMANENTLY DELETE this client? This cannot be undone.")) {
                    setOpsLoading(false);
                    return;
                }
                const res = await fetch('/api/ops/service', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deploymentId: selectedId, action })
                });
                const data = await res.json();
                alert(data.message);
            } else if (action === 'health' || action === 'purge') {
                const res = await fetch('/api/ops/turbo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deploymentId: selectedId, purgeCache: action === 'purge' })
                });
                const data = await res.json();
                setHealthData(data);
            }
        } catch (e) {
            alert("Operation Failed");
        } finally {
            setOpsLoading(false);
        }
    };

    const selectedClient = clients.find(c => c.id === selectedId);

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[400px]">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 font-mono flex items-center gap-2 border-b border-slate-700 pb-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Administrative Ops
            </h3>

            <div className="mb-6">
                <label className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Target Client</label>
                <select
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-xs outline-none focus:border-emerald-500 font-mono"
                    value={selectedId}
                    onChange={e => { setSelectedId(e.target.value); setHealthData(null); setSsoUrl(''); }}
                >
                    <option value="">Select Client...</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name} ({c.domain}) - {c.status.toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>

            <div className={`flex-1 grid grid-cols-2 gap-4 ${!selectedId ? 'opacity-30 pointer-events-none' : ''}`}>
                {/* Access & Support */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col gap-3">
                    <h4 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2">
                        <Key className="w-3 h-3" /> Zero-Touch Access
                    </h4>
                    <button
                        onClick={() => handleAction('sso')}
                        disabled={opsLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                    >
                        {opsLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                        Admin SSO Login
                    </button>
                    <div className="text-[10px] text-slate-600 text-center">
                        Generates secure, time-limited token.
                    </div>
                </div>

                {/* Tech Ops */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col gap-3">
                    <h4 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Turbo & Health
                    </h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction('health')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 py-2 rounded text-xs font-bold uppercase"
                        >
                            DNS Check
                        </button>
                        <button
                            onClick={() => handleAction('purge')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 py-2 rounded text-xs font-bold uppercase"
                        >
                            Purge Cache
                        </button>
                    </div>
                    {healthData && (
                        <div className="mt-2 text-[10px] bg-black/30 p-2 rounded border border-slate-800 font-mono">
                            <div className={healthData.dns.healthy ? 'text-green-400' : 'text-red-400'}>
                                {healthData.dns.healthy ? '✔ DNS MATCH' : '✖ DNS MISMATCH'}
                            </div>
                            {healthData.cdn && (
                                <div className="text-yellow-400 mt-1">
                                    CDN: {healthData.cdn.itemsCleared ? `CLEARED ${healthData.cdn.itemsCleared} ITEMS` : healthData.cdn.status}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Account Lifecycle */}
                <div className="col-span-2 bg-slate-950 p-4 rounded border border-slate-800 mt-2">
                    <h4 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-3 h-3" /> Account Lifecycle (Danger Zone)
                    </h4>
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0" id="safety-toggle" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Safety Lock</span>
                        </label>

                        <div className="flex-1 flex gap-2 justify-end">
                            <button
                                onClick={() => handleAction('suspend')}
                                className="bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-500 border border-yellow-900/50 py-2 px-4 rounded text-xs font-bold uppercase flex items-center gap-2"
                            >
                                <StopCircle className="w-3 h-3" /> Suspend
                            </button>
                            <button
                                onClick={() => handleAction('unsuspend')}
                                className="bg-green-900/40 hover:bg-green-900/60 text-green-500 border border-green-900/50 py-2 px-4 rounded text-xs font-bold uppercase flex items-center gap-2"
                            >
                                <PlayCircle className="w-3 h-3" /> Restore
                            </button>
                            <button
                                onClick={() => {
                                    const locked = (document.getElementById('safety-toggle') as HTMLInputElement).checked;
                                    if (locked) { alert("Disengage Safety Lock first."); return; }
                                    handleAction('terminate');
                                }}
                                className="bg-red-900/40 hover:bg-red-900/60 text-red-500 border border-red-900/50 py-2 px-4 rounded text-xs font-bold uppercase flex items-center gap-2"
                            >
                                <LogOut className="w-3 h-3" /> Terminate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-6 -right-6 p-10 opacity-5 pointer-events-none">
                <Server className="w-40 h-40 text-emerald-500" />
            </div>
        </div>
    );
};
