export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { performComprehensiveScan } from '@/lib/server/services/gemini'
import { PlaceResult } from '@/lib/server/services/google-places'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { candidate, industry, location } = body

        if (!candidate || !industry || !location) {
            return NextResponse.json({ error: 'Missing candidate, industry, or location' }, { status: 400 })
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
        }

        console.log(`Analyzing Lead: ${candidate.displayName.text}...`)

        // 1. Perform Comprehensive Scan (Audit + Static Site Code in one go)
        // Using candidate-specific industry if available for precision
        const specificIndustry = candidate.primaryTypeDisplayName?.text || industry

        let scanResult
        try {
            scanResult = await performComprehensiveScan(specificIndustry, location, candidate as PlaceResult)
        } catch (e: any) {
            console.error("Scan Failed:", e)
            return NextResponse.json({ error: 'Scan Generation Failed', details: e.message }, { status: 500 })
        }

        // 2. Persist to brandlift_leads
        // Use consistent key generation logic
        const key = candidate.contactEmail || candidate.displayName.text.replace(/\W/g, '').toLowerCase()
        const leadRef = db.collection("brandlift_leads").doc(key)

        const leadData = {
            company_name: candidate.displayName.text,
            website_url: candidate.websiteUri || null,
            primary_keyword: industry,
            location: candidate.formattedAddress || location,
            business_phone: candidate.nationalPhoneNumber || candidate.internationalPhoneNumber || null,
            harvestedAt: new Date(),
            // Storing the heavy assets
            seoAudit: scanResult.audit,
            competitorAnalysis: scanResult.competition,
            staticSiteCode: scanResult.staticSiteCode,
            // Original data reference
            _originalId: candidate.name || key
        }

        await leadRef.set(leadData, { merge: true })

        return NextResponse.json({
            success: true,
            leadId: key,
            audit: scanResult.audit,
            competition: scanResult.competition,
            staticSiteCode: scanResult.staticSiteCode,
            message: 'Analysis Complete & Stored'
        })

    } catch (error: any) {
        console.error("Analyze Lead API Error", error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
