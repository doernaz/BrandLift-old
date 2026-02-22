
import { db } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { processSingleCandidate } from "@/lib/server/services/antigravity-core"

export const maxDuration = 60

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })

    const jobId = (await params).id
    const { candidateIndex } = await req.json()

    if (candidateIndex === undefined) {
        return NextResponse.json({ error: 'Missing candidateIndex' }, { status: 400 })
    }

    try {
        const docRef = db.collection('antigravity_jobs').doc(jobId)
        const jobDoc = await docRef.get()

        if (!jobDoc.exists) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        const job = jobDoc.data()

        if (job?.status !== 'awaiting_selection') {
            return NextResponse.json({ error: 'Job is not awaiting selection' }, { status: 400 })
        }

        const candidates = job.result?.candidates || []
        const selectedCandidate = candidates[candidateIndex]

        if (!selectedCandidate) {
            return NextResponse.json({ error: 'Invalid candidate index' }, { status: 400 })
        }

        // Set status synchronously to start the UI spinner
        await docRef.update({
            status: 'analyzing',
            progress: 0,
            result: {
                ...job.result,
                topCandidate: selectedCandidate // Lock in the choice
            },
            logs: [...(job.logs || []), `User selected candidate: ${selectedCandidate.displayName.text}`]
        })

        // Fire and forget background process
        // We simulate the next steps: Gemini Analysis + Identity Generation (if in Prod mode)
        // Since processSingleCandidate is async, we call it without await to return quickly? Or with await + maxDuration?
        // Given Vercel limits, we should trigger it. `antigravity-core` functions are designed to update progress.

        // Note: processSingleCandidate takes (jobId, vacuum, industry, location, mode, auditorId)

        // We execute it in background (no await) to avoid timeout on Vercel hobby if strict. 
        // But for consistency let's try to await or at least catch errors.
        processSingleCandidate(
            jobId,
            selectedCandidate,
            job.industry,
            job.location,
            'prod', // Force prod mode to proceed directly to Identity Gen if desired? Or keep job.mode?
            // Let's stick to 'prod' for full autonomous flow per user request ("Autonomous Mode")
            // Or better, respect job.mode if it was set to 'prod' or 'test'. 
            // The runAntigravityProtocol usually defaults mode='test'. 
            // User requested "Always use Autonomous Mode". So let's force 'prod' effectively.
            job.auditorId
        ).catch(err => console.error("Background processing failed", err))

        return NextResponse.json({ success: true, message: 'Processing initiated for selected candidate.' })

    } catch (error: any) {
        console.error("Selection API Error", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
