import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listExistingInfrastructure() {
    const API_Base = 'https://api.20i.com';
    const apiKey = process.env.TWENTYI_API_KEY || '';

    // Auth Fix
    const keyPart = apiKey.includes('+') ? apiKey.split('+')[0] : apiKey;
    const bearerToken = Buffer.from(keyPart).toString('base64');

    const headers = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
    };

    const endpoints = [
        '/reseller/33267/cloudServers', // Valid per docs usually
        '/reseller/33267/vps',           // Legacy
        '/reseller/33267/managedVps',    // Managed
        '/reseller/33267/virtualServers' // Another variant
    ];

    console.log("Checking for EXISTING infrastructure...");

    for (const ep of endpoints) {
        try {
            console.log(`Checking: ${ep}`);
            const res = await fetch(`${API_Base}${ep}`, { headers });
            if (res.status === 200) {
                const data = await res.json();
                console.log(`[SUCCESS] Found:`, JSON.stringify(data, null, 2));
            } else {
                console.log(`[${res.status}] Not Found or Error`);
            }
        } catch (e) {
            console.error(`Error checking ${ep}:`, e);
        }
    }
}

listExistingInfrastructure();
