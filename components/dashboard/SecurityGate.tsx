import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Server } from 'lucide-react';

export const SecurityGate = () => {
    const [status, setStatus] = useState<'LOCKED' | 'UNLOCKED'>('LOCKED');
    const [loading, setLoading] = useState(false);
    const [activePackageId, setActivePackageId] = useState<string | null>(null);
    const [packageDomain, setPackageDomain] = useState<string>('');

    useEffect(() => {
        // Auto-resolve context to finding the most relevant active site
        fetch('/api/admin/data')
            .then(res => res.json())
            .then(data => {
                if (data.clients && data.clients.length > 0) {
                    // Start with the first client found
                    const target = data.clients[0];
                    setActivePackageId(target.packageId || target.id);
                    setPackageDomain(target.domain);
                }
            })
            .catch(() => { });
    }, []);

    const toggleSecurity = async () => {
        if (!activePackageId || loading) return;

        // Toggle Logic
        const newStatus = status === 'LOCKED' ? 'UNLOCKED' : 'LOCKED';
        const action = newStatus === 'UNLOCKED' ? 'unlock' : 'lock';

        setLoading(true);
        try {
            const res = await fetch('/api/security/ftp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: activePackageId, action })
            });

            if (!res.ok) throw new Error("Security toggle failed");

            setStatus(newStatus);
        } catch (e) {
            console.error(e);
            alert("Failed to toggle security protocols.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
            {/* Status Indicator Background */}
            <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500 ${status === 'LOCKED' ? 'bg-green-500' : 'bg-red-500'}`} />

            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    {status === 'LOCKED' ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />}
                    Security Gate
                </h3>

                <div className="space-y-1 mb-6">
                    <div className="text-xs text-slate-500 font-mono uppercase">Target Ecosystem</div>
                    <div className="text-sm font-bold text-white font-mono flex items-center gap-2 truncate">
                        <Server className="w-3 h-3 text-slate-600" />
                        {packageDomain || "NO_TARGET_LINKED"}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">FTP WRITE ACCESS</span>
                    <span className={`text-xs font-mono font-bold transition-colors ${status === 'LOCKED' ? 'text-green-500' : 'text-red-500'}`}>
                        {status}
                    </span>
                </div>

                <button
                    onClick={toggleSecurity}
                    disabled={!activePackageId || loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${status === 'UNLOCKED' ? 'bg-red-900/50 border border-red-500/50' : 'bg-slate-800 border border-slate-600'
                        }`}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300 flex items-center justify-center ${status === 'UNLOCKED'
                                ? 'translate-x-[24px] bg-red-500 text-black shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                : 'translate-x-0.5 bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                            }`}
                    >
                        {loading ? (
                            <div className="w-2 h-2 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            status === 'UNLOCKED' ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />
                        )}
                    </div>
                </button>
            </div>

            {status === 'UNLOCKED' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
            )}
        </div>
    );
};
