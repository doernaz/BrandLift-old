
"use server"

import { revalidatePath } from "next/cache"
import { createAuditor, assignJobsToAuditor, updateAuditStatus } from "@/lib/server/services/auditor-service"
import { AuditStatus } from "@/lib/types/job"

export async function addAuditorAction(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    if (!name || !email) {
        throw new Error("Missing fields")
    }

    await createAuditor(name, email)
    revalidatePath('/dashboard/admin')
}

export async function assignJobsAction(jobIds: string[], auditorId: string) {
    if (!auditorId || jobIds.length === 0) return
    await assignJobsToAuditor(jobIds, auditorId)
    revalidatePath('/dashboard/admin')
}

export async function updateAuditStatusAction(jobId: string, status: AuditStatus, issues: string[] = []) {
    await updateAuditStatus(jobId, status, issues)
    revalidatePath('/dashboard') // Or specific auditor page
}
