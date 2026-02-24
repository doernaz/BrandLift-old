import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, Loader, Bug, Search } from 'lucide-react';

export const SecurityTile = () => {
    const [packageId, setPackageId] = useState('pkg_demo_1');
    const [scanning, setScanning] = useState(false);
    const [report, setReport] = useState<any>(null);

    const handleScan = async () => {
        setScanning(true);
        setReport(null);
        try {
            const res = await fetch(`/api/elite/malware/${packageId}`);
            const data = await res.json();
            setReport(data);
        } catch (e) {
            console.error(e);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Elite Security
            </h3>

            <div className="flex gap-2 mb-4">
                <input
                    value={packageId}
                    onChange={e => setPackageId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-xs"
                    placeholder="Package ID"
                />
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs border border-red-800"
                >
                    {scanning ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded border border-slate-800">
                {!report && !scanning && <div className="text-xs text-slate-500 text-center">Enter Package ID to run scan</div>}
                {scanning && <div className="text-xs text-slate-400 animate-pulse">Running Deep Scan...</div>}

                {report && report.clean && (
                    <div className="text-center space-y-2 animate-fadeIn">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-sm font-bold text-green-400">System Clean</div>
                        <div className="text-[10px] text-slate-500">No malware signatures detected</div>
                    </div>
                )}

                {report && !report.clean && (
                    <div className="w-full animate-fadeIn">
                        <div className="flex items-center gap-2 text-red-500 font-bold text-xs mb-2 justify-center">
                            <Bug className="w-4 h-4" /> Critical Threats Found
                        </div>
                        <div className="space-y-2">
                            {report.threats.map((t: any, i: number) => (
                                <div key={i} className="bg-red-950/30 p-2 rounded border border-red-900/50 text-[10px]">
                                    <div className="text-red-300 font-bold">{t.type} ({t.severity})</div>
                                    <div className="text-slate-400 truncate" title={t.file}>{t.file}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-[10px] text-center text-red-400 animate-pulse">
                            Alert sent to Command Center
                        </div>
                    </div>
                )}
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-6 -left-6 p-8 opacity-5 pointer-events-none">
                <ShieldAlert className="w-32 h-32 text-red-500" />
            </div>
        </div>
    );
};
