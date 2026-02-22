
import "server-only"
import { db } from "@/lib/firebase-admin"
import { AntigravityJob } from "@/lib/types/job"

export async function getRecentJobs(limit = 10): Promise<AntigravityJob[]> {
    if (!db) return []

    try {
        const snapshot = await db.collection("antigravity_jobs")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get()

        if (snapshot.empty) return []

        return snapshot.docs.map(doc => {
            const data = doc.data()
            // Fix date serialization for client components if needed
            // Currently assuming we might need to convert Timestamp to Date or ISO string
            // But for server component rendering, we can pass plain objects if structured correctly
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
            } as AntigravityJob
        })
    } catch (error) {
        console.error("Failed to fetch recent jobs", error)
        return []
    }
}
