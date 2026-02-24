import React, { useEffect, useState } from 'react';
import { Activity, Server, Database, ShieldCheck } from 'lucide-react';

export const HealthSentinel = () => {
    const [statuses, setStatuses] = useState<any>({
        firebase: { status: 'CONNECTING' },
        twentyi: { status: 'CONNECTING' },
        stripe: { status: 'CONNECTING' },
        smtp: { status: 'CONNECTING' },
        system: { status: 'ONLINE' }
    });

    useEffect(() => {
        const checkHealth = () => {
            fetch('/api/health')
                .then(res => res.json())
                .then(data => setStatuses(data))
                .catch(() => setStatuses({
                    firebase: { status: 'OFFLINE' },
                    twentyi: { status: 'OFFLINE' },
                    stripe: { status: 'OFFLINE' },
                    smtp: { status: 'OFFLINE' },
                    system: { status: 'ERROR' }
                }));
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'CONNECTED' || status === 'ACTIVE' || status.includes('READY')) return 'text-green-500';
        if (status === 'CONNECTING') return 'text-yellow-500 animate-pulse';
        return 'text-red-500';
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Health Sentinel
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">SYSTEM_CORE</span>
                        <span className="text-[10px] text-slate-600 font-mono">{statuses.system.uptime ? `UP: ${Math.round(statuses.system.uptime)}s` : ''}</span>
                    </div>
                    <span className="text-xs font-bold text-green-500">{statuses.system.status}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">FIREBASE_DB</span>
                        {statuses.firebase.latency > 0 && <span className="text-[10px] text-slate-600 font-mono">{statuses.firebase.latency}ms</span>}
                    </div>
                    <span className={`text-xs font-bold ${getStatusColor(statuses.firebase.status)}`}>
                        {statuses.firebase.status}
                    </span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">20i_RESELLER</span>
                        {statuses.twentyi.latency > 0 && <span className="text-[10px] text-slate-600 font-mono">{statuses.twentyi.latency}ms</span>}
                    </div>
                    <span className={`text-xs font-bold ${getStatusColor(statuses.twentyi.status)}`}>
                        {statuses.twentyi.status}
                    </span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">STRIPE_GATE</span>
                        {statuses.stripe.latency > 0 && <span className="text-[10px] text-slate-600 font-mono">{statuses.stripe.latency}ms</span>}
                    </div>
                    <span className={`text-xs font-bold ${getStatusColor(statuses.stripe.status)}`}>
                        {statuses.stripe.status.split(' ')[0]}
                    </span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">SMTP_RELAY</span>
                        {statuses.smtp?.host && <span className="text-[10px] text-slate-600 font-mono truncate max-w-[80px]">{statuses.smtp.host}</span>}
                    </div>
                    <span className={`text-xs font-bold ${getStatusColor(statuses.smtp?.status || 'OFFLINE')}`}>
                        {statuses.smtp?.status || 'OFFLINE'}
                    </span>
                </div>
            </div>
        </div>
    );
};
