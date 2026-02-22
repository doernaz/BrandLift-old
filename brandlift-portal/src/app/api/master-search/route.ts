
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { AntigravityJob } from '@/lib/types/job'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { state, industry, mode, websiteFilter, limit } = body

        if (!state || !industry || !mode) {
            return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
        }

        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
        }

        // --- LOGIC GATE ---
        if (mode === 'production') {
            const existing = await db.collection('search_history')
                .where('state', '==', state)
                .where('industry', '==', industry)
                .where('mode', '==', 'production')
                .limit(1)
                .get()

            if (!existing.empty) {
                return NextResponse.json(
                    { error: 'Sector already harvested', details: 'Historical check failed. Sector active in production.' },
                    { status: 409 }
                )
            }
        } else if (mode === 'test') {
            // WIPE PREVIOUS TEST HISTORY
            try {
                const snapshot = await db.collection('search_history')
                    .where('mode', '==', 'test')
                    .get()

                if (!snapshot.empty) {
                    const batch = db.batch()
                    snapshot.docs.forEach(doc => {
                        batch.delete(doc.ref)
                    })
                    await batch.commit()
                }
            } catch (err) {
                console.warn("Failed to wipe test history", err)
            }
        }

        // --- LAUNCH PROTOCOLS ---

        // Define Blocks with User Filter Override
        const appliedFilter = websiteFilter || 'all'

        let blocks = []

        if (industry === "Auto Body") {
            blocks = [
                {
                    name: 'BLOCK A (Specialty)',
                    pivots: [`Unclaimed Auto Body ${state}`, `Auto Restoration ${state}`, `Luxury Auto Body ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK B (Commercial)',
                    pivots: [`Fleet Repair ${state}`, `Commercial Truck Body ${state}`, `Fleet Auto Body ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK C (Volume)',
                    pivots: [`Auto Body ${state}`, `Collision Repair ${state}`],
                    websiteFilter: appliedFilter
                }
            ]
        } else if (industry === "Caretaker") {
            blocks = [
                {
                    name: 'BLOCK A (Specialty)',
                    pivots: [`Private Duty Caretaker ${state}`, `Live-in Caregiver ${state}`, `Luxury Home Care ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK B (Commercial)',
                    pivots: [`Medical Staffing Agency ${state}`, `Nurse Registry ${state}`, `Care Facility Staffing ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK C (Volume)',
                    pivots: [`Caregiver ${state}`, `Home Health Aide ${state}`, `Elder Care ${state}`],
                    websiteFilter: appliedFilter
                }
            ]
        } else if (industry === "Fleet Repair") {
            blocks = [
                {
                    name: 'BLOCK A (Specialty)',
                    pivots: [`Emergency Roadside Assistance ${state}`, `Mobile Diesel Mechanic ${state}`, `Heavy Duty Towing ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK B (Commercial)',
                    pivots: [`Fleet Maintenance ${state}`, `Commercial Truck Center ${state}`, `Logistics Support ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK C (Volume)',
                    pivots: [`Diesel Repair ${state}`, `Truck Repair ${state}`, `Trailer Repair ${state}`],
                    websiteFilter: appliedFilter
                }
            ]
        } else if (industry === "Custom Restoration") {
            blocks = [
                {
                    name: 'BLOCK A (Specialty)',
                    pivots: [`Classic Car Restoration ${state}`, `Vintage Auto Repair ${state}`, `Concours Preparation ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK B (Commercial)',
                    pivots: [`Custom Fabrication ${state}`, `Auto Upholstery ${state}`, `Custom Paint Shop ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK C (Volume)',
                    pivots: [`Hot Rod Shop ${state}`, `Restomod Builder ${state}`, `Muscle Car Repair ${state}`],
                    websiteFilter: appliedFilter
                }
            ]
        } else if (industry === "HVAC") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Emergency AC Repair ${state}`, `High Efficiency HVAC ${state}`, `Geothermal Heating ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial HVAC ${state}`, `Chiller Repair ${state}`, `Industrial Ventilation ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`AC Repair ${state}`, `Heating Service ${state}`, `Furnace Repair ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "Plumbing") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Emergency Plumber ${state}`, `Luxury Bath Remodel ${state}`, `Tankless Water Heater ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial Plumbing ${state}`, `Backflow Testing ${state}`, `Industrial Piping ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`Plumber ${state}`, `Drain Cleaning ${state}`, `Water Heater Repair ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "Roofing") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Slate Roofing ${state}`, `Tile Roofing ${state}`, `Luxury Roofing ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial Roofing ${state}`, `Flat Roof Repair ${state}`, `Industrial Roofing ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`Roof Replacement ${state}`, `Roof Leaks ${state}`, `Shingle Roofing ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "Landscaping") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Luxury Landscape Design ${state}`, `Hardscaping ${state}`, `Pool Landscaping ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial Landscaping ${state}`, `HOA Maintenance ${state}`, `Campus Maintenance ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`Lawn Care ${state}`, `Tree Service ${state}`, `Irrigation Repair ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "Electrician") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Emergency Electrician ${state}`, `Smart Home Installation ${state}`, `Luxury Lighting ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial Electrician ${state}`, `Industrial Wiring ${state}`, `Generator Installation ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`Electrician ${state}`, `Panel Upgrade ${state}`, `Electrical Repair ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "General Contractor") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Luxury Home Builder ${state}`, `Custom Home Builder ${state}`, `Historic Renovation ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial General Contractor ${state}`, `Tenant Improvement ${state}`, `Industrial Construction ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`General Contractor ${state}`, `Home Remodeling ${state}`, `Kitchen Remodel ${state}`], websiteFilter: appliedFilter }
            ]
        } else if (industry === "Pool Service") {
            blocks = [
                { name: 'BLOCK A (Specialty)', pivots: [`Luxury Pool Builder ${state}`, `Custom Pool Design ${state}`, `Infinity Pool ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK B (Commercial)', pivots: [`Commercial Pool Service ${state}`, `Hotel Pool Maintenance ${state}`, `Community Pool Service ${state}`], websiteFilter: appliedFilter },
                { name: 'BLOCK C (Volume)', pivots: [`Pool Service ${state}`, `Pool Repair ${state}`, `Pool Cleaning ${state}`], websiteFilter: appliedFilter }
            ]
        } else {
            // Fallback Generic
            blocks = [
                {
                    name: 'BLOCK A (Specialty)',
                    pivots: [`Best ${industry} ${state}`, `Luxury ${industry} ${state}`, `Specialty ${industry} ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK B (Commercial)',
                    pivots: [`Commercial ${industry} ${state}`, `Industrial ${industry} ${state}`, `${industry} Fleet ${state}`],
                    websiteFilter: appliedFilter
                },
                {
                    name: 'BLOCK C (Volume)',
                    pivots: [`${industry} ${state}`, `${industry} Services ${state}`, `Local ${industry} ${state}`],
                    websiteFilter: appliedFilter
                }
            ]
        }


        const launches = []

        for (const block of blocks) {
            // 1. Create History Record (Pending)
            const historyRef = await db.collection('search_history').add({
                state,
                industry,
                block: block.name,
                count: 0,
                status: 'running',
                mode,
                timestamp: new Date()
            })

            // 2. Create Job Record
            const jobData: Omit<AntigravityJob, 'id'> = {
                status: 'pending',
                industry,
                location: state,
                strategy: 'master_search',
                goldMineFilter: 'all', // can be customized
                platforms: ['google_maps'],
                progress: 0,
                logs: [`Master Search Block Initialized: ${block.name}`],
                createdAt: new Date(),
                updatedAt: new Date()
            }
            const jobRef = await db.collection('antigravity_jobs').add(jobData)

            // 3. Trigger Core
            // Use dynamic import to attempt detached execution (local dev friendly)
            launches.push(
                import('@/lib/server/services/antigravity-core').then(mod => {
                    mod.runAntigravityProtocol(
                        jobRef.id,
                        industry,
                        state,
                        mode === 'production' ? 'prod' : 'test',
                        'generic',
                        limit || 50, // Limit per block
                        undefined, // auto auditor
                        'all', // goldMine
                        ['google_maps'],
                        block.websiteFilter,
                        block.pivots,
                        historyRef.id,
                        true // autoHarvest
                    ).catch(err => console.error(`Block ${block.name} failed`, err))
                })
            )
        }

        return NextResponse.json({
            success: true,
            message: `Alcubierre Drive Engaged: 3 Blocks Launched for ${industry} in ${state} (Filter: ${appliedFilter})`,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error("Master Search API Error", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
