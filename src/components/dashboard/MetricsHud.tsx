import React, { useState, useEffect } from 'react';
import {
    Server, Zap, Monitor, Sparkles, Users, DollarSign, Activity,
    AlertTriangle, X, Save
} from 'lucide-react';

// --- Types & Config ---

interface MetricThresholds {
    warning: number;
    critical: number;
}

interface UserConfig {
    activeMetrics: string[];
    thresholds: Record<string, MetricThresholds>;
    refreshRate: number;
}

const DEFAULT_CONFIG: UserConfig = {
    activeMetrics: ["uptime", "credits", "mrr", "seo"],
    thresholds: {
        uptime: { warning: 99.5, critical: 98.0 },
        credits: { warning: 15, critical: 5 }, // Percentage
        seo: { warning: 90, critical: 80 },
        mrr: { warning: 10000, critical: 5000 },
        deployments: { warning: 5, critical: 1 },
        leads: { warning: 10, critical: 0 },
        traffic: { warning: 5000, critical: 1000 }
    },
    refreshRate: 5000 // 5 seconds for demo responsiveness
};

// Mock Data Source
const MOCK_DATA = {
    uptime: { label: 'Server Health', value: 99.9, unit: '%', icon: Server, color: 'text-emerald-400' },
    credits: { label: 'AI Credit Pulse', value: 85, unit: '%', icon: Zap, color: 'text-amber-400' },
    deployments: { label: 'Deployment Velocity', value: 3, unit: ' Active', icon: Monitor, color: 'text-blue-400' },
    seo: { label: 'SEO Performance', value: 92, unit: '/100', icon: Sparkles, color: 'text-cyan-400' },
    leads: { label: 'Lead Ingest (24h)', value: 45, unit: ' Leads', icon: Users, color: 'text-purple-400' },
    mrr: { label: 'Financial Ticker', value: 12450, unit: ' USD', icon: DollarSign, color: 'text-green-400' },
    traffic: { label: 'Traffic Density', value: 15400, unit: ' Hits', icon: Activity, color: 'text-pink-400' },
};

// --- Sub-Components ---

const CountUp = ({ end, duration = 2000 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
};

interface StatCardProps {
    metricKey: string;
    data: any;
    threshold?: MetricThresholds;
    index: number;
}

const StatCard: React.FC<StatCardProps> = ({ metricKey, data, threshold, index }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 100);
        return () => clearTimeout(timer);
    }, [index]);

    let statusColor = data.color;
    let isCritical = false;

    // Dynamic Color based on threshold logic customized per metric if needed (high is good vs low is good)
    // Assuming High is Good for Uptime, Credits, SEO, Leads, MRR, Traffic
    // Warning: Value < Threshold.Warning
    // Critical: Value < Threshold.Critical
    if (threshold) {
        if (data.value < threshold.critical) {
            statusColor = 'text-red-500 animate-pulse';
            isCritical = true;
        } else if (data.value < threshold.warning) {
            statusColor = 'text-amber-500';
        } else {
            statusColor = 'text-emerald-400';
        }
    }

    const Icon = data.icon;

    return (
        <div
            className={`bg-slate-900/50 border ${isCritical ? 'border-red-500/50' : 'border-slate-700'} p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className={`w-24 h-24 ${statusColor}`} />
            </div>

            {/* Pulse Indicator */}
            <div className="absolute top-4 right-4 flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-cyan-500/30'}`}></span>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${statusColor}`} />
                    <h3 className="text-slate-400 text-sm font-mono uppercase tracking-wider">{data.label}</h3>
                </div>
                <div className={`text-4xl font-bold mb-1 font-mono ${statusColor}`}>
                    {typeof data.value === 'number' ? <CountUp end={data.value} /> : data.value}
                    <span className="text-lg text-slate-500 ml-1">{data.unit}</span>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 translate-y-[-100%] group-hover:translate-y-[100%] transition-all duration-1000 pointer-events-none" />
        </div>
    );
};

// Sliders Icon Component
const ConfigIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-500 hover:stroke-amber-400 cursor-pointer transition-colors" fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4h18M3 12h18M3 20h18M7 2v4M17 10v4M11 18v4" />
    </svg>
);


// --- Main Component ---

export const MetricsHud = () => {
    const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Alert Logic Loop
    useEffect(() => {
        const checkAlerts = () => {
            let criticalAlert = null;

            // Check all active metrics against thresholds
            for (const key of config.activeMetrics) {
                const value = (MOCK_DATA as any)[key].value;
                const thresh = config.thresholds[key];

                if (thresh && value < thresh.critical) {
                    const label = (MOCK_DATA as any)[key].label.toUpperCase();
                    criticalAlert = `[ CRITICAL ] : ${label} DROP DETECTED - VALUE ${value}`;
                    break; // Prioritize first critical found
                }
            }
            setAlertMessage(criticalAlert);
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, config.refreshRate);
        return () => clearInterval(interval);
    }, [config]); // Re-run if config changes

    const toggleMetric = (key: string) => {
        if (config.activeMetrics.includes(key)) {
            setConfig({ ...config, activeMetrics: config.activeMetrics.filter(k => k !== key) });
        } else {
            setConfig({ ...config, activeMetrics: [...config.activeMetrics, key] });
        }
    };

    const updateThreshold = (metric: string, type: 'warning' | 'critical', value: string) => {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) return;

        setConfig({
            ...config,
            thresholds: {
                ...config.thresholds,
                [metric]: {
                    ...config.thresholds[metric],
                    [type]: numVal
                }
            }
        });
    };

    return (
        <div className="relative mb-6">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    white-space: nowrap;
                    will-change: transform;
                }
            `}</style>

            <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
                {/* Alert Ticker / System Status */}
                <div className="flex-1 overflow-hidden relative h-6">
                    {alertMessage ? (
                        <div className="text-red-400 font-mono text-xs animate-pulse flex items-center gap-2 absolute w-full">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="animate-marquee pl-4">{alertMessage}   ///   ACTION REQUIRED   ///   CHECK LOGS</span>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 font-mono flex gap-4 absolute w-full opacity-70">
                            <span className="flex items-center gap-2 bg-slate-950 z-10 pr-4">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                SYS.STATUS: <span className="text-green-500">ONLINE</span>
                            </span>
                            <div className="flex-1 relative overflow-hidden h-full">
                                <div className="animate-marquee absolute top-0 text-slate-600">
                                    UPTIME: 99.9%   ///   SECURE_LINK: ESTABLISHED   ///   Scanning active pipelines... Node integrity verified... Latency 14ms... 0x4F92 Active...   ///   System Nominal
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Config Button */}
                <button
                    onClick={() => setIsConfigOpen(true)}
                    className="p-2 hover:bg-slate-900 rounded transition-colors group ml-4 relative z-20"
                    title="Configure Sensors"
                >
                    <ConfigIcon />
                </button>
            </div>

            {/* Config Panel (Modal/Side - Fixed Position for Z-Index) */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-sm bg-slate-950 border-l border-amber-500/30 h-full p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 relative">
                        <button
                            onClick={() => setIsConfigOpen(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-amber-500 font-mono font-bold text-lg flex items-center gap-2 mb-1">
                                <Activity className="w-5 h-5" /> SENSOR_CONFIG
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">Manage active data streams and alert thresholds.</p>
                        </div>

                        {/* Visibility Toggles */}
                        <div className="mb-8 space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">Active Sensors</h4>
                            {Object.entries(MOCK_DATA).map(([key, data]) => {
                                const isActive = config.activeMetrics.includes(key);
                                return (
                                    <div
                                        key={key}
                                        onClick={() => toggleMetric(key)}
                                        className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all ${isActive
                                            ? 'bg-slate-900 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                            : 'bg-transparent border-slate-800 opacity-50 hover:opacity-100 hover:bg-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <data.icon className={`w-4 h-4 ${isActive ? data.color : 'text-slate-500'}`} />
                                            <span className={`font-mono text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>{data.label}</span>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full border ${isActive ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Threshold Inputs */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">Alert Thresholds</h4>
                            {Object.entries(config.thresholds).filter(([k]) => config.activeMetrics.includes(k)).map(([key, thresholds]) => {
                                const metricLabel = (MOCK_DATA as any)[key]?.label || key;
                                const thresh = thresholds as MetricThresholds;
                                return (
                                    <div key={key} className="p-3 rounded bg-slate-900/20 border border-slate-800/50 hover:border-slate-700 transition-colors">
                                        <div className="text-[10px] text-amber-500 font-mono mb-2 uppercase font-bold">{metricLabel}</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1 uppercase">Warning (&lt;)</label>
                                                <input
                                                    type="number"
                                                    value={thresh.warning}
                                                    onChange={(e) => updateThreshold(key, 'warning', e.target.value)}
                                                    className="w-full bg-black border border-slate-700 text-amber-500 text-xs px-2 py-1.5 rounded font-mono focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1 uppercase">Critical (&lt;)</label>
                                                <input
                                                    type="number"
                                                    value={thresh.critical}
                                                    onChange={(e) => updateThreshold(key, 'critical', e.target.value)}
                                                    className="w-full bg-black border border-red-900/50 text-red-500 text-xs px-2 py-1.5 rounded font-mono focus:border-red-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800 text-center sticky bottom-0 bg-slate-950 pb-4">
                            <button
                                onClick={() => setIsConfigOpen(false)}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20"
                            >
                                <Save className="w-4 h-4" /> Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Render */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[140px]">
                {config.activeMetrics.map((key, idx) => {
                    const data = (MOCK_DATA as any)[key];
                    if (!data) return null; // Safety check
                    const threshold = config.thresholds[key];

                    return (
                        <StatCard
                            key={key}
                            index={idx}
                            metricKey={key}
                            data={data}
                            threshold={threshold}
                        />
                    );
                })}
            </div>
        </div>
    );
};
