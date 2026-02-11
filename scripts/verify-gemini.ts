import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    console.log("--- Gemini Key Diagnostics ---");
    console.log(`Key Present: ${!!key}`);
    console.log(`Key Length: ${key ? key.length : 0}`);
    console.log(`Key Start: ${key ? key.substring(0, 4) : 'N/A'}`);

    if (!key) {
        console.error("ERROR: GEMINI_API_KEY is missing in process.env");
        return;
    }

    try {
        console.log("Attempting Simple Generation...");
        const client = new GoogleGenAI({ apiKey: key });
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        });
        console.log("SUCCESS! API responded.");
        console.log("Response Preview:", response.text ? response.text.substring(0, 50) : "No text");
    } catch (e: any) {
        console.error("API Call Failed:", e.message);
        if (e.status) console.error("Status:", e.status);
        if (e.errorDetails) console.error("Details:", JSON.stringify(e.errorDetails, null, 2));
    }
}

verify();
