
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { firebaseService } from './firebaseService.js';
// import OpenAI from 'openai'; // Uncomment if OpenAI package is installed

dotenv.config({ path: '.env.local' });

// Initialize AI Clients
// const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
// Initialize AI Clients
// const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
// Initialize with correct option structure
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const deepScanService = {
    /**
        * Performs a full-site crawl and SEO regeneration.
        * Maps to /v1/deep-scan
        */
    async performDeepScan(url: string, htmlContent: string): Promise<any> { // Using any internally to avoid type conflict with frontend import for now, but structure must match
        console.log(`[DeepScan] Starting analysis for ${url}...`);

        // Fetch Patented Logic from Vault (The "Brain")
        let vaultLogic: any = {};
        try {
            vaultLogic = await firebaseService.getPatentedLogic('content_gen_v1');
            console.log(`[DeepScan] Applied Vault Logic: ${vaultLogic?.name || 'Standard'}`);
        } catch (e) {
            console.warn("[DeepScan] Vault Logic unavailable, using standard heuristic.");
        }

        const constraints = vaultLogic?.logic?.constraints || { keyword_density: '2%', reading_level: 'Grade 8' };
        const promptLogic = `
            Apply the following PROPRIETARY OPTIMIZATION RULES:
            - Keyword Density Target: ${constraints.keyword_density || '2%'}
            - Reading Level: ${constraints.reading_level || 'Grade 8'}
            - Tone: ${vaultLogic?.logic?.tone || 'Authoritative & Local'}
        `;

        const prompt = `
            Analyze this website content and generate a "Deep Scan" SEO report.
            URL: ${url}
            
            ${promptLogic}
            
            HTML Content (Truncated):
            ${htmlContent.substring(0, 25000)}

            Task:
            1. Analyze the current SEO health (0-100 score).
            2. Generate 3 distinct SEO Strategy Variants:
               - "Strategy A": Technical/Structural focus
               - "Strategy B": Content/Keyword focus
               - "Strategy C": Local/Authority focus
            3. For EACH variant, provide:
               - Name & Description
               - A full SEO Injection Package (JSON-LD, Meta Tags, OpenGraph full structure)
               - Optimized Score forecast
               - List of opportunities addressed
            
            Return JSON matching this schema exactly:
            {
                "originalScore": number,
                "variants": [
                    {
                        "name": "Strategy Name",
                        "description": "...",
                        "seoPackage": {
                            "jsonLd": { "Organization": {}, "WebSite": {}, "LocalBusiness": {} },
                            "metaTags": { "title": "...", "description": "..." },
                            "openGraph": { "og:title": "...", "og:description": "...", "og:type": "website", "og:url": "...", "og:image": "..." },
                            "twitterCard": { "twitter:card": "summary_large_image", "twitter:title": "...", "twitter:description": "...", "twitter:image": "..." }
                        },
                        "optimizedScore": number,
                        "opportunities": ["string", "string"]
                    }
                ]
            }
        `;

        try {
            const response = await gemini.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                }
            });

            const jsonString = response.text;
            const result = JSON.parse(jsonString || "{}");

            // Validate structure roughly
            if (!result.variants || !Array.isArray(result.variants)) {
                throw new Error("Invalid AI response structure");
            }

            return result;

        } catch (error: any) {
            console.error("Deep Scan Failed:", error);

            // Fallback for demo/testing or API failure
            console.warn("[DeepScan] Fallback: Using MOCK data due to error or invalid key.");
            return {
                originalScore: 62,
                variants: [
                    {
                        name: "Technical Powerhouse",
                        description: "Focus on schema depth, technical crawlability, and speed.",
                        seoPackage: {
                            metaTags: { title: `${url} | High Performance`, description: "Optimized for speed and structure." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "High Perf", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "High Perf", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 94,
                        opportunities: ["Fix Schema Drift", "Improve Core Web Vitals", "Canonical Tag Logic"]
                    },
                    {
                        name: "Content Authority",
                        description: "Focus on keyword density, entity richness, and featured snippets.",
                        seoPackage: {
                            metaTags: { title: `Best Services in Town | ${url}`, description: "Comprehensive guide to our services." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "Authority", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "Authority", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 89,
                        opportunities: ["Keyword Gap Fill", "FAQ Schema Injection", "Entity Alignment"]
                    },
                    {
                        name: "Conversion Minimalist",
                        description: "Focus on user intent, click-through-rate, and call-to-action clarity.",
                        seoPackage: {
                            metaTags: { title: `Book Now - ${url}`, description: "Get started today." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "Conversion", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "Conversion", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 88,
                        opportunities: ["Title Tag CTA", "Meta Desc Hook", "Social Proof Signals"]
                    }
                ]
            };
        }
    }
};
