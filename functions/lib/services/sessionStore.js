"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = void 0;
exports.sessionStore = {
    // --- VARIANT CONFIGURATION ---
    variantConfig: {
        count: 2,
        themes: ['modern_minimal', 'dark_saas']
    },
    getVariantConfig() {
        return this.variantConfig;
    },
    async updateVariantConfig(config) {
        console.log("[SessionStore] Updating Variant Config:", config);
        this.variantConfig = config;
        // In a real app, call API: await fetch('/api/config/variants', { method: 'POST', body: JSON.stringify(config) });
        return { success: true };
    },
    async recordPurchase(deploymentId, variantType, amount) {
        console.log(`[SessionStore] Client ${deploymentId} purchased ${variantType} for $${amount}`);
        // await fetch('/api/analytics/purchase', ...);
        return { success: true };
    },
    // --- REIMAGINE SESSION STORE ---
    activeSession: null,
    createVirtualSourceObject(scrapedData) {
        const virtualID = `v_src_${Math.random().toString(36).substring(7)}`;
        console.log("[Data Translation] Packaging Virtual Source Object:", virtualID, scrapedData);
        // Return standardized source object
        return {
            id: virtualID,
            type: 'virtual_hand_off',
            metadata: {
                business_name: scrapedData.businessName,
                industry: scrapedData.industry,
                target_keywords: scrapedData.keywords,
                geo_focus: scrapedData.location,
                generated_at: new Date().toISOString()
            },
            // Mock Autopsy Report
            autopsy: {
                seo_health: 'N/A (No Site)',
                market_opportunity: 'High',
                keyword_gaps: scrapedData.keywords
            }
        };
    },
    async startReimagineSession(data) {
        const isVirtual = !!data.virtualSource;
        this.activeSession = {
            originalUrl: data.originalUrl || 'https://virtual-hand-off.brandlift.ai',
            isVirtual: isVirtual,
            virtualSource: data.virtualSource,
            seoScore: data.seoScore || (isVirtual ? 0 : Math.floor(Math.random() * 40) + 40),
            // Progress State
            status: 'analyzing', // analyzing, provisioning, injecting, complete
            progressStep: 1, // 1, 2, 3
            variants: [], // Will populate after provisioning
            emailCampaigns: data.emailCampaigns || [
                'Initial Contact: Value Prop',
                'Follow-Up 1: Case Study (HVAC)',
                'Follow-Up 2: Discount Offer'
            ],
            deploymentId: null,
            startedAt: new Date().toISOString()
        };
        console.log("[SessionStore] Reimagine Session Started:", this.activeSession);
        if (isVirtual) {
            this._runVirtualOrchestration(data.virtualSource);
        }
        else {
            this._runStandardOrchestration(this.activeSession.originalUrl, data.variants);
        }
    },
    async _runStandardOrchestration(url, providedVariants) {
        console.log("[Orchestrator] Starting Standard Workflow for", url);
        // Reset state
        this.activeSession.status = 'analyzing';
        this.activeSession.progressStep = 1;
        // Wait for next poll cycle to pick up change
        await new Promise(r => setTimeout(r, 1000));
        this.activeSession.status = 'provisioning';
        this.activeSession.progressStep = 2;
        await new Promise(r => setTimeout(r, 1500));
        // Generate Mock Variants if not provided
        let variants = providedVariants || [];
        if (variants.length === 0) {
            let domain = 'client';
            try {
                domain = new URL(url).hostname.replace('www.', '').split('.')[0];
            }
            catch (e) { }
            variants = [
                {
                    name: 'Authority',
                    url: `https://${domain}-auth.brandlift.app`,
                    type: 'authority',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>${domain} - Authority</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-slate-50 font-serif">
                            <nav class="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-xl">
                                <div class="container mx-auto flex justify-between items-center">
                                    <h1 class="text-2xl font-bold tracking-widest uppercase">${domain}</h1>
                                    <div class="space-x-4 text-sm font-light">
                                        <a href="#" class="hover:text-amber-400 transition">Services</a>
                                        <a href="#" class="hover:text-amber-400 transition">About</a>
                                        <button class="bg-amber-500 text-black px-4 py-2 rounded font-bold hover:bg-amber-400 transition">Book Now</button>
                                    </div>
                                </div>
                            </nav>
                            <header class="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24">
                                <div class="container mx-auto px-6 text-center">
                                    <h2 class="text-5xl font-bold mb-6">Premium Solutions</h2>
                                    <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-8">Serving your local area with uncompromised quality and professional integrity.</p>
                                    <button class="bg-white text-slate-900 px-8 py-3 rounded text-lg font-bold hover:bg-amber-500 hover:text-white transition shadow-lg">Schedule Consultation</button>
                                </div>
                            </header>
                            <section class="py-16 container mx-auto px-6 grid md:grid-cols-3 gap-8">
                                <div class="p-8 bg-white shadow-lg rounded border-t-4 border-amber-500 text-center">
                                    <h3 class="text-xl font-bold mb-4">Certified Experts</h3>
                                    <p class="text-slate-600">Top-rated professionals in the industry.</p>
                                </div>
                                <div class="p-8 bg-white shadow-lg rounded border-t-4 border-slate-500 text-center">
                                    <h3 class="text-xl font-bold mb-4">24/7 Availability</h3>
                                    <p class="text-slate-600">Emergency services available.</p>
                                </div>
                                <div class="p-8 bg-white shadow-lg rounded border-t-4 border-slate-900 text-center">
                                    <h3 class="text-xl font-bold mb-4">Guaranteed Results</h3>
                                    <p class="text-slate-600">100% satisfaction guarantee on all projects.</p>
                                </div>
                            </section>
                        </body>
                        </html>
                    `
                },
                {
                    name: 'Speedster',
                    url: `https://${domain}-speed.brandlift.app`,
                    type: 'speedster',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>${domain} - Speedster</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-white font-sans antialiased">
                             <div class="bg-indigo-600 text-white text-xs font-bold text-center py-2">
                                 ⚡️ FAST RESPONSE GUARANTEED
                             </div>
                            <nav class="p-4 border-b border-gray-100 flex justify-between items-center container mx-auto">
                                <h1 class="text-xl font-black text-indigo-600 tracking-tighter italic">${domain}</h1>
                                <button class="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30">CALL NOW</button>
                            </nav>
                            <header class="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
                                <div class="md:w-1/2">
                                    <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">Flash Service</span>
                                    <h2 class="text-6xl font-black leading-tight mb-6 text-slate-900">Instant Service.</h2>
                                    <p class="text-lg text-slate-500 mb-8">Don't wait. We arrive faster than anyone else.</p>
                                    <div class="flex gap-4">
                                         <button class="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-indigo-700 transition shadow-xl text-center">Get Quote (30s)</button>
                                         <button class="flex-1 border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-lg font-bold hover:border-black transition text-center">View Map</button>
                                    </div>
                                </div>
                                <div class="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                                    <div class="bg-indigo-50 w-full h-80 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                         <div class="absolute inset-0 bg-indigo-500 opacity-10 transform skew-y-6 scale-110"></div>
                                         <span class="text-9xl">⚡️</span>
                                    </div>
                                </div>
                            </header>
                        </body>
                        </html>
                    `
                },
                {
                    name: 'Closer',
                    url: `https://${domain}-offer.brandlift.app`,
                    type: 'closer',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>${domain} - Closer</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-slate-950 text-white font-mono">
                            <div class="fixed inset-x-0 top-0 bg-red-600 text-white text-center text-sm font-bold py-2 z-50 animate-pulse">
                                ⚠️  URGENT: 50% OFF FIRST SERVICE - ENDS TODAY
                            </div>
                            <nav class="pt-16 px-6 container mx-auto flex justify-between items-center">
                                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">${domain}</h1>
                                <a href="#" class="text-emerald-400 border-b border-emerald-400 text-sm hover:text-white hover:border-white transition">Claim Offer</a>
                            </nav>
                            <main class="container mx-auto px-6 py-20 text-center max-w-4xl">
                                <h2 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">Stop Overpaying. <span class="text-emerald-400">Save Now</span>.</h2>
                                <p class="text-slate-400 text-xl mb-12">Exclusive deal for new customers.</p>
                                
                                <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                                    <div class="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">LIMITED TIME</div>
                                    <h3 class="text-3xl font-bold mb-2">Full Service Package</h3>
                                    <div class="flex justify-center items-end gap-2 mb-6">
                                        <span class="text-5xl font-bold text-white">$49</span>
                                        <span class="text-lg text-slate-500 line-through mb-1">$199</span>
                                    </div>
                                    <ul class="text-left max-w-xs mx-auto space-y-3 mb-8 text-sm text-slate-300">
                                        <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Full Inspection</li>
                                        <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Priority Scheduling</li>
                                        <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> 1-Year Warranty</li>
                                    </ul>
                                    <button class="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">LOCK IN PRICE NOW</button>
                                    <p class="text-xs text-slate-500 mt-4">No credit card required. Cancel anytime.</p>
                                </div>
                            </main>
                        </body>
                        </html>
                    `
                }
            ];
        }
        this.activeSession.status = 'injecting';
        this.activeSession.progressStep = 3;
        await new Promise(r => setTimeout(r, 1000));
        this.activeSession.status = 'complete';
        this.activeSession.progressStep = 4; // Ensure we go past 3
        this.activeSession.variants = variants;
        console.log("[Orchestrator] Standard Workflow Complete. Variants:", this.activeSession.variants);
    },
    async _runVirtualOrchestration(source) {
        console.log("[Orchestrator] Starting Virtual Hand-off Workflow for", source.id);
        // Step 1: Analyzing Scrape
        this.activeSession.status = 'analyzing';
        this.activeSession.progressStep = 1;
        await new Promise(r => setTimeout(r, 2000)); // Simulate analysis
        // Step 2: Provisioning Variants (Authority, Speedster, Closer)
        this.activeSession.status = 'provisioning';
        this.activeSession.progressStep = 2;
        console.log("[Orchestrator] Triggering 20i /addWeb for blueprints: Authority, Speedster, Closer");
        await new Promise(r => setTimeout(r, 3000)); // Simulate API calls
        // Generate Variant URLs & HTML Content
        const baseDomain = source.metadata.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const variants = [
            {
                name: 'Authority',
                url: `https://${baseDomain}-auth.brandlift.app`,
                type: 'authority',
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>${source.metadata.business_name} - Authority</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body class="bg-slate-50 font-serif">
                        <nav class="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-xl">
                            <div class="container mx-auto flex justify-between items-center">
                                <h1 class="text-2xl font-bold tracking-widest uppercase">${source.metadata.business_name}</h1>
                                <div class="space-x-4 text-sm font-light">
                                    <a href="#" class="hover:text-amber-400 transition">Services</a>
                                    <a href="#" class="hover:text-amber-400 transition">About</a>
                                    <button class="bg-amber-500 text-black px-4 py-2 rounded font-bold hover:bg-amber-400 transition">Book Now</button>
                                </div>
                            </div>
                        </nav>
                        <header class="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24">
                            <div class="container mx-auto px-6 text-center">
                                <h2 class="text-5xl font-bold mb-6">Premium ${source.metadata.industry} Solutions</h2>
                                <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-8">Serving ${source.metadata.geo_focus} with uncompromised quality and professional integrity.</p>
                                <button class="bg-white text-slate-900 px-8 py-3 rounded text-lg font-bold hover:bg-amber-500 hover:text-white transition shadow-lg">Schedule Consultation</button>
                            </div>
                        </header>
                        <section class="py-16 container mx-auto px-6 grid md:grid-cols-3 gap-8">
                            <div class="p-8 bg-white shadow-lg rounded border-t-4 border-amber-500 text-center">
                                <h3 class="text-xl font-bold mb-4">Certified Experts</h3>
                                <p class="text-slate-600">Top-rated professionals in ${source.metadata.industry}.</p>
                            </div>
                            <div class="p-8 bg-white shadow-lg rounded border-t-4 border-slate-500 text-center">
                                <h3 class="text-xl font-bold mb-4">24/7 Availability</h3>
                                <p class="text-slate-600">Emergency services across ${source.metadata.geo_focus}.</p>
                            </div>
                            <div class="p-8 bg-white shadow-lg rounded border-t-4 border-slate-900 text-center">
                                <h3 class="text-xl font-bold mb-4">Guaranteed Results</h3>
                                <p class="text-slate-600">100% satisfaction guarantee on all projects.</p>
                            </div>
                        </section>
                    </body>
                    </html>
                `
            },
            {
                name: 'Speedster',
                url: `https://${baseDomain}-speed.brandlift.app`,
                type: 'speedster',
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>${source.metadata.business_name} - Speedster</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body class="bg-white font-sans antialiased">
                         <div class="bg-indigo-600 text-white text-xs font-bold text-center py-2">
                             ⚡️ FAST RESPONSE GUARANTEED IN ${source.metadata.geo_focus.toUpperCase()}
                         </div>
                        <nav class="p-4 border-b border-gray-100 flex justify-between items-center container mx-auto">
                            <h1 class="text-xl font-black text-indigo-600 tracking-tighter italic">${source.metadata.business_name}</h1>
                            <button class="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30">CALL NOW</button>
                        </nav>
                        <header class="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
                            <div class="md:w-1/2">
                                <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 inline-block">Flash Service</span>
                                <h2 class="text-6xl font-black leading-tight mb-6 text-slate-900">Instant ${source.metadata.industry} Service.</h2>
                                <p class="text-lg text-slate-500 mb-8">Don't wait. We arrive faster than anyone else in ${source.metadata.geo_focus}.</p>
                                <div class="flex gap-4">
                                     <button class="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-indigo-700 transition shadow-xl text-center">Get Quote (30s)</button>
                                     <button class="flex-1 border-2 border-slate-200 text-slate-700 px-6 py-4 rounded-lg font-bold hover:border-black transition text-center">View Map</button>
                                </div>
                            </div>
                            <div class="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                                <div class="bg-indigo-50 w-full h-80 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                     <div class="absolute inset-0 bg-indigo-500 opacity-10 transform skew-y-6 scale-110"></div>
                                     <span class="text-9xl">⚡️</span>
                                </div>
                            </div>
                        </header>
                    </body>
                    </html>
                `
            },
            {
                name: 'Closer',
                url: `https://${baseDomain}-offer.brandlift.app`,
                type: 'closer',
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>${source.metadata.business_name} - Closer</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body class="bg-slate-950 text-white font-mono">
                        <div class="fixed inset-x-0 top-0 bg-red-600 text-white text-center text-sm font-bold py-2 z-50 animate-pulse">
                            ⚠️  URGENT: 50% OFF FIRST SERVICE - ENDS TODAY
                        </div>
                        <nav class="pt-16 px-6 container mx-auto flex justify-between items-center">
                            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">${source.metadata.business_name}</h1>
                            <a href="#" class="text-emerald-400 border-b border-emerald-400 text-sm hover:text-white hover:border-white transition">Claim Offer</a>
                        </nav>
                        <main class="container mx-auto px-6 py-20 text-center max-w-4xl">
                            <h2 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">Stop Overpaying for <span class="text-emerald-400">${source.metadata.industry}</span>.</h2>
                            <p class="text-slate-400 text-xl mb-12">Exclusive deal for ${source.metadata.geo_focus} residents.</p>
                            
                            <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                                <div class="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">LIMITED TIME</div>
                                <h3 class="text-3xl font-bold mb-2">Full Service Package</h3>
                                <div class="flex justify-center items-end gap-2 mb-6">
                                    <span class="text-5xl font-bold text-white">$49</span>
                                    <span class="text-lg text-slate-500 line-through mb-1">$199</span>
                                </div>
                                <ul class="text-left max-w-xs mx-auto space-y-3 mb-8 text-sm text-slate-300">
                                    <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Full Inspection</li>
                                    <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Priority Scheduling</li>
                                    <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> 1-Year Warranty</li>
                                </ul>
                                <button class="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">LOCK IN PRICE NOW</button>
                                <p class="text-xs text-slate-500 mt-4">No credit card required. Cancel anytime.</p>
                            </div>
                        </main>
                    </body>
                    </html>
                `
            }
        ];
        // Critical: Update session state immediately
        this.activeSession.variants = variants;
        // Step 3: Injecting SEO Schema
        this.activeSession.status = 'injecting';
        this.activeSession.progressStep = 3;
        console.log("[Orchestrator] Injecting SEO Schema based on keywords:", source.metadata.target_keywords);
        await new Promise(r => setTimeout(r, 2000)); // Simulate injection
        // Complete
        this.activeSession.status = 'complete';
        this.activeSession.progressStep = 4;
        this.activeSession.variants = variants; // Redundant safety
        this.activeSession.emailCampaigns = [
            'Outreach: "I built this for you"',
            'Follow-Up: Speed Comparison',
            'Closing: limited Time Offer'
        ];
        console.log("[Orchestrator] Virtual Workflow Complete. Variants:", variants);
    },
    getActiveSession() {
        return this.activeSession;
    }
};
//# sourceMappingURL=sessionStore.js.map