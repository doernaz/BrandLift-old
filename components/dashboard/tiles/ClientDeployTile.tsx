import React, { useState } from 'react';
import { UserPlus, ArrowRight, Loader, CheckCircle, CreditCard, Lock, Mail, Server } from 'lucide-react';

export const ClientDeployTile = () => {
    const [step, setStep] = useState<'form' | 'provisioning' | 'payment' | 'finalizing' | 'complete'>('form');
    const [clientName, setClientName] = useState('');
    const [domain, setDomain] = useState('');
    const [blueprintId, setBlueprintId] = useState('master_bp_v1');
    const [result, setResult] = useState<any>(null);

    const handleDeploy = async () => {
        if (!clientName || !domain) return;
        setStep('provisioning');
        try {
            const res = await fetch('/api/deploy/lifecycle/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName, domain, blueprintId, packageType: 'Basic' })
            });
            const data = await res.json();
            setResult(data);
            setStep('payment');
        } catch (e) {
            alert('Deployment Failed');
            setStep('form');
        }
    };

    const handlePaymentSuccess = async () => {
        setStep('finalizing');
        try {
            const res = await fetch('/api/deploy/lifecycle/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deploymentId: result.deploymentId })
            });
            const data = await res.json();
            setResult({ ...result, ...data });
            setStep('complete');
        } catch (e) {
            alert('Finalization Failed');
            setStep('payment');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[400px]">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> New Client Deployment
            </h3>

            {step === 'form' && (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Company/Client Name</label>
                        <input
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            placeholder="Acme Corp"
                            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:border-cyan-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Target Domain</label>
                        <input
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                            placeholder="acmecorp.com"
                            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:border-cyan-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Blueprint</label>
                        <select
                            value={blueprintId}
                            onChange={e => setBlueprintId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:border-cyan-500 outline-none"
                        >
                            <option value="master_bp_v1">Master BrandLift V1 (Default)</option>
                            <option value="ecom_starter">E-Commerce Starter</option>
                        </select>
                    </div>

                    <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-400 space-y-1 mt-2">
                        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-cyan-500" /> Auto-Provision Sandbox</div>
                        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-cyan-500" /> Inject Chatbot & Knowledge Base</div>
                        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-cyan-500" /> Generate Stripe Checkout</div>
                    </div>

                    <button
                        onClick={handleDeploy}
                        disabled={!clientName || !domain}
                        className="mt-auto w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded text-xs uppercase transition-all flex items-center justify-center gap-2"
                    >
                        Initiate Lifecycle <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {step === 'provisioning' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
                    <Server className="w-16 h-16 text-cyan-500" />
                    <div className="text-center">
                        <div className="text-white font-bold"> provisioning Environment...</div>
                        <div className="text-xs text-slate-400">Cloning Blueprint & Injecting AI Agents</div>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-center space-y-1">
                        <h4 className="text-white font-bold">Financial Gate Active</h4>
                        <p className="text-xs text-slate-400">Sandbox is live at: <span className="text-cyan-400 font-mono">{result?.sandboxUrl}</span></p>
                        <p className="text-[10px] text-slate-500">Waiting for Stripe Checkout on deployment <span className="font-mono">{result?.deploymentId}</span></p>
                    </div>

                    <div className="w-full bg-slate-950 p-4 rounded border border-slate-800">
                        <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold text-center">Simulate Customer Action</div>
                        <button
                            onClick={handlePaymentSuccess}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-xs uppercase flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Simulate Payment Success
                        </button>
                    </div>
                </div>
            )}

            {step === 'finalizing' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
                    <Loader className="w-16 h-16 text-green-500 animate-spin" />
                    <div className="text-center">
                        <div className="text-white font-bold">Promoting to Production...</div>
                        <div className="text-xs text-slate-400">Pushing Sandbox to {domain}</div>
                    </div>
                </div>
            )}

            {step === 'complete' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h4 className="text-white font-bold text-lg">Deployment Successful!</h4>
                        <div className="space-y-1">
                            <a href={result?.liveUrl} target="_blank" rel="noreferrer" className="block text-cyan-400 hover:underline text-sm font-mono">{result?.liveUrl}</a>
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                <Mail className="w-3 h-3" /> Welcome Email Sent
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { setStep('form'); setClientName(''); setDomain(''); }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-xs mt-4"
                    >
                        Deploy Another Client
                    </button>
                </div>
            )}

            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <UserPlus className="w-40 h-40 text-cyan-500" />
            </div>
        </div>
    );
};
