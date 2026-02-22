
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

// Ensure this runs on edge or node? Node is safer for env vars usually.
// But Vercel Edge supports it.
// Default is Node.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { lead } = body

        if (!lead) {
            return NextResponse.json({ error: 'Missing lead data' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        // UPDATED: User requested "current rev" (assuming 2.0 Flash)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // Sanitize lead data to reduce token usage and noise
        const sanitizedLead = {
            name: lead.displayName?.text || lead.name,
            industry: lead.primaryTypeDisplayName?.text || lead.types?.[0] || 'General Business',
            address: lead.formattedAddress,
            phone: lead.nationalPhoneNumber || lead.internationalPhoneNumber,
            website: lead.websiteUri,
            rating: lead.rating,
            reviewCount: lead.userRatingCount,
            types: lead.types,
            hours: lead.currentOpeningHours?.weekdayDescriptions || lead.regularOpeningHours?.weekdayDescriptions,
            summary: lead.editorialSummary?.text,
            reviews: lead.reviews?.slice(0, 3).map((r: any) => ({
                text: r.text?.text || r.text,
                rating: r.rating,
                author: r.authorAttribution?.displayName
            })),
            businessStatus: lead.businessStatus
        }

        const prompt = `
# Skill: Universal Site Architect (Gemini 2.0 Flash Isolated)
**Command:** /build-master-lead
### SYSTEM ROLE: SENIOR_UX_ARCHITECT & DESIGN_THINKER
### CONFIG: [MODEL: GEMINI_2.0_FLASH][TEMP: 0.8][REASONING: DEEP]

### CORE MISSION:
Transform the provided JSON lead data into a high-conversion, photorealistic single-page website. You are not just a coder; you are a Creative Director at a top-tier design agency. Every generation must feel unique, premium, and specifically tailored to the client's industry.

### DESIGN PERSONALITY (THE BRANDLIFT STANDARD):
- **Aesthetic:** Minimalist Tech (Inter/Space Grotesk fonts).
- **Prohibited:** NO glass-tiles, NO corporate boardroom stock photos, NO centered/boxed layouts.
- **Mandatory:** High whitespace, asymmetrical "Kinetic" grids, and 0.5px subtle vector borders.

### ADAPTIVE LOGIC GATES:
1. **Industry Analysis:** Scan "${sanitizedLead.industry}" and Keywords in Name. 
   - IF [Health/Wellness]: Pivot to Refined-Modern (Sage/Bone palette).
   - IF [Trades/Construction]: Pivot to Industrial-Tech (Cobalt/Obsidian/Emergency-Red).
   - IF [Automotive]: Pivot to Mechanical-Precision (Carbon/Silver/Signal-Orange).
   - IF [Smart Home/Automation/Security/Audio]: Pivot to Future-Residential (Clean-White/Electric-Blue/Glass).
   - IF [Professional]: Pivot to Authority-Minimal (Slate/Deep-Gold).

### IMAGE BANK (STRICTLY USE THESE EXACT URLS):
- **Health/Medical:** "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80"
- **Trades/Construction:** "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
- **Automotive/Mechanic:** "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80"
- **Smart Home/security:** "https://images.unsplash.com/photo-1558002038-1091a166111c?auto=format&fit=crop&w=1200&q=80"
- **Professional/Legal:** "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
- **Tech/Modern:** "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
- **General Business:** "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"

### DATA MAPPING:
- [[NAME]]: ${sanitizedLead.name}
- [[CONTACT]]: ${sanitizedLead.phone} / ${sanitizedLead.address}
- [[REVIEWS]]: Map the top 3 reviews into a 'Social Proof' grid.
- [[SEO_REPORT]]: Generate a 'Market Intelligence Report' comparing the Pre-Lift score (18) vs Post-Lift (94).
- [[HERO_IMAGE]]: Pick ONE URL from IMAGE BANK above. MUST be used in the top Hero Section <img> src.
- [[LINK]]: The Hero Image/Section MUST be wrapped in an <a href="seo-report.html" target="_blank"> tag or have a prominent button linking to "seo-report.html".

### TASK:
Analyze the following lead and generate the full, responsive Tailwind CSS / HTML code.

### LEAD DATA:
${JSON.stringify(sanitizedLead, null, 2)}

### TECHNICAL OVERRIDES:
- **CRITICAL:** You MUST include <script src="https://cdn.tailwindcss.com"></script> in the <head>.
- **Colors:** Ensure high contrast text (text-slate-900). Avoid white-on-white.
- **Images:** YOU MUST INCLUDE at least one <img> tag using a URL from the IMAGE BANK.

### OUTPUT:
Deliver ONLY the raw HTML code starting with <!DOCTYPE html>. Focus on visual "flair" and asymmetrical section breaks.
`

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Robust HTML cleanup: Extract code between ```html and ``` OR take everything from <!DOCTYPE html>
        let cleanText = text.replace(/```html/g, '').replace(/```/g, '').trim()

        // If specific start tag is found, ensure we prioritize it to avoid conversational preamble
        const docTypeIndex = cleanText.indexOf('<!DOCTYPE html>')
        if (docTypeIndex !== -1) {
            cleanText = cleanText.substring(docTypeIndex)
        }

        return NextResponse.json({ html: cleanText })

    } catch (error) {
        console.error("Gemini Generation Error", error)
        return NextResponse.json({ error: `Failed to generate package: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
    }
}
