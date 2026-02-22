import { db } from "../lib/firebase-admin";

async function checkJob() {
    if (!db) {
        console.error("DB not initialized");
        return;
    }
    const slug = "emerald-harvest-consulting";
    const domainQuery = `${slug}.brandlift.ai`;
    console.log("Querying for:", domainQuery);
    
    const snapshot = await db.collection("antigravity_jobs")
        .where("result.domain", "==", domainQuery)
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log("No job found for domain.");
    } else {
        console.log("Job found:", snapshot.docs[0].id);
        console.log("Data:", JSON.stringify(snapshot.docs[0].data().result, null, 2));
    }
}

checkJob();
