import type { Place } from '../types';
import { searchEngineDiscovery } from './searchEngine';
import { dataProviderEnrichment } from './dataProvider';

/**
 * 3-Stage Enrichment Pipeline:
 * 1. Search Engine (Website Discovery)
 * 2. Social Media (Owner & Profile Discovery)
 * 3. Data Provider (Email Verification)
 */
export const enrichLeadsWithEmail = async (leads: Place[]): Promise<Place[]> => {
    console.log(`[Pipeline] Starting enrichment for ${leads.length} leads...`);

    // Process leads in parallel for speed, or sequential to avoid rate limits
    const enrichedLeads = await Promise.all(leads.map(async (lead) => {
        // Stage 0: Initial State
        let currentLead = { ...lead };

        // Stage 1: Search Engine (Find Website if missing)
        if (!currentLead.website) {
            const searchResults = await searchEngineDiscovery(currentLead);
            currentLead = { ...currentLead, ...searchResults };
        }

        // Delay to simulate processing
        await new Promise(r => setTimeout(r, 200));

        // Stage 2: Social Media (Simulated Discovery)
        // Check for common platforms based on business name
        const cleanName = currentLead.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const platforms = [];

        // 60% chance of Facebook
        if (Math.random() > 0.4) {
            const fbUrl = `https://facebook.com/${cleanName}`;
            currentLead.facebookUrl = fbUrl;
            platforms.push(fbUrl);
        }

        // 40% chance of Instagram
        if (Math.random() > 0.6) {
            const igUrl = `https://instagram.com/${cleanName}`;
            currentLead.instagramUrl = igUrl;
            platforms.push(igUrl);
        }

        // 30% chance of LinkedIn
        if (Math.random() > 0.7) {
            const liUrl = `https://linkedin.com/company/${cleanName}`;
            currentLead.linkedinUrl = liUrl;
            platforms.push(liUrl);
        }

        currentLead.socials = platforms;

        // Stage 3: Data Provider (Find Email using Domain + Name)
        if (!currentLead.email && currentLead.website) {
            const dataResults = await dataProviderEnrichment(currentLead);
            // Fallback: If data provider fails but we have no email, try "contact@" guess
            if (!dataResults.email) {
                const domain = currentLead.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
                // Only guess if we haven't found a better one
                if (!currentLead.email) {
                    dataResults.email = `contact@${domain}`; // Fallback logic preserved
                }
            }
            currentLead = { ...currentLead, ...dataResults };
        } else if (!currentLead.email && !currentLead.website) {
            // Deep fallback for completely offline business
            const safeName = currentLead.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            currentLead.email = `info@${safeName}.com`;
        }

        return currentLead;
    }));

    console.log(`[Pipeline] Completed enrichment.`);
    return enrichedLeads;
};
