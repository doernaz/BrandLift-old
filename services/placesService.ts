import type { Place, FilterOptions } from '../types';
import { enrichLeadsWithEmail } from './enrichmentService';

const PLACES_API_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const fetchPlacesPage = async (filters: FilterOptions, pageToken?: string, customQuery?: string) => {
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    if (!GOOGLE_API_KEY) {
        throw new Error("CONFIGURATION ERROR: VITE_GOOGLE_PLACES_API_KEY is missing in .env.local.");
    }

    const query = customQuery || `${filters.industry} in ${filters.city}, ${filters.state}`;

    const response = await fetch(PLACES_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.businessStatus,places.primaryType,places.regularOpeningHours,places.priceLevel,places.reviews,nextPageToken',
        },
        body: JSON.stringify({
            textQuery: query,
            maxResultCount: 20, // Max per page is 20
            pageToken: pageToken, // Used for pagination
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
    }

    return response.json();
};

export const searchLeads = async (filters: FilterOptions): Promise<{ leads: Place[], stats: { scanned: number, noWebsite: number } }> => {
    let allRawPlaces: any[] = [];
    const scannedPlaceIds = new Set<string>();

    // Helper to execute a scan pattern
    const executeScan = async (query?: string) => {
        let nextPageToken: string | undefined = undefined;
        let pagesFetched = 0;
        const MAX_PAGES = 5; // Scan up to 5 pages per query

        do {
            try {
                if (pagesFetched > 0) await new Promise(r => setTimeout(r, 200));

                // If using custom query, use that. Else standard.
                const data: any = await fetchPlacesPage(filters, nextPageToken, query);

                if (data.places) {
                    let newCount = 0;
                    for (const p of data.places) {
                        if (!scannedPlaceIds.has(p.id)) {
                            scannedPlaceIds.add(p.id);
                            allRawPlaces.push(p);
                            newCount++;
                        }
                    }
                    // Optimization: If a page returns 0 *new* results, we might have exhausted this area.
                    if (newCount === 0 && pagesFetched > 1) break;
                }

                nextPageToken = data.nextPageToken;
                pagesFetched++;

            } catch (err: any) {
                console.error("Error fetching page:", err);
                // Don't crash entire scan on one partial failure
                break;
            }
        } while (nextPageToken && pagesFetched < MAX_PAGES);
    };

    // 1. STANDARD SCAN
    console.log(`[Places] Starting Standard Scan...`);
    await executeScan();

    // 2. DEEP SCAN TRIGGER 
    // If "No Website Only" is ON, we usually get very few results from standard scan.
    // Trigger sub-region scans automatically.
    const currentNoWebsiteCount = allRawPlaces.filter((p: any) => !p.websiteUri).length;

    // If Deep Scan is requested, OR "No Website Only" yielded insufficient results
    const shouldDeepScan = filters.deepScan || (filters.noWebsiteOnly && currentNoWebsiteCount < filters.maxResults);

    if (shouldDeepScan) {
        console.log(`[Places] Deep Scan Triggered (Refining Search...)`);

        const subQueries = [
            `${filters.industry} in North ${filters.city}, ${filters.state}`,
            `${filters.industry} in South ${filters.city}, ${filters.state}`,
            `${filters.industry} in East ${filters.city}, ${filters.state}`,
            `${filters.industry} in West ${filters.city}, ${filters.state}`,
            `${filters.industry} in Central ${filters.city}, ${filters.state}`
        ];

        // Run sequentially or parallel? Parallel is faster but might hit Rate Limits.
        // Let's run in 2 batches.
        await Promise.all(subQueries.slice(0, 3).map(q => executeScan(q)));
        await Promise.all(subQueries.slice(3).map(q => executeScan(q)));
    }

    console.log(`[Places] Total scanned unique leads: ${allRawPlaces.length}`);

    // MAP TO INTERNAL TYPE
    const leads: Place[] = allRawPlaces.map((p: any) => ({
        id: p.id,
        name: p.displayName?.text || 'Unknown Business',
        address: p.formattedAddress,
        phone: p.internationalPhoneNumber || 'N/A',
        website: p.websiteUri || null,
        icon: null,
        socials: [],
        email: null,

        // Expanded Fields
        reviews: p.reviews ? p.reviews.map((r: any) => ({
            name: r.authorAttribution?.displayName || 'Anonymous',
            rating: r.rating,
            text: r.text?.text || '',
            relativePublishTimeDescription: r.relativePublishTimeDescription,
            authorPhotoUri: r.authorAttribution?.photoUri
        })) : [],
        googleMapsUri: p.googleMapsUri || null,
        rating: p.rating || null,
        userRatingCount: p.userRatingCount || null,
        businessStatus: p.businessStatus || null,
        priceLevel: p.priceLevel || null,
        primaryType: p.primaryType || null,
        regularOpeningHours: p.regularOpeningHours || null,
    }));

    // ENRICHMENT SETUP
    let leadsToProcess = leads;

    if (filters.noWebsiteOnly) {
        // Only enrich leads that STARTED without a website on Google Maps
        leadsToProcess = leads.filter(l => !l.website);

        if (leadsToProcess.length === 0) {
            // If we found NO leads without websites, just fall through (or throw?)
            // We will just let the downstream logic handle filtering
        }
    }

    // ENRICHMENT EXECUTION
    // Process all candidates found via Deep Scan that match the No Website filter.
    // Or enrich ALL if no filter
    const enrichedLeads = await enrichLeadsWithEmail(leadsToProcess); // Only enrich filtered subset for speed?

    // Wait, if we only enrich a subset, what about the rest? 
    // If filters.noWebsiteOnly is TRUE, we only return the subset.
    // If FALSE, we return everything. 
    // The original code only enriched 'leadsToProcess'.
    // If 'noWebsiteOnly' is false, leadsToProcess = leads (all).

    // Merging back might be needed if we want to return mixed results?
    // But for now let's stick to the 5173 logic:

    // Calculate final stats
    const finalStats = {
        scanned: allRawPlaces.length,
        noWebsite: allRawPlaces.filter((p: any) => !p.websiteUri).length
    };

    // POST-FILTER
    if (filters.noWebsiteOnly) {
        const strictResults = enrichedLeads.filter(l => !l.website);

        if (strictResults.length === 0) {
            // Just return empty array instead of throwing to avoid crashing UI
            return { leads: [], stats: finalStats };
        }

        return {
            leads: strictResults.slice(0, filters.maxResults),
            stats: finalStats
        };
    }

    return {
        leads: enrichedLeads.slice(0, filters.maxResults),
        stats: finalStats
    };
};
