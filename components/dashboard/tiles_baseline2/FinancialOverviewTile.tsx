import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

export const FinancialOverviewTile = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/financial/overview');
            const d = await res.json();
            setData(d);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!data && loading) return <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg flex items-center justify-center min-h-[300px]"><RefreshCcw className="animate-spin text-slate-500" /></div>;

    if (!data) return <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg min-h-[300px]">Failed to load</div>;

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Financial Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-950/20 p-4 rounded border border-green-900/40">
                    <div className="text-[10px] text-green-400 uppercase font-bold mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Income
                    </div>
                    <div className="text-2xl font-mono text-white">${data.monthly_revenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Stripe Monthly Recurring</div>
                </div>

                <div className="bg-red-950/20 p-4 rounded border border-red-900/40">
                    <div className="text-[10px] text-red-400 uppercase font-bold mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Costs
                    </div>
                    <div className="text-2xl font-mono text-white">${data.monthly_cost.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 mt-1">20i Reseller Fees</div>
                </div>
            </div>

            <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">Month To Date</div>

                <div className="flex items-end justify-between mb-4">
                    <div>
                        <div className="text-xs text-slate-400 uppercase mb-1">Net Profit</div>
                        <div className="text-3xl font-bold text-white font-mono">${data.profit.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded text-xl font-bold text-cyan-400 font-mono">
                        {data.margin}
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    {data.breakdown.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-slate-800 pb-1 last:border-0 hover:bg-slate-900 px-1 py-1 rounded transition-colors">
                            <span className="text-slate-400">{item.category}</span>
                            <span className="font-mono text-white">${item.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-10 -right-10 p-12 opacity-5 pointer-events-none">
                <PieChart className="w-64 h-64 text-green-500" />
            </div>
        </div>
    );
};
