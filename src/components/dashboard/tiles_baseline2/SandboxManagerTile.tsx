import React, { useState } from 'react';
import { Beaker, Copy, Upload, ArrowRight, CheckCircle, Loader, Lock, DollarSign } from 'lucide-react';

export const SandboxManagerTile = () => {
    const [step, setStep] = useState<'idle' | 'sandbox' | 'staging'>('idle');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Sandbox Inputs
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const features = [
        { id: 'feat_dark_mode_v2', name: 'Dark Mode V2 (Beta)' },
        { id: 'feat_ai_writer', name: 'AI Writer Assistant' },
        { id: 'feat_schema_pro', name: 'Schema Pro Markup' }
    ];

    // Mirror Inputs
    const [mirrorClientId, setMirrorClientId] = useState('');

    // Promote State (Mocking webhook for demo)
    const [sandboxUrl, setSandboxUrl] = useState('');
    const [sandboxId, setSandboxId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');

    const handleCreateSandbox = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sandbox/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blueprintId: 'master_bp_v1', features: selectedFeatures })
            });
            const data = await res.json();
            setResult(data);
            setSandboxId(data.sandboxId);
            setSandboxUrl(data.url);
            setStep('sandbox');
        } catch (e) {
            alert('Sandbox Creation Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleMirror = async () => {
        if (!mirrorClientId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/sandbox/mirror', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: mirrorClientId })
            });
            const data = await res.json();
            setResult(data);
            setSandboxId('stg_' + mirrorClientId);
            setSandboxUrl(data.stagingUrl);
            setStep('staging');
        } catch (e) {
            alert('Mirror Failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (paymentStatus !== 'paid') return;
        setLoading(true);
        try {
            const res = await fetch('/api/sandbox/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sandboxId, paymentStatus })
            });
            const data = await res.json();
            alert(`Success! Site is live at: ${data.liveUrl}`);
            setStep('idle');
            setResult(null);
            setPaymentStatus('pending');
        } catch (e) {
            alert('Promotion Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[350px]">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Beaker className="w-4 h-4" /> Sandbox & Staging
            </h3>

            {step === 'idle' && (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Sandbox Generator */}
                    <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                            <Upload className="w-3 h-3" /> Generate New Sandbox
                        </div>
                        <div className="space-y-2 mb-3">
                            <label className="text-[10px] text-slate-500 block">Inject Beta Features:</label>
                            {features.map(f => (
                                <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedFeatures.includes(f.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedFeatures([...selectedFeatures, f.id]);
                                            else setSelectedFeatures(selectedFeatures.filter(x => x !== f.id));
                                        }}
                                        className="rounded border-slate-700 bg-slate-900 text-amber-500 w-3 h-3"
                                    />
                                    <span className="text-[10px] text-slate-400">{f.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleCreateSandbox}
                            disabled={loading}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs py-2 rounded flex items-center justify-center gap-2 border border-slate-700 transition-all"
                        >
                            {loading ? <Loader className="w-3 h-3 animate-spin" /> : 'Launch Sandbox Environment'}
                        </button>
                    </div>

                    {/* Mirror Production */}
                    <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                            <Copy className="w-3 h-3" /> Mirror Production Site
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={mirrorClientId}
                                onChange={e => setMirrorClientId(e.target.value)}
                                placeholder="Client ID (e.g. client_123)"
                                className="flex-1 bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded text-[10px]"
                            />
                            <button
                                onClick={handleMirror}
                                disabled={loading || !mirrorClientId}
                                className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-3 py-1 rounded border border-slate-700 transition-all"
                            >
                                Mirror
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(step === 'sandbox' || step === 'staging') && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="text-center w-full">
                        <h4 className="text-white font-bold mb-1">{step === 'sandbox' ? 'Sandbox Active' : 'Staging Ready'}</h4>
                        <a href={sandboxUrl} target="_blank" rel="noreferrer" className="text-[10px] text-amber-400 hover:underline break-all font-mono block mb-4">
                            {sandboxUrl}
                        </a>

                        <div className="bg-slate-950 p-4 rounded border border-slate-800 w-full text-left">
                            <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold">Promotion Gate</div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-slate-300">Stripe Payment Status:</span>
                                <button
                                    onClick={() => setPaymentStatus(paymentStatus === 'paid' ? 'pending' : 'paid')}
                                    className={`text-[10px] px-2 py-0.5 rounded border ${paymentStatus === 'paid' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}
                                >
                                    {paymentStatus.toUpperCase()} (Click to toggle)
                                </button>
                            </div>

                            <button
                                onClick={handlePromote}
                                disabled={loading || paymentStatus !== 'paid'}
                                className={`w-full py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${paymentStatus === 'paid' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                                {loading && paymentStatus === 'paid' ? <Loader className="w-3 h-3 animate-spin" /> : paymentStatus === 'paid' ? <><ArrowRight className="w-3 h-3" /> Promote to Production</> : <><Lock className="w-3 h-3" /> Awaiting Payment</>}
                            </button>
                        </div>
                    </div>

                    <button onClick={() => { setStep('idle'); setMirrorClientId(''); setSelectedFeatures([]); }} className="text-[10px] text-slate-500 hover:text-white">
                        ← Return to Manager
                    </button>
                </div>
            )}

            {/* Background Effect */}
            <div className="absolute -bottom-6 -left-6 p-8 opacity-5 pointer-events-none">
                <Beaker className="w-32 h-32 text-amber-500" />
            </div>
        </div>
    );
};
