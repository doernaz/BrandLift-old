import React from 'react';
import type { Place } from '../../types';
import { FacebookIcon, LinkedInIcon, XIcon, InstagramIcon } from './icons/SocialIcons';
import { SparklesIcon } from '../icons/Icons';
import { Globe, Loader, CheckCircle } from 'lucide-react';
import { EnrichmentCell } from './EnrichmentCell';

interface ResultsTableProps {
    leads: Place[];
    onReimagine?: (target: string | Place) => void;
    reimaginingId?: string | null;
    reimagineSuccessId?: string | null;
}

const SocialIcon: React.FC<{ url: string }> = ({ url }) => {
    try {
        const domain = new URL(url).hostname.toLowerCase();
        let IconComponent = Globe;
        if (domain.includes('facebook.com')) IconComponent = FacebookIcon;
        if (domain.includes('linkedin.com')) IconComponent = LinkedInIcon;
        if (domain.includes('instagram.com')) IconComponent = InstagramIcon;
        if (domain.includes('x.com') || domain.includes('twitter.com')) IconComponent = XIcon;

        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neon-mint transition-colors inline-block" title={domain}>
                <IconComponent className="w-3 h-3" />
            </a>
        );
    } catch (error) {
        console.error("Invalid URL for social icon:", url);
        return null;
    }
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ leads, onReimagine, reimaginingId, reimagineSuccessId }) => {
    const [expandedReviewId, setExpandedReviewId] = React.useState<string | null>(null);

    const toggleReviews = (id: string) => {
        setExpandedReviewId(expandedReviewId === id ? null : id);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left font-roboto-mono text-sm">
                <thead className="text-neutral-400 border-b border-neon-mint/30">
                    <tr>
                        <th className="p-3 w-1/4">BUSINESS</th>
                        <th className="p-3 w-1/6">TYPE / RATING</th>
                        <th className="p-3 w-1/4">CONTACT</th>
                        <th className="p-3 w-1/4">LOCATION</th>
                        <th className="p-3 w-1/12 text-center">SOURCE</th>
                        <th className="p-3 w-1/12 text-center">LINKS</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => {
                        const isReimagining = reimaginingId === lead.id;
                        const isSuccess = reimagineSuccessId === lead.id;
                        return (
                            <React.Fragment key={lead.id}>
                                <tr className="border-b border-neutral-800 hover:bg-neutral-900/50">
                                    <td className="p-3 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neon-mint font-bold border border-neutral-700">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{lead.name}</div>
                                                <div className="flex gap-2 items-center mt-1">
                                                    {lead.businessStatus && lead.businessStatus !== 'OPERATIONAL' && (
                                                        <span className="text-[10px] text-red-400 font-bold bg-red-900/30 px-1 rounded">{lead.businessStatus}</span>
                                                    )}
                                                    {lead.reviews && lead.reviews.length > 0 && (
                                                        <button
                                                            onClick={() => toggleReviews(lead.id)}
                                                            className="text-[10px] text-neutral-400 hover:text-white underline decoration-dotted transition-colors"
                                                        >
                                                            {expandedReviewId === lead.id ? 'Hide Reviews' : `${lead.reviews.length} Reviews`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-neutral-300 truncate max-w-[150px]" title={lead.primaryType || ''}>
                                                {lead.primaryType ? lead.primaryType.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                                            </span>
                                            {lead.rating ? (
                                                <div className="flex items-center text-yellow-400 text-xs gap-1">
                                                    <span>★ {lead.rating}</span>
                                                    <span className="text-neutral-500">({lead.userRatingCount})</span>
                                                </div>
                                            ) : <span className="text-xs text-neutral-600">No Ratings</span>}
                                            {lead.priceLevel && <span className="text-xs text-green-400">{lead.priceLevel}</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="flex flex-col gap-1">
                                            {lead.phone ? (
                                                <a href={`tel:${lead.phone}`} className="text-neutral-300 hover:text-white transition-colors">{lead.phone}</a>
                                            ) : <span className="text-neutral-600">No Phone</span>}

                                            <EnrichmentCell email={lead.email} leadId={lead.id} />
                                        </div>
                                    </td>
                                    <td className="p-3 text-neutral-400 align-top text-xs">{lead.address || 'N/A'}</td>
                                    <td className="p-3 align-top text-center">
                                        <span className="text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 rounded px-1 py-0.5 inline-block whitespace-nowrap">
                                            GOOGLE PLACES
                                        </span>
                                    </td>
                                    <td className="p-3 align-top text-center">
                                        <div className="flex flex-col gap-2 items-center">
                                            {!lead.website ?
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-red-500 text-[10px] font-bold">NO WEB</span>
                                                    {onReimagine && (
                                                        <button
                                                            onClick={() => onReimagine(lead)}
                                                            disabled={isReimagining || isSuccess}
                                                            className={`text-[10px] px-2 py-0.5 rounded transition-all font-bold uppercase tracking-wide flex items-center justify-center gap-1 min-w-[90px] ${isSuccess
                                                                ? 'bg-green-900/20 text-green-400 border border-green-500/30'
                                                                : isReimagining
                                                                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-wait'
                                                                    : 'bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/40'
                                                                }`}
                                                        >
                                                            {isReimagining ? (
                                                                <>
                                                                    <Loader className="w-3 h-3 animate-spin" /> ANALYZING
                                                                </>
                                                            ) : isSuccess ? (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" /> COMPLETE
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <SparklesIcon className="w-3 h-3" /> REIMAGINE
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div> :
                                                <div className="flex flex-col items-center gap-1">
                                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-neon-mint hover:underline text-xs">WEBSITE</a>
                                                    {onReimagine && (
                                                        <button
                                                            onClick={() => onReimagine(lead.website!)}
                                                            disabled={isReimagining || isSuccess}
                                                            className={`text-[10px] px-2 py-0.5 rounded transition-all font-bold uppercase tracking-wide flex items-center justify-center gap-1 min-w-[90px] ${isSuccess
                                                                ? 'bg-green-900/20 text-green-400 border border-green-500/30'
                                                                : isReimagining
                                                                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-wait'
                                                                    : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40'
                                                                }`}
                                                        >
                                                            {isReimagining ? (
                                                                <>
                                                                    <Loader className="w-3 h-3 animate-spin" /> ANALYZING
                                                                </>
                                                            ) : isSuccess ? (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" /> COMPLETE
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <SparklesIcon className="w-3 h-3" /> REIMAGINE
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            }
                                            {lead.googleMapsUri && (
                                                <a href={lead.googleMapsUri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1">
                                                    <Globe size={10} /> MAPS
                                                </a>
                                            )}
                                            {/* Social Icons Row */}
                                            {(lead.socials?.length > 0 || lead.linkedinUrl || lead.facebookUrl || lead.instagramUrl) && (
                                                <div className="flex items-center gap-2 mt-1 justify-center">
                                                    {lead.facebookUrl && <SocialIcon url={lead.facebookUrl} />}
                                                    {lead.linkedinUrl && <SocialIcon url={lead.linkedinUrl} />}
                                                    {lead.instagramUrl && <SocialIcon url={lead.instagramUrl} />}
                                                    {lead.socials?.map(url => <SocialIcon key={url} url={url} />)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {/* Expandable Review Section */}
                                {expandedReviewId === lead.id && lead.reviews && (
                                    <tr className="bg-neutral-900/30 border-b border-neutral-800 animate-fadeIn">
                                        <td colSpan={6} className="p-4 pl-14">
                                            <div className="mb-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">Latest Reviews</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {lead.reviews.slice(0, 4).map((review, idx) => (
                                                    <div key={idx} className="bg-black/40 p-3 rounded border border-neutral-800 text-xs">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-bold text-white">{review.name}</span>
                                                            <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                                        </div>
                                                        <p className="text-neutral-400 italic mb-1">"{review.text.substring(0, 150)}{review.text.length > 150 ? '...' : ''}"</p>
                                                        <div className="text-[10px] text-neutral-600 text-right">{review.relativePublishTimeDescription}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
