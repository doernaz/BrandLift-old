import React, { useState, useEffect } from 'react';
import { Rocket, Zap, Sliders, CheckCircle, Loader } from 'lucide-react';

export const PerformanceTile = () => {
    const [packageId, setPackageId] = useState('pkg_demo_1');
    const [optimization, setOptimization] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);

    const handleOptimization = async (state: boolean) => {
        setLoading(true);
        try {
            const res = await fetch('/api/elite/optimization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId, enable: state })
            });
            const data = await res.json();
            setStatus(data);
            setOptimization(state);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Rocket className="w-4 h-4" /> Elite Performance
            </h3>

            <div className="flex gap-2 mb-4">
                <input
                    value={packageId}
                    onChange={e => setPackageId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-xs"
                    placeholder="Package ID"
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${optimization ? 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'border-slate-800'}`}>
                    <Zap className={`w-8 h-8 transition-colors duration-500 ${optimization ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>

                <div className="text-center">
                    <h4 className="text-white font-bold">{optimization ? 'TURBO MODE ACTIVE' : 'STANDARD MODE'}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                        {optimization ? 'Edge Caching & Image Compression Enabled' : 'Basic Performance Tier'}
                    </p>
                </div>

                <div className="flex gap-2 w-full mt-4">
                    <button
                        onClick={() => handleOptimization(true)}
                        disabled={loading || optimization}
                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${optimization ? 'bg-cyan-900/20 text-cyan-700 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'}`}
                    >
                        {loading && !optimization ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'ACTIVATE'}
                    </button>
                    <button
                        onClick={() => handleOptimization(false)}
                        disabled={loading || !optimization}
                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${!optimization ? 'bg-slate-900/20 text-slate-700 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                    >
                        {loading && optimization ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'DISABLE'}
                    </button>
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <Rocket className="w-32 h-32 text-cyan-500" />
            </div>
        </div>
    );
};
