import { NextResponse } from 'next/server'
import { fetchPlaces, filterForMultipleVacuums, PlaceResult } from '@/lib/server/services/google-places'
import * as enrichment from '@/lib/server/services/enrichment'
import fs from 'fs'
import path from 'path'

// Configuration
const TARGET_LEADS = 50
const OUTPUT_FILE = path.join(process.cwd(), 'progress.md')

// Pivot Strategies
const LOCATIONS = [
    'Arizona',
    'Scottsdale, AZ',
    'Paradise Valley, AZ',
    'Phoenix, AZ',
    'Tempe, AZ',
    'Gilbert, AZ',
    'Chandler, AZ',
    'Mesa, AZ'
]

const KEYWORDS = [
    'Cosmetic Dentistry',
    'Aesthetic Dental Surgery',
    'Dental Implants',
    'Porcelain Veneers',
    'Smile Makeover',
    'Restorative Dentistry'
]

// Tracker
interface LeadTracker {
    count: number
    leads: Set<string> // Track usage by business name or email to avoid dupes
}

async function appendToProgressFile(leads: PlaceResult[]) {
    const timestamp = new Date().toISOString()
    let content = ""

    // Initialize file if not exists
    if (!fs.existsSync(OUTPUT_FILE)) {
        content = `# Recursive Lead Discovery Log\nStarted: ${timestamp}\nTarget: ${TARGET_LEADS}\n\n| Business Name | Location | Email | Confidence | Source | Status |\n|---|---|---|---|---|---|\n`
        fs.writeFileSync(OUTPUT_FILE, content)
    }

    // Append Candidates
    let newContent = ""
    for (const lead of leads) {
        newContent += `| ${lead.displayName.text} | ${lead.formattedAddress} | **${lead.contactEmail}** | ${lead.rating}* | ${lead.enrichmentSource || 'N/A'} | Verified |\n`
    }

    fs.appendFileSync(OUTPUT_FILE, newContent)
}

export async function POST(req: Request) {
    try {
        console.log("[Recursive Scan] Starting...")

        // tracking state
        let totalVerified = 0
        const seenEmails = new Set<string>()

        // 1. Initialize File
        if (fs.existsSync(OUTPUT_FILE)) {
            fs.unlinkSync(OUTPUT_FILE) // Reset for this run as per "Initialize count = 0"
        }

        // Loop controls
        let locIndex = 0
        let keyIndex = 0
        let loopCount = 0
        const MAX_LOOPS = 50 // Safety break

        while (totalVerified < TARGET_LEADS && loopCount < MAX_LOOPS) {
            loopCount++

            // 2. Select Parameters (The Ralph Loop Logic)
            const currentLocation = LOCATIONS[locIndex]
            const currentKeyword = KEYWORDS[keyIndex]

            console.log(`[Loop ${loopCount}] Searching: "${currentKeyword}" in "${currentLocation}" (Found: ${totalVerified}/${TARGET_LEADS})`)

            // 3. Search & Enrich
            try {
                // A. Search Google
                const { places } = await fetchPlaces(currentKeyword, currentLocation)

                // B. Filter (Vacuum Logic - High Ticket)
                // We filter for operational businesses with reasonable ratings
                const candidates = filterForMultipleVacuums(places, 20, 'high_ticket_artisan')

                if (candidates.length === 0) {
                    console.log(`[Loop ${loopCount}] No candidates found. Pivoting...`)
                } else {
                    // C. Enrich
                    console.log(`[Loop ${loopCount}] Enriching ${candidates.length} candidates...`)
                    const enriched = await Promise.all(candidates.map(async (c) => {
                        // Skip if we've already seen this business
                        if (seenEmails.has(c.displayName.text)) return null

                        let domain: string | null = null
                        if (c.websiteUri) {
                            try {
                                domain = new URL(c.websiteUri).hostname.replace('www.', '')
                            } catch (e) { }
                        }

                        try {
                            const contact = await enrichment.executeWaterfallEnrichment(domain, c.displayName.text, currentLocation)
                            if (contact && contact.email) {
                                return { ...c, contactEmail: contact.email, enrichmentSource: contact.source }
                            }
                        } catch (e) {
                            console.error("Enrichment failed", e)
                        }
                        return null
                    }))

                    // D. Verify & Collect
                    // D. Verify & Collect
                    const validLeads = enriched.filter(c => c !== null && !!c.contactEmail) as PlaceResult[]

                    // Filter Duplicates (by Email or Name)
                    const uniqueLeads = validLeads.filter(lead => {
                        const id = lead.contactEmail!
                        if (seenEmails.has(id)) return false
                        seenEmails.add(id)
                        return true
                    })

                    console.log(`[Loop ${loopCount}] Found ${uniqueLeads.length} new verified leads.`)

                    if (uniqueLeads.length > 0) {
                        await appendToProgressFile(uniqueLeads)
                        totalVerified += uniqueLeads.length
                    }
                }

            } catch (err) {
                console.error(`[Loop ${loopCount}] Search failed:`, err)
            }

            // 4. Pivot Logic (The "Ralph Loop")
            // If we haven't met the target, we must pivot parameters
            if (totalVerified < TARGET_LEADS) {
                // Simple Round Robin: Change Keyword first, then Location
                keyIndex++
                if (keyIndex >= KEYWORDS.length) {
                    keyIndex = 0
                    locIndex++
                    if (locIndex >= LOCATIONS.length) {
                        console.log("Exhaused all locations and keywords.")
                        break // Exit if we run out of pivots
                    }
                }
            }
        }

        return NextResponse.json({
            status: totalVerified >= TARGET_LEADS ? "success" : "partial",
            totalVerified,
            message: `Discovery Complete. Found ${totalVerified} leads. Log blocked at ${OUTPUT_FILE}`,
            logPath: OUTPUT_FILE
        })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
