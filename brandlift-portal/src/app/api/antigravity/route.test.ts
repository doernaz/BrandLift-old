
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Use vi.hoisted to ensure mocks are initialized before vi.mock()
const { mockAdd, mockCollection } = vi.hoisted(() => {
    return {
        mockAdd: vi.fn(),
        mockCollection: vi.fn()
    }
})

vi.mock('@/lib/firebase-admin', () => ({
    initAdmin: vi.fn(),
    db: {
        collection: mockCollection
    }
}))

// Setup the chain: collection() -> { add() }
mockCollection.mockReturnValue({ add: mockAdd })

describe('POST /api/antigravity', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('creates a job and returns 200 on valid input', async () => {
        const req = new NextRequest('http://localhost/api/antigravity', {
            method: 'POST',
            body: JSON.stringify({ industry: 'HVAC', location: 'Phoenix' })
        })

        mockAdd.mockResolvedValueOnce({ id: 'job-123' })

        const res = await POST(req)
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.jobId).toBe('job-123')
        expect(mockCollection).toHaveBeenCalledWith('antigravity_jobs')
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
            industry: 'HVAC',
            location: 'Phoenix',
            status: 'pending'
        }))
    })

    it('returns 400 on missing params', async () => {
        const req = new NextRequest('http://localhost/api/antigravity', {
            method: 'POST',
            body: JSON.stringify({ industry: 'HVAC' }) // Missing location
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
    })
})
