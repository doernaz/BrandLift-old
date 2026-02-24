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
            className="flex items-center gap-1.5 text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md transition-all border border-slate-700 hover:border-slate-600 shadow-sm"
            aria-label="Request email enrichment"
        >
            <Zap size={14} className="text-yellow-500" />
            Enrich Email
        </button>
    );
};
