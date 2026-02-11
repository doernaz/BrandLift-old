import React, { useState, useEffect } from 'react';
import { Package, ShieldPlus, Zap, ShoppingCart, Check, Loader, Server, Globe } from 'lucide-react';

interface Addon {
    id: string; // Stripe Price ID or internal ref
    name: string;
    price: number;
    icon: any;
    color: string;
    description: string;
}

// Static definition for Arizona LLC standard addons
const ADDONS: Addon[] = [
    { id: 'price_ip_dedi', name: 'Dedicated IP', price: 15, icon: ShieldPlus, color: 'text-green-400', description: 'Reputation isolation' },
    { id: 'price_seo_pack', name: 'SEO Power Pack', price: 99, icon: Zap, color: 'text-cyan-400', description: 'Auto-schema & backlinks' },
    { id: 'price_api_acc', name: 'API Access', price: 49, icon: Package, color: 'text-purple-400', description: 'Full GraphQL endpoint' },
];

export const AddonManager = () => {
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [checkingOut, setCheckingOut] = useState(false);
    const [activeSandbox, setActiveSandbox] = useState<string | null>(null);

    useEffect(() => {
        // Attempt to auto-resolve context
        fetch('/api/admin/data')
            .then(res => res.json())
            .then(data => {
                if (data.clients && data.clients.length > 0) {
                    // Find most recent active
                    setActiveSandbox(data.clients[0].id);
                }
            })
            .catch(() => { });
    }, []);

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const total = ADDONS.filter(a => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0);

    const handleCheckout = async () => {
        if (selectedAddons.length === 0) return;
        setCheckingOut(true);

        const items = ADDONS.filter(a => selectedAddons.includes(a.id)).map(a => ({
            price: a.id,
            quantity: 1
        }));

        try {
            const sandboxId = activeSandbox || 'manual_init';
            const res = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sandboxId,
                    email: 'client@brandlift.ai',
                    tier: 'BASIC', // Defaulting to Basic + Addons for this flow
                    addons: items
                })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout initialization failed.");
            }
        } catch (e) {
            console.error("Checkout Error", e);
            alert("Checkout failed");
        } finally {
            setCheckingOut(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-4 h-4" /> Add-on Services
                </h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeSandbox ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                    <span className="text-[10px] text-slate-500 font-mono">{activeSandbox ? 'LINKED' : 'STANDALONE'}</span>
                </div>
            </div>

            <div className="space-y-2 flex-grow">
                {ADDONS.map(addon => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                        <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`flex justify-between items-center text-xs p-3 rounded group cursor-pointer transition-all border ${isSelected
                                ? 'bg-yellow-900/20 border-yellow-500/50'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <addon.icon className={`w-4 h-4 ${addon.color}`} />
                                <div>
                                    <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{addon.name}</div>
                                    <div className="text-[10px] text-slate-600">{addon.description}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-white">${addon.price}/mo</span>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isSelected ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-slate-600'
                                    }`}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-slate-400">Total Monthly:</span>
                    <span className="font-mono text-white font-bold">${total}</span>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={selectedAddons.length === 0 || checkingOut}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/20"
                >
                    {checkingOut ? <Loader className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
                    {checkingOut ? 'PROCESSING...' : 'UPDATE SUBSCRIPTION'}
                </button>
            </div>
        </div>
    );
};
