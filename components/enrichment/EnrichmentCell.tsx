import React from 'react';
import { EnrichButton } from './EnrichButton';

interface EnrichmentCellProps {
    email?: string | null;
    leadId: string;
}

export const EnrichmentCell: React.FC<EnrichmentCellProps> = ({ email, leadId }) => {
    if (email) {
        return <a href={`mailto:${email}`} className="text-neon-mint hover:underline">{email}</a>;
    }

    return <EnrichButton leadId={leadId} />;
};
