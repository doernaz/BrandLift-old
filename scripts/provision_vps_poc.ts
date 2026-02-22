import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function attemptUnmanagedVps() {
    const API_Base = 'https://api.20i.com';
    const apiKey = process.env.TWENTYI_API_KEY || '';

    // Auth Fix: Use the ID part of the key (before '+') and Base64 encode it.
    const keyPart = apiKey.includes('+') ? apiKey.split('+')[0] : apiKey;
    const bearerToken = Buffer.from(keyPart).toString('base64');

    const headers = {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
    };

    console.log("Attempting Provision of Unmanaged VPS (Dallas)...");

    const payload = {
        configuration: {
            "Name": "brandlift-ops-core-v1",
            "location": "dfw"
        },
        options: {
            "os": "ubuntu22.04"
        },
        periodMonths: 1,
        productSpec: "vps-a", // Smallest unmanaged VPS
        forUser: "stack-user:5191983" // brandlift.ai user ID
    };

    // Log the Request for Support Tracing
    const requestTime = new Date().toISOString();
    console.log(`[Request] Time: ${requestTime}`);
    console.log(`[Request] URL: ${API_Base}/reseller/33267/addVps`);
    console.log(`[Request] Payload:`, JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(`${API_Base}/reseller/33267/addVps`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log(`[Response] Status: ${res.status}`);
        console.log(`[Response] Headers:`, Object.fromEntries(res.headers.entries()));
        console.log(`[Response] Body:`, JSON.stringify(data, null, 2));

        if (data.result && data.result.id) {
            console.log(`VPS Created! ID: ${data.result.id || data.result}`);
        }

    } catch (e) {
        console.error("Provisioning Failed:", e);
    }
}

attemptUnmanagedVps();
