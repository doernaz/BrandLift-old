import type { Place } from '../types';

interface HunterResponse {
    data: {
        emails: { value: string; type: string; confidence: number }[];
        domain: string;
        organization: string;
    };
    errors?: { id: string; code: number; details: string }[];
}

/**
 * Step 3: Data Provider Integration
 * Uses Hunter.io Domain Search API to find emails for a domain.
 */
export const dataProviderEnrichment = async (lead: Place): Promise<Partial<Place>> => {
    const API_KEY = import.meta.env.VITE_HUNTER_API_KEY;

    // Extract domain from website if available
    const domain = lead.website ? new URL(lead.website).hostname.replace('www.', '') : null;

    if (!domain) {
        console.log(`[Data Provider] Skipping ${lead.name} (No domain to query)`);
        return {};
    }

    console.log(`[Data Provider] Querying Hunter.io for domain: ${domain}`);

    // Fallback to simulation if key is missing
    if (!API_KEY) {
        console.warn("[Data Provider] API Key missing. Using fallback simulation.");
        if (!lead.email && Math.random() > 0.2) {
            const contact = lead.contactName ? lead.contactName.split(' ')[0].toLowerCase() : 'contact';
            return { email: `${contact}@${domain}` };
        }
        return {};
    }

    try {
        const response = await fetch(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${API_KEY}&limit=1`
        );

        if (!response.ok) {
            console.error(`[Data Provider] API Error: ${response.statusText}`);
            return {};
        }

        const data: HunterResponse = await response.json();

        if (data.errors) {
            console.error(`[Data Provider] Hunter Error:`, data.errors);
            return {};
        }

        if (data.data?.emails?.length > 0) {
            // prioritize personal/high confidence emails if multiple (Hunter returns sorted by confidence usually)
            const email = data.data.emails[0].value;
            console.log(`[Data Provider] Found verified email: ${email}`);
            return { email };
        } else {
            console.log(`[Data Provider] No emails found for domain.`);
            return {};
        }

    } catch (error) {
        console.error(`[Data Provider] Network Error:`, error);
        return {};
    }
};
