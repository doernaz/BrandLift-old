
import React, { useState, useEffect } from 'react';
import {
    Users,
    Server,
    Shield,
    Zap,
    AlertTriangle,
    CheckCircle,
    Loader,
    Search,
    Globe,
    Lock,
    Unlock,
    Settings,
    DollarSign
} from 'lucide-react';
import { TwentyIPackageTier, CustomerStatus } from '../../types';

export const ResellerControl = () => {
    const [activeTab, setActiveTab] = useState<'provision' | 'customers' | 'controls'>('provision');

    // Provisioning State
    const [tiers, setTiers] = useState<TwentyIPackageTier[]>([]);
    const [selectedTier, setSelectedTier] = useState<string>('');
    const [deployDomain, setDeployDomain] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [deployStatus, setDeployStatus] = useState<string | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);

    // Customer State
    const [customers, setCustomers] = useState<CustomerStatus[]>([]);
    const [delinquents, setDelinquents] = useState<CustomerStatus[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Controls State
    const [targetPackageId, setTargetPackageId] = useState('');
    const [capabilities, setCapabilities] = useState({
        enablePlugins: true,
        enableThemeEditing: true,
        lockdownMode: false
    });
    const [controlStatus, setControlStatus] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchTiers();
        fetchCustomers();
    }, []);

    const fetchTiers = async () => {
        try {
            const res = await fetch('/api/admin/tiers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTiers(data);
                if (data.length > 0) setSelectedTier(data[0].name);
            }
        } catch (e) { console.error("Failed to fetch tiers", e); }
    };

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const [custRes, delRes] = await Promise.all([
                fetch('/api/admin/customers'),
                fetch('/api/admin/customers/delinquent')
            ]);
            const allCust = await custRes.json();
            const badCust = await delRes.json();

            if (Array.isArray(allCust)) setCustomers(allCust);
            if (Array.isArray(badCust)) setDelinquents(badCust);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleProvision = async () => {
        if (!deployDomain || !clientEmail || !selectedTier) return;

        setIsDeploying(true);
        setDeployStatus("Initializing Production Deploy...");

        try {
            const tier = tiers.find(t => t.name === selectedTier);
            if (!tier) throw new Error("Invalid Tier");

            const res = await fetch('/api/deploy/provision-production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: deployDomain,
                    blueprintId: tier.blueprintId,
                    packageType: tier.name,
                    customer: { email: clientEmail }
                })
            });

            const data = await res.json();
            if (data.success) {
                setDeployStatus(`SUCCESS: Site Provisioned (ID: ${data.id})`);
                setDeployDomain('');
                fetchCustomers(); // Refresh list
            } else {
                throw new Error(data.error || "Provisioning Failed");
            }
        } catch (e: any) {
            setDeployStatus(`ERROR: ${e.message}`);
        } finally {
            setIsDeploying(false);
            setTimeout(() => setDeployStatus(null), 5000);
        }
    };

    const handleCapabilityUpdate = async () => {
        if (!targetPackageId) return;
        setControlStatus("Applying Policies...");
        try {
            const res = await fetch(`/api/admin/package/${targetPackageId}/capabilities`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(capabilities)
            });
            const data = await res.json();
            if (data.success) setControlStatus("Policies Enforced Successfully.");
            else throw new Error(data.error);
        } catch (e: any) {
            setControlStatus(`Failed: ${e.message}`);
        }
        setTimeout(() => setControlStatus(null), 3000);
    };

    const triggerDelinquencyAlert = (email: string) => {
        // Mock trigger
        alert(`7-Day Warning Email Triggered for ${email}`);
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('provision')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'provision' ? 'bg-cyan-950/30 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Server className="w-4 h-4" /> Provisioning
                </button>
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'customers' ? 'bg-cyan-950/30 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Users className="w-4 h-4" /> Clients {delinquents.length > 0 && <span className="bg-red-500 text-white px-1.5 rounded-full text-[10px]">{delinquents.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('controls')}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'controls' ? 'bg-cyan-950/30 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Shield className="w-4 h-4" /> Controls
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 overflow-y-auto">

                {/* PROVISIONING TAB */}
                {activeTab === 'provision' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" /> New Deployment
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Target Domain</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={deployDomain}
                                            onChange={e => setDeployDomain(e.target.value)}
                                            placeholder="client-site.com"
                                            className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono flex-1 focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Service Tier</label>
                                        <select
                                            value={selectedTier}
                                            onChange={e => setSelectedTier(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:border-cyan-500 outline-none"
                                        >
                                            {tiers.map(t => (
                                                <option key={t.id} value={t.name}>{t.name} ({t.specs.disk})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Client Email</label>
                                        <input
                                            value={clientEmail}
                                            onChange={e => setClientEmail(e.target.value)}
                                            placeholder="client@company.com"
                                            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleProvision}
                                    disabled={isDeploying || !deployDomain}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeploying ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                    {isDeploying ? 'Provisioning...' : 'Deploy to Production'}
                                </button>

                                {deployStatus && (
                                    <div className={`text-center font-mono text-xs p-2 rounded ${deployStatus.includes('SUCCESS') ? 'text-green-400 bg-green-950/30' : 'text-cyan-400 bg-cyan-950/30'}`}>
                                        {deployStatus}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {tiers.map(tier => (
                                <div key={tier.id} className="bg-slate-900 border border-slate-800 p-4 rounded text-center opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{tier.name}</div>
                                    <div className="text-2xl font-mono text-white mb-2">{tier.specs.sites} <span className="text-xs text-slate-600">Sites</span></div>
                                    <div className="text-[10px] text-slate-500">{tier.specs.bandwidth} Bandwidth</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CUSTOMERS TAB */}
                {activeTab === 'customers' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded border border-slate-800">
                                <div className="text-xs text-slate-500 uppercase">Total ARR</div>
                                <div className="text-2xl font-mono text-green-400 flex items-center gap-1">
                                    <DollarSign className="w-5 h-5" />
                                    {customers.reduce((acc, c) => acc + c.monthlyRevenue, 0) * 12}
                                </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded border border-slate-800">
                                <div className="text-xs text-slate-500 uppercase">Active Sites</div>
                                <div className="text-2xl font-mono text-cyan-400">
                                    {customers.reduce((acc, c) => acc + c.totalSites, 0)}
                                </div>
                            </div>
                        </div>

                        {/* Delinquency Alert */}
                        {delinquents.length > 0 && (
                            <div className="bg-red-950/20 border border-red-900/50 p-4 rounded flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-red-400 mb-1">Payment Alerts Detected</h3>
                                    <p className="text-xs text-red-300/70 mb-3">
                                        The following accounts are over 7 days delinquent. Automated workflows are standing by.
                                    </p>
                                    <div className="space-y-2">
                                        {delinquents.map(d => (
                                            <div key={d.id} className="bg-red-950/40 p-2 rounded flex justify-between items-center">
                                                <span className="text-xs text-red-200 font-mono">{d.name} ({d.email})</span>
                                                <button
                                                    onClick={() => triggerDelinquencyAlert(d.email)}
                                                    className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded uppercase tracking-wider"
                                                >
                                                    Trigger Warning
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full List */}
                        <div className="bg-slate-950/30 rounded border border-slate-800 overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-900 text-slate-400 font-mono uppercase">
                                    <tr>
                                        <th className="p-3">Client</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Sites</th>
                                        <th className="p-3 text-right">MRR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {customers.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                                            <td className="p-3 font-medium text-slate-200">{c.name}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                                        c.status === 'delinquent' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-slate-500/10 text-slate-400'
                                                    }`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-400">{c.totalSites}</td>
                                            <td className="p-3 text-right font-mono text-slate-400">${c.monthlyRevenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CONTROLS TAB */}
                {activeTab === 'controls' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-sm font-bold text-white">Centralized Capability Control</h3>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase text-slate-500 block mb-1">Target Package ID</label>
                                <div className="flex gap-2">
                                    <input
                                        value={targetPackageId}
                                        onChange={e => setTargetPackageId(e.target.value)}
                                        placeholder="Specific Package ID (or blank for Global)"
                                        className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono flex-1 focus:border-cyan-500 outline-none"
                                    />
                                    <button className="bg-slate-800 text-slate-300 px-3 py-2 rounded text-xs hover:bg-slate-700 flex items-center gap-1">
                                        <Search className="w-3 h-3" /> Lookup
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Plugin Installation</div>
                                        <div className="text-[10px] text-slate-500">Allow clients to add new plugins</div>
                                    </div>
                                    <button
                                        onClick={() => setCapabilities(prev => ({ ...prev, enablePlugins: !prev.enablePlugins }))}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${capabilities.enablePlugins ? 'bg-green-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${capabilities.enablePlugins ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">Theme Editor</div>
                                        <div className="text-[10px] text-slate-500">Allow access to code editor</div>
                                    </div>
                                    <button
                                        onClick={() => setCapabilities(prev => ({ ...prev, enableThemeEditing: !prev.enableThemeEditing }))}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${capabilities.enableThemeEditing ? 'bg-green-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${capabilities.enableThemeEditing ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800 border-l-4 border-l-red-500">
                                    <div>
                                        <div className="text-xs font-bold text-white">LOCKDOWN MODE</div>
                                        <div className="text-[10px] text-slate-400">Freeze all file modifications</div>
                                    </div>
                                    <button
                                        onClick={() => setCapabilities(prev => ({ ...prev, lockdownMode: !prev.lockdownMode }))}
                                        className={`font-bold text-[10px] px-3 py-1 rounded transition-colors ${capabilities.lockdownMode ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                    >
                                        {capabilities.lockdownMode ? 'LOCKED' : 'UNLOCKED'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleCapabilityUpdate}
                                disabled={!targetPackageId}
                                className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Lock className="w-3 h-3" /> Push Capabilities
                            </button>

                            {controlStatus && (
                                <div className="mt-2 text-center text-[10px] font-mono text-cyan-400">
                                    {controlStatus}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
