
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const rawServiceAccount = process.env.BRANDLIFT_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT
const cleanServiceAccount = rawServiceAccount ? rawServiceAccount.replace(/^'|'$/g, "") : undefined

const serviceAccount = cleanServiceAccount
    ? JSON.parse(cleanServiceAccount)
    : undefined

const firebaseAdminConfig = {
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: serviceAccount?.project_id,
}

function initAdmin() {
    if (getApps().length <= 0) {
        if (!serviceAccount) {
            console.warn("BRANDLIFT_SERVICE_ACCOUNT not found in environment. Firebase Admin not initialized.")
            return null
        }
        return initializeApp(firebaseAdminConfig)
    }
    return getApps()[0]
}

const app = initAdmin();
const db = app ? getFirestore(app) : null;

async function run() {
    if (!db) { console.error("DB init failed"); return; }

    // Check main domain
    const slugs = ["lifecare-chiropractic", "chandler-chiropractic"];

    for (const slug of slugs) {
        const domain = `${slug}.brandlift.ai`;
        console.log(`Checking ${domain}...`);

        try {
            const snap = await db.collection("antigravity_jobs")
                .where("result.domain", "==", domain)
                .get();

            if (!snap.empty) {
                const data = snap.docs[0].data();
                console.log(`FOUND JOB: ${snap.docs[0].id}`);
                console.log(`STATUS: ${data.status}`);
                console.log(`HAS IDENTITY: ${!!data.result?.identity}`);
                console.log(`HAS VARIANTS: ${data.result?.variants?.length}`);
                console.log(`LOGS (last 3):`, data.logs?.slice(-3));
            } else {
                console.log("NOT FOUND by main domain.");

                // Check variants
                const snapV = await db.collection("antigravity_jobs")
                    .where("result.variantDomains", "array-contains", domain)
                    .get();

                if (!snapV.empty) {
                    console.log(`FOUND JOB via VARIANT: ${snapV.docs[0].id}`);
                } else {
                    console.log("Not found via variant either.");
                }
            }
        } catch (e) {
            console.error("Error querying db:", e);
        }
        console.log("---");
    }
}

run().catch(console.error);
