import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function discoverCloud() {
    const API_Base = 'https://api.20i.com';
    const apiKey = process.env.TWENTYI_API_KEY || '';


    // Auth Fix: Use the ID part of the key (before '+') and Base64 encode it.
    const keyPart = apiKey.includes('+') ? apiKey.split('+')[0] : apiKey;
    const bearerToken = Buffer.from(keyPart).toString('base64');

    const headers = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
    };

    try {
        // Step 1: Providers
        console.log("Fetching Cloud Providers...");
        const providersRes = await fetch(`${API_Base}/reseller/33267/cloudProviders`, { headers });
        const providers = await providersRes.json();
        console.log("Providers:", JSON.stringify(providers, null, 2));

        // Step 2: Specs & Zones for the first provider (assumed 20i)
        // Adjust if provider structure is complex
        let providerId = '20i'; // Default assumption
        if (Array.isArray(providers) && providers.length > 0) {
            providerId = providers[0].id || providers[0].slug || providers[0];
        }

        console.log(`Fetching Split Specs for Provider: ${providerId}...`);
        const specsOnlyRes = await fetch(`${API_Base}/reseller/33267/cloudServerSpecs?provider=${providerId}`, { headers });
        const specsOnly = await specsOnlyRes.json();
        console.log("Specs Only:", JSON.stringify(specsOnly, null, 2));

        // RETRY WITH WILDCARD
        console.log(`[Wildcard Attempt] Fetching Specs...`);
        const wSpecsRes = await fetch(`${API_Base}/reseller/*/cloudServerSpecs?provider=${providerId}`, { headers });
        const wSpecs = await wSpecsRes.json();
        console.log("Wildcard Specs:", JSON.stringify(wSpecs, null, 2));

        console.log(`[Wildcard Attempt] Fetching Zones...`);
        const wZonesRes = await fetch(`${API_Base}/reseller/*/cloudServerZones?provider=${providerId}`, { headers });
        const wZones = await wZonesRes.json();
        console.log("Wildcard Zones:", JSON.stringify(wZones, null, 2));

        console.log(`[VPS Attempt] Fetching VPS Types...`);
        try {
            const vpsRes = await fetch(`${API_Base}/reseller/33267/vpsTypes`, { headers });
            const vpsTypes = await vpsRes.json();
            console.log("VPS Types:", JSON.stringify(vpsTypes, null, 2));
        } catch (vpsErr) { console.error("VPS Check Failed:", vpsErr); }

        try {
            console.log(`[StackCP Users Attempt] Fetching Users...`);
            const susersRes = await fetch(`${API_Base}/reseller/33267/susers`, { headers });
            const susers = await susersRes.json();
            console.log("StackCP Users:", JSON.stringify(susers, null, 2));
        } catch (sErr) { console.error("StackCP Users Check Failed:", sErr); }
    } catch (e) {
        console.error("Discovery Failed:", e);
    }
}
discoverCloud();
