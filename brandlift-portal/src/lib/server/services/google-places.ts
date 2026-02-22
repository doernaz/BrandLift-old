import "server-only"

export interface PlaceResult {
    name: string
    formattedAddress: string
    displayName: { text: string }
    primaryType?: string
    primaryTypeDisplayName?: { text: string; languageCode: string }
    rating: number
    userRatingCount: number
    websiteUri?: string
    businessStatus?: string
    internationalPhoneNumber?: string
    nationalPhoneNumber?: string
    priceLevel?: string
    types?: string[]
    contactEmail?: string
    contactName?: string
    enrichmentSource?: string
    linkedinUrl?: string
    mobilePhone?: string
    intentTopics?: string[]
    technographics?: string[]
    growthMetrics?: {
        jobChange: boolean
        headcountGrowth: number
    }
    staticSiteCode?: string // Pre-generated HTML for 20i upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seoAudit?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    competitorAnalysis?: any
}

export async function fetchPlaces(industry: string, location: string, pageToken?: string): Promise<{ places: PlaceResult[], nextPageToken?: string }> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY

    if (!apiKey) {
        throw new Error("Missing Google Places API Key")
    }

    const query = `${industry} in ${location}`

    const requestBody: any = { textQuery: query }
    if (pageToken) {
        requestBody.pageToken = pageToken
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            // Enhanced Field Mask for Contact & Rich Data + nextPageToken
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.businessStatus,places.currentOpeningHours,places.iconMaskBaseUri,places.internationalPhoneNumber,places.nationalPhoneNumber,places.priceLevel,places.types,places.primaryType,places.primaryTypeDisplayName,nextPageToken'
        },
        body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
        throw new Error(`Google Places API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
        places: data.places || [],
        nextPageToken: data.nextPageToken
    }
}

export type TargetStrategy = 'generic' | 'high_ticket_artisan' | 'urgent_service' | 'boutique_service'

interface VacuumScore {
    place: PlaceResult
    score: number
    strategyMatch: string
}

export function filterForEfficiencyVacuum(places: PlaceResult[], strategy: TargetStrategy = 'generic'): PlaceResult | null {
    // Basic criteria: Operational, reasonable rating
    const operational = places.filter(p => p.businessStatus === 'OPERATIONAL' && p.rating >= 4.0)

    // Scoring function
    const getScore = (place: PlaceResult): VacuumScore => {
        let score = place.rating * Math.log(place.userRatingCount + 1) // Base score: Rating * Log(Reviews)
        let matchType = 'generic'

        const name = place.displayName.text.toLowerCase()
        const noWebsiteBonus = !place.websiteUri ? 2.0 : 0.5 // Massive multiplier for no website

        // Strategy-Specific Boosts
        if (strategy === 'high_ticket_artisan') {
            if (name.includes('custom') || name.includes('design') || name.includes('artisan') || name.includes('studio') || name.includes('landscape') || name.includes('furniture')) {
                score *= 1.5
                matchType = 'high_ticket_artisan'
            }
        } else if (strategy === 'urgent_service') {
            if (name.includes('repair') || name.includes('emergency') || name.includes('removal') || name.includes('clean') || name.includes('fix')) {
                score *= 1.5
                matchType = 'urgent_service'
            }
        } else if (strategy === 'boutique_service') {
            if (name.includes('consulting') || name.includes('law') || name.includes('therapy') || name.includes('wealth') || name.includes('private')) {
                score *= 1.5
                matchType = 'boutique_service'
            }
        }

        // Penalty for generic/chain names (heuristic)
        if (name.includes('starbucks') || name.includes('mcdonalds') || name.includes('homedepot')) {
            score *= 0.1
        }

        return { place, score: score * noWebsiteBonus, strategyMatch: matchType }
    }

    // Rank candidates
    const rankings = operational.map(getScore).sort((a, b) => b.score - a.score)

    if (rankings.length > 0) {
        // Return top N
        // Note: The caller needs to handle array vs single. 
        // For backwards compatibility, we return single (top 1) by default if we don't change signature.
        // But to support batch, we should probably export a new function or change signature.

        const winner = rankings[0]
        console.log(`[Vacuum Filter] Winner: ${winner.place.displayName.text} (Score: ${winner.score.toFixed(2)}, Strategy: ${winner.strategyMatch})`)
        return winner.place
    }

    return null
}

export function filterForMultipleVacuums(places: PlaceResult[], limit: number = 1, strategy: TargetStrategy = 'generic'): PlaceResult[] {
    // Re-use logic or duplicate for clarity. Let's duplicate core scoring for now to keep it clean.
    const operational = places.filter(p => p.businessStatus === 'OPERATIONAL' && p.rating >= 3.8) // Lower threshold slightly for bulk

    const getScore = (place: PlaceResult) => {
        let score = place.rating * Math.log(place.userRatingCount + 1)
        const name = place.displayName.text.toLowerCase()
        const noWebsiteBonus = !place.websiteUri ? 2.0 : 0.5

        if (strategy === 'high_ticket_artisan') {
            if (name.includes('custom') || name.includes('design') || name.includes('artisan') || name.includes('studio') || name.includes('landscape')) score *= 1.5
        } else if (strategy === 'urgent_service') {
            if (name.includes('repair') || name.includes('emergency') || name.includes('removal') || name.includes('clean')) score *= 1.5
        } else if (strategy === 'boutique_service') {
            if (name.includes('consulting') || name.includes('law') || name.includes('therapy') || name.includes('wealth')) score *= 1.5
        }

        if (name.includes('starbucks') || name.includes('mcdonalds')) score *= 0.1

        return { place, score: score * noWebsiteBonus }
    }

    const rankings = operational.map(getScore).sort((a, b) => b.score - a.score)
    return rankings.slice(0, limit).map(r => r.place)
}
