
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { AntigravityJob } from '@/lib/types/job'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { industry, location } = body

        if (!industry || !location) {
            return NextResponse.json(
                { error: 'Missing required params: industry, location' },
                { status: 400 }
            )
        }

        if (!db) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            )
        }

        const jobData: Omit<AntigravityJob, 'id'> = {
            status: 'pending',
            industry,
            location,
            strategy: 'generic',
            goldMineFilter: body.goldMineFilter || 'all',
            platforms: body.platforms || ['google_maps'],
            progress: 0,
            logs: ['Job initialized via API'],
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // 1. Create Job Record in Firestore (Source of Truth)
        const docRef = await db.collection('antigravity_jobs').add(jobData)

        // 2. Trigger Background Processing
        import('@/lib/server/services/antigravity-core').then(mod => {
            mod.runAntigravityProtocol(
                docRef.id,
                industry,
                location,
                body.mode || 'test',
                'generic', // Strategy deprecated
                parseInt(body.limit || "50", 10),
                body.auditorId === 'auto' ? undefined : body.auditorId,
                body.goldMineFilter || 'all',
                body.platforms || ['google_maps'],
                body.websiteFilter || 'all'
            ).catch(err => {
                console.error('Background Process Error:', err)
            })
        })

        // 3. Return the Job ID immediately so the UI can poll/subscribe
        return NextResponse.json({
            success: true,
            jobId: docRef.id,
            message: 'Antigravity Protocol Initiated',
            timestamp: new Date().toISOString()
        })

    } catch (error: unknown) {
        console.error('[Antigravity API] Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
