import dotenv from 'dotenv';
import { twentyiService } from '../services/twentyiService.js';

dotenv.config({ path: '.env.local' });

const API_Base = 'https://api.20i.com';

async function explore() {
    if (!process.env.TWENTYI_API_KEY) {
        console.error("Missing KEY");
        return;
    }

    const packageId = '3576717';
    const generalKey = process.env.TWENTYI_API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const headers = {
        'Authorization': `Bearer ${encodedKey}`,
        'Content-Type': 'application/json'
    };

    console.log(`Probing FTP User Resources for Package ${packageId}...`);

    try {
        // 1. Get Web Object to find FTP User ID
        const webRes = await fetch(`${API_Base}/package/${packageId}/web`, { headers });
        const webData = await webRes.json();

        if (!webData.ftpUsers || webData.ftpUsers.length === 0) {
            console.log("No FTP Users found.");
            return;
        }

        const user = webData.ftpUsers[0];
        console.log("Target FTP User:", user);

        const candidateUrls = [
            `${API_Base}/package/${packageId}/web/ftpUser/${user.Id}`,           // Case 1
            `${API_Base}/package/${packageId}/web/ftpUsers/${user.Id}`,          // Case 2
            `${API_Base}/package/${packageId}/web/ftpUser/${user.Username}`,     // Case 3
            `${API_Base}/package/${packageId}/web/ftp/${user.Username}`          // Case 4
        ];

        for (const url of candidateUrls) {
            console.log(`\nProbing GET ${url}...`);
            const res = await fetch(url, { headers });
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log("SUCCESS! Resource Keys:", Object.keys(data));
                // console.log(JSON.stringify(data, null, 2));

                // If this is the resource, does it have an unlock link/method?
                // Or maybe we can POST /unlock to it?
                console.log("Attempting POST /unlock on this resource...");
                const unlockRes = await fetch(`${url}/unlock`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ ip: '8.8.8.8' }) // Dummy IP
                });
                console.log(`POST .../unlock Status: ${unlockRes.status}`);
                if (unlockRes.ok) console.log("UNLOCK ENDPOINT CONFIRMED!");
                else console.log("Unlock Error:", await unlockRes.text());

                break;
            }
        }

    } catch (e) {
        console.error(e);
    }
}

explore();
