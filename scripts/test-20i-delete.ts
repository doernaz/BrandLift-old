
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_Base = 'https://api.20i.com';
const PACKAGE_ID = '3574679';

async function testDelete() {
    if (!process.env.TWENTYI_API_KEY) { console.error("Missing Key"); return; }

    // Auth - Base64 Encoding
    const generalKey = process.env.TWENTYI_API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const headers = {
        'Authorization': `Bearer ${encodedKey}`,
        'Content-Type': 'application/json'
    };

    const methods = [
        {
            method: 'POST',
            url: `${API_Base}/reseller/*/deleteWeb`,
            body: { package_id: PACKAGE_ID },
            name: 'POST /reseller/*/deleteWeb [Literal asterisk]'
        },
        {
            method: 'POST',
            url: `${API_Base}/reseller/deleteWeb`,
            body: { package_id: PACKAGE_ID },
            name: 'POST /reseller/deleteWeb [No asterisk]'
        },
        {
            method: 'POST',
            url: `${API_Base}/reseller/*/delete`,
            body: { delete: [PACKAGE_ID] },
            name: 'POST /reseller/*/delete'
        },
        {
            method: 'POST',
            url: `${API_Base}/package/${PACKAGE_ID}`,
            body: { delete: true },
            name: 'POST /package/{id} {delete: true}'
        },
        {
            method: 'DELETE',
            url: `${API_Base}/package/${PACKAGE_ID}?confirm=true`,
            name: 'DELETE /package/{id}?confirm=true'
        },
        {
            method: 'POST',
            url: `${API_Base}/package/delete`,
            body: { package_id: PACKAGE_ID },
            name: 'POST /package/delete {package_id}'
        },
        // Trying one more
        {
            method: 'POST',
            url: `${API_Base}/reseller/delete`,
            body: { package_id: PACKAGE_ID },
            name: 'POST /reseller/delete {package_id}'
        }
    ];

    for (const req of methods) {
        console.log(`\n--- Testing ${req.name} ---`);
        try {
            const res = await fetch(req.url, {
                method: req.method,
                headers,
                body: req.body ? JSON.stringify(req.body) : undefined
            });
            console.log(`Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log("Response:", text.substring(0, 200));

            if (res.ok) {
                console.log("SUCCESS! Delete worked.");
                return;
            }
        } catch (e: any) {
            console.error("Error:", e.message);
        }
    }
}

testDelete();
