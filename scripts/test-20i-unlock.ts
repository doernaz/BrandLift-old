
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_Base = 'https://api.20i.com';
const PACKAGE_ID = '3576443'; // Using the ID from the last failed deployment

async function testUnlock() {
    if (!process.env.TWENTYI_API_KEY) { console.error("Missing Key"); return; }

    const generalKey = process.env.TWENTYI_API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const headers = {
        'Authorization': `Bearer ${encodedKey}`,
        'Content-Type': 'application/json'
    };

    const candidates = [
        // Candidate 1: CommonReseller /web/ftpLock
        { method: 'POST', path: `/package/${PACKAGE_ID}/web/ftpLock`, body: { lock: 'unlocked' } },
        // Candidate 2: Different body
        { method: 'POST', path: `/package/${PACKAGE_ID}/web/ftpLock`, body: { status: 'unlocked' } },
        // Candidate 3: /web/tls/ftp (sometimes related)
        // Candidate 4: Unlocking via StackCP User?
        // Candidate 5: Reseller specific
        { method: 'POST', path: `/reseller/package/${PACKAGE_ID}/ftp/unlock` },
        // Candidate 6: Simple unlock
        { method: 'POST', path: `/package/${PACKAGE_ID}/ftp/unlock` }
    ];

    for (const c of candidates) {
        console.log(`\nTesting ${c.method} ${c.path} ` + (c.body ? JSON.stringify(c.body) : ""));
        try {
            const res = await fetch(API_Base + c.path, {
                method: c.method,
                headers,
                body: c.body ? JSON.stringify(c.body) : undefined
            });
            console.log(`Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log(`Response: ${text.substring(0, 300)}`);

            if (res.ok) {
                console.log("!!! SUCCESS !!! Found working endpoint.");
                break;
            }
        } catch (e: any) {
            console.error(e.message);
        }
    }
}

testUnlock();
