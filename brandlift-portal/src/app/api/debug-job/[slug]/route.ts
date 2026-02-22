
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!db) {
        return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });
    }

    const domainQuery = `${slug}.brandlift.ai`;

    try {
        const snapshot = await db.collection("antigravity_jobs")
            .where("result.domain", "==", domainQuery)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({
                error: 'Not Found',
                query: domainQuery,
                message: `No job found for ${domainQuery}`
            }, { status: 404 });
        }

        const data = snapshot.docs[0].data();
        return NextResponse.json({
            found: true,
            jobId: snapshot.docs[0].id,
            status: data.status,
            progress: data.progress,
            logs: data.logs,
            result: data.result
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
