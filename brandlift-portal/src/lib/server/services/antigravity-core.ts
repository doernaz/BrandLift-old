import "server-only"
import { db } from "@/lib/firebase-admin"
import { fetchPlaces, filterForMultipleVacuums, TargetStrategy, PlaceResult } from "./google-places"
import { performDeepScanAnalysis, generateBrandIdentity, generateStaticSiteContent } from "./gemini"

// ... existing code ...



// 7. Automated Outreach Trigger
import { provisionSubsite } from "./provisioning"
import { SEOAudit, UnifiedIdentity, AntigravityJob } from "@/lib/types/job"

async function updateJobLog(jobId: string, message: string, progress: number) {
    if (!db) return
    const timestamp = new Date().toLocaleTimeString()
    try {
        const docRef = db.collection("antigravity_jobs").doc(jobId)
        const doc = await docRef.get()
        if (doc.exists) {
            const currentLogs = doc.data()?.logs || []
            await docRef.update({
                logs: [...currentLogs, `[${timestamp}] ${message}`],
                progress,
                updatedAt: new Date()
            })
        }
    } catch (e) {
        console.error("Log update failed", e)
    }
}

export async function runAntigravityProtocol(
    jobId: string,
    industry: string,
    location: string,
    mode: 'test' | 'prod' = 'test',
    strategy: TargetStrategy = 'generic',
    limit: number = 1,
    auditorId?: string,
    goldMineFilter: 'all' | 'high_value' | 'commoner' = 'all',
    platforms: string[] = ['google_maps'],
    websiteFilter: 'all' | 'no_website' | 'has_website' = 'all',
    customPivots?: string[],
    searchHistoryId?: string,
    autoHarvest: boolean = false
) {
    if (!db) throw new Error("Database not initialized")

    try {
        // Log auditor config for debugging if needed, though unused in logic currently
        if (auditorId) {
            console.log(`Auditor ${auditorId} assigned to job ${jobId}`)
        }

        await updateJobLog(jobId, `Initializing Alcubierre Drive for ${industry} in ${location} (Filter: ${goldMineFilter.toUpperCase()}, Web: ${websiteFilter.toUpperCase()}, Mode: ${mode})...`, 10)

        // Log Platform Activation
        const platformLog = platforms.map(p => p.toUpperCase().replace('_', ' ')).join(', ')
        await updateJobLog(jobId, `Engaging Sensors: ${platformLog}`, 12)

        // --- The Ralph Loop (Recursive Discovery) ---
        const finalCandidates: PlaceResult[] = []
        let totalVerified = 0

        // Standard Pivots (Industry + Location Variations)
        // If Custom Pivots provided (Master Search), use them directly.
        // Otherwise generate standard ones.
        const PIVOT_KEYWORDS = customPivots && customPivots.length > 0 ? customPivots : [
            industry,
            `${industry} Services`,
            `Best ${industry}`,
            `${industry} Near Me`,
            `Top Rated ${industry}`,
            `Affordable ${industry}`,
            `Local ${industry}`,
            `Emergency ${industry}`,
            `Professional ${industry}`,
            `Reliable ${industry}`,
            `${industry} Companies`,
            `${industry} Contractors`,
            `${industry} Experts`
        ]

        const PIVOT_LOCATIONS = [
            location,
            // Add slight variations if location is "City, State" -> "City"
            location.split(',')[0]
        ]

        let pivotCount = 0
        const MAX_PIVOTS = 50

        loop_pivots:
        for (const loc of PIVOT_LOCATIONS) {
            for (const kw of PIVOT_KEYWORDS) {
                if (finalCandidates.length >= limit) break loop_pivots
                if (pivotCount >= MAX_PIVOTS) break loop_pivots

                pivotCount++
                if (pivotCount > 1) {
                    await updateJobLog(jobId, `[Alcubierre Loop] Warping to sector: "${kw}" in "${loc}"...`, 20 + (pivotCount * 2))
                }

                // Inner Page Loop 
                let pageToken: string | undefined = undefined
                // If seeking "No Website" targets, we must dig deeper as Google buries them.
                const MAX_PAGES_PER_PIVOT = websiteFilter === 'no_website' ? 10 : 3
                let pageCount = 0

                if (websiteFilter === 'no_website') {
                    await updateJobLog(jobId, `Deep Dredge Active: Scanning up to ${MAX_PAGES_PER_PIVOT} pages per sector to find "No Website" artifacts...`, 25)
                }

                while (finalCandidates.length < limit && pageCount < MAX_PAGES_PER_PIVOT) {
                    pageCount++

                    // Fetch
                    const { places, nextPageToken } = await fetchPlaces(kw, loc, pageToken)

                    if (places.length === 0) break

                    // Pre-Filter (Gold Mine Logic - Acceleration Phase)
                    let batchCandidates = filterForMultipleVacuums(places, 50, strategy)

                    // Apply Gold Mine Filters
                    // Apply Gold Mine Filters (Data Engine Mode)
                    // Note: API limitations prevent "Review Growth" tracking without historical data. Using static authority metrics.
                    if (goldMineFilter === 'high_value') {
                        // High Authority Proxy: > 4.5 Rating AND > 40 Reviews
                        batchCandidates = batchCandidates.filter(c => (c.rating || 0) > 4.5 && (c.userRatingCount || 0) > 40)
                    } else if (goldMineFilter === 'commoner') {
                        // Emerging Proxy: < 4.0 Rating OR < 20 Reviews
                        batchCandidates = batchCandidates.filter(c => (c.rating || 0) < 4.0 || (c.userRatingCount || 0) < 20)
                    }

                    // Apply Website Filter
                    if (websiteFilter === 'no_website') {
                        batchCandidates = batchCandidates.filter(c => !c.websiteUri)
                    } else if (websiteFilter === 'has_website') {
                        batchCandidates = batchCandidates.filter(c => !!c.websiteUri)
                    }

                    if (batchCandidates.length > 0) {
                        await updateJobLog(jobId, `Extracting ${batchCandidates.length} entities from data stream (Page ${pageCount})...`, 50)

                        const enrichedBatch: (PlaceResult | null)[] = await Promise.all(batchCandidates.map(async (candidate) => {
                            // Dedupe check 
                            if (finalCandidates.some(c => c.displayName.text === candidate.displayName.text)) return null

                            // Determine domain
                            let domain: string | null = null
                            if (candidate.websiteUri) {
                                try { domain = new URL(candidate.websiteUri).hostname.replace('www.', '') } catch { /* ignore */ }
                            }

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            let contact: any = null
                            try {
                                const enrichment = await import("./enrichment")
                                contact = await enrichment.executeWaterfallEnrichment(domain, candidate.displayName.text, loc)
                            } catch (e) {
                                console.error("Enrichment error", e)
                            }

                            // STRICT RULE: Valid Email Required for ALL results
                            if (!contact || !contact.email) {
                                return null;
                            }


                            // COMPREHENSIVE SCAN (Gemini 2.5 Pro)
                            // Generates: Audit, Monetization Report, Competitor Analysis, AND Static Site Code
                            let scanResult = null
                            try {
                                const specificInd = candidate.primaryTypeDisplayName?.text || industry
                                const { performComprehensiveScan } = await import("./gemini")
                                scanResult = await performComprehensiveScan(specificInd, loc, candidate)
                            } catch (err) {
                                console.error(`Comprehensive scan failed for ${candidate.displayName.text}`, err)
                            }

                            // Return candidate with whatever enrichment data we found
                            return {
                                ...candidate,
                                contactEmail: contact?.email || null,
                                contactName: contact?.name || null,
                                enrichmentSource: contact?.source || 'raw_scan',
                                linkedinUrl: contact?.linkedinUrl || null,
                                mobilePhone: contact?.mobilePhone || null,
                                intentTopics: contact?.intentTopics || [],
                                technographics: contact?.technographics || [],
                                growthMetrics: contact?.growthMetrics || null,
                                staticSiteCode: scanResult?.staticSiteCode, // Include generated code
                                seoAudit: scanResult?.audit,
                                competitorAnalysis: scanResult?.competition
                            } as PlaceResult
                        }))


                        // Collect Valid
                        const validBatch = enrichedBatch.filter((c): c is PlaceResult => c !== null)

                        for (const valid of validBatch) {
                            if (finalCandidates.length >= limit) break
                            if (!finalCandidates.some(c => c.displayName.text === valid.displayName.text)) {
                                finalCandidates.push(valid)
                                totalVerified++
                            }
                        }

                        if (validBatch.length > 0) {
                            await updateJobLog(jobId, `Captured ${validBatch.length} matter-stable entities. Total: ${totalVerified}/${limit}`, 60)
                            if (finalCandidates.length >= limit) break
                        }
                    }

                    // Next Page
                    if (nextPageToken && finalCandidates.length < limit) {
                        pageToken = nextPageToken
                        await new Promise(resolve => setTimeout(resolve, 1500))
                    } else {
                        break
                    }
                }
            }
        }

        if (finalCandidates.length === 0) {
            await updateJobLog(jobId, `Exhausted all ${pivotCount} pivot strategies. Found 0 suitable candidates.`, 100)
            await db.collection("antigravity_jobs").doc(jobId).update({ status: 'failed' })
            return
        }

        await updateJobLog(jobId, `Recursive Discovery Complete. Identified ${finalCandidates.length} high-value targets across ${pivotCount} pivots.`, 100)

        // Store candidates and pause for manual selection
        await db.collection("antigravity_jobs").doc(jobId).update({
            status: 'awaiting_selection',
            progress: 100, // Scan is 100% complete, but overall process is paused
            result: {
                vacuumCandidates: finalCandidates.length,
                candidates: finalCandidates // Use the cleansed array
            }
        })

        // Update History (Master Search)
        if (searchHistoryId && db) {
            await db.collection("search_history").doc(searchHistoryId).update({
                count: finalCandidates.length,
                status: 'completed'
            })
        }

        // Auto Harvest (Master Search)
        if (autoHarvest && db) {
            await updateJobLog(jobId, `[Master Search] Auto-Harvesting ${finalCandidates.length} candidates to 'brandlift_leads'...`, 100)
            const batch = db.batch()
            let leadCount = 0
            for (const c of finalCandidates) {
                // Use email as key, or composite
                const key = c.contactEmail || c.displayName.text.replace(/\W/g, '').toLowerCase()
                const leadRef = db.collection("brandlift_leads").doc(key)
                batch.set(leadRef, {
                    company_name: c.displayName.text,
                    website_url: c.websiteUri || null,
                    primary_keyword: industry,
                    location: c.formattedAddress || location,
                    business_phone: c.nationalPhoneNumber || c.internationalPhoneNumber || null,
                    harvestedAt: new Date(),
                    searchHistoryId: searchHistoryId || null,
                    jobId: jobId,
                    // Internal check references
                    _originalId: c.name || key
                })
                leadCount++
            }
            if (leadCount > 0) await batch.commit()
        }

        // Execution stops here. The user must select a candidate via API to resume.
        return

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error)
        console.error("Antigravity Protocol Error", error)
        await updateJobLog(jobId, `CRITICAL FAILURE: ${errMessage}`, 0)
        await db.collection("antigravity_jobs").doc(jobId).update({ status: 'failed' })
        if (searchHistoryId && db) {
            await db.collection("search_history").doc(searchHistoryId).update({ status: 'failed' })
        }
    }
}

export async function processSingleCandidate(
    jobId: string,
    vacuum: PlaceResult,
    industry: string,
    location: string,
    mode: string,
    auditorId?: string
) {
    try {
        await updateJobLog(jobId, `Processing Target: ${vacuum.displayName.text} [Mode: ${mode}, Auditor: ${auditorId || 'Auto'}]`, 40)

        // 3. Deep Scan Analysis (Gemini)
        await db!.collection("antigravity_jobs").doc(jobId).update({ status: 'analyzing' })

        // Use candidate-specific industry if available for better precision
        const specificIndustry = vacuum.primaryTypeDisplayName?.text || industry

        let analysis
        try {
            analysis = await performDeepScanAnalysis(specificIndustry, location, vacuum)
        } catch (e) {
            console.error("Gemini failed", e)
            await updateJobLog(jobId, `Gemini analysis failed.`, 70)
            throw e
        }

        // 4. Persistence of Audit Data
        await db!.collection("antigravity_jobs").doc(jobId).update({
            result: {
                topCandidate: vacuum,
                seoAudit: analysis.audit,
                competitorAnalysis: analysis.competition,
                domain: `${vacuum.displayName.text.toLowerCase().replace(/[^a-z0-9]/g, '-')}.brandlift.ai`,
                provisionedUrl: `http://localhost:3000/demo/${vacuum.displayName.text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
            }
        })

        // 5. AUTO-CHAIN: Proceed directly to Identity Generation
        try {
            await runIdentityGenerationPhase(
                jobId,
                industry,
                location,
                vacuum,
                analysis.audit,
                'generic'
            )
        } catch (e) {
            console.error("Auto-chain identity generation failed", e)
            throw e
        }

        // 6. AUTO-CHAIN: Generate Static Site Code (20i Export)
        try {
            await updateJobLog(jobId, `Generating Static Site Code (20i Export)...`, 95)
            const staticHtml = await generateStaticSiteContent(specificIndustry, vacuum)

            // Save to Firestore result (using update with dot notation)
            await db!.collection("antigravity_jobs").doc(jobId).update({
                "result.staticSiteCode": staticHtml
            })
            await updateJobLog(jobId, `Static Site Code Generated. Ready for Download.`, 100)
        } catch (e) {
            console.error("Static site generation failed", e)
            // Non-blocking, continue
        }

        // 7. Automated Outreach Trigger
        if (vacuum.contactEmail) {
            try {
                await updateJobLog(jobId, `Initiating Automated Outreach for ${vacuum.contactEmail}...`, 99)
                const outreachResult = await import("./enrichment").then(mod => mod.addToSequence(vacuum.contactEmail!, true))
                await updateJobLog(jobId, `Outreach Status: ${outreachResult}`, 100)
            } catch (e) {
                console.error("Outreach trigger failed", e)
            }
        }

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error)
        console.error("Process Single Candidate Critical Failure", error)
        await updateJobLog(jobId, `CRITICAL PROCESS FAILURE: ${errMessage}`, 0)
        await db!.collection("antigravity_jobs").doc(jobId).update({ status: 'failed' })
    }
}

export async function runIdentityGenerationPhase(
    jobId: string,
    industry: string,
    location: string,
    target: PlaceResult,
    audit: SEOAudit,
    strategy: TargetStrategy = 'generic'
) {
    if (!db) return
    await db.collection("antigravity_jobs").doc(jobId).update({ status: 'generating_identity' })
    await updateJobLog(jobId, `Initiating Brand Identity Protocol (Strategy: ${strategy})...`, 85)

    try {
        const themes = [
            "The Kinetic",
            "The Essentialist",
            "The Architect"
        ]

        const variants: UnifiedIdentity[] = []
        const variantDomains: string[] = []
        const baseSubdomain = target.displayName.text.toLowerCase().replace(/[^a-z0-9]/g, '-')

        for (const theme of themes) {
            await updateJobLog(jobId, `Generating Variant: ${theme}...`, 90)

            const identity = await generateBrandIdentity(industry, location, target, audit, theme)

            const variantSlug = `${baseSubdomain}-${theme.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

            let provisionResult
            try {
                provisionResult = await provisionSubsite(variantSlug)
            } catch (provErr: unknown) {
                const error = provErr as Error
                provisionResult = {
                    provisionedUrl: `http://localhost:3000/demo/${variantSlug}`,
                    error: error.message
                }
            }

            variantDomains.push(`${variantSlug}.brandlift.ai`)
            identity.variantUrl = provisionResult.provisionedUrl
            variants.push(identity)
        }

        await updateJobLog(jobId, `All Variants Generated. Provisioning Dashboard...`, 98)

        const docRef = db.collection("antigravity_jobs").doc(jobId)
        const doc = await docRef.get()
        const currentResult = doc.data()?.result || {}

        const defaultIdentity = variants[0]

        if (!defaultIdentity) {
            throw new Error("No variants generated.")
        }

        const updatePayload: Partial<AntigravityJob> = {
            status: 'completed',
            progress: 100,
            result: {
                ...currentResult,
                identity: defaultIdentity,
                variants: variants,
                variantDomains: variantDomains,
                provisionedUrl: `http://localhost:3000/demo/${baseSubdomain}`
            }
        }

        await docRef.update(updatePayload)
        await updateJobLog(jobId, `Identity Generation Complete. Dashboard Live at http://localhost:3000/demo/${baseSubdomain}`, 100)

    } catch (idErr) {
        console.error("Identity Generation Failed", idErr)
        await updateJobLog(jobId, `Identity Gen Failed: ${idErr}`, 90)
        await db.collection("antigravity_jobs").doc(jobId).update({ status: 'failed' })
        // Rethrow so processSingleCandidate knows it failed
        throw idErr
    }
}
