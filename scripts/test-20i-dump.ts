
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_Base = 'https://api.20i.com';
const PACKAGE_ID = '3576473';

async function dumpPackage() {
    if (!process.env.TWENTYI_API_KEY) { console.error("Missing Key"); return; }
    const generalKey = process.env.TWENTYI_API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const headers = { 'Authorization': `Bearer ${encodedKey}`, 'Content-Type': 'application/json' };

    console.log(`Inspecting Package Web Service: ${PACKAGE_ID}`);
    try {
        const resWeb = await fetch(`${API_Base}/package/${PACKAGE_ID}/web`, { headers });
        if (resWeb.ok) {
            const webData = await resWeb.json();
            console.log("\n--- FTP Credentials ---");
            console.log(JSON.stringify(webData.ftp_credentials, null, 2));

            console.log("\n--- FTP Users ---");
            console.log(JSON.stringify(webData.ftpUsers, null, 2));

            // Also check 'lock' status in webData if available
            console.log("\n--- Full Web Data (Truncated) ---");
            const trunc = { ...webData };
            delete trunc.defaultHtml; // big
            delete trunc.logs;
            // console.log(JSON.stringify(trunc, null, 2));
        } else {
            console.error("Failed to fetch /web info");
        }
    } catch (e) {
        console.error(e);
    }
}
dumpPackage();
