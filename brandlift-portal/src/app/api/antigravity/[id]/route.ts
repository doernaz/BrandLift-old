
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(
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

        const docSnapshot = await db.collection('antigravity_jobs').doc(id).get()

        if (!docSnapshot.exists) {
            return NextResponse.json({ error: 'Job Not Found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, ...docSnapshot.data() })

    } catch (error: unknown) {
        console.error(`[Job ${id || 'Unknown'}] Fetch Error:`, error)
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
