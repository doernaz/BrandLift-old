
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_Base = 'https://api.20i.com';
const PACKAGE_ID = '3576473'; // Newest failed package

async function testFtpUser() {
    if (!process.env.TWENTYI_API_KEY) { console.error("Missing Key"); return; }
    const generalKey = process.env.TWENTYI_API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const headers = { 'Authorization': `Bearer ${encodedKey}`, 'Content-Type': 'application/json' };

    // Goal: Create a working FTP user or reset main password
    const testPass = 'BrandLift2026!';

    const attempts = [
        // 1. Create sub-user
        { m: 'POST', u: `/package/${PACKAGE_ID}/web/ftpUser`, b: { name: 'deploy', password: testPass } },
        // 2. Create sub-user (plural)
        { m: 'POST', u: `/package/${PACKAGE_ID}/web/ftp-users`, b: { user: 'deploy', password: testPass } },
        // 3. Update main package password
        { m: 'POST', u: `/package/${PACKAGE_ID}`, b: { password: testPass } },
        // 4. Update main package (reseller route)
        { m: 'POST', u: `/reseller/package/${PACKAGE_ID}`, b: { password: testPass } },
    ];

    for (const a of attempts) {
        console.log(`\nTesting ${a.m} ${a.u} ...`);
        try {
            const res = await fetch(API_Base + a.u, { method: a.m, headers, body: JSON.stringify(a.b) });
            console.log(`Status: ${res.status}`);
            console.log(`Response: ${await res.text()}`);
        } catch (e) { console.error(e); }
    }
}

testFtpUser();
