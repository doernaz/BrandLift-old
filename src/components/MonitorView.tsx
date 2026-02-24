
import React, { useEffect, useState } from 'react';

export const MonitorView = () => {
    const [data, setData] = useState<{ clients: any[], logs: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/data')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh] text-slate-500 font-mono flex-col gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
            <p>SYNCING SOURCE OF TRUTH...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Database Explorer GUI</h2>
                    <p className="text-slate-400 font-mono text-sm">PATENTED IP & FIREBASE SOURCE OF TRUTH</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-mono text-xs border border-slate-700">
                        EXPORT JSON
                    </button>
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-mono text-xs shadow-lg shadow-cyan-500/20">
                        FORCE SYNC
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client List (Firestore Mirror) */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                        <h3 className="font-bold text-slate-300 text-sm tracking-wider">ACTIVE CLIENTS (FIRESTORE)</h3>
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">LIVE SYNC</span>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {data?.clients.map((client, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                <div>
                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{client.domain}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {client.id}</div>
                                    {/* Link to 20i Site */}
                                    <div className="mt-1">
                                        <a href={`http://${client.domain.replace('.', '-')}.stackstaging.com`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1">
                                            Open Site <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-slate-300 font-mono">${client.revenue.toFixed(2)}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${client.status === 'live' ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                            {client.status}
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${client.status === 'live' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Logs (The Sentinel) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                        <h3 className="font-bold text-slate-300 text-sm tracking-wider">SYSTEM ACTIVITY LOG</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-4 font-mono text-xs">
                        {data?.logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-slate-700 pl-4 py-1 relative">
                                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-800 border border-slate-600"></div>
                                <div className="text-cyan-400 font-bold mb-1">{log.action}</div>
                                <div className="text-slate-500 mb-2">{new Date(log.timestamp).toLocaleString()}</div>
                                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-400 break-all">
                                    {JSON.stringify(log.details)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
