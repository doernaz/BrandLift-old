import React, { useState } from 'react';
import { SeoAnalysisResult } from '../../types';
import { SparklesIcon, CheckCircleIcon, PaperAirplaneIcon, ArrowPathIcon } from '../icons/Icons';

interface EmailDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisResults: SeoAnalysisResult | null;
    targetUrl?: string;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ isOpen, onClose, analysisResults, targetUrl }) => {
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    // Dynamic Data
    const clientName = analysisResults?.variants?.[0]?.seoPackage?.jsonLd?.LocalBusiness?.name || "Client Company";
    const companyName = clientName;
    const ownerName = "Business Owner"; // In real app, derived from lead enrichment
    const currentScore = analysisResults?.originalScore || 42;
    const brandLiftScore = analysisResults?.variants?.[0]?.optimizedScore || 98;
    // Mocking the 20i link structure
    const showcaseLink = `https://preview.brandlift.ai/${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    // Live date for headers
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const handleCreateDraft = async () => {
        setIsSending(true);
        try {
            // Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Success state
            setSendSuccess(true);
            setTimeout(() => {
                setSendSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to create draft", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 ring-1 ring-white/20">

                {/* Header / Toolbar */}
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center relative overflow-hidden shadow-lg shadow-blue-600/20">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-overlay"></div>
                            <SparklesIcon className="w-4 h-4 text-white relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-gray-900 font-bold text-lg leading-none tracking-tight">BrandLift<span className="text-blue-600">.Outreach</span></h2>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">GENERATIVE EMAIL PREVIEW // {today.toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateDraft}
                            disabled={isSending || sendSuccess}
                            className={`px-6 py-2 rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${sendSuccess
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30'
                                }`}
                        >
                            {isSending ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : sendSuccess ? (
                                <>
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Draft Saved
                                </>
                            ) : (
                                <>
                                    Confirm & Save Draft
                                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Email Context Bar */}
                <div className="bg-white px-8 py-4 border-b border-gray-100 flex gap-8 text-sm">
                    <div className="flex gap-2">
                        <span className="text-gray-400 font-medium">To:</span>
                        <span className="text-gray-800 font-mono bg-gray-50 px-2 rounded border border-gray-200">{ownerName} &lt;owner@{new URL(targetUrl || 'http://example.com').hostname}&gt;</span>
                    </div>
                    <div className="flex gap-2 flex-1">
                        <span className="text-gray-400 font-medium">Subject:</span>
                        <span className="text-gray-900 font-medium">I used AI to build a ready-to-use, SEO-optimized version of your site. Link inside.</span>
                    </div>
                </div>

                {/* Email Body Preview (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 font-sans">
                    <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">

                        {/* Email Content Container */}
                        <div className="p-8 md:p-10 space-y-8 text-gray-800 leading-relaxed font-sans text-[15px]">

                            {/* Salutation */}
                            <p>Hi {ownerName},</p>

                            {/* Opening */}
                            <p>Most people use 'AI' as a buzzword to fill slides. I’d rather just show you the output.</p>

                            <p>I’ve already created your AI generated upgrade for <strong>{companyName}</strong>. It fixes the brand gap and automates your SEO footprint—the work is done.</p>

                            {/* Hero Visual: Side-by-Side Comparison */}
                            <div className="my-8 rounded-lg overflow-hidden border border-gray-200 shadow-xl relative bg-slate-900">
                                {/* Chrome-like Header */}
                                <div className="h-8 bg-slate-800 flex items-center px-3 border-b border-gray-700 justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono opacity-60">BrandLift_comparison_engine.render()</div>
                                    <div className="w-4"></div>
                                </div>

                                <div className="grid grid-cols-2 relative h-[280px]">
                                    {/* Left: Original (Abstract) */}
                                    <div className="relative group border-r border-gray-700 bg-slate-100 overflow-hidden flex flex-col">
                                        {/* Mock Header */}
                                        <div className="bg-white h-10 border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
                                            <div className="h-3 w-20 bg-gray-300 rounded"></div>
                                            <div className="flex gap-2">
                                                <div className="h-2 w-10 bg-gray-200 rounded"></div>
                                                <div className="h-2 w-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        {/* Mock Content (Cluttered/Dated) */}
                                        <div className="p-4 space-y-3 opacity-60">
                                            <div className="w-full h-32 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-xs">Legacy Hero Image</div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-gray-300 rounded w-full"></div>
                                                <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                                                <div className="h-2 bg-gray-300 rounded w-4/6"></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-4">
                                                <div className="h-16 bg-gray-200 rounded"></div>
                                                <div className="h-16 bg-gray-200 rounded"></div>
                                                <div className="h-16 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        {/* Overlay Label */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm p-3 border-t border-slate-700">
                                            <div className="text-[10px] text-red-300 font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                Status: Needs Update
                                            </div>
                                            <div className="text-white font-bold text-xs">Current Site (Legacy)</div>
                                        </div>
                                    </div>

                                    {/* Right: Optimized (Abstract) */}
                                    <div className="relative group bg-slate-900 overflow-hidden flex flex-col">
                                        {/* Premium background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-950 to-black">
                                            <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
                                        </div>

                                        {/* Mock Header */}
                                        <div className="relative z-10 h-12 bg-white/5 border-b border-white/10 backdrop-blur-md flex items-center px-4 justify-between shrink-0">
                                            <div className="h-4 w-24 bg-white/90 rounded-sm"></div>
                                            <div className="h-8 w-20 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <div className="h-2 w-10 bg-white/20 rounded"></div>
                                            </div>
                                        </div>

                                        {/* Mock Content (Modern/Sleek) */}
                                        <div className="relative z-10 p-6 flex flex-col items-center justify-center flex-1 text-center space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-2"></div>
                                            <div className="h-3 w-3/4 bg-white/90 rounded-full"></div>
                                            <div className="h-2 w-1/2 bg-white/40 rounded-full"></div>

                                            <div className="flex gap-3 mt-4 w-full justify-center">
                                                <div className="h-12 w-28 bg-white/10 border border-white/10 rounded-xl backdrop-blur-sm"></div>
                                                <div className="h-12 w-28 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm"></div>
                                            </div>
                                        </div>

                                        {/* Overlay Label */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600/95 backdrop-blur-sm p-3 border-t border-blue-500 z-20">
                                            <div className="text-[10px] text-blue-100 font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse"></div>
                                                Status: Optimized
                                            </div>
                                            <div className="text-white font-bold text-xs flex items-center gap-2">
                                                BrandLift Optimized
                                                <CheckCircleIcon className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* VS Badge */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center font-black text-xs text-slate-900 z-30 shadow-2xl ring-4 ring-slate-900/20">VS</div>
                                </div>
                            </div>

                            {/* Vital Signs Table (Redesigned) */}
                            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 my-8 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4" />
                                        Performance Audit
                                    </h4>
                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100 uppercase">AI Verified</span>
                                </div>
                                <div className="space-y-6">
                                    {/* Mobile Speed - Progress Bar Style */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-700">Mobile Page Speed</span>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-red-500 font-medium">Critical Issues ({currentScore})</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-green-600 font-bold">BrandLift ({brandLiftScore})</span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                            <div style={{ width: `${currentScore}%` }} className="h-full bg-red-400 opacity-50"></div>
                                            <div style={{ width: `${brandLiftScore - currentScore}%` }} className="h-full bg-gradient-to-r from-green-400 to-green-500 relative">
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] [background-size:10px_10px]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* SEO Structure Card */}
                                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex flex-col items-center text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase mb-1">Architecture</div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400 line-through">Fragmented</span>
                                                <ArrowPathIcon className="w-3 h-3 text-indigo-400" />
                                                <span className="text-indigo-600 font-bold">AI-Mapped</span>
                                            </div>
                                        </div>

                                        {/* UX Card */}
                                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex flex-col items-center text-center">
                                            <div className="text-xs text-gray-400 font-medium uppercase mb-1">User Journey</div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400 line-through">High Friction</span>
                                                <ArrowPathIcon className="w-3 h-3 text-purple-400" />
                                                <span className="text-purple-600 font-bold">Conversion-First</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Link */}
                            <p>You can view your custom preview here: <a href={showcaseLink} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold decoration-2 underline-offset-2 hover:text-blue-800 transition-colors break-all">{showcaseLink}</a></p>

                            <p>No strings attached—I just love showing business owners what's possible with these new tools.</p>

                            {/* Signature */}
                            <div className="pt-6 border-t border-gray-100 mt-8">
                                <p className="font-bold text-gray-900">Best,</p>
                                <p className="mt-1 font-semibold text-lg text-gray-900">Brad Doern</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className="font-medium text-gray-700">Founder, BrandLift</span>
                                    <span className="text-gray-300">|</span>
                                    <a href="#" className="text-blue-600 font-medium hover:underline">BrandLift.ai</a>
                                </div>
                            </div>

                            {/* Footer / Disclaimer */}
                            <div className="mt-12 pt-6 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed font-sans bg-gray-50 -mx-8 -mb-8 p-8 border-b border-gray-200">
                                <p className="mb-2">
                                    <span className="font-bold text-gray-500">Disclaimer:</span> This analysis was performed using publicly accessible front-end web signals for research purposes. BrandLift is not affiliated with {companyName}. No private data was accessed.
                                </p>
                                <p>
                                    <span className="font-bold text-gray-500">Opt-Out:</span> If you'd prefer not to receive further research updates, please reply "Stop" and you will be removed from our list.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
