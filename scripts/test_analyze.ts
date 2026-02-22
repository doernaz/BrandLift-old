
import fetch from 'node-fetch';

const targetUrl = 'https://orthopedicsportstherapy.com/';
console.log(`Testing /api/analyze for ${targetUrl}...`);

try {
    const response = await fetch(`http://localhost:3001/api/analyze?url=${encodeURIComponent(targetUrl)}`);
    console.log(`Status: ${response.status}`);

    if (response.ok) {
        const data = await response.json();
        console.log('Analysis Result:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } else {
        const error = await response.text();
        console.error('Error:', error);
    }
} catch (err) {
    console.error('Request Failed:', err);
}
