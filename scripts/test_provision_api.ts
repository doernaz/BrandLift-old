
async function testApiProvision() {
    console.log("Testing Provision API...");
    const url = 'http://localhost:3001/api/deploy/provision';

    const body = {
        domain: 'api-test-v11.com',
        blueprintId: 'wp-starter',
        clientId: 'test-client-api-v11',
        clientSlug: 'apitest-v11',
        htmlContent: '<div style="background:#eee;padding:20px;"><h2>Reimagined Content V11</h2><p>This is injected content.</p></div>'
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log("API Response:", JSON.stringify(data, null, 2));

        if (data.success && data.url.includes('nip.io')) {
            console.log("SUCCESS: Deployment URL returned correctly.");
        } else {
            console.error("FAILURE: Unexpected response.");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testApiProvision();
