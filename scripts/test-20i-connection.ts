import 'dotenv/config';

// Load .env.local manually since we are running this script directly
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const API_KEY = process.env.TWENTYI_API_KEY;
const API_BASE = 'https://api.20i.com';

async function testConnection() {
    console.log(`Testing with Full Key: ${API_KEY}`);

    if (!API_KEY) {
        console.error("No API KEY found");
        return;
    }

    const generalKey = API_KEY.split('+')[0];
    const encodedKey = Buffer.from(generalKey).toString('base64');
    const authHeader = `Bearer ${encodedKey}`;

    console.log(`Using Auth Header: ${authHeader.substring(0, 20)}...`);

    const endpoints = [
        '/package/3574679/web/ftpUser', // Try to list FTP users
        '/package/3574679/web/ftp-users',
        '/package/3574679/ftp'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n=== Testing GET ${endpoint} ===`);
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                const data = await res.json();
                console.log("Response (Full JSON):", JSON.stringify(data, null, 2));
                return;
            } else {
                const text = await res.text();
                console.log("Error Response:", text);
            }
        } catch (err: any) {
            console.error(`Error requesting ${endpoint}:`, err.message);
        }
    }
}

testConnection();
