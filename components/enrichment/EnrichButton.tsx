import React from 'react';
import { Zap } from 'lucide-react';

export const EnrichButton: React.FC<{ leadId: string }> = ({ leadId }) => {
    const handleEnrich = () => {
        // Placeholder for future enrichment logic
        console.log(`Enrichment requested for lead: ${leadId}`);
        alert('Email enrichment is a premium feature. Contact sales@brandlift.ai to upgrade.');
    };

    return (
        <button
            onClick={handleEnrich}
            className="flex items-center gap-1.5 text-xs font-roboto-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded-sm transition-colors"
            aria-label="Request email enrichment"
        >
            <Zap size={14} className="text-yellow-400" />
            Enrich Email
        </button>
    );
};
