
import "server-only"
import { db, FieldValue } from "@/lib/firebase-admin"
import { GenericAuditor, AntigravityJob, AuditStatus } from "@/lib/types/job"

export async function createAuditor(name: string, email: string) {
    if (!db) return
    try {
        await db.collection("auditors").add({
            name,
            email,
            active: true,
            assignedCount: 0,
            createdAt: new Date()
        })
    } catch (e) {
        console.error("Failed to create auditor", e)
        throw e
    }
}

export async function getAuditors(): Promise<GenericAuditor[]> {
    if (!db) return []
    const snapshot = await db.collection("auditors").where("active", "==", true).get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GenericAuditor))
}

export async function getJobsPendingAssignment(): Promise<AntigravityJob[]> {
    if (!db) return []
    // Get completed jobs that have no auditorId
    const snapshot = await db.collection("antigravity_jobs")
        .where("status", "==", "completed")
        // Note: Firestore queries with "not-equal" or "missing" can be tricky.
        // For simplicity in this prototype, we'll fetch completed jobs and filter in memory if auditorId is missing.
        // A better index would allow .where("auditorId", "==", null) but that requires specific indexing.
        .orderBy("createdAt", "desc")
        .limit(50)
        .get()

    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AntigravityJob))
        .filter(job => !job.auditorId && job.result?.identity) // Only assign if identity is generated
}

export async function getJobsForAuditor(auditorId: string): Promise<AntigravityJob[]> {
    if (!db) return []
    const snapshot = await db.collection("antigravity_jobs")
        .where("auditorId", "==", auditorId)
        .orderBy("createdAt", "desc")
        .get()

    return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id,
            ...data,
            // Safe date conversion
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as AntigravityJob
    })
}

export async function assignJobsToAuditor(jobIds: string[], auditorId: string) {
    if (!db) return
    const batch = db.batch()

    // Increment assignment count
    // Increment assignment count
    const auditorRef = db.collection("auditors").doc(auditorId)
    batch.update(auditorRef, { assignedCount: FieldValue.increment(jobIds.length) })

    // Update jobs
    const jobsRef = db.collection("antigravity_jobs")
    jobIds.forEach(id => {
        const jobRef = jobsRef.doc(id)
        batch.update(jobRef, {
            auditorId,
            auditStatus: 'assigned',
            updatedAt: new Date()
        })
    })

    await batch.commit()
}

export async function updateAuditStatus(jobId: string, status: AuditStatus, issues: string[] = [], emailDraft?: string) {
    if (!db) return
    await db.collection("antigravity_jobs").doc(jobId).update({
        auditStatus: status,
        auditIssues: issues,
        emailDraft: emailDraft || null,
        updatedAt: new Date()
    })
}
