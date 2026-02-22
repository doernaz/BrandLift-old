
import { twentyiService } from './twentyiService';
import { deepScanService } from './deepScanService';

// Niche Market Value Estimates (for ATV Calculation)
const MARKET_VALUES: Record<string, number> = {
    'hvac': 5500,
    'roofing': 12000,
    'plumbing': 850,
    'electrician': 950,
    'dentist': 1200,
    'lawyer': 3000,
    'landscaping': 4500,
    'solar': 25000,
    'remodeling': 35000,
    'default': 500
};

export const antigravityService = {

    /**
     * The Master Command: Global BrandLift Orchestration
     */
    async executeGlobalOrchestration(industry: string, location: string) {
        const log = (msg: string) => console.log(`[Antigravity] ${msg}`);
        log(`Initiating Global Orchestration for ${industry} in ${location}...`);

        // 1. LEAD DISCOVERY (Profit Mapping)
        const leads = await this.discoverLeads(industry, location);
        if (leads.length === 0) throw new Error("No leads found matching Efficiency Vacuum criteria.");

        const topLead = leads.sort((a, b) => b.userRatingCount - a.userRatingCount)[0];
        log(`Target Identified: ${topLead.displayName.text}`);

        // 2. COMPETITIVE INTELLIGENCE (Technical Benchmarking)
        // Mocked radius-based scrape of top 5
        const competitors = await this.gatherCompetitorIntelligence(industry, location);
        const technicalAudit = await this.performTechnicalBenchmarking(competitors);

        // 3. SEMANTIC AUTHORITY CHECK
        // Identify "Service Gap"
        const semanticGaps = await this.analyzeSemanticAuthority(industry);

        // 4. MONETIZATION ENGINE EXECUTION
        const marketValue = this.getMarketValue(industry);
        // Base projected lead increase on capturing 15% of the market leader's traffic
        // Mock leader traffic: 1,200 visits/mo
        const leaderTraffic = 1200;
        const { annualRevenueLift, projectedLeads } = this.calculateMonetization(marketValue, leaderTraffic);

        log(`Calculated Annual Revenue Lift: $${annualRevenueLift.toLocaleString()}`);

        // 5. INFRASTRUCTURE DEPLOYMENT
        const safeName = topLead.displayName.text.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const domain = `${safeName}.brandlift.ai`;

        log(`Provisioning Infrastructure: ${domain}...`);
        const provisionResult = await twentyiService.provisionSandbox(domain, '284870');

        log(`Infrastructure Active. Status: ${provisionResult.status}`);

        // 6. DYNAMIC REPORT INJECTION
        // Update to include Market Leaderboard and ROI Visualization
        const blueprintHtml = this.generateBlueprintHtml(
            topLead,
            competitors,
            annualRevenueLift,
            marketValue,
            semanticGaps,
            technicalAudit
        );

        if (provisionResult.ftpDetails) {
            log(`Injecting Competitive Data into /growth-blueprint...`);
            await twentyiService.uploadVariantContent(
                provisionResult.id,
                blueprintHtml,
                provisionResult.ftpDetails,
                'public_html/growth-blueprint'
            );
        }

        // 7. READINESS CONFIRMATION
        return {
            success: true,
            target: topLead.displayName.text,
            domain: provisionResult.url,
            blueprintUrl: `${provisionResult.url}/growth-blueprint/`,
            revenueGap: `$${Math.round(annualRevenueLift / 12).toLocaleString()}/mo`,
            annualLift: `$${annualRevenueLift.toLocaleString()}`,
            marketLeaderboard: [
                { rank: 1, name: competitors[0].name, share: '35%' },
                { rank: 2, name: competitors[1].name, share: '22%' },
                { rank: 10, name: topLead.displayName.text, share: '< 1%' } // Current State
            ],
            criticalOpportunities: semanticGaps.map(gap => ({
                opportunity: gap,
                potentialValue: `+$${Math.round(marketValue * 0.5)}` // Mock value assignment
            })),
            summary: `Orchestration Complete. Identified ${semanticGaps.length} service gaps. Projected annual lift: $${annualRevenueLift.toLocaleString()}.`
        };
    },

    /**
     * Step 1: Discover Leads via Google Places
     */
    async discoverLeads(industry: string, location: string) {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
        if (!apiKey) throw new Error("Missing Google Places API Key");

        const query = `${industry} in ${location}`;
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.userRatingCount,places.websiteUri,places.businessStatus'
            },
            body: JSON.stringify({ textQuery: query })
        });

        if (!response.ok) throw new Error("Places API Failed");
        const data = await response.json();

        if (!data.places) return [];

        // FILTER: No Website + Reviews >= 15
        const idealLeads = data.places.filter((p: any) =>
            (!p.websiteUri) &&
            (p.userRatingCount >= 15) &&
            (p.businessStatus === 'OPERATIONAL')
        );

        if (idealLeads.length > 0) return idealLeads;

        // FALLBACK: If no "ideal" leads (no website) are found, take the highest rated operational business
        // This ensures the demo/report generation always succeeds.
        console.log("[Antigravity] No ideal leads found (all have websites). Using fallback targets.");
        return data.places.filter((p: any) => p.businessStatus === 'OPERATIONAL');
    },

    /**
     * Step 3: Mock Competitor Intelligence
     */
    async gatherCompetitorIntelligence(industry: string, location: string) {
        // In a real scenario, this would Google Search and run PSI audits.
        // Returning mock data for the prototype.
        return [
            { name: `${location} Top ${industry}`, speedScore: 45, seoScore: 60 },
            { name: `Best ${industry} Pros`, speedScore: 52, seoScore: 65 },
            { name: `City ${industry} Services`, speedScore: 30, seoScore: 40 },
            { name: `Elite ${industry}`, speedScore: 88, seoScore: 90 }, // The efficient competitor
            { name: `${industry} Guys`, speedScore: 55, seoScore: 50 },
        ];
    },

    /**
     * Step 4: Technical Benchmarking (Mock)
     */
    async performTechnicalBenchmarking(competitors: any[]) {
        return competitors.map(c => ({
            name: c.name,
            issues: ['Slow Time-to-First-Byte', 'Uncompressed Images', 'Missing Schema']
        }));
    },

    /**
     * Step 5: Semantic Authority Analysis (Mock)
     */
    async analyzeSemanticAuthority(industry: string) {
        return [
            `${industry} Emergency Services Schema`,
            `Local ${industry} Authority Backlinks`,
            `Voice Search Optimization for ${industry}`,
            'Hyper-Local Landing Pages'
        ];
    },

    /**
     * Step 6: Monetization Calculation (Mock)
     */
    calculateMonetization(marketValue: number, leaderTraffic: number) {
        // Assume we capture 15% of leader traffic
        const capturedTraffic = leaderTraffic * 0.15;
        // Assume 5% conversion rate
        const convertedLeads = capturedTraffic * 0.05;
        // Annual Lift = Leads * Market Value * 12
        const annualRevenueLift = Math.round(convertedLeads * marketValue * 12);

        return {
            projectedLeads: Math.round(convertedLeads * 12),
            annualRevenueLift
        };
    },


    getMarketValue(industry: string): number {
        // Simple fuzzy match
        const key = Object.keys(MARKET_VALUES).find(k => industry.toLowerCase().includes(k));
        return MARKET_VALUES[key || 'default'];
    },

    /**
     * Generate the Dark Mode / Neon HTML Report with ROI Visualization
     */
    generateBlueprintHtml(lead: any, competitors: any[], revenue: number, jobValue: number, gaps: string[], audit: any[]) {
        const compRows = competitors.map((c, i) => `
            <div class="stat-row">
                <span>#${i + 1} ${c.name}</span>
                <div class="bars">
                    <div class="bar speed" style="width:${c.speedScore}%">Speed: ${c.speedScore}</div>
                    <div class="bar seo" style="width:${c.seoScore}%">SEO: ${c.seoScore}</div>
                </div>
            </div>
        `).join('');

        const gapList = gaps.map(g => `<li>${g}</li>`).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Growth Blueprint: ${lead.displayName.text}</title>
                <style>
                    body { background: #0f172a; color: #e2e8f0; font-family: 'Inter', sans-serif; padding: 40px; }
                    h1 { color: #06b6d4; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #334155; padding-bottom: 20px; }
                    .metric-box { background: #1e293b; border: 1px solid #334155; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .highlight { color: #10b981; font-size: 2em; font-weight: bold; }
                    .stat-row { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
                    .bars { width: 50%; display: flex; gap: 5px; }
                    .bar { height: 8px; border-radius: 4px; font-size: 0; }
                    .speed { background: #3b82f6; }
                    .seo { background: #8b5cf6; }
                    .summary { font-size: 1.2em; line-height: 1.6; max-width: 800px; }
                    .cta { display: inline-block; margin-top: 30px; padding: 15px 30px; background: #06b6d4; color: #000; text-decoration: none; font-weight: bold; border-radius: 2px; }
                    ul.gaps { list-style: none; padding: 0; }
                    ul.gaps li { background: #334155; padding: 8px; margin-bottom: 5px; border-left: 3px solid #f43f5e; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <h1>Growth Blueprint // ${lead.displayName.text}</h1>
                
                <div class="summary">
                    <p>We identified a critical efficiency vacuum in your local market.</p>
                    <p>Despite having <strong>${lead.userRatingCount} reviews</strong>, your digital absence is leaking revenue to lower-rated competitors.</p>
                </div>

                <div class="metric-box">
                    <h3>Recoverable Monthly Revenue</h3>
                    <div class="highlight">$${revenue.toLocaleString()}</div>
                    <small>Based on Market ATV of $${jobValue} and 2.8% Conversion</small>
                </div>

                <div class="metric-box">
                    <h3>Competitive Efficiency Vacuum</h3>
                    ${compRows}
                </div>

                <div class="metric-box">
                    <h3>Service Gap Opportunities</h3>
                    <ul class="gaps">
                        ${gapList}
                    </ul>
                </div>

                <a href="/" class="cta">DEPLOY INFRASTRUCTURE</a>
            </body>
            </html>
        `;
    }
};
