import React, { useState } from 'react';
import { MessageSquare, UploadCloud, Code, CheckCircle, Loader } from 'lucide-react';

export const ChatbotDeployerTile = () => {
    const [scriptTag, setScriptTag] = useState('<script src="https://cdn.brandlift.ai/chat/v2.js"></script>');
    const [deploying, setDeploying] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleDeploy = async () => {
        if (!scriptTag) return;
        if (!confirm("This will inject the script into the footer of ALL active client websites. Proceed?")) return;

        setDeploying(true);
        setResult(null);
        try {
            const res = await fetch('/api/ai/chatbot/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptTag })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            alert("Deployment Failed");
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[300px]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Global Chatbot Deployer
            </h3>

            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <label className="text-[10px] uppercase text-slate-500 block mb-2 flex items-center gap-2">
                        <Code className="w-3 h-3" /> Chatbot Script Tag
                    </label>
                    <textarea
                        value={scriptTag}
                        onChange={e => setScriptTag(e.target.value)}
                        className="w-full h-24 bg-slate-900 border border-slate-700 text-green-400 p-3 rounded text-[10px] font-mono outline-none resize-none"
                        placeholder="<script>...</script>"
                    />
                </div>

                <div className="bg-indigo-900/10 p-3 rounded border border-indigo-900/30 text-[10px] text-indigo-200">
                    <strong>Note:</strong> This uses 20i file access to inject the script into the global footer of all WordPress and custom sites.
                </div>

                {result && (
                    <div className="bg-green-900/20 border border-green-500/30 p-3 rounded text-center animate-fadeIn">
                        <div className="flex items-center justify-center gap-2 text-green-400 font-bold mb-1">
                            <CheckCircle className="w-4 h-4" /> Deployment Complete
                        </div>
                        <div className="text-[10px] text-slate-400">
                            {result.message}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                    onClick={handleDeploy}
                    disabled={deploying || !scriptTag}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                    {deploying ? <Loader className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    Deploy to All Sites
                </button>
            </div>

            {/* Background Effect */}
            <div className="absolute -bottom-6 -right-6 p-8 opacity-5 pointer-events-none">
                <MessageSquare className="w-32 h-32 text-indigo-500" />
            </div>
        </div>
    );
};
