import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const IP_VAULT_DATA = {
    'lead_scoring_v1': {
        name: 'Lead Scoring Algorithm v1',
        active: true,
        version: '1.0.0',
        logic: {
            factors: [
                { id: 'has_website', weight: 0.3, condition: 'equals', value: false },
                { id: 'reviews_count', weight: 0.2, condition: 'greater_than', value: 10 },
                { id: 'rating', weight: 0.2, condition: 'less_than', value: 4.0 },
                { id: 'competitor_density', weight: 0.3, condition: 'high' }
            ],
            threshold: 0.7
        },
        description: 'Proprietary scoring model for high-value plumbing leads.'
    },
    'content_gen_v1': {
        name: 'SEO Content Generator v1',
        active: true,
        version: '1.0.0',
        prompts: {
            landing_page: "Generate a high-conversion landing page for {{service}} in {{city}}...",
            blog_post: "Write a 500-word blog post about {{topic}} for local SEO..."
        },
        constraints: {
            keyword_density: '2%',
            reading_level: 'Grade 8'
        }
    },
    'market_analysis_v1': {
        name: 'Market Saturation Logic v1',
        active: true,
        version: '1.0.0',
        heuristics: [
            "If > 5 competitors with > 4.5 rating, market is saturated.",
            "If CPC > $50, skip unless rigorous qualification."
        ]
    }
};

async function initVault() {
    console.log("Initializing BrandLift IP Vault...");

    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error("❌ ERROR: FIREBASE_SERVICE_ACCOUNT not found in .env.local.");
        // ...
        process.exit(1);
    }

    if (!getApps().length) {
        try {
            initializeApp({
                credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
        } catch (e) {
            console.error("Failed to parse Service Account JSON", e);
            process.exit(1);
        }
    }

    const db = getFirestore();
    const batch = db.batch();
    const vaultRef = db.collection('brandlift_ip_vault');

    for (const [id, data] of Object.entries(IP_VAULT_DATA)) {
        const docRef = vaultRef.doc(id);
        batch.set(docRef, { ...data, lastUpdated: new Date() }, { merge: true });
        console.log(`Prepared: ${data.name} (${id})`);
    }

    try {
        await batch.commit();
        console.log("✅ BrandLift IP Vault Successfully Initialized!");
    } catch (error) {
        console.error("❌ Error initializing Vault:", error);
        process.exit(1);
    }
}

initVault();
