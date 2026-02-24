import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface WPSettings {
    can_edit_plugins: boolean;
    can_change_themes: boolean;
    can_edit_files: boolean;
}

export const CapabilitySyncTile = () => {
    const [settings, setSettings] = useState<WPSettings>({
        can_edit_plugins: true,
        can_change_themes: true,
        can_edit_files: false
    });
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);

    // Initial load: GET Defaults
    useEffect(() => {
        fetch('/api/admin/wp-defaults')
            .then(res => res.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    setSettings(data);
                }
            })
            .catch(console.error);
    }, []);

    // Push to All
    const handleBroadcast = async () => {
        if (!confirm("WARNING: This will overwrite capabilities on ALL client sites. Proceed?")) return;

        setSyncing(true);
        setSyncStatus("Broadcasting new policies...");

        try {
            const res = await fetch('/api/admin/wp-broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            const data = await res.json();

            setSyncStatus(`Sync Complete: ${data.updated} / ${data.total} Clients Updated.`);
        } catch (e: any) {
            setSyncStatus(`Error: ${e.message}`);
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncStatus(null), 5000);
        }
    };

    const toggle = (key: keyof WPSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" /> Global WP Capability Sync
                </h3>

                <div className="space-y-3 mb-6">
                    {/* Render Toggle Switches */}
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-800">
                        <span className="text-xs text-slate-300 font-mono">Allow Plugin Install</span>
                        <button
                            onClick={() => toggle('can_edit_plugins')}
                            className={`w-8 h-4 rounded-full relative transition-colors ${settings.can_edit_plugins ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.can_edit_plugins ? 'translate-x-4' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-800">
                        <span className="text-xs text-slate-300 font-mono">Allow Theme Changes</span>
                        <button
                            onClick={() => toggle('can_change_themes')}
                            className={`w-8 h-4 rounded-full relative transition-colors ${settings.can_change_themes ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.can_change_themes ? 'translate-x-4' : ''}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-800">
                        <span className="text-xs text-slate-300 font-mono">Allow File Access</span>
                        <button
                            onClick={() => toggle('can_edit_files')}
                            className={`w-8 h-4 rounded-full relative transition-colors ${settings.can_edit_files ? 'bg-red-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.can_edit_files ? 'translate-x-4' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <button
                    onClick={handleBroadcast}
                    disabled={syncing}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 font-bold py-3 rounded text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
                >
                    {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {syncing ? 'Broadcasting...' : 'Push to All Clients'}
                </button>

                {syncStatus && (
                    <div className="mt-2 text-center text-[10px] text-green-400 font-mono animate-pulse">
                        {syncStatus}
                    </div>
                )}
            </div>
            {/* Background Effect */}
            <div className="absolute -bottom-4 -right-4 p-8 opacity-5 pointer-events-none">
                <Database className="w-32 h-32 text-purple-500" />
            </div>
        </div>
    );
};
