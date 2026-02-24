import React, { useState } from 'react';
import { Bot, MessageSquare, Save, Loader, Database, FileText, Sparkles, Trash2, Plus } from 'lucide-react';

export const KnowledgeBaseTile = () => {
    const [instructions, setInstructions] = useState('You are a BrandLift Support Agent. Be professional, minimalist, and helpful.');
    const [qaPairs, setQaPairs] = useState([{ q: '', a: '' }]);
    const [includeDocs, setIncludeDocs] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const addPair = () => {
        setQaPairs([...qaPairs, { q: '', a: '' }]);
    };

    const removePair = (index: number) => {
        setQaPairs(qaPairs.filter((_, i) => i !== index));
    };

    const updatePair = (index: number, field: 'q' | 'a', value: string) => {
        const newPairs = [...qaPairs];
        newPairs[index][field] = value;
        setQaPairs(newPairs);
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');
        try {
            const res = await fetch('/api/ai/knowledge-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalInstructions: instructions,
                    qaPairs: qaPairs.filter(p => p.q && p.a),
                    includeTechnicalDocs: includeDocs
                })
            });
            const data = await res.json();
            setSuccessMsg(`Synced ${data.docCount} documents to Vector DB.`);

            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (e) {
            alert('Save Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full md:col-span-2 lg:col-span-2 xl:col-span-2 min-h-[400px]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Bot className="w-4 h-4" /> AI Knowledge Base
            </h3>

            <div className="flex flex-col lg:flex-row gap-6 mb-4 flex-1 overflow-hidden">
                {/* Left Column: Context & Settings */}
                <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Global Instructions (Tone & Persona)
                        </label>
                        <textarea
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            className="w-full h-32 bg-slate-950 border border-slate-700 text-white p-3 rounded text-xs font-mono focus:border-indigo-500 outline-none resize-none"
                            placeholder="Define how the AI should behave..."
                        />
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeDocs ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                                {includeDocs && <FileText className="w-3 h-3 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={includeDocs}
                                onChange={e => setIncludeDocs(e.target.checked)}
                            />
                            <div>
                                <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Integrate 20i Technical Docs</div>
                                <div className="text-[10px] text-slate-500">Allow AI to access hosting documentation for technical support</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Right Column: Q&A Pairs */}
                <div className="flex-[1.5] flex flex-col min-w-[300px] border-l border-slate-800 pl-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase text-slate-500 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> Frequent Q&A
                        </label>
                        <button onClick={addPair} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Question
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 max-h-[300px]">
                        {qaPairs.map((pair, idx) => (
                            <div key={idx} className="bg-slate-950/50 p-3 rounded border border-slate-800 group hover:border-indigo-500/30 transition-colors relative">
                                <input
                                    value={pair.q}
                                    onChange={e => updatePair(idx, 'q', e.target.value)}
                                    placeholder="Q: How do I reset my password?"
                                    className="w-full bg-transparent text-xs font-bold text-white mb-2 outline-none placeholder-slate-600 border-b border-transparent focus:border-indigo-500/50 pb-1"
                                />
                                <textarea
                                    value={pair.a}
                                    onChange={e => updatePair(idx, 'a', e.target.value)}
                                    placeholder="A: You can reset it via the portal settings..."
                                    className="w-full bg-transparent text-xs text-slate-400 outline-none resize-none h-16 placeholder-slate-600"
                                />
                                {qaPairs.length > 1 && (
                                    <button
                                        onClick={() => removePair(idx)}
                                        className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="text-[10px] text-green-400 font-mono animate-fadeIn h-4">
                    {successMsg}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded text-xs font-bold uppercase transition-all shadow-lg flex items-center gap-2"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sync Knowledge Base
                </button>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-10 -left-10 p-12 opacity-5 pointer-events-none">
                <Database className="w-48 h-48 text-indigo-500" />
            </div>
        </div>
    );
};
