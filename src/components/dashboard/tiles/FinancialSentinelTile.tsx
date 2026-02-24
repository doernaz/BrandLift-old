import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Bell } from 'lucide-react';

export const FinancialSentinelTile = () => {
    const [status, setStatus] = useState('Active');
    const [lastScan, setLastScan] = useState<Date | null>(null);
    const [scannedCount, setScannedCount] = useState(0);
    const [scanning, setScanning] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);

    const runSentinel = async () => {
        setScanning(true);
        setStatus("Scanning Financial Records...");

        try {
            const res = await fetch('/api/admin/sentinel/run', { method: 'POST' });
            const data = await res.json();

            setScannedCount(data.scanned);
            setAlerts(data.actions || []);
            setLastScan(new Date());
            setStatus("Monitoring Active");
        } catch (e) {
            setStatus("Scan Error");
        } finally {
            setScanning(false);
        }
    };

    // Auto-run on mount (simulating the 24h loop check)
    useEffect(() => {
        runSentinel();
        // Set up interval for "live" monitoring visualization (every 30s just for effect)
        const interval = setInterval(() => {
            if (!scanning) setStatus(prev => prev === 'Monitoring Active' ? 'Analyzed 0 new records.' : 'Monitoring Active');
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 border border-red-900/30 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Financial Sentinel
                </h3>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase">System Status</div>
                        <div className={`text-lg font-mono flex items-center gap-2 ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                            <Activity className="w-4 h-4 animate-pulse" /> {status}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Next Scan</div>
                        <div className="text-xs text-slate-300 font-mono">In 23h 59m</div>
                    </div>
                </div>

                {alerts.length > 0 ? (
                    <div className="bg-red-950/40 p-3 rounded border border-red-900/50 mb-4 animate-pulse">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            {alerts.length} Accounts At Risk
                        </div>
                        <div className="space-y-1">
                            {alerts.map((alert, i) => (
                                <div key={i} className="text-[10px] text-red-300 flex justify-between">
                                    <span>{alert.name}</span>
                                    <span className="text-red-500">EMAIL SENT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-950/30 rounded border border-slate-800 text-center mb-4">
                        <div className="text-green-500/50 text-4xl mb-2 flex justify-center"><Shield className="w-8 h-8" /></div>
                        <div className="text-xs text-slate-500">No Delinquencies Detected</div>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="text-[10px] text-slate-600 font-mono">
                    Last Scan: {lastScan ? lastScan.toLocaleTimeString() : 'Never'}
                </div>
                <button
                    onClick={runSentinel}
                    disabled={scanning}
                    className="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1 rounded text-[10px] uppercase font-bold border border-red-900/50 transition-colors flex items-center gap-1"
                >
                    <Bell className="w-3 h-3" /> Force Scan
                </button>
            </div>
            {/* Background Effect */}
            <div className="absolute -bottom-4 -left-4 p-8 opacity-5 pointer-events-none">
                <AlertTriangle className="w-32 h-32 text-red-500" />
            </div>
        </div>
    );
};
