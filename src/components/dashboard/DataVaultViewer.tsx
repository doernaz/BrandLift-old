import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

export const DataVaultViewer = () => {
    const [stats, setStats] = useState<{ count: number; items: any[] } | null>(null);

    useEffect(() => {
        fetch('/api/admin/vault')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => setStats({ count: 0, items: [] }));
    }, []);

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 h-full flex flex-col relative overflow-hidden">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Shield className="w-4 h-4" /> IP Data Vault
            </h3>

            {/* Background Effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded text-center relative z-10 flex-grow flex flex-col justify-center items-center group cursor-help">
                <div className="relative mb-3">
                    <Lock className="w-8 h-8 text-amber-500 mx-auto opacity-80 group-hover:text-amber-400 transition-colors" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                </div>

                <div className="text-xs text-amber-200 font-mono tracking-widest mb-1">SECURE_STORAGE</div>
                <div className="text-2xl font-bold text-white font-mono mb-1">
                    {stats ? stats.count : '--'}
                </div>
                <div className="text-[10px] text-amber-500/70 font-mono uppercase">
                    Algorithms Protected
                </div>

                {/* Tooltip-like list on hover */}
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-left">
                    <div className="text-[10px] text-amber-400 mb-2 font-bold uppercase">Vault Contents:</div>
                    <ul className="space-y-1 w-full px-2">
                        {stats?.items?.slice(0, 3).map((item: any) => (
                            <li key={item.id} className="text-[9px] text-slate-300 font-mono truncate flex items-center gap-2">
                                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
