
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let id: string | undefined
    try {
        const resolvedParams = await params
        id = resolvedParams.id

        if (!id) {
            return NextResponse.json({ error: 'Missing Job ID' }, { status: 400 })
        }

        if (!db) {
            return NextResponse.json({ error: 'Database Unavailable' }, { status: 500 })
        }

        const docRef = db.collection('antigravity_jobs').doc(id)
        const doc = await docRef.get()

        if (!doc.exists) {
            return NextResponse.json({ error: 'Job Not Found' }, { status: 404 })
        }

        const job = doc.data()

        if (!job || !job.result || !job.result.topCandidate || !job.result.seoAudit) {
            return NextResponse.json({ error: 'Job is not ready for Identity Generation (Audit missing)' }, { status: 400 })
        }

        // Update Status Synchronously to prevent UI race condition
        await db.collection('antigravity_jobs').doc(id).update({ status: 'generating_identity' })

        // Trigger Background Processing (Fire and Forget)
        import('@/lib/server/services/antigravity-core').then(mod => {
            mod.runIdentityGenerationPhase(id!, job.industry, job.location, job.result.topCandidate.displayName.text, job.result.seoAudit).catch(err => {
                console.error('Background Process Error:', err)
            })
        })

        return NextResponse.json({ success: true, message: 'Identity Generation Initiated' })

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : String(error)
        console.error(`[Job ${id || 'unknown'}] Identity Gen Error:`, error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: errMessage },
            { status: 500 }
        )
    }
}
