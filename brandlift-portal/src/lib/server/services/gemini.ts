import "server-only"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { PlaceResult } from "./google-places"
import { SEOAudit, CompetitorAnalysis, UnifiedIdentity } from "@/lib/types/job"

// ... existing setup ...
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
if (!apiKey) throw new Error("Missing GEMINI_API_KEY")
const genAI = new GoogleGenerativeAI(apiKey)

// Helper: JSON Extractor
function extractJson(text: string): string {
    // Try to find code blocks first
    const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/)
    if (match) return match[1]

    // If no code blocks, look for the first { and last }
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
        return text.substring(firstBrace, lastBrace + 1)
    }

    return text
}

export async function performDeepScanAnalysis(
    industry: string,
    location: string,
    target: PlaceResult
): Promise<{ audit: SEOAudit; competition: CompetitorAnalysis }> {
    // UPDATED: Using confirmed available model gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const intentDetails = target.intentTopics?.length
        ? `\n    **Intent Signals (Surging)**: ${target.intentTopics.join(", ")} (Focus the audit on these areas)`
        : ""

    const growthSignal = target.growthMetrics?.jobChange
        ? `\n    **Executive Flux**: New CEO/Owner (<90 days). Use "First 90 Days" transition language.`
        : ""

    const prompt = `
    Conduct a ruthless, data-driven Digital Infrastructure Audit for:
    **Business Name**: ${target.displayName.text}
    **Industry**: ${industry || "B2B Professional Services"}
    **Location**: ${location}
    **Current Status**: ${target.websiteUri ? `Has Website (${target.websiteUri})` : "NO WEBSITE (Critical Efficiency Vacuum)"}
    **Rating**: ${target.rating} stars (${target.userRatingCount} reviews)
    ${intentDetails}
    ${growthSignal}

    Your task is to analyze why this business is underperforming digitally compared to top competitors in ${location}.
    
    CONTEXTUALIZE: Identify 3 specific pain points unique to the ${industry} in ${location} (e.g., If HVAC in Phoenix, focus on emergency dispatch speed during heatwaves; if Legal in NY, focus on high-stakes privacy). These must be specific.

    If "Intent Signals" are present, pivot the "Recommendations" to specifically address those topics.
    If "Executive Flux" is active, frame the summary as a "New Era" roadmap for the incoming leadership.

    Provide the output in strict JSON format:
    {
        "audit": {
            "technicalScore": <number 0-100>,
            "contentScore": <number 0-100>,
            "overallGrade": <"A"|"B"|"C"|"D"|"F">,
            "summary": <string>,
            "painPoints": <string[], list of 3 specific frustrations identified>,
            "technicalIssues": <string[]>,
            "contentGaps": <string[]>,
            "keywordsMissing": <string[]>,
            "marketOpportunity": <string>,
            "monetization": {
                "estimatedLostRevenue": <string, e.g. "$15,000 - $20,000 / mo">,
                "potentialUplift": <string, e.g. "300% increase in qualified leads">,
                "recommendedPackage": <string "Starter"|"Growth"|"Enterprise">,
                "packageJustification": <string, why this package fits their needs based on gaps>
            }
        },
        "competition": {
            "localCompetitors": [{"name": <string>, "weakness": <string>}],
            "nationalBenchmarks": [{"brand": <string>, "strength": <string>}],
            "comparison": <string>
        }
    }
    `

    let rawText = ''
    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        rawText = response.text()
        return JSON.parse(extractJson(rawText))
    } catch (e: any) {
        console.error("Gemini Scan Error", e)
        console.error("Raw Response:", rawText)
        throw new Error(`Audit Generation Failed: ${e.message || String(e)} | Raw: ${rawText.substring(0, 200)}...`)
    }
}

const THEME_INSTRUCTIONS: Record<string, string> = {
    "default": "This identity must look extremely premium, modern, and trustworthy.",
    "The Kinetic": `
        STRATEGY: "THE KINETIC" (Dynamic & Bold).
        Design: High contrast, accent colors based on industry (e.g., Construction: Safety Orange; Tech: Neon Blue).
        Typography: Bold sans-serif headers with wide tracking.
        Visuals: Diagonal section breaks, oversized imagery, subtle micro-animations.
        Vibe: High energy, movement, forward-thinking.`,
    "The Essentialist": `
        STRATEGY: "THE ESSENTIALIST" (Zen & Minimalist).
        Design: Monochromatic palette with one "pop" color. Thin vector borders (0.5px).
        Typography: Elegant serif headers with ample leading.
        Visuals: Asymmetrical content blocks, thin line-art icons, soft diffused shadows.
        Vibe: Calm, clarified, premium simplicity.`,
    "The Architect": `
        STRATEGY: "THE ARCHITECT" (Structured & Tech-Forward).
        Design: Dark mode default. Grid-based but asymmetrical.
        Typography: Monospaced fonts for data points/labels (terminal aesthetic).
        Visuals: Wireframe-style background accents, data-viz placeholders, sharp 90-degree corners.
        Vibe: Precision, data-driven, engineered.`,
}

export async function generateBrandIdentity(
    industry: string,
    location: string,
    target: PlaceResult, // Updated to accept full object
    audit: SEOAudit,
    theme: string = "default"
): Promise<UnifiedIdentity> {
    // UPDATED: Using confirmed available model gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const themeInstruction = THEME_INSTRUCTIONS[theme] || THEME_INSTRUCTIONS["default"]

    // Check for technographics to add context
    const techContext = target.technographics?.length
        ? `\n    **Legacy Tech Stack Detected**: ${target.technographics.join(", ")}. Ensure the new design visually obsoletes these specific platforms (e.g., if Wix, avoid template-like structure; if WordPress, avoid clutter).`
        : ""

    // Fallback Industry
    const safeIndustry = industry || "B2B Professional Services"

    const prompt = `
    ### SYSTEM ROLE: SENIOR_UX_ARCHITECT
    ### ENGINE: GEMINI_2.5_PRO
    ### PROTOCOL: [ISOLATED_BATCH_PROCESSING]

    ### INSTRUCTIONS:
    Process the following Search Result Row. You must generate a brand identity system for the web theme: "${theme}". 
    Map the data into the variables below to determine the "Visual DNA" and strategy.

    ### 1. VARIABLE EXTRACTION & ADAPTATION
    - [[ENTITY]]: "${target.displayName.text}"
    - [[VECTOR]]: "${industry}"
    - [[LOCATION]]: "${location}"

    ### 2. SEMANTIC DESIGN ADAPTER (LOGIC GATE)
    Analyze [[VECTOR]] to determine the industry logic. 
    STRICTLY FORBIDDEN: Glass-tile layouts, boardroom imagery, shaking hands, mahogany.
    
    LOGIC:
    - IF [[VECTOR]] contains "Home Service" OR "Trade" OR "Construction" OR "HVAC" -> USE: Industrial Cobalt/Crimson, Sans-Serif, "System Specs" sections.
    - IF [[VECTOR]] contains "Wellness" OR "Health" OR "Yoga" -> USE: Sage/Terracotta, Serif/Sans mix, "Service Menu/Schedule" sections.
    - IF [[VECTOR]] contains "Legal" OR "Professional" OR "Consulting" -> USE: Obsidian/Gold, Heavy Serif, "Case Strategy" sections.
    - IF [[VECTOR]] contains "Tech" OR "SaaS" OR "IT" -> USE: Neon Blue/Slate, Monospaced fonts, "API/Infrastructure" sections.
    - ELSE: Default to "Minimalist Tech" (Anodic Aluminum/Matte Black).

    ### 3. THEME INSTRUCTION ("${theme}"):
    ${themeInstruction}

    ### 4. DATA INPUT (ROW DATA)
    ${JSON.stringify(target)}

    ### OUTPUT FORMAT:
    Output strict JSON compatible with the UnifiedIdentity schema. 
    Ensure "palette", "typography", and "strategy" fields specifically reflect the SEMANTIC DESIGN ADAPTER logic above.
    
    {
        "theme": "${theme}",
        "name": "${target.displayName.text}",
        "brandVoice": <string>,
        "strategy": <string, based on Logic Gate>,
        "targetAudience": <string>,
        "heroHeadline": <string, based on theme and vector>,
        "bodyCopy": <string>,
        "seoScore": <number, 0-100>,
        "palette": {
             "primary": <hex string, based on Logic Gate>,
             "secondary": <hex string>,
             "accent": <hex string>,
             "background": <hex string>,
             "surface": <hex string>
        },
        "typography": {
             "headingFont": <string, based on Logic Gate>,
             "bodyFont": <string>
        },
        "logoConcept": <string>,
        "imageStyle": <string, adhering to AESTHETIC GUARD>
    }
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const json = JSON.parse(extractJson(response.text()))

        // Map to UnifiedIdentity interface
        return {
            ...json,
            tagline: json.heroHeadline, // Map for component compatibility
            missionStatement: json.bodyCopy, // Map for component compatibility
            voice: json.brandVoice
        }
    } catch (e) {
        console.error("Gemini Identity Error", e)
        throw new Error("Identity Generation Failed")
    }
}

// NEW: Comprehensive Scan (Audit + Code in one shot)
export async function performComprehensiveScan(
    industry: string,
    location: string,
    target: PlaceResult
): Promise<{ audit: SEOAudit; competition: CompetitorAnalysis; staticSiteCode: string }> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // ... (Context building similar to deep scan)
    const intentDetails = target.intentTopics?.length
        ? `\n    **Intent Signals (Surging)**: ${target.intentTopics.join(", ")}`
        : ""

    const prompt = `
    ### SYSTEM ROLE: DIGITAL_GROWTH_ENGINE & SENIOR_UX_ARCHITECT
    ### TASK: Perform a Dual-Core Analysis for "${target.displayName.text}" in "${location}".
    
    ### PART 1: DIGITAL INFRASTRUCTURE AUDIT & MONETIZATION
    Analyze the business. Identify 3 specific pain points for ${industry} in ${location}.
    Calculate precise "Lost Revenue" estimates based on missing digital optimization.
    
    ### PART 2: STATIC SITE GENERATION (THE SOLUTION)
    Synthesize the "Gold Mine" value into a single-page HTML/CSS website.
    - Aesthetic: Minimalist Tech (No glass tiles).
    - Industry: ${industry} (Trade=Industrial, Wellness=Refined).
    - Sections: Hero (Gravity-Defying Headline), Value Grid, Process, Footer.
    - Hero Image: Use Unsplash URL: https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80
    - Tech: TailwindCSS via CDN or embedded CSS.

    ### OUTPUT FORMAT: STRICT JSON
    {
        "audit": {
            "technicalScore": <0-100>,
            "contentScore": <0-100>,
            "overallGrade": <"A"-"F">,
            "summary": <string>,
            "painPoints": <string[]>,
            "technicalIssues": <string[]>,
            "contentGaps": <string[]>,
            "keywordsMissing": <string[]>,
            "marketOpportunity": <string>,
            "monetization": {
                "estimatedLostRevenue": <string>,
                "potentialUplift": <string>,
                "recommendedPackage": <string>,
                "packageJustification": <string>
            }
        },
        "competition": {
            "localCompetitors": [{"name": <string>, "weakness": <string>}],
            "nationalBenchmarks": [{"brand": <string>, "strength": <string>}],
            "comparison": <string>
        },
        "staticSiteCode": "<!DOCTYPE html>..." (The full HTML string, properly escaped)
    }
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const parsed = JSON.parse(extractJson(text))

        // Validate structure vaguely
        if (!parsed.audit || !parsed.staticSiteCode) throw new Error("Incomplete JSON structure")

        return parsed
    } catch (e: any) {
        console.error("Comprehensive Scan Failed", e)
        // Fallback: Return empty structure to avoid crashing list
        return {
            audit: {
                technicalScore: 0, contentScore: 0, overallGrade: 'F', summary: "Scan Failed",
                painPoints: [], technicalIssues: [], contentGaps: [], keywordsMissing: [],
                marketOpportunity: "Unknown",
                monetization: { estimatedLostRevenue: "$0", potentialUplift: "0%", recommendedPackage: "Starter", packageJustification: "Error" }
            },
            competition: { localCompetitors: [], nationalBenchmarks: [], comparison: "N/A" },
            staticSiteCode: "<!-- Generation Failed -->"
        }
    }
}

// NEW: Static Site Generator (Legacy Single Mode)
export async function generateStaticSiteContent(
    industry: string,
    target: PlaceResult
): Promise<string> {
    // ... existing logic ...
    // UPDATED: Using confirmed available model gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    ### SYSTEM ROLE: SENIOR_UX_ARCHITECT
    ### DESIGN PHILOSOPHY: MINIMALIST_TECH (NO_GLASS_TILES, NO_BOARDROOM_IMAGERY, HIGH_WHITESPACE)
    
    ### INPUT DATA:
    Business Name: ${target.displayName.text}
    Industry Vector: ${industry}
    Location: ${target.formattedAddress}
    Context: ${JSON.stringify(target)}

    ### TASK:
    Analyze the provided business description. Extract the core "Gold Mine" value (What makes them unique?) and synthesize it into a stunning, professional, and photorealistic single-page HTML/CSS webpage.

    ### EXECUTION REQUIREMENTS:
    1. **THEMATIC ADAPTATION:** 
       - Analyze the industry. 
       - If it's a trade (Plumbing/Roofing), use an industrial-tech aesthetic (Cobalt/Charcoal). 
       - If it's wellness/boutique, use a refined-modern aesthetic (Sage/Bone).
       - Inject asymmetrical layouts and diagonal section breaks to create visual "Kinetic Energy."

    2. **SECTION ARCHITECTURE:**
       - **Hero Section:** Create a "Gravity-Defying" headline. Use this specific Unsplash background URL for the hero: https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80
       - **Value Grid:** 3 asymmetrical blocks highlighting specific services found in the description.
       - **The Process:** A modern, vertical timeline or grid showing how they operate.
       - **Lead Capture:** A minimalist footer with verified contact info extracted from the description.

    3. **VISUAL CONSTRAINTS:**
       - Use 'Inter' or 'Space Grotesk' for modern sans-serif looks.
       - Use 'Playfair Display' for high-end boutique looks.
       - Max 2 accent colors. Use subtle 0.5px borders and soft, diffused shadows.
       - EMBED CSS directly in a <style> block.
       - USE TailwindCSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) for rapid styling if preferred, or raw CSS.

    ### OUTPUT:
    Provide the full, production-ready HTML and CSS in a single code block. Start with <!DOCTYPE html>.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        let text = response.text()

        // Strip markdown code blocks if present
        text = text.replace(/```html/g, '').replace(/```/g, '')

        return text
    } catch (e) {
        console.error("Gemini Static Site Error", e)
        throw new Error("Static Site Generation Failed")
    }
}

// NEW: Gemini Ultra Extract
export async function extractContactFromText(
    rawText: string,
    context: string
): Promise<{ email: string | null; name: string | null; title: string | null; confidence: number; source: string }> {
    // UPDATED: Using confirmed available model gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Truncate to ensure prompt fits context
    const cleanText = rawText.substring(0, 30000).replace(/"/g, "'").replace(/\n/g, " ")

    const prompt = `
    TASK: Analyze the following RAW TEXT (scraped from ${context}) and EXTRACT the single most likely Decision Maker contact.
    
    HIERARCHY OF CONFIDENCE:
    1. Direct Email explicitly labeled as "Owner", "Founder", "CEO", "President". (Confidence: 90-100)
    2. Direct Email found near "Contact Us" or implicitly for a manager. (Confidence: 70-89)
    3. Pattern deduced ("firstname.lastname@domain") if name is found. (Confidence: 50-69)
    4. Generic "info@" or "hello@" (Confidence: 30-49)
    
    RAW TEXT:
    "${cleanText}" ...

    OUTPUT STRICT JSON:
    {
        "email": <string | null>,
        "name": <string | null>,
        "title": <string | null>,
        "confidence": <number, 0-100>,
        "reasoning": <string, precise reason>
    }
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const rawJson = extractJson(response.text())
        const json = JSON.parse(rawJson)
        return {
            email: json.email || null,
            name: json.name || null,
            title: json.title || 'Extracted Contact',
            confidence: json.confidence || 0,
            source: 'Gemini Ultra Extract'
        }
    } catch (e) {
        // console.error("Gemini Extraction Failed", e)
        return { email: null, name: null, title: null, confidence: 0, source: 'Gemini (Failed)' }
    }
}
