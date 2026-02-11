import React, { useState, useEffect } from 'react';
import { ShoppingCart, ExternalLink, Loader, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
}

export const StorefrontPreviewTile = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/hostshop/products')
            .then(res => res.json())
            .then(data => {
                if (data.packages) {
                    setProducts(data.packages);
                    if (data.packages.length > 0) setSelectedProduct(data.packages[0].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handlePurchase = async () => {
        if (!selectedProduct) return;

        try {
            const res = await fetch('/api/hostshop/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedProduct,
                    blueprintId: 'bp_core_v1' // Defaulting for simple purchase flow
                })
            });
            const data = await res.json();
            if (data.checkoutUrl) {
                setCheckoutUrl(data.checkoutUrl);
                // In a real app, maybe auto-redirect:
                // window.location.href = data.checkoutUrl;
            }
        } catch (e) {
            alert("Checkout Error");
        }
    };

    if (loading) return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg flex items-center justify-center h-[300px]">
            <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
    );

    const activeProduct = products.find(p => p.id === selectedProduct);

    return (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> HostShop Storefront
                </h3>

                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => { setSelectedProduct(p.id); setCheckoutUrl(null); }}
                            className={`flex-shrink-0 w-[120px] p-3 rounded border cursor-pointer transition-all ${selectedProduct === p.id ? 'bg-cyan-950/50 border-cyan-500' : 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="text-[10px] uppercase text-slate-500 mb-1">{p.name}</div>
                            <div className="text-lg font-mono text-white">${p.price}</div>
                            <div className="text-[9px] text-slate-600">/{p.interval}</div>
                        </div>
                    ))}
                </div>

                {activeProduct && (
                    <div className="bg-slate-950/30 p-4 rounded border border-slate-800 mb-4 animate-fadeIn">
                        <ul className="space-y-1">
                            {activeProduct.features.map((f, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-cyan-500 rounded-full" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                {!checkoutUrl ? (
                    <button
                        onClick={handlePurchase}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-slate-600"
                    >
                        Prepare Checkout
                    </button>
                ) : (
                    <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                        Complete Payment <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
            {/* Background Effect */}
            <div className="absolute -bottom-4 -left-4 p-8 opacity-5 pointer-events-none">
                <Package className="w-32 h-32 text-cyan-500" />
            </div>
        </div>
    );
};
