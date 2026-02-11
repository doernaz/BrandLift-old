import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity, RefreshCw, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

export const IntegritySentinelTile = () => {
    const [score, setScore] = useState(100);
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fixingId, setFixingId] = useState<string | null>(null);

    useEffect(() => {
        runScan();
    }, []);

    const runScan = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/integrity/status');
            const data = await res.json();
            setScore(data.score);
            setIssues(data.issues);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFix = async (id: string, type: string) => {
        setFixingId(id);
        try {
            await fetch('/api/integrity/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type })
            });
            await runScan();
        } catch (e) {
            alert('Fix Failed');
        } finally {
            setFixingId(null);
        }
    };

    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-500 border-green-500';
        if (s >= 70) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Integrity Sentinel
                </h3>
                <button
                    onClick={runScan}
                    disabled={loading}
                    className={`text-slate-400 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-6 items-center flex-1">
                {/* Score Ring */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full border-8 opacity-20 ${getScoreColor(score)} absolute`}></div>
                    <div
                        className={`w-full h-full rounded-full border-8 border-t-transparent ${getScoreColor(score)} absolute animate-spin-slow`}
                        style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: `rotate(${Date.now() / 50}deg)` }}
                    ></div>
                    <div className="text-center z-10">
                        <div className={`text-3xl font-bold font-mono ${getScoreColor(score).split(' ')[0]}`}>{score}%</div>
                        <div className="text-[10px] text-slate-500 uppercase">Integrity</div>
                    </div>
                </div>

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-slate-700 pr-2">
                    {issues.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <CheckCircle className="w-8 h-8 text-green-500/50" />
                            <span className="text-xs">All Systems Nominal</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {issues.map(issue => (
                                <div key={issue.id} className="bg-slate-950 border border-slate-800 p-3 rounded flex justify-between items-center gap-2 group hover:border-slate-600 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className={`w-3 h-3 ${issue.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                                            <span className="text-xs font-bold text-slate-300">{issue.type.toUpperCase()} GAP</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 leading-tight">{issue.message}</div>
                                    </div>
                                    <button
                                        onClick={() => handleFix(issue.id, issue.type)}
                                        disabled={fixingId === issue.id}
                                        className="bg-slate-800 hover:bg-cyan-900 text-cyan-400 text-[10px] px-2 py-1 rounded border border-slate-700 flex items-center gap-1 transition-all"
                                    >
                                        {fixingId === issue.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                                        <span className="hidden group-hover:inline">Fix Now</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Checks Summary */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Sync
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Uptime
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Finance
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Security
                </div>
            </div>

            {/* Background Effect */}
            <div className="absolute -top-10 -right-10 p-12 opacity-5 pointer-events-none">
                <Activity className="w-40 h-40 text-cyan-500" />
            </div>
        </div>
    );
};
