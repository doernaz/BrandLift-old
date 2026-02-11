
import React, { useEffect, useState } from 'react';

export const AnalyticsView = () => {
    const [metrics, setMetrics] = useState({ gross: 0, net: 0, hosting_costs: 0, support_costs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                setMetrics(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh] text-slate-500 font-mono flex-col gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin"></div>
            <p>COMPUTING FINANCIAL SENTINEL...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Profit Metrics Dashboard</h2>
                    <p className="text-slate-400 font-mono text-sm">PRICING & FINANCIAL SENTINEL</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-40">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">GROSS REVENUE (STRIPE)</div>
                    <div className="text-4xl font-bold text-white">${metrics.gross.toLocaleString()}</div>
                    <div className="text-green-400 text-xs font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> LIVE
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-40">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">NET PROFIT</div>
                    <div className="text-4xl font-bold text-cyan-400">${metrics.net.toLocaleString()}</div>
                    <div className="text-cyan-500/50 text-xs font-mono">Operations Deducted</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-40">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">HOSTING COSTS (20i)</div>
                    <div className="text-4xl font-bold text-red-400">-${metrics.hosting_costs.toLocaleString()}</div>
                    <div className="text-red-500/50 text-xs font-mono">Infrastructure</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-40">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">SUPPORT OPEX</div>
                    <div className="text-4xl font-bold text-yellow-400">-${metrics.support_costs.toLocaleString()}</div>
                    <div className="text-yellow-500/50 text-xs font-mono">Human Resources</div>
                </div>
            </div>

            <div className="w-full h-96 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
                <div className="text-slate-600 font-mono text-sm">[CHART VISUALIZATION PLACEHOLDER]</div>
                {/* In a real app, use Recharts or Chart.js here */}
            </div>
        </div>
    );
};
