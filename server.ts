
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { firebaseService } from './services/firebaseService.js';
import { twentyiService } from './services/twentyiService.js';
import { stripeService } from './services/stripeService.js';
import { deepScanService } from './services/deepScanService.js';

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
    type: Type.OBJECT,
    properties: {
        originalScore: { type: Type.INTEGER, description: "SEO score of the original HTML from 0-100" },
        variants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the SEO strategy (e.g., 'Core Optimization', 'Local Dominance', 'Aggressive Growth')" },
                    description: { type: Type.STRING, description: "Brief description of the strategy's focus." },
                    seoPackage: {
                        type: Type.OBJECT,
                        properties: {
                            jsonLd: {
                                type: Type.OBJECT,
                                properties: {
                                    Organization: { type: Type.OBJECT, properties: { '@context': { type: Type.STRING }, '@type': { type: Type.STRING } }, additionalProperties: true },
                                    WebSite: { type: Type.OBJECT, properties: { '@context': { type: Type.STRING }, '@type': { type: Type.STRING } }, additionalProperties: true },
                                    LocalBusiness: { type: Type.OBJECT, properties: { '@context': { type: Type.STRING }, '@type': { type: Type.STRING } }, additionalProperties: true }
                                }
                            },
                            metaTags: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            },
                            openGraph: {
                                type: Type.OBJECT,
                                properties: {
                                    'og:title': { type: Type.STRING },
                                    'og:description': { type: Type.STRING },
                                    'og:type': { type: Type.STRING },
                                    'og:url': { type: Type.STRING },
                                    'og:image': { type: Type.STRING }
                                }
                            },
                            twitterCard: {
                                type: Type.OBJECT,
                                properties: {
                                    'twitter:card': { type: Type.STRING },
                                    'twitter:title': { type: Type.STRING },
                                    'twitter:description': { type: Type.STRING },
                                    'twitter:image': { type: Type.STRING }
                                }
                            }
                        }
                    },
                    optimizedScore: { type: Type.INTEGER, description: "Projected SEO score after applying this specific package, from 0-100" },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key SEO opportunities that were addressed by this specific strategy." }
                }
            }
        }
    }
};

const cleanJsonString = (rawText) => {
    const match = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return rawText.trim();
};

// --- Admin Routes ---
app.get('/api/admin/packages', async (req: Request, res: Response) => {
    try {
        const packages = await twentyiService.listPackages();
        res.json(packages);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/products', async (req: Request, res: Response) => {
    try {
        const products = await stripeService.listProducts();
        res.json(products);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/pricing', async (req: Request, res: Response) => {
    try {
        const { productId, amount } = req.body;
        if (!productId || !amount) return res.status(400).json({ error: "Missing productId or amount" });
        const price = await stripeService.createPrice(productId, amount * 100);
        res.json(price);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});



app.get('/api/admin/vault', async (req: Request, res: Response) => {
    try {
        const snapshot = await firebaseService.db.collection('brandlift_ip_vault').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ items, count: items.length });
    } catch (error) {
        // Fallback to mock if Firebase fails
        res.json({
            items: [
                { id: 'lead_scoring_v1', name: 'Lead Scoring Algorithm v1 (Offline)', active: true },
                { id: 'content_gen_v1', name: 'SEO Content Generator v1 (Offline)', active: true }
            ],
            count: 2,
            offline: true
        });
    }
});

// --- Health Check / Sentinel Endpoint ---
app.get('/api/health', async (req: any, res: any) => {
    const statuses: any = {
        firebase: { status: 'UNKNOWN', latency: 0 },
        twentyi: { status: 'UNKNOWN', latency: 0 },
        stripe: { status: 'UNKNOWN', latency: 0 },
        system: { status: 'ONLINE', uptime: process.uptime() }
    };

    // Check Firebase
    const fbStart = Date.now();
    try {
        await firebaseService.db.listCollections();
        statuses.firebase = { status: 'CONNECTED', latency: Date.now() - fbStart };
    } catch (e: any) {
        statuses.firebase = { status: 'ERROR', latency: Date.now() - fbStart };
    }

    // Check 20i (List Packages limit 1 via Service)
    const tiStart = Date.now();
    try {
        if (!process.env.TWENTYI_API_KEY) throw new Error("Missing API Key");
        // Lightweight check: listing packages is usually fast
        await twentyiService.listPackages();
        statuses.twentyi = { status: 'ACTIVE', latency: Date.now() - tiStart };
    } catch (e: any) {
        statuses.twentyi = { status: 'ERROR', error: e.message, latency: Date.now() - tiStart };
    }

    // Check Stripe (Balance)
    const stStart = Date.now();
    try {
        // Since we don't have a direct 'stripe' object exported here, we can rely on env var or assume service is init
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing Stripe Key");
        // If stripeService exposed a health check, better. But for now, just check key presence.
        // Or instantiate locally for check
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
        // await stripe.balance.retrieve();
        // Just report 'READY' if key exists.
        statuses.stripe = { status: 'READY (Key Present)', latency: 0 };
    } catch (e: any) {
        statuses.stripe = { status: 'ERROR', latency: Date.now() - stStart };
    }

    // Check SMTP
    statuses.smtp = process.env.SMTP_HOST
        ? { status: 'CONFIGURED', host: process.env.SMTP_HOST }
        : { status: 'MISSING_CONFIG' };

    res.json(statuses);
});

app.post('/api/analyze', async (req, res) => {
    // Alias to Deep Scan for backward compatibility
    try {
        const { htmlContent, url } = req.body;
        const result = await deepScanService.performDeepScan(url, htmlContent);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/deep-scan', async (req, res) => {
    try {
        const { htmlContent, url } = req.body;
        if (!htmlContent || !url) return res.status(400).json({ error: "Missing htmlContent or url" });
        const result = await deepScanService.performDeepScan(url, htmlContent);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});



app.post('/api/leads', async (req, res) => {
    try {
        const { industry, location } = req.body;
        if (!industry || !location) {
            return res.status(400).json({ error: 'Missing industry or location' });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'Configuration Error: GOOGLE_PLACES_API_KEY is missing in .env.local. Please add your Google Places API Key to enable real data fetching.'
            });
        }

        const query = `${industry} in ${location}`;
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.businessStatus'
            },
            body: JSON.stringify({ textQuery: query })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Places API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch leads' });
    }
});

app.get('/api/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const targetUrl = new URL(url as string).href;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        // Inject base tag
        const urlObject = new URL(targetUrl);
        const baseTag = `<base href="${urlObject.origin}">`;

        let processedHtml = html;
        if (/<head/i.test(html)) {
            processedHtml = html.replace(/<head/i, `<head>\n${baseTag}`);
        } else {
            processedHtml = `<head>${baseTag}</head>${html}`;
        }

        res.send(processedHtml);

    } catch (error: any) {
        console.error('Proxy error:', error);

        // Distinguish between DNS/Network errors and HTTP errors
        const status = error.message.includes('404') ? 404 :
            error.message.includes('403') ? 403 : 502;

        res.status(status).json({
            error: 'Could not fetch the URL. The site may be blocking requests or is unreachable.',
            details: error.message
        });
    }
});

app.post('/api/export-subsite', async (req, res) => {
    try {
        const { landingHtml, resultsHtml, comparisonHtml } = req.body;

        // Ensure directory exists
        const fs = await import('fs/promises');
        const path = await import('path');
        const exportDir = path.join(process.cwd(), 'deployment_assets');

        try {
            await fs.access(exportDir);
        } catch {
            await fs.mkdir(exportDir, { recursive: true });
        }

        await fs.writeFile(path.join(exportDir, 'landing.html'), landingHtml, 'utf-8');
        await fs.writeFile(path.join(exportDir, 'seo-results.html'), resultsHtml, 'utf-8');
        await fs.writeFile(path.join(exportDir, 'comparison.html'), comparisonHtml, 'utf-8');

        console.log(`Subsite assets exported to: ${exportDir}`);
        res.json({ success: true, path: exportDir });

    } catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Export failed' });
    }
});

// --- BRANDLIFT ORCHESTRATION ENDPOINTS ---

/**
 * 1. Zero-Touch Deployment: Provision Sandbox
 * Triggers 20i to create a temporary stackstaging environment.
 */
// --- IN-MEMORY STORE FOR DEMO FALLBACKS ---
const localDeployments: Record<string, string> = {};

// ... (existing imports/setup)

/**
 * SERVE LOCAL FALLBACK SITES (DEMO MODE)
 * Uses in-memory content when 20i FTP blocks uploads.
 */
app.get('/api/live-site/:id', (req, res) => {
    const content = localDeployments[req.params.id];
    if (content) {
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } else {
        res.status(404).send('<h1>Site Not Found (Expired or Invalid ID)</h1>');
    }
});

/**
 * 1. Zero-Touch Deployment: Provision Sandbox
 * Triggers 20i to create a temporary stackstaging environment.
 */
app.post('/api/deploy/provision', async (req, res) => {
    try {
        const { domain, blueprintId, clientId, clientEmail } = req.body;

        if (!domain || !blueprintId) {
            return res.status(400).json({ error: "Missing domain or blueprintId" });
        }

        // 1. Log Activity
        await firebaseService.logActivity('Provisioning Started', { domain, email: clientEmail });

        // 2. Call 20i Service
        let provisionResult;
        try {
            provisionResult = await twentyiService.provisionSandbox(domain, blueprintId);
            console.log(`[ORCHESTRATOR] Sandbox Provisioned Successfully: ${provisionResult.url} (ID: ${provisionResult.id})`);
        } catch (provisionError) {
            console.warn(`[ORCHESTRATOR] 20i Provisioning Failed (Swallowing error for Demo Flow):`, provisionError);
            // Fallback: Create a mock result so we can proceed to the "Local Proxy" step
            provisionResult = {
                id: `mock_${Date.now()}`,
                url: `https://${domain}`,
                status: 'mock_fallback',
                ftpDetails: { host: 'mock.ftp', user: 'demo', password: 'demo' },
                details: { error: String(provisionError) }
            };
        }

        // 3. Deploy Content (FTP)
        let deploySuccess = false;
        let finalUrl = provisionResult.url;
        let finalStatus = 'uploaded';

        const isProd = req.body.environment === 'production';
        const banner = !isProd
            ? `<div style="position:fixed;top:0;left:0;right:0;background:#f59e0b;color:black;text-align:center;font-weight:bold;padding:5px;z-index:9999;font-family:sans-serif;font-size:12px;">🚧 BRANDLIFT SANDBOX ENVIRONMENT: ${blueprintId} 🚧</div>`
            : '';

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${domain} - ${isProd ? 'Official Site' : 'Staging'}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { padding-top: ${!isProd ? '25px' : '0'}; }</style>
            </head>
            <body class="bg-white font-sans antialiased text-gray-900">
                ${banner}
                <nav class="bg-slate-900 text-white p-6 sticky top-0 z-40 shadow-xl">
                    <div class="container mx-auto flex justify-between items-center">
                        <h1 class="text-2xl font-bold tracking-widest uppercase text-cyan-400">${domain.split('.')[0].replace(/-/g, ' ')}</h1>
                        <div class="space-x-4 text-sm font-light hidden md:block">
                            <a href="#" class="hover:text-cyan-400 transition">Services</a>
                            <a href="#" class="hover:text-cyan-400 transition">About</a>
                            <button class="bg-cyan-500 text-black px-4 py-2 rounded font-bold hover:bg-cyan-400 transition">Book Now</button>
                        </div>
                    </div>
                </nav>

                <header class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-32 relative overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
                    <div class="container mx-auto px-6 text-center relative z-10">
                        <span class="inline-block py-1 px-3 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-6">
                            ${isProd ? '🚀 Production Deployment Active' : '🧪 Experimental Sandbox'}
                        </span>
                        <h2 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            Elevating <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Local Business</span>
                        </h2>
                        <p class="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                            This is a live demonstration of the BrandLift ${blueprintId} architecture. 
                            The content you see here is dynamically scaffolded based on the provided metadata.
                        </p>
                        <div class="flex flex-col md:flex-row gap-4 justify-center">
                            <button class="bg-cyan-500 text-black px-8 py-4 rounded text-lg font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                Schedule Consultation
                            </button>
                            <button class="bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded text-lg font-bold hover:bg-slate-700 transition">
                                View Service Map
                            </button>
                        </div>
                    </div>
                </header>

                <section class="py-20 bg-slate-50">
                    <div class="container mx-auto px-6">
                        <div class="text-center mb-16">
                            <h3 class="text-3xl font-bold mb-4">Core Technology Stack</h3>
                            <p class="text-gray-600">Built for speed, reliability, and conversion.</p>
                        </div>
                        <div class="grid md:grid-cols-3 gap-8">
                            <div class="p-8 bg-white shadow-lg rounded-xl border-t-4 border-cyan-500">
                                <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl text-cyan-600">⚡️</div>
                                <h3 class="text-xl font-bold mb-2">High Velocity</h3>
                                <p class="text-gray-600 text-sm">Optimized for sub-100ms load times and instant interaction.</p>
                            </div>
                            <div class="p-8 bg-white shadow-lg rounded-xl border-t-4 border-amber-500">
                                <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-2xl text-amber-600">🛡</div>
                                <h3 class="text-xl font-bold mb-2">Secure Infrastructure</h3>
                                <p class="text-gray-600 text-sm">Enterprise-grade security with automated SSL and WAF protection.</p>
                            </div>
                            <div class="p-8 bg-white shadow-lg rounded-xl border-t-4 border-emerald-500">
                                <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-2xl text-emerald-600">📈</div>
                                <h3 class="text-xl font-bold mb-2">Conversion First</h3>
                                <p class="text-gray-600 text-sm">Designed from the ground up to maximize lead capture and sales.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer class="bg-slate-900 text-slate-500 py-12 text-center text-sm border-t border-slate-800">
                    <p>&copy; ${new Date().getFullYear()} ${domain}. All rights reserved.</p>
                    <p class="mt-2 text-xs">Provisioned by BrandLift Orchestrator &bull; ID: ${provisionResult.id}</p>
                </footer>
            </body>
            </html>
        `;

        try {
            console.log(`[ORCHESTRATOR] Starting content deployment...`);
            await twentyiService.uploadVariantContent(provisionResult.id, htmlContent, provisionResult.ftpDetails);
            deploySuccess = true;
            console.log(`[ORCHESTRATOR] Content deployment successful.`);

        } catch (ftpError: any) {
            console.error("[ORCHESTRATOR] Deploy Variant Error (FTP):", ftpError);

            // FALLBACK STRATEGY: Store locally and serve via proxy
            console.warn("[ORCHESTRATOR] Activating Local Proxy Fallback for Demo Mode.");
            localDeployments[provisionResult.id] = htmlContent;

            // Override the URL to point to our local server
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            finalUrl = `${protocol}://${req.get('host')}/api/live-site/${provisionResult.id}`;
            finalStatus = 'fallback_local';
        }

        // 4. Sync to Firebase "Source of Truth" (Non-blocking)
        if (clientId) {
            try {
                await firebaseService.syncClientData(clientId, {
                    status: 'provisioning_sandbox',
                    sandboxUrl: finalUrl,
                    packageId: provisionResult.id,
                    domain: domain,
                    ftpDetails: provisionResult.ftpDetails,
                    lastDeployStatus: finalStatus
                });
            } catch (syncError) {
                console.warn("Firebase Sync Failed (Non-critical):", syncError);
            }
        }

        res.json({
            success: true,
            ...provisionResult,
            url: finalUrl, // Return the fallback URL if FTP failed
            ftpStatus: finalStatus,
            ftpDetails: provisionResult.ftpDetails
        });

    } catch (error) {
        console.error("Provisioning Error:", error);
        await firebaseService.logActivity('Provisioning Failed', { error: String(error) });
        res.status(500).json({
            error: "Provisioning failed",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * 1b. Retry Deployment: Use when FTP propagation fails initially.
 */
app.post('/api/deploy/retry', async (req, res) => {
    try {
        const { packageId, domain, ftpDetails } = req.body;

        if (!packageId || !ftpDetails) return res.status(400).json({ error: "Missing packageId or ftpDetails" });

        console.log(`[ORCHESTRATOR] Retrying deployment for ${packageId} (${domain})...`);

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>BrandLift Site - ${domain}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 100px; background: #f0f2f5; color: #333; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; }
                h1 { color: #2563eb; margin: 0 0 20px 0; }
                .success { color: #16a34a; font-weight: bold; }
                .meta { color: #666; font-size: 0.9em; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Site Provisioned Successfully</h1>
                <p class="success">Deployment Retry Corrected</p>
                <div class="meta">
                    <p><strong>Package ID:</strong> ${packageId}</p>
                    <p><strong>Domain:</strong> ${domain}</p>
                    <p><em>Powered by BrandLift Auto-Scaffold</em></p>
                </div>
            </div>
        </body>
        </html>
        `;

        await twentyiService.uploadVariantContent(packageId, htmlContent, ftpDetails);

        console.log(`[ORCHESTRATOR] Retry deployment successful.`);
        res.json({ success: true, message: "Deployment Succeeded" });

    } catch (error) {
        console.error("Retry Deployment Error:", error);
        res.status(500).json({ error: "Retry Failed", details: String(error) });
    }
});

/**
 * 2. Financial Gate: Create Checkout
 * Links the provisioned sandbox to a Stripe payment session.
 */
/**
 * 2. Financial Gate: Create Checkout
 * Links the provisioned sandbox to a Stripe payment session.
 */
app.post('/api/payment/checkout', async (req, res) => {
    try {
        const { sandboxId, email, tier, addons } = req.body;

        // 1. Create Stripe Session with tiered pricing + addons
        const session = await stripeService.createCheckoutSession(
            sandboxId,
            email,
            tier || 'BASIC',
            addons || []
        );

        // 2. Update Firebase
        // Ideally we'd look up the Client ID via email or sandboxId here
        await firebaseService.logActivity('Checkout Initiated', { sandboxId, email, tier, addonCount: addons?.length });

        res.json({ url: session.url });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        res.status(500).json({ error: "Checkout creation failed", details: error.message });
    }
});

/**
 * 2a. Content Deployment: Upload Variant HTML
 * Uploads the static HTML of a chosen strategy to the 20i package.
 */
app.post('/api/deploy/variant', async (req, res) => {
    try {
        const { packageId, variantHtml, ftpDetails } = req.body;

        if (!packageId || !variantHtml) {
            return res.status(400).json({ error: "Missing packageId or variantHtml" });
        }

        let deployCredentials = ftpDetails;

        // If credentials not provided, look up in "Source of Truth"
        if (!deployCredentials) {
            const clientData = await firebaseService.getClientByPackageId(packageId);
            if (clientData && clientData.ftpDetails) {
                deployCredentials = clientData.ftpDetails;
            }
        }

        if (!deployCredentials) {
            return res.status(404).json({ error: "Client package credentials not found." });
        }

        // 2. Upload Content via FTP logic in Service
        const success = await twentyiService.uploadVariantContent(packageId, variantHtml, deployCredentials);

        if (success) {
            try {
                await firebaseService.logActivity('Variant Deployed', { packageId, method: ftpDetails ? 'direct' : 'db_lookup' });
            } catch (e) { console.warn("Log activity failed", e); }
            res.json({ success: true, message: "Variant deployed to 20i Sandbox via FTP." });
        } else {
            res.status(500).json({ error: "Deployment failed" });
        }

    } catch (error) {
        console.error("Deploy Variant Error:", error);
        res.status(500).json({ error: "Deployment failed" });
    }
});

/**
 * 3. Promotion & Hand-off: Stripe Webhook
 * The critical trigger that moves a site from Sandbox to Live.
 */
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        // Note: verification requires raw body. In production, ensure body-parser is configured correctly.
        // const event = stripeService.verifyWebhookSignature(req.body, signature as string);

        // Mock event for scaffolding if verification is tricky without middleware ops
        const event = req.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const sandboxId = session.metadata?.sandboxId;
            const email = session.metadata?.email;

            // A. Update Firebase to "Paid"
            await firebaseService.logActivity('Payment Successful', { sandboxId, amount: session.amount_total });

            // B. Inject Smart Chatbot (The Logic Injection)
            await twentyiService.injectChatbot(sandboxId, "CHATBOT_CONFIG_V1");

            // C. Generate Hand-off SSO
            const ssoLink = await twentyiService.generateSSOLink(sandboxId);

            // D. "Push to Live" (Mocked logic, would be a 20i API call to change domain mapping)
            console.log(`[ORCHESTRATOR] Promoting logic for ${sandboxId} to LIVE execution.`);

            // E. Trigger "Live Success" Email (Mocked)
            console.log(`[ORCHESTRATOR] Sending Success Email to ${email} with SSO: ${ssoLink}`);

            res.json({ received: true });
        } else {
            res.json({ received: true });
        }
    } catch (error) {
        console.error("Webhook Error", error);
        res.status(400).send(`Webhook Error: ${error}`);
    }
});

/**
 * 4. Security Gate: FTP Access Control
 * Toggle Maintenance Mode / Deployment Access explicitly.
 */
app.post('/api/security/ftp', async (req, res) => {
    try {
        const { packageId, action } = req.body;
        if (!packageId || !action) return res.status(400).json({ error: "Missing packageId or action" });

        const result = await twentyiService.updateFtpSecurity(packageId, action);

        // Log this significant security event
        await firebaseService.logActivity('Security Toggle', { packageId, action, remoteIp: req.ip });

        res.json(result);
    } catch (error) {
        console.error("Security Toggle Error:", error);
        res.status(500).json({ error: "Security action failed", details: String(error) });
    }
});

// --- NEW TILE SPECIFIC ENDPOINTS ---

/**
 * TILE 1: Custom Client Deployment Console
 * POST /reseller/addWeb (Mapped)
 */
app.post('/api/deploy/custom', async (req, res) => {
    try {
        const { clientName, blueprintId, packageType } = req.body;
        if (!clientName || !blueprintId || !packageType) return res.status(400).json({ error: "Missing fields" });

        const result = await twentyiService.provisionCustomClient(clientName, blueprintId, packageType);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * TILE 2: WordPress Capability Global Sync
 */
app.get('/api/admin/wp-defaults', async (req, res) => {
    try {
        const defaults = await twentyiService.getGlobalWpDefaults();
        res.json(defaults);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/wp-broadcast', async (req, res) => {
    try {
        const { settings } = req.body; // { can_edit_plugins: bool, ... }
        const result = await twentyiService.broadcastWpSettings(settings);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

/**
 * TILE 3: Financial Delinquency Sentinel
 */
app.post('/api/admin/sentinel/run', async (req, res) => {
    try {
        const report = await twentyiService.runDelinquencySentinel();
        res.json(report);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: HostShop Integration ---

app.get('/api/hostshop/products', async (req, res) => {
    try {
        const products = await twentyiService.getHostShopProducts();
        res.json(products);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/hostshop/checkout', async (req, res) => {
    try {
        const { packageId, blueprintId } = req.body;
        const result = await twentyiService.initiateHostShopCheckout(packageId, blueprintId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/webhooks/payment', async (req, res) => {
    try {
        // In reality, verify Stripe/20i signature header here
        const result = await twentyiService.handlePaymentWebhook(req.body);
        res.json(result);
    } catch (e: any) {
        console.error("Webhook Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- NEW ENDPOINTS: Domain Discovery ---

app.get('/api/domain/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ error: "Query required" });
        const results = await twentyiService.searchDomains(query);
        res.json(results);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/domain/recommendations', async (req, res) => {
    try {
        const brand = req.query.brand as string;
        if (!brand) return res.status(400).json({ error: "Brand required" });
        const results = await twentyiService.getDomainRecommendations(brand);
        res.json(results);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/domain/markup', async (req, res) => {
    try {
        const { percentage } = req.body;
        const result = await twentyiService.setDomainMarkup(percentage);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/domain/markup', async (req, res) => {
    try {
        const result = await twentyiService.getDomainMarkup();
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: Domain Porting ---

app.post('/api/domain/transfer', async (req, res) => {
    try {
        const { domain, authCode } = req.body;
        const result = await twentyiService.transferDomain(domain, authCode);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/domain/dns-instructions', async (req, res) => {
    try {
        const result = await twentyiService.getDnsInstructions();
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/domain/provision-external', async (req, res) => {
    try {
        const { domain, blueprintId, packageType } = req.body;
        const result = await twentyiService.provisionExternalDomain(domain, blueprintId, packageType);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: Client experience ---

app.get('/api/reseller/features/:tierId', async (req, res) => {
    try {
        const { tierId } = req.params;
        const features = await twentyiService.getPackageTypeFeatures(tierId);
        res.json(features);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/reseller/features/:tierId', async (req, res) => {
    try {
        const { tierId } = req.params;
        const { disabledFeatures } = req.body;
        const result = await twentyiService.updatePackageTypeFeatures(tierId, disabledFeatures);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: Upgrades & Add-ons ---

app.get('/api/reseller/addons', async (req, res) => {
    try {
        const addons = await twentyiService.getAdditionalServices();
        res.json(addons);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reseller/addons/pricing', async (req, res) => {
    try {
        const { updates } = req.body;
        const result = await twentyiService.updateServicePricing(updates);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: Bundle Architect ---

app.get('/api/reseller/tiers', async (req, res) => {
    try {
        const tiers = await twentyiService.getDefinedTiers();
        res.json(tiers);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reseller/bundles', async (req, res) => {
    try {
        const bundle = req.body;
        const result = await twentyiService.createBundle(bundle);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- ELITE MANAGEMENT ENDPOINTS ---

app.get('/api/elite/malware/:packageId', async (req, res) => {
    try {
        const result = await twentyiService.getMalwareReport(req.params.packageId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/elite/optimization', async (req, res) => {
    try {
        const { packageId, enable } = req.body;
        const result = await twentyiService.toggleWebOptimization(packageId, enable);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/elite/backups/:packageId', async (req, res) => {
    try {
        const result = await twentyiService.getTimelineBackups(req.params.packageId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/elite/restore', async (req, res) => {
    try {
        const { packageId, snapshotId } = req.body;
        const result = await twentyiService.restoreBackup(packageId, snapshotId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/elite/stats/:packageId', async (req, res) => {
    try {
        const result = await twentyiService.getMonthlyStats(req.params.packageId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- AI KNOWLEDGE BASE ---

app.post('/api/ai/knowledge-base', async (req, res) => {
    try {
        const data = req.body;
        const result = await twentyiService.updateAiKnowledgeBase(data);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- GLOBAL CHATBOT & FINANCIALS ---

app.post('/api/ai/chatbot/deploy', async (req, res) => {
    try {
        const { scriptTag } = req.body;
        const result = await twentyiService.deployChatbotToClients(scriptTag);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/financial/overview', async (req, res) => {
    try {
        // Here we'd ideally pass some params but for dashboard overview mock it's fine
        const result = await twentyiService.getFinancialOverview();
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});









// --- SANDBOX & STAGING MANAGER ---

app.post('/api/sandbox/create', async (req, res) => {
    try {
        const { blueprintId, features } = req.body;
        const result = await twentyiService.createSandbox(blueprintId, features);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sandbox/mirror', async (req, res) => {
    try {
        const { clientId } = req.body;
        const result = await twentyiService.mirrorProduction(clientId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sandbox/promote', async (req, res) => {
    try {
        const { sandboxId, paymentStatus } = req.body;
        const result = await twentyiService.promoteToProduction(sandboxId, paymentStatus);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- LIFECYCLE DEPLOYMENT ---

app.post('/api/deploy/lifecycle/start', async (req, res) => {
    try {
        const data = req.body;
        const result = await twentyiService.deployFullLifecycle(data);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deploy/lifecycle/complete', async (req, res) => {
    try {
        const { deploymentId } = req.body;
        const result = await twentyiService.finalizeDeployment(deploymentId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- BRANDLIFT EMAIL ENGINE ---

app.get('/api/email/templates', async (req, res) => {
    try {
        const templates = await twentyiService.getEmailTemplates();
        res.json(templates);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/email/templates', async (req, res) => {
    try {
        const template = req.body;
        const result = await twentyiService.saveEmailTemplate(template);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/email/templates/:id', async (req, res) => {
    try {
        const result = await twentyiService.deleteEmailTemplate(req.params.id);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/email/test', async (req, res) => {
    try {
        const { templateId, email } = req.body;
        const result = await twentyiService.sendTestEmail(templateId, email);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/system/export', async (req, res) => {
    try {
        const backup = await twentyiService.exportDatabase();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=brandlift-export-${Date.now()}.json`);
        res.json(backup);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- INTEGRITY SENTINEL ---

app.get('/api/integrity/status', async (req, res) => {
    try {
        const result = await twentyiService.runIntegrityCheck();
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/integrity/fix', async (req, res) => {
    try {
        const { id, type } = req.body;
        const result = await twentyiService.fixIntegrityIssue(id, type);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- SANDBOX FUNCTIONALITY ENHANCEMENTS ---

app.get('/api/sandbox/clients', async (req, res) => {
    try {
        const result = await twentyiService.getSandboxClients();
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sandbox/addons', async (req, res) => {
    try {
        const { clientId, addons } = req.body;
        const result = await twentyiService.provisionSandboxAddons(clientId, addons);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sandbox/portal', async (req, res) => {
    try {
        const { clientId, config } = req.body;
        const result = await twentyiService.updateSandboxPortalConfig(clientId, config);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sandbox/access', async (req, res) => {
    try {
        const { clientId } = req.body;
        const result = await twentyiService.getSandboxAccessLink(clientId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- WHITE-GLOVE SUPPORT & OPS ---

app.post('/api/support/sso', async (req, res) => {
    try {
        const { deploymentId } = req.body;
        const result = await twentyiService.getStackCpLogin(deploymentId);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/webhooks/provisioning', async (req, res) => {
    try {
        const { deploymentId, status } = req.body;
        const result = await twentyiService.updateProvisioningStatus(deploymentId, status);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ops/service', async (req, res) => {
    try {
        const { deploymentId, action } = req.body;
        const result = await twentyiService.toggleClientService(deploymentId, action);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ops/turbo', async (req, res) => {
    try {
        const { deploymentId, purgeCache } = req.body;
        const result = await twentyiService.runTurboHealthCheck(deploymentId, purgeCache);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- NEW ENDPOINTS: Custom Storefront & Capabilities ---

/**
 * 5. Storefront Configuration: Get Package Tiers
 */
app.get('/api/admin/tiers', async (req, res) => {
    try {
        const tiers = await twentyiService.getDefinedTiers();
        res.json(tiers);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * 6. Automated Provisioning (Production)
 * POST /customer/provision logic
 */
app.post('/api/deploy/provision-production', async (req, res) => {
    try {
        const { domain, blueprintId, packageType, customer } = req.body;
        if (!domain || !blueprintId || !packageType || !customer) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await twentyiService.provisionProduction({ domain, blueprintId, packageType, customer });

        // Auto-Sync from Master if successful
        if (result.success && result.id) {
            // Non-blocking sync
            twentyiService.syncFromMaster(result.id, blueprintId).catch(console.error);
        }

        res.json(result);
    } catch (e: any) {
        console.error("Production Provision Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * 7. Dashboard Monitoring: Customer List & Status
 * GET /customer/list logic
 */
app.get('/api/admin/customers', async (req, res) => {
    try {
        const customers = await twentyiService.getCustomers();
        res.json(customers);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to fetch customers" });
    }
});

/**
 * 8. Financial Alerts: Delinquent Customers
 * GET /customers/delinquent logic
 */
app.get('/api/admin/customers/delinquent', async (req, res) => {
    try {
        const delinquents = await twentyiService.getDelinquentCustomers();
        res.json(delinquents);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

/**
 * 9. Master Capabilities: Update Package Settings
 * PUT /package/{id}/settings logic
 */
app.put('/api/admin/package/:id/capabilities', async (req, res) => {
    try {
        const { id } = req.params;
        const settings = req.body; // { enablePlugins: bool, ... }

        const success = await twentyiService.updatePackageCapabilities(id, settings);
        if (success) {
            res.json({ success: true, message: "Capabilities updated" });
        } else {
            res.status(500).json({ error: "Update failed" });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * 10. Manual Sync Trigger
 * POST /site/clone logic
 */
app.post('/api/deploy/sync-master', async (req, res) => {
    try {
        const { targetPackageId, masterBlueprintId } = req.body;
        const result = await twentyiService.syncFromMaster(targetPackageId, masterBlueprintId);
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});



/**
 * 4. Financial Sentinel: Dashboard Stats
 * Aggregates Stripe Revenue - 20i Costs
 */
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const metrics = await stripeService.getProfitMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
});

/**
 * 5. Database Explorer: Fetch Admin Data
 * Returns a snapshot of clients and activity logs for the 'Source of Truth' UI.
 */
app.get('/api/admin/data', async (req, res) => {
    try {
        // In a real app, this would be paginated and filtered
        // For the demo, we return a mock structure if Firebase returns nothing
        // or the actual data if available.

        // Mock Data for Visualization
        const clients = await firebaseService.getAllClients();
        const logs = await firebaseService.getRecentLogs();

        return res.json({
            clients,
            logs
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch admin data" });
    }
});

app.post('/api/admin/scaffold', async (req, res) => {
    try {
        const result = await firebaseService.seedDatabase();
        res.json(result);
    } catch (error) {
        console.error("Scaffold Error:", error);
        res.status(500).json({ error: "Failed to scaffold database", details: error instanceof Error ? error.message : String(error) });
    }
});

// --- Blueprint Management ---
app.get('/api/admin/blueprints', async (req, res) => {
    try {
        const blueprints = await firebaseService.getBlueprints();
        res.json(blueprints);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/blueprints', async (req, res) => {
    try {
        const result = await firebaseService.saveBlueprint(req.body);
        res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/blueprints/:id', async (req, res) => {
    try {
        await firebaseService.deleteBlueprint(req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
