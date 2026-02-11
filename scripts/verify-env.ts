import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const checks: Record<string, (val: string) => boolean> = {
    GEMINI_API_KEY: (val) => val.startsWith('AIza') && val.length > 30,
    STRIPE_SECRET_KEY: (val) => val.startsWith('sk_'),
    TWENTYI_API_KEY: (val) => val.length > 10,
    FIREBASE_SERVICE_ACCOUNT: (val) => val.length > 10 // Likely a JSON string or path
};

console.log("--- Environment Health Check ---");
let issues = 0;

for (const [key, validator] of Object.entries(checks)) {
    const val = process.env[key];
    if (!val) {
        console.log(`❌ ${key}: MISSING`);
        issues++;
        continue;
    }

    if (val.startsWith("PLAC") || val.includes("PLACEHOLDER") || val === "your_api_key_here") {
        console.log(`❌ ${key}: PLACEHOLDER DETECTED`);
        issues++;
        continue;
    }

    if (!validator(val)) {
        console.log(`⚠️ ${key}: FORMAT WARNING (Val: ${val.substring(0, 4)}..., Length: ${val.length})`);
        // Not counting as issue, just warning
    } else {
        console.log(`✅ ${key}: OK`);
    }
}

if (issues === 0) {
    console.log("\nAll checked keys appear valid.");
} else {
    console.log(`\nFound ${issues} issue(s). Action required.`);
}
