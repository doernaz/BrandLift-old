import React, { useState, useEffect } from 'react';
import { FileCode, Settings, Loader, CheckCircle, Server, Database, Globe, Plus, Trash2, X } from 'lucide-react';

interface Blueprint {
    id?: string;
    name: string;
    type: 'wordpress' | 'magento' | 'custom';
    description: string;
    ref_code: string; // 20i product ID
}

export const BlueprintManager = () => {
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeSandboxes, setActiveSandboxes] = useState<number | null>(null);
    const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
    const [provisionStatus, setProvisionStatus] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBlueprint, setNewBlueprint] = useState<Blueprint>({ name: '', type: 'wordpress', description: '', ref_code: '284869' });

    useEffect(() => {
        fetchBlueprints();
        fetch('/api/admin/packages')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setActiveSandboxes(data.length); })
            .catch(console.error);
    }, []);

    const fetchBlueprints = () => {
        fetch('/api/admin/blueprints')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setBlueprints(data);
                else setBlueprints([
                    { id: 'bp_core', name: 'BrandLift Core', type: 'wordpress', description: 'Optimized SEO foundation', ref_code: '284869' },
                    { id: 'bp_comm', name: 'E-Commerce Lite', type: 'wordpress', description: 'WooCommerce pre-configured', ref_code: '284869' }
                ]); // Fallback/Seed
                if (data.length > 0 && !selectedBlueprint) setSelectedBlueprint(data[0].id);
            });
    };

    const handleSaveBlueprint = async () => {
        if (!newBlueprint.name) return;
        await fetch('/api/admin/blueprints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlueprint)
        });
        setShowAddForm(false);
        fetchBlueprints();
        setNewBlueprint({ name: '', type: 'wordpress', description: '', ref_code: '284869' });
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Delete blueprint?')) return;
        await fetch(`/api/admin/blueprints/${id}`, { method: 'DELETE' });
        fetchBlueprints();
    };

    const handleProvision = async () => {
        setLoading(true);
        setProvisionStatus("Initializing...");

        const blueprint = blueprints.find(b => b.id === selectedBlueprint);
        if (!blueprint) return;

        const uniqueId = Math.floor(1000 + Math.random() * 9000);
        const domain = `brandlift-dev-${uniqueId}.com`;

        try {
            setProvisionStatus("Provisioning 20i Environment...");
            const res = await fetch('/api/deploy/provision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blueprintId: blueprint.ref_code,
                    domain: domain,
                    clientEmail: 'admin@brandlift.ai'
                })
            });

            if (!res.ok) throw new Error("Provisioning failed");
            const data = await res.json();

            setProvisionStatus("Deployment Complete.");
            if (confirm(`Sandbox Ready: ${data.url}\n\nOpen Environment?`)) {
                window.open(data.url, '_blank');
            }
            setActiveSandboxes(prev => (prev || 0) + 1);

        } catch (error: any) {
            alert(`Error: ${error.message}`);
            setProvisionStatus("Failed.");
        } finally {
            setLoading(false);
            setTimeout(() => setProvisionStatus(null), 5000);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 relative overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="w-4 h-4" /> Blueprint Architecture
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-500 font-mono">SYSTEM ACTIVE</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-2 mb-1">
                        <Server className="w-3 h-3" /> Active Nodes
                    </div>
                    <div className="text-lg font-mono text-white">
                        {activeSandboxes !== null ? activeSandboxes : <Loader className="w-3 h-3 animate-spin" />}
                    </div>
                </div>
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-2 mb-1">
                        <Database className="w-3 h-3" /> Registry
                    </div>
                    <div className="text-lg font-mono text-cyan-400">v2.4.0</div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-2 mb-4 flex-grow overflow-y-auto max-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Select Architecture</label>
                    <button onClick={() => setShowAddForm(true)} className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1">
                        <Plus className="w-3 h-3" /> New
                    </button>
                </div>

                {showAddForm && (
                    <div className="p-3 bg-slate-800 rounded border border-slate-600 space-y-2 mb-2 animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">Define New Blueprint</span>
                            <button onClick={() => setShowAddForm(false)}><X className="w-3 h-3 text-slate-400" /></button>
                        </div>
                        <input
                            className="w-full bg-slate-900 border border-slate-700 text-xs p-1 rounded text-white"
                            placeholder="Blueprint Name"
                            value={newBlueprint.name}
                            onChange={e => setNewBlueprint({ ...newBlueprint, name: e.target.value })}
                        />
                        <input
                            className="w-full bg-slate-900 border border-slate-700 text-xs p-1 rounded text-white"
                            placeholder="Description"
                            value={newBlueprint.description}
                            onChange={e => setNewBlueprint({ ...newBlueprint, description: e.target.value })}
                        />
                        <button onClick={handleSaveBlueprint} className="w-full bg-cyan-600 text-white text-[10px] py-1 rounded">SAVE DEFINITION</button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                    {blueprints.map(bp => (
                        <div
                            key={bp.id}
                            onClick={() => setSelectedBlueprint(bp.id!)}
                            className={`p-3 rounded border cursor-pointer transition-all flex justify-between items-center group relative ${selectedBlueprint === bp.id
                                ? 'bg-cyan-950/30 border-cyan-500/50'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded ${selectedBlueprint === bp.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-600'}`}>
                                    <Globe className="w-3 h-3" />
                                </div>
                                <div>
                                    <div className={`text-xs font-bold ${selectedBlueprint === bp.id ? 'text-white' : 'text-slate-400'}`}>{bp.name}</div>
                                    <div className="text-[10px] text-slate-600">{bp.description}</div>
                                </div>
                            </div>
                            {selectedBlueprint === bp.id && <CheckCircle className="w-3 h-3 text-cyan-400" />}
                            <button
                                onClick={(e) => handleDelete(e, bp.id!)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-600 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action */}
            <div className="border-t border-slate-800 pt-4 mt-auto">
                <button
                    onClick={handleProvision}
                    disabled={loading || !selectedBlueprint}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-bold py-3 rounded shadow-lg shadow-cyan-900/20 border border-t-cyan-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
                    {loading ? (provisionStatus || 'PROCESSING...') : 'INITIATE DEPLOYMENT SEQUENCE'}
                </button>
                {provisionStatus && (
                    <div className="mt-2 text-center text-[10px] font-mono text-cyan-400 animate-pulse">
                        {`> ${provisionStatus}`}
                    </div>
                )}
            </div>
        </div>
    );
};
