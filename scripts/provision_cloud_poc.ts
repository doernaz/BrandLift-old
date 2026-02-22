import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function attemptProvision() {
    const API_Base = 'https://api.20i.com';
    const apiKey = process.env.TWENTYI_API_KEY || '';

    // Auth Fix: Use the ID part of the key (before '+') and Base64 encode it.
    const keyPart = apiKey.includes('+') ? apiKey.split('+')[0] : apiKey;
    const bearerToken = Buffer.from(keyPart).toString('base64');

    const headers = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
    };

    console.log("Attempting Provision of Micro Cloud Server (London)...");

    const payload = {
        configuration: {
            provider: "20icloud",
            mvpsName: "brandlift-ops-core-v1", // Using separate field per support
            optimisation: "default",
            spec: "micro",
            zone: "lhr"
        },
        periodMonths: 1,
        type: "cloud-20i",
        forUser: "stack-user:5191983" // brandlift.ai user ID
    };

    try {
        const res = await fetch(`${API_Base}/reseller/33267/addCloudServer`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.result && data.result.id) {
            console.log(`Server Created! ID: ${data.result.id || data.result}`);

            // Immediately try to get details to see failing IP field
            console.log("Fetching Server Details...");
            const detailsRes = await fetch(`${API_Base}/cloud_server/${data.result.id || data.result}`, { headers });
            const details = await detailsRes.json();
            console.log("Server Details:", JSON.stringify(details, null, 2));
        }

    } catch (e) {
        console.error("Provisioning Failed:", e);
    }
}
attemptProvision();
