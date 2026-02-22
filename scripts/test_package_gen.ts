
// using global fetch
import fs from 'fs';

const TARGET_URL = 'http://localhost:3010/api/generate-package';

const DUMMY_LEAD = {
    displayName: { text: "Test Auto Detailing" },
    primaryTypeDisplayName: { text: "Auto Detailing" },
    formattedAddress: "123 Main St, Nashville, TN",
    nationalPhoneNumber: "(615) 555-0123",
    websiteUri: "http://example.com"
};

async function testGeneration() {
    console.log(`Testing POST to ${TARGET_URL}...`);
    try {
        const res = await fetch(TARGET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead: DUMMY_LEAD })
        });

        console.log(`Status: ${res.status} ${res.statusText}`);

        const text = await res.text();

        if (!res.ok) {
            console.error('Error Response:', text);
            return;
        }

        try {
            const data = JSON.parse(text);
            console.log('Response JSON keys:', Object.keys(data));

            if (data.html) {
                console.log(`HTML Length: ${data.html.length} chars`);
                console.log(`HTML Preview (first 100 chars): ${data.html.substring(0, 100)}...`);

                fs.writeFileSync('test_package_output.html', data.html);
                console.log('Saved output to test_package_output.html');
            } else {
                console.error('No HTML field in response!');
                console.log('Full Response:', data);
            }

        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            console.log('Raw Response:', text);
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testGeneration();
