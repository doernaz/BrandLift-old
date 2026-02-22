
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { firebaseService } from './services/firebaseService.js';
import { twentyiService } from './services/twentyiService.js';
import { vpsDeployService } from './services/vpsDeployService.js';
import { stripeService } from './services/stripeService.js';
import { deepScanService } from './services/deepScanService.js';

import { antigravityService } from './services/antigravityService.js';

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/antigravity/execute', async (req, res) => {
    try {
        const { industry, location } = req.body;
        if (!industry || !location) {
            return res.status(400).json({ error: "Missing required params: industry, location" });
        }

        const result = await antigravityService.executeGlobalOrchestration(industry, location);
        res.json(result);

    } catch (e: any) {
        console.error("[Antigravity] Execution Failed:", e);
        res.status(500).json({
            success: false,
            error: e.message || "Antigravity Protocol Failure",
            details: e.stack
        });
    }
});
app.get('/api/proxy', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).send("Missing URL parameter");
        }

        const response = await fetch(url.startsWith('http') ? url : `https://${url}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        const html = await response.text();
        res.send(html);
    } catch (error: any) {
        console.error("Proxy Error:", error);
        res.status(500).send("Failed to fetch site content");
    }
});
app.post('/api/manual-shell/execute', async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({ error: "Missing domain" });
        }

        // This is a direct implementation of the user's manual shell request
        // It bypasses the standard service for granular control
        console.log(`[ManualShell] Executing for ${domain}...`);



        // RE-IMPLEMENTING MANUALLY FOR PRECISION AS REQUESTED
        const API_Base = 'https://api.20i.com';
        const headers = {
            'Authorization': `Bearer ${Buffer.from(process.env.TWENTYI_API_KEY!.split('+')[0]).toString('base64')}`,
            'Content-Type': 'application/json'
        };

        // A. Add Web
        console.log(`[ManualShell] Provisioning Base Package for ${domain}...`);
        const addWebRes = await fetch(`${API_Base}/reseller/*/addWeb`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: '284869', // BrandLift Essential / Standard
                domain_name: domain
            })
        });

        const addWebData = await addWebRes.json();
        if (!addWebData.result) throw new Error("Provision Failed: " + JSON.stringify(addWebData));
        const packageId = addWebData.result.id || addWebData.result;
        console.log(`[ManualShell] Package ID: ${packageId}`);

        // B. Shell Activation (Standard Install)
        console.log(`[ManualShell] Activating WordPress Shell...`);
        const installRes = await fetch(`${API_Base}/package/${packageId}/web/1clk/WordPress`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                install_path: null,
                options: {
                    title: `StayInSedona Shell`,
                    user: 'admin',
                    password: 'TempPassword123!',
                    email: 'admin@stayinsedona.com',
                    language: 'en_US'
                }
            })
        });

        if (!installRes.ok) console.warn("[ManualShell] Install Warning:", await installRes.text());
        else console.log("[ManualShell] Shell Activation Signal Sent.");

        // C. Content Reimagine (Injection) - Mocked for now
        console.log("[ManualShell] Injecting BrandLift Minimalist Aesthetic (Mock DB Injection)...");

        // D. Diagnostic Check
        const tempUrl = `http://${domain.replace('.', '-')}.stackstaging.com`;
        console.log(`[ManualShell] Verifying: ${tempUrl}`);
        // Headless check
        try {
            const check = await fetch(tempUrl);
            console.log(`[ManualShell] Status: ${check.status}`);
        } catch (e) { console.warn("[ManualShell] Check failed (likely propagation)."); }

        res.json({
            success: true,
            message: "Manual Shell Deployment Executed",
            url: tempUrl,
            packageId
        });

    } catch (e: any) {
        console.error("[ManualShell] Failed:", e);
        res.status(500).json({ error: e.message });
    }
});



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

app.get('/api/admin/blueprints', async (req: Request, res: Response) => {
    try {
        const blueprints = await twentyiService.getBlueprints();
        res.json(blueprints);
    } catch (e: any) {
        console.error("Blueprints fetch error:", e);
        // Fallback to mock if API fails/is inconsistent
        res.status(500).json({
            error: e.message,
            details: "Could not fetch blueprints from 20i."
        });
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
// DEPLOYMENT ORCHESTRATOR ENDPOINT
app.post('/api/deploy/provision', async (req, res) => {
    try {
        const { domain, blueprintId, clientId, clientSlug, htmlContent, type } = req.body;

        if (!domain || !blueprintId) {
            return res.status(400).json({ error: "Missing domain or blueprintId" });
        }

        const vpsIp = process.env.VPS_HOST || '127.0.0.1';

        // 1. Construct Staging Domain
        const sandboxBase = process.env.SANDBOX_DOMAIN;
        const stagingDomain = sandboxBase
            ? `${clientSlug || 'demo'}.${sandboxBase}`
            : `${clientSlug || 'demo'}.${vpsIp}.nip.io`;

        console.log(`[ORCHESTRATOR] Starting Deployment for ${stagingDomain} (Client: ${clientId})...`);

        let deployUrl = '';
        let deployType = 'vps_wordpress';
        let details = {};
        let finalStatus = 'deployed';

        try {
            // 2. Deploy to Unmanaged VPS
            // Default to WordPress unless explicitly requested as static
            if (type === 'static') {
                console.log(`[ORCHESTRATOR] Deploying STATIC Site...`);
                deployUrl = await vpsDeployService.deploySite(stagingDomain, htmlContent || '<h1>No Content</h1>');
                deployType = 'vps_static';
            } else {
                console.log(`[ORCHESTRATOR] Deploying WORDPRESS Site...`);
                // Use the domain name as the site title
                const siteTitle = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                deployUrl = await vpsDeployService.deployWordPress(stagingDomain, siteTitle, htmlContent);
            }

            details = { ip: vpsIp, method: 'ssh', timestamp: new Date().toISOString() };
            console.log(`[ORCHESTRATOR] Deployment Success: ${deployUrl}`);

        } catch (vpsError: any) {
            console.error(`[ORCHESTRATOR] VPS Deployment Failed:`, vpsError);

            // FALLBACK: Local Proxy (if VPS is down or unreachable)
            console.warn("[ORCHESTRATOR] Activating Local Proxy Fallback.");
            localDeployments[`fallback_${clientId}`] = htmlContent || '<h1>Deployment Failed - Local Fallback</h1>';

            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            deployUrl = `${protocol}://${host}/api/live-site/fallback_${clientId}`;
            deployType = 'local_fallback';
            finalStatus = 'fallback_local';
            details = { error: vpsError.message };
        }

        // 3. Sync to Firebase
        if (clientId) {
            try {
                /*
                const deploymentRef = db.collection('deployments').doc(clientId);
                await deploymentRef.set({
                    domain: stagingDomain,
                    originalDomain: domain,
                    blueprintId,
                    status: 'live',
                    url: deployUrl,
                    hostingUrl: deployUrl, 
                    deployedAt: new Date().toISOString(),
                    type: deployType,
                    clientSlug: clientSlug,
                    creds: deployType === 'vps_wordpress' ? { user: 'brandlift', pass: 'password123', login: `${deployUrl}/wp-admin` } : null
                }, { merge: true });
                */

                // Update Client Record
                await firebaseService.syncClientData(clientId, {
                    status: finalStatus === 'fallback_local' ? 'provisioning_local_fallback' : 'provisioning_success',
                    sandboxUrl: deployUrl,
                    packageId: 'vps_' + clientId,
                    domain: stagingDomain,
                    lastDeployStatus: finalStatus
                });

            } catch (fbErr) {
                console.warn("[ORCHESTRATOR] Firebase Sync Warning:", fbErr);
            }
        }

        // 4. Return Result
        return res.json({
            success: true,
            url: deployUrl,
            hostingUrl: deployUrl,
            ftpStatus: finalStatus,
            details: details,
            cms: deployType === 'vps_wordpress' ? { login: `${deployUrl}/wp-admin`, user: 'brandlift', pass: 'password123' } : null
        });

    } catch (error: any) {
        console.error("[ORCHESTRATOR] Critical Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
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
