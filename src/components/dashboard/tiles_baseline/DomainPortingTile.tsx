import React, { useState } from 'react';
import { ArrowLeftRight, Server, Globe, Check, Loader, Copy, ShieldCheck } from 'lucide-react';

export const DomainPortingTile = () => {
    const [step, setStep] = useState<'initial' | 'transfer' | 'dns' | 'success'>('initial');
    const [domain, setDomain] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [dnsInfo, setDnsInfo] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState('');

    const handleTransfer = async () => {
        if (!domain || !authCode) return;
        setLoading(true);
        try {
            // 1. Initiate Transfer
            await fetch('/api/domain/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, authCode })
            });

            // 2. Auto-Provision Hosting
            await fetch('/api/domain/provision-external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, blueprintId: 'bp_core_v1', packageType: 'Pro' })
            });

            setSuccessMsg(`Transfer Initiated for ${domain}. Check registrant email.`);
            setStep('success');
        } catch (e: any) {
            alert(`Transfer Failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDns = async () => {
        if (!domain) return;
        setLoading(true);
        try {
            // 1. Get Instructions
            const dnsRes = await fetch('/api/domain/dns-instructions');
            const dnsData = await dnsRes.json();
            setDnsInfo(dnsData);

            // 2. Auto-Provision Hosting (so it's ready when propagated)
            await fetch('/api/domain/provision-external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, blueprintId: 'bp_core_v1', packageType: 'Pro' })
            });

            setStep('dns');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied!');
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" /> Port Your Domain
            </h3>

            {step === 'initial' && (
                <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-slate-400">Already own a domain? Bring it to BrandLift.</p>
                    <input
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        placeholder="your-domain.com"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-cyan-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStep('transfer')}
                            disabled={!domain}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded border border-slate-600 flex flex-col items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            <span className="text-[10px] uppercase font-bold">Transfer In</span>
                        </button>
                        <button
                            onClick={handleDns}
                            disabled={!domain || loading}
                            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded border border-slate-600 flex flex-col items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5 text-blue-400" />}
                            <span className="text-[10px] uppercase font-bold">Point DNS Only</span>
                        </button>
                    </div>
                </div>
            )}

            {step === 'transfer' && (
                <div className="space-y-4 animate-slideIn">
                    <div className="text-xs text-slate-400">
                        To transfer <span className="text-white font-bold">{domain}</span>, please provide the EPP / Auth Code from your current registrar.
                    </div>
                    <input
                        value={authCode}
                        onChange={e => setAuthCode(e.target.value)}
                        placeholder="EPP Auth Code"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm font-mono focus:border-cyan-500 outline-none"
                    />
                    <button
                        onClick={handleTransfer}
                        disabled={!authCode || loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-xs uppercase flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Start Transfer'}
                    </button>
                    <button onClick={() => setStep('initial')} className="text-[10px] text-slate-500 hover:text-white w-full">Cancel</button>
                </div>
            )}

            {step === 'dns' && dnsInfo && (
                <div className="space-y-4 animate-slideIn">
                    <div className="bg-blue-950/30 p-3 rounded border border-blue-900/50">
                        <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                            <Server className="w-3 h-3" /> White-Glove Instructions
                        </div>
                        <p className="text-[10px] text-slate-300 mb-3">{dnsInfo.instructions}</p>
                        <div className="space-y-1">
                            {dnsInfo.nameservers.map((ns: string, i: number) => (
                                <div key={i} onClick={() => copyToClipboard(ns)} className="bg-slate-950 p-1.5 rounded text-[10px] font-mono text-cyan-400 cursor-pointer hover:bg-slate-900 flex justify-between items-center group">
                                    {ns} <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-2 bg-green-950/20 border border-green-900/30 rounded text-center">
                        <div className="text-[10px] text-green-400 font-bold mb-1"><Check className="w-3 h-3 inline mr-1" /> Hosting Provisioned</div>
                        <div className="text-[9px] text-slate-500">Site will go live once DNS propagates.</div>
                    </div>
                    <button onClick={() => { setStep('initial'); setDomain(''); }} className="w-full bg-slate-800 text-white py-2 rounded text-xs">Done</button>
                </div>
            )}

            {step === 'success' && (
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center space-y-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-sm font-bold text-white">Action Complete</div>
                    <p className="text-xs text-slate-400">{successMsg}</p>
                    <p className="text-[10px] text-slate-500 mt-2">Hosting has been pre-provisioned.</p>
                    <button onClick={() => { setStep('initial'); setDomain(''); setAuthCode(''); }} className="text-cyan-400 text-xs hover:underline">Start Another</button>
                </div>
            )}
        </div>
    );
};
