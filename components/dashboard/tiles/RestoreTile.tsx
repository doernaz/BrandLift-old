import React, { useState, useEffect } from 'react';
import { RotateCcw, Calendar, Loader, History, Archive } from 'lucide-react';

export const RestoreTile = () => {
    const [packageId, setPackageId] = useState('pkg_demo_1');
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);

    const loadBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/elite/backups/${packageId}`);
            const data = await res.json();
            setBackups(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string) => {
        if (!confirm(`Are you sure you want to restore ${packageId} to snapshot ${id}? Current data will be overwritten.`)) return;

        setRestoring(id);
        try {
            await fetch('/api/elite/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId, snapshotId: id })
            });
            alert('Restore Initiated. System will reboot shortly.');
        } catch (e) {
            alert('Restore Failed');
        } finally {
            setRestoring(null);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <History className="w-4 h-4" /> Time Machine
            </h3>

            <div className="flex gap-2 mb-4">
                <input
                    value={packageId}
                    onChange={e => setPackageId(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-xs"
                    placeholder="Package ID"
                />
                <button
                    onClick={loadBackups}
                    disabled={loading}
                    className="bg-green-900/50 hover:bg-green-900 text-green-200 px-3 py-1 rounded border border-green-800 transition-colors"
                >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 max-h-[200px]">
                {backups.length === 0 && !loading && (
                    <div className="text-center text-slate-500 text-xs mt-8">No backups found or not loaded.</div>
                )}

                {backups.map((bk: any) => (
                    <div key={bk.id} className="bg-slate-950/50 p-3 rounded border border-slate-800 flex justify-between items-center group hover:border-green-500/30 transition-colors">
                        <div>
                            <div className="text-xs font-bold text-green-300 font-mono">{bk.date.split('T')[0]}</div>
                            <div className="text-[10px] text-slate-500 flex gap-2">
                                <span>{bk.type}</span> • <span>{bk.size}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRestore(bk.id)}
                            disabled={!!restoring}
                            className="text-[10px] bg-slate-800 hover:bg-green-600 hover:text-white text-slate-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            {restoring === bk.id ? <Loader className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                            Restore
                        </button>
                    </div>
                ))}
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <Archive className="w-32 h-32 text-green-500" />
            </div>
        </div>
    );
};
