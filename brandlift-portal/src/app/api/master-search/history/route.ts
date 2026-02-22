import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
        }

        const snapshot = await db.collection('search_history')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get()

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure timestamp is string
            timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        }))

        return NextResponse.json(history)
    } catch (error) {
        console.error("History fetch failed", error)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
