
"use client"

import * as React from "react"
import { SocialScannerTile } from "@/components/brandlift/social-scanner-tile"

export default function TestScannerPage() {
    return (
        <div className="min-h-screen bg-black p-8 font-sans text-white">
            <h1 className="text-2xl font-bold mb-8">Social Scanner Test Environment</h1>
            <p className="mb-8 text-zinc-400">Isolated Test Bed for Signal Discovery Module</p>

            <SocialScannerTile />
        </div>
    )
}
