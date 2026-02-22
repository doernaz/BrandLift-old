
import { db } from "../lib/firebase-admin";

async function run() {
    if (!db) { console.error("DB init failed"); return; }

    // Check main domain
    const slugs = ["lifecare-chiropractic", "chandler-chiropractic"];

    for (const slug of slugs) {
        const domain = `${slug}.brandlift.ai`;
        console.log(`Checking ${domain}...`);

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
        console.log("---");
    }
}

run().catch(console.error);
