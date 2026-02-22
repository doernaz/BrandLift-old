import React, { useState, useEffect } from 'react';
import { Layers, Settings, Save, CheckCircle } from 'lucide-react';
import { sessionStore } from '../../../services/sessionStore';

const THEMES = [
    { id: 'modern_minimal', name: 'Modern Minimalist' },
    { id: 'dark_saas', name: 'Dark Mode SaaS' },
    { id: 'corporate_trust', name: 'Corporate Trust' },
    { id: 'creative_port', name: 'Creative Portfolio' },
    { id: 'ecom_conversion', name: 'E-commerce Conversion' },
    { id: 'medical_clean', name: 'Medical Clean' },
    { id: 'legal_auth', name: 'Legal Authority' },
    { id: 'restaurant_bistro', name: 'Restaurant Bistro' },
    { id: 'tech_startup', name: 'Tech Startup' },
    { id: 'lux_realestate', name: 'Lux Real Estate' },
    { id: 'industrial_bold', name: 'Industrial Bold' },
    { id: 'eco_green', name: 'Eco/Green Nature' },
    { id: 'fitness_energy', name: 'Fitness Energy' },
    { id: 'edu_academic', name: 'Educational Academic' },
    { id: 'nonprofit_impact', name: 'Non-Profit Impact' },
    { id: 'fintech_secure', name: 'Fintech Secure' },
    { id: 'cyberpunk_neon', name: 'Cyberpunk Neon' },
    { id: 'retro_vintage', name: 'Retro Vintage' },
    { id: 'scandi_hygge', name: 'Scandinavian Hygge' },
    { id: 'brutalist_art', name: 'Brutalist Art' },
    { id: 'glassmorphism', name: 'Glassmorphism UI' },
    { id: 'neumorphism', name: 'Neumorphism Soft' },
    { id: 'material_design', name: 'Material Design' },
    { id: 'apple_esque', name: 'Apple-esque' },
    { id: 'high_octane', name: 'High-Octane Sports' }
];

export interface VariantConfig {
    count: number;
    themes: string[];
}

interface VariantConfigTileProps {
    config?: VariantConfig;
    setConfig?: (config: VariantConfig) => void;
}

export const VariantConfigTile: React.FC<VariantConfigTileProps> = ({ config, setConfig }) => {
    const [count, setCount] = useState(config?.count || 3);
    const [selectedThemes, setSelectedThemes] = useState<string[]>(config?.themes || ['modern_minimal', 'dark_saas', 'corporate_trust']);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Sync from props if they change external to this component
    useEffect(() => {
        if (config) {
            setCount(config.count);
            setSelectedThemes(config.themes);
        }
    }, [config]);

    useEffect(() => {
        // Load initial if no props provided (legacy/standalone mode)
        const saved = sessionStore.getVariantConfig();
        if (saved && !config) {
            setCount(saved.count);
            setSelectedThemes(saved.themes);
        }
    }, [config]);

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (val > 0 && val <= 10) {
            setCount(val);
            // Adjust theme selection array size
            const newThemes = [...selectedThemes];
            if (val > newThemes.length) {
                // Add default themes if we need more
                for (let i = newThemes.length; i < val; i++) {
                    newThemes.push(THEMES[i % THEMES.length].id);
                }
            } else {
                // Trim if we need less
                newThemes.length = val;
            }
            setSelectedThemes(newThemes);
        }
    };

    const handleThemeSelect = (index: number, themeId: string) => {
        const newThemes = [...selectedThemes];
        newThemes[index] = themeId;
        setSelectedThemes(newThemes);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const newConfig = { count, themes: selectedThemes };
            await sessionStore.updateVariantConfig(newConfig);
            if (setConfig) setConfig(newConfig); // Notify parent
            setMsg('Configuration Saved');
            setTimeout(() => setMsg(''), 3000);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col h-full min-h-[350px]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4" /> Variant Generator Config
            </h3>

            <div className="mb-4">
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-2">
                    Variants per Client (Max 10)
                </label>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={count}
                        onChange={handleCountChange}
                        className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm w-20 text-center font-mono focus:border-indigo-500 outline-none"
                    />
                    <div className="text-xs text-slate-500">
                        Adjusting this determines how many unique layout concepts are generated per scan.
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700">
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-2 sticky top-0 bg-slate-900 z-10 pb-2">
                    Theme Selection
                </label>
                <div className="space-y-2">
                    {Array.from({ length: count }).map((_, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-xs text-indigo-400 font-mono w-6">#{idx + 1}</span>
                            <select
                                value={selectedThemes[idx] || ''}
                                onChange={(e) => handleThemeSelect(idx, e.target.value)}
                                className="flex-1 bg-transparent text-white text-xs outline-none border-none cursor-pointer"
                            >
                                {THEMES.map(t => (
                                    <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                    {saving ? <Settings className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Apply Configuration
                </button>
                {msg && (
                    <div className="mt-2 text-[10px] text-green-400 text-center animate-fadeIn flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {msg}
                    </div>
                )}
            </div>

            {/* Background Effect */}
            <div className="absolute -top-4 -right-4 p-8 opacity-5 pointer-events-none">
                <Layers className="w-32 h-32 text-indigo-500" />
            </div>
        </div>
    );
};
