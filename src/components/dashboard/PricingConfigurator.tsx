import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Settings, RefreshCw, Loader } from 'lucide-react';

export const PricingConfigurator = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/admin/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const updatePrice = async (productId: string, currentAmount: number) => {
        const newPrice = prompt(`Update monthly price for this tier (USD)?`, (currentAmount / 100).toString());
        if (!newPrice || isNaN(Number(newPrice))) return;

        setUpdating(productId);
        try {
            const res = await fetch('/api/admin/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, amount: Number(newPrice) })
            });

            if (res.ok) {
                await fetchProducts(); // Refresh list
            } else {
                alert("Update failed. Check API logs.");
            }
        } catch (e) {
            alert("Error updating price");
        } finally {
            setUpdating(null);
        }
    };

    const formatPrice = (p: any) => {
        if (p.default_price && typeof p.default_price === 'object') {
            return `$${(p.default_price.unit_amount / 100).toFixed(0)}`;
        }
        return 'Not Set';
    };

    const getPriceAmount = (p: any) => {
        if (p.default_price && typeof p.default_price === 'object') {
            return p.default_price.unit_amount;
        }
        return 0;
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Pricing Strategy
                </h3>
                <div className="bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-mono">HYBRID MODEL</span>
                </div>
            </div>

            <div className="space-y-3 flex-grow">
                {loading ? (
                    <div className="flex items-center justify-center h-20 text-slate-500 gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Syncing Stripe...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded">
                        No active pricing tiers found.
                    </div>
                ) : (
                    products.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs bg-slate-950 p-3 rounded border border-slate-800 hover:border-slate-600 transition-colors group">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-white flex items-center gap-2">
                                    {p.name}
                                    {p.name.includes('Basic') && <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400">CORE</span>}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono">{p.id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-purple-300 font-bold text-sm">
                                    {formatPrice(p)}<span className="text-xs text-slate-500 font-normal">/mo</span>
                                </span>
                                <button
                                    onClick={() => updatePrice(p.id, getPriceAmount(p))}
                                    disabled={!!updating}
                                    className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-purple-400 transition-colors"
                                    title="Update Data"
                                >
                                    {updating === p.id ? <Loader className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span className="uppercase tracking-wider">Recurring Revenue</span>
                <span className="flex items-center gap-1">
                    Sources: Stripe API <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </span>
            </div>
        </div>
    );
};
