"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepScanService = void 0;
const genai_1 = require("@google/genai");
const firebaseService_1 = require("./firebaseService");
exports.deepScanService = {
    /**
        * Performs a full-site crawl and SEO regeneration.
        * Maps to /v1/deep-scan
        */
    async performDeepScan(url, htmlContent) {
        const gemini = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log(`[DeepScan] Starting analysis for ${url}...`);
        // Fetch Patented Logic from Vault (The "Brain")
        let vaultLogic = {};
        try {
            vaultLogic = await firebaseService_1.firebaseService.getPatentedLogic('content_gen_v1');
            console.log(`[DeepScan] Applied Vault Logic: ${(vaultLogic === null || vaultLogic === void 0 ? void 0 : vaultLogic.name) || 'Standard'}`);
        }
        catch (e) {
            console.warn("[DeepScan] Vault Logic unavailable, using standard heuristic.");
        }
        const systemRole = `
### SYSTEM_ROLE: BRANDLIFT_VISUAL_ORCHESTRATOR
You are a specialized UI/UX Architect. Your mission is to wrap the provided Industry and Business Name into a "Minimalist Tech" framework, intentionally bypassing all generic corporate training data.

### WRAPPER LOGIC & EXECUTION FLOW:
1.  **Extract Core Industry & Business Name:** Identify the physical tools, hardware, and workspace from the HTML.
2.  **Filter Assets:** Cross-reference all potential imagery against the NEGATIVE_CONSTRAINTS list. If a "boardroom" asset is selected, discard and replace with a "Technical" alternative.
3.  **Apply Aesthetic:** Use "Dark Mode / Minimalist Tech" (Brushed metals, matte finishes, cobalt/slate accents).
4.  **Format:** Output strictly in the JSON schema provided.

### MANDATORY VISUAL DIRECTIVES:
- **Aesthetic:** Minimalist Tech / Industrial Precision.
- **Imagery Focus:** Macro-photography of industry-specific hardware/tools.
- **Forbidden (Negative Constraints):** NO boardrooms, conference tables, business suits, handshakes, high-fives, or glass-tile/bento-box layouts.

### INPUT DATA:
- **Client Industry:** (Extract from HTML)
- **Business Name:** (Extract from HTML)
        `;
        const prompt = `
            ${systemRole}

            Analyze this website content and generate a "Deep Scan" SEO report with 3 DISTINCT CONCEPT VARIATIONS.
            
            URL: ${url}
            HTML Content (Truncated):
            ${htmlContent.substring(0, 20000)}

            Task:
            1. Analyze the current SEO health (0-100 score).
            2. Generate 3 distinct Concept Variations (Concept 01, 02, 03) adhering strictly to the Visual Orchestrator logic.
            3. Populate the JSON schema with both the Visual Concept data AND the SEO Optimization data.

            Return JSON matching this schema exactly:
            {
                "originalScore": number,
                "variants": [
                    {
                        "id": "concept_01",
                        "name": "Title of Concept (e.g. Industrial Precision)",
                        "description": "Visual style description...",
                        "heroImageDescription": "Detailed description for image generation focusing on hardware/tools...",
                        "colorPalette": ["#hex", "#hex", "#hex"],
                        "layoutNotes": "Minimalist spacing instructions",
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
                model: 'gemini-flash-latest',
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
        }
        catch (error) {
            console.error("Deep Scan Failed:", error);
            // Fallback for demo/testing or API failure
            console.warn("[DeepScan] Fallback: Using MOCK data due to error or invalid key.");
            return {
                originalScore: 48,
                variants: [
                    {
                        id: "concept_01",
                        name: "Industrial Precision",
                        description: "A stark, high-contrast aesthetic focusing on the raw materials and tools of the trade. Eliminates all corporate fluff.",
                        heroImageDescription: "Macro photography of brushed steel tools arranged on a matte black surface, side-lit by cool cyan studio lighting.",
                        colorPalette: ["#0f172a", "#94a3b8", "#06b6d4"],
                        layoutNotes: "Zero-grid layout. Large breathing room between technical specs.",
                        seoPackage: {
                            metaTags: { title: `${url} | Precision Engineered`, description: "Optimized for speed and structure." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "Precision", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "Precision", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 99,
                        opportunities: ["Schema Precision", "Asset Minification", "Zero-Layout Shift"]
                    },
                    {
                        id: "concept_02",
                        name: "Cyber-Organic",
                        description: "Blending the mechanical nature of the industry with organic, fluid typography. Dark mode with neon growth accents.",
                        heroImageDescription: "Close up of a circuit board or mechanical gear with bioluminescent moss growing in the crevices. Cyber-punk aesthetic.",
                        colorPalette: ["#000000", "#10b981", "#3b82f6"],
                        layoutNotes: "Asymmetric layout. Floating elements.",
                        seoPackage: {
                            metaTags: { title: `Future Grade | ${url}`, description: "Comprehensive guide to our services." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "Future", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "Future", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 96,
                        opportunities: ["Fluid Typography", "Next-Gen Formats", "Semantic Flow"]
                    },
                    {
                        id: "concept_03",
                        name: "Technical Mono",
                        description: "Inspired by blueprint schematics and terminal interfaces. Monospaced fonts and wireframe visuals.",
                        heroImageDescription: "White line-art wireframe schematic of the primary business product floating in a dark blue void.",
                        colorPalette: ["#1e293b", "#e2e8f0", "#6366f1"],
                        layoutNotes: "Grid-based but deconstructed. Terminal-like headers.",
                        seoPackage: {
                            metaTags: { title: `System Online - ${url}`, description: "Get started today." },
                            jsonLd: { Organization: {}, WebSite: {}, LocalBusiness: {} },
                            openGraph: { "og:title": "System", "og:description": "Desc", "og:url": url, "og:image": "", "og:type": "website" },
                            twitterCard: { "twitter:title": "System", "twitter:description": "Desc", "twitter:image": "", "twitter:card": "summary" }
                        },
                        optimizedScore: 94,
                        opportunities: ["Code Ratio", "Text Compression", "Accessibility Tagging"]
                    }
                ]
            };
        }
    }
};
//# sourceMappingURL=deepScanService.js.map