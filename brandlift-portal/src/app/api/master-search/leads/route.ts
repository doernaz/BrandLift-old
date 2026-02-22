import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const historyId = searchParams.get('id')

    if (!historyId) {
        return NextResponse.json({ error: 'Missing history id' }, { status: 400 })
    }

    if (!db) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    try {
        const snapshot = await db.collection('brandlift_leads')
            .where('searchHistoryId', '==', historyId)
            .get()

        const leads = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                // Ensure dates are strings
                harvestedAt: data.harvestedAt?.toDate?.()?.toISOString() || null,
                // Map new lean schema back to UI expectation
                displayName: { text: data.company_name || 'Unknown' },
                formattedAddress: data.location || data.address || 'Unknown',
                nationalPhoneNumber: data.business_phone || null,
                internationalPhoneNumber: data.business_phone || null,
                websiteUri: data.website_url || null,
                rating: 0, // No longer stored
                userRatingCount: 0 // No longer stored
            }
        })

        // Sort in memory to avoid index requirements
        leads.sort((a, b) => {
            if (!a.harvestedAt) return 1;
            if (!b.harvestedAt) return -1;
            return b.harvestedAt.localeCompare(a.harvestedAt);
        })

        return NextResponse.json(leads)
    } catch (error) {
        console.error("Leads fetch failed", error)
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}
