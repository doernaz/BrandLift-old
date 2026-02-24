import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Play, CheckCircle, XCircle,
    ExternalLink, Mail, Save, Clock, AlertTriangle,
    ChevronRight, Terminal, Server, Cpu, ArrowRight as ArrowRightIcon
} from 'lucide-react';

// --- TYPES ---

export type AuditStatus =
    | 'Assigned'
    | 'Generating'
    | 'Client Site Created'
    | 'WIP'
    | 'Approved'
    | 'Declined'
    | 'Email Drafted'
    | 'Client Letter Sent';

export interface Auditor {
    id: string;
    name: string;
    email: string;
    phone: string;
    activeCount: number;
}

export interface ClientTimestamps {
    assigned: string;
    sandbox_ready?: string;
    wip_start?: string;
    validated?: string;
    email_sent?: string;
}

export interface ClientRecord {
    id: string;
    businessName: string;
    industry: string;
    auditorId: string;
    status: AuditStatus;
    timestamps: ClientTimestamps;
    sandboxUrl?: string;
    emailContent?: string;
    declineNotes?: string;
    declineScreenshot?: string;
}

// --- VISUAL VARIANTS CONFIG (JSON OUTPUT) ---
const VISUAL_VARIANTS = {
    obsidian: {
        id: "variant_obsidian",
        name: "Obsidian Glass",
        bg: "bg-[#09090b] text-slate-400",
        border: "border-slate-800",
        panel: "bg-[#121214] border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm",
        accent: "text-cyan-400 border-cyan-500/30 bg-cyan-900/10",
        status: {
            assigned: "bg-slate-800 text-slate-300",
            generating: "bg-yellow-900/20 text-yellow-500 border-yellow-500/20 animate-pulse",
            ready: "bg-blue-900/20 text-blue-400 border-blue-500/20",
            wip: "bg-purple-900/20 text-purple-400 border-purple-500/20",
            approved: "bg-green-900/20 text-green-400 border-green-500/20",
            declined: "bg-red-900/20 text-red-400 border-red-500/20",
            sent: "bg-slate-700 text-slate-300"
        }
    },
    slate: {
        id: "variant_slate",
        name: "Matte Slate",
        bg: "bg-slate-900 text-slate-300",
        border: "border-slate-700",
        panel: "bg-slate-800 border border-slate-600 shadow-lg",
        accent: "text-white bg-slate-600",
        status: {
            assigned: "bg-slate-700 text-slate-200",
            generating: "bg-amber-700 text-white",
            ready: "bg-sky-700 text-white",
            wip: "bg-indigo-700 text-white",
            approved: "bg-emerald-700 text-white",
            declined: "bg-rose-700 text-white",
            sent: "bg-gray-600 text-gray-200"
        }
    },
    cyber: {
        id: "variant_cyber",
        name: "Cyber Industrial",
        bg: "bg-black text-green-400 font-mono",
        border: "border-green-900",
        panel: "bg-black border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
        accent: "text-green-400 border-green-500",
        status: {
            assigned: "border border-green-800 text-green-700",
            generating: "bg-green-900/50 text-green-300 border border-green-400 animate-pulse",
            ready: "bg-black border border-green-400 text-green-400 shadow-[0_0_5px_#4ade80]",
            wip: "bg-black border border-yellow-400 text-yellow-400",
            approved: "bg-green-500 text-black font-bold",
            declined: "bg-red-900 text-red-500 border border-red-500",
            sent: "border border-green-900 text-green-800 decoration-line-through"
        }
    }
};

// Default variant
const THEME = VISUAL_VARIANTS.obsidian;

const StatusBadge = ({ status }: { status: AuditStatus }) => {
    let style = THEME.status.assigned;
    if (status === 'Generating') style = THEME.status.generating;
    if (status === 'Client Site Created') style = THEME.status.ready;
    if (status === 'WIP') style = THEME.status.wip;
    if (status === 'Approved') style = THEME.status.approved;
    if (status === 'Declined') style = THEME.status.declined;
    if (status === 'Client Letter Sent') style = THEME.status.sent;

    return (
        <span className={`px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider rounded border border-transparent ${style}`}>
            {status}
        </span>
    );
};

export const AuditorWorkflowTile = () => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState<'dashboard' | 'validation' | 'email'>('dashboard');
    const [selectedAuditorId, setSelectedAuditorId] = useState<string>('all');
    const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [declineNotes, setDeclineNotes] = useState('');
    const [activeClient, setActiveClient] = useState<ClientRecord | null>(null);

    // Mock Data Init
    const [auditors, setAuditors] = useState<Auditor[]>([
        { id: 'AUD-001', name: 'System Architect', email: 'arch@brandlift.io', phone: '555-0101', activeCount: 12 },
        { id: 'AUD-002', name: 'Lead Analyst', email: 'analyst@brandlift.io', phone: '555-0102', activeCount: 8 },
        { id: 'AUD-003', name: 'QA Specialist', email: 'qa@brandlift.io', phone: '555-0103', activeCount: 5 },
    ]);

    const [clients, setClients] = useState<ClientRecord[]>([
        { id: 'LEAD-8492', businessName: 'Apex Plumbing', industry: 'Plumbing', auditorId: 'AUD-001', status: 'Assigned', timestamps: { assigned: new Date().toISOString() } },
        { id: 'LEAD-3921', businessName: 'Legal Eagles', industry: 'Legal', auditorId: 'AUD-002', status: 'Client Site Created', sandboxUrl: 'https://demo-legal.brandlift.io', timestamps: { assigned: '2023-10-24T10:00:00Z', sandbox_ready: '2023-10-25T14:30:00Z' } },
        { id: 'LEAD-7734', businessName: 'Metro HVAC', industry: 'HVAC', auditorId: 'AUD-001', status: 'WIP', sandboxUrl: 'https://demo-hvac.brandlift.io', timestamps: { assigned: '2023-10-24T09:00:00Z', sandbox_ready: '2023-10-24T12:00:00Z', wip_start: '2023-10-25T09:15:00Z' } },
        { id: 'LEAD-1102', businessName: 'City Dental', industry: 'Dental', auditorId: 'AUD-003', status: 'Approved', sandboxUrl: 'https://demo-dental.brandlift.io', emailContent: 'Dear Dr. Smith,\n\nWe have completed the digital audit for City Dental. Please find the attached report...', timestamps: { assigned: '2023-10-23T08:00:00Z', validated: '2023-10-25T16:00:00Z' } },
    ]);

    // --- ACTIONS ---

    const handleBatchGenerate = () => {
        const timestamp = new Date().toISOString();
        setClients(prev => prev.map(c => {
            if (selectedClientIds.has(c.id) && c.status === 'Assigned') {
                return { ...c, status: 'Generating' };
            }
            return c;
        }));
        setSelectedClientIds(new Set());

        // Simulate Async Process
        setTimeout(() => {
            setClients(prev => prev.map(c => {
                if (c.status === 'Generating') {
                    return {
                        ...c,
                        status: 'Client Site Created',
                        sandboxUrl: `https://${c.businessName.toLowerCase().replace(/ /g, '-')}.brandlift-demo.com`,
                        timestamps: { ...c.timestamps, sandbox_ready: new Date().toISOString() }
                    };
                }
                return c;
            }));
        }, 3000);
    };

    const handleOpenSandbox = (client: ClientRecord) => {
        if (!client.sandboxUrl) return;
        window.open(client.sandboxUrl, '_blank');

        // Update status to WIP if not already validated
        if (client.status === 'Client Site Created') {
            setClients(prev => prev.map(c => c.id === client.id ? {
                ...c,
                status: 'WIP',
                timestamps: { ...c.timestamps, wip_start: new Date().toISOString() }
            } : c));
        }
    };

    const handleApprove = (client: ClientRecord) => {
        const draftEmail = `SUBJECT: Audit Complete - ${client.businessName}\n\nReview Team,\n\nThe ${client.industry} audit for ${client.businessName} has been successfully validated. Performance metrics exceed baseline parameters.\n\nSandbox URL: ${client.sandboxUrl}\n\nReady for immediate client delivery.`;

        setClients(prev => prev.map(c => c.id === client.id ? {
            ...c,
            status: 'Approved',
            emailContent: draftEmail,
            timestamps: { ...c.timestamps, validated: new Date().toISOString() }
        } : c));
    };

    const handleDeclineTrigger = (client: ClientRecord) => {
        setActiveClient(client);
        setDeclineModalOpen(true);
    };

    const submitDecline = () => {
        if (!activeClient) return;
        setClients(prev => prev.map(c => c.id === activeClient.id ? {
            ...c,
            status: 'Declined',
            declineNotes: declineNotes,
            timestamps: { ...c.timestamps, validated: new Date().toISOString() }
        } : c));
        setDeclineModalOpen(false);
        setDeclineNotes('');
        setActiveClient(null);
    };

    const handleSendEmail = (client: ClientRecord) => {
        setClients(prev => prev.map(c => c.id === client.id ? {
            ...c,
            status: 'Client Letter Sent',
            timestamps: { ...c.timestamps, email_sent: new Date().toISOString() }
        } : c));
    };


    // --- FILTER ---
    const filteredClients = clients.filter(c => selectedAuditorId === 'all' || c.auditorId === selectedAuditorId);

    // View filtering logic
    const dashboardClients = filteredClients.filter(c => ['Assigned', 'Generating'].includes(c.status));
    const validationClients = filteredClients.filter(c => ['Client Site Created', 'WIP', 'Declined'].includes(c.status));
    const emailClients = filteredClients.filter(c => ['Approved', 'Email Drafted', 'Client Letter Sent'].includes(c.status));

    const activeList = viewMode === 'dashboard' ? dashboardClients : (viewMode === 'validation' ? validationClients : emailClients);


    // --- RENDER ---
    return (
        <div className={`w-full min-h-[600px] p-6 font-sans ${THEME.bg} selection:bg-cyan-500/30`}>
            {/* COMPONENT HEADER */}
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10">
                        <Server className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            Auditor Workflow Engine <span className="text-[10px] uppercase px-2 py-0.5 rounded border border-cyan-900 text-cyan-500 bg-cyan-950/30">v4.2.0</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-mono mt-1">System Status: ONLINE // Mode: {THEME.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Auditor Filter */}
                    <div className="relative group">
                        <select
                            className="bg-black border border-white/10 text-slate-400 text-sm rounded-lg px-4 py-2 pr-8 appearance-none focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            value={selectedAuditorId}
                            onChange={(e) => setSelectedAuditorId(e.target.value)}
                        >
                            <option value="all">All Auditors</option>
                            {auditors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
                        <Users className="w-4 h-4" /> Add Auditor
                    </button>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-1 mb-8 bg-black/40 p-1 rounded-lg border border-white/10 w-fit">
                {[
                    { id: 'dashboard', label: 'Processing Queue', icon: Cpu, count: dashboardClients.length },
                    { id: 'validation', label: 'Validation Portal', icon: CheckCircle, count: validationClients.length },
                    { id: 'email', label: 'Outbox Relay', icon: Mail, count: emailClients.filter(c => c.status === 'Approved').length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setViewMode(tab.id as any)}
                        className={`
                            px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                            ${viewMode === tab.id
                                ? 'bg-slate-800 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-[10px] rounded-full">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT PANEL */}
            <div className={`rounded-xl overflow-hidden ${THEME.panel}`}>
                {/* TOOLBAR */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Terminal className="w-4 h-4" />
                        <span className="font-mono">{activeList.length} records found in buffer</span>
                    </div>

                    {viewMode === 'dashboard' && selectedClientIds.size > 0 && (
                        <button
                            onClick={handleBatchGenerate}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 animate-pulse"
                        >
                            <Play className="w-3 h-3" /> Initiate Sequence ({selectedClientIds.size})
                        </button>
                    )}
                </div>

                {/* TABLE */}
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20 text-xs uppercase font-mono text-slate-500">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                {viewMode === 'dashboard' && (
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-700 bg-slate-900 checked:bg-cyan-600"
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedClientIds(new Set(activeList.map(c => c.id)));
                                            else setSelectedClientIds(new Set());
                                        }}
                                    />
                                )}
                            </th>
                            <th className="p-4 font-normal tracking-wider">Business Entity</th>
                            <th className="p-4 font-normal tracking-wider">Auditor</th>
                            <th className="p-4 font-normal tracking-wider">Status</th>
                            <th className="p-4 font-normal tracking-wider text-right">Timestamp</th>
                            <th className="p-4 font-normal tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {activeList.map(client => (
                            <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-center">
                                    {viewMode === 'dashboard' && client.status === 'Assigned' && (
                                        <input
                                            type="checkbox"
                                            checked={selectedClientIds.has(client.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedClientIds);
                                                if (newSet.has(client.id)) newSet.delete(client.id);
                                                else newSet.add(client.id);
                                                setSelectedClientIds(newSet);
                                            }}
                                            className="rounded border-slate-700 bg-slate-900 checked:bg-cyan-600"
                                        />
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-200">{client.businessName}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">{client.id} • {client.industry}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                        <span className="text-slate-400">{auditors.find(a => a.id === client.auditorId)?.name || client.auditorId}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={client.status} />
                                </td>
                                <td className="p-4 text-right font-mono text-slate-600 text-xs">
                                    {new Date(client.timestamps.assigned).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* DASHBOARD ACTIONS */}
                                        {viewMode === 'dashboard' && client.status === 'Assigned' && (
                                            <button className="text-cyan-500 hover:text-cyan-400 p-1">
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* VALIDATION ACTIONS */}
                                        {viewMode === 'validation' && (
                                            <>
                                                {client.sandboxUrl && (
                                                    <button
                                                        onClick={() => handleOpenSandbox(client)}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-white/5 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> Test Link
                                                    </button>
                                                )}
                                                {client.status === 'WIP' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(client)}
                                                            className="p-1 text-green-500 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineTrigger(client)}
                                                            className="p-1 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                            title="Decline"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        {/* EMAIL ACTIONS */}
                                        {viewMode === 'email' && client.status === 'Approved' && (
                                            <button
                                                onClick={() => setActiveClient(client)}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 rounded text-xs transition-colors"
                                            >
                                                <Mail className="w-3 h-3" /> Draft Email
                                            </button>
                                        )}
                                        {viewMode === 'email' && client.status === 'Client Letter Sent' && (
                                            <span className="text-xs text-green-500 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Sent
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {activeList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-600 font-mono text-sm">
                                    ./buffer_empty -- no records found for current filter selection
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* MODALS / OVERLAYS */}

            {/* DECLINE MODAL */}
            {declineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#09090b] border border-red-900/50 w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Decline Audit: {activeClient?.businessName}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 mb-1">Deficiency Notes (Required)</label>
                                <textarea
                                    className="w-full bg-black border border-slate-800 rounded p-3 text-slate-300 text-sm focus:border-red-500 focus:outline-none min-h-[100px]"
                                    placeholder="Enter detailed reason for rejection..."
                                    value={declineNotes}
                                    onChange={(e) => setDeclineNotes(e.target.value)}
                                />
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded border border-white/5 text-xs text-slate-500">
                                Screenshot references should be attached to the Jira ticket manually. Timestamp logged: {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setDeclineModalOpen(false); setActiveClient(null); }}
                                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitDecline}
                                disabled={!declineNotes}
                                className="px-4 py-2 bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900 hover:text-white rounded text-sm font-bold disabled:opacity-50 transition-all"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EMAIL EDITOR MODAL (Basic implementation) */}
            {activeClient && viewMode === 'email' && activeClient.status === 'Approved' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#09090b] border border-cyan-500/30 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2 text-cyan-400 font-bold">
                                <Mail className="w-5 h-5" /> Outbound Communication Relay
                            </div>
                            <button onClick={() => setActiveClient(null)} className="text-slate-500 hover:text-white"><XCircle className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="mb-4">
                                <label className="block text-xs uppercase text-slate-500 mb-1 font-mono">Recipient</label>
                                <div className="p-2 bg-black border border-slate-800 rounded text-slate-300 text-sm font-mono">
                                    client@{activeClient.businessName.toLowerCase().replace(/ /g, '')}.com
                                </div>
                            </div>
                            <div className="h-full">
                                <label className="block text-xs uppercase text-slate-500 mb-1 font-mono">Message Body</label>
                                <textarea
                                    className="w-full h-[300px] bg-[#111] border border-slate-800 rounded p-4 text-slate-300 font-mono text-sm leading-relaxed focus:border-cyan-500 focus:outline-none resize-none"
                                    value={activeClient.emailContent}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setClients(prev => prev.map(c => c.id === activeClient.id ? { ...c, emailContent: val } : c));
                                        setActiveClient(prev => prev ? { ...prev, emailContent: val } : null);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-mono">Secure Connection: ENCRYPTED // TLS 1.3</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActiveClient(null)}
                                    className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={() => { handleSendEmail(activeClient); setActiveClient(null); }}
                                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-900/20 text-sm flex items-center gap-2"
                                >
                                    <ArrowRightIcon className="w-4 h-4" /> Transmit Securely
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
