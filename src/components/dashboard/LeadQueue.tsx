import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LEADS = [
    { id: 1, name: 'Peak Performance Auto', email: 'verified', action: 'Build Sandbox' },
    { id: 2, name: 'Sedona Yoga Retreat', email: 'verified', action: 'Build Sandbox' },
    { id: 3, name: 'Flagstaff B&B', email: 'pending', action: 'Verify Data' },
    { id: 4, name: 'Tucson Solar Pros', email: 'verified', action: 'Build Sandbox' },
    { id: 5, name: 'Havasu Boat Rentals', email: 'verified', action: 'Build Sandbox' },
];

export const LeadQueue = () => {
    return (
        <div className="bg-[#0a0a0a] border border-slate-800 rounded p-4 h-[400px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    Lead Queue
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">LIVE FEED</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 relative">
                <AnimatePresence>
                    {LEADS.map((lead, i) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            className="bg-slate-900/50 border border-slate-800 p-3 rounded flex justify-between items-center group hover:border-cyan-500/30 transition-colors cursor-pointer"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{lead.name}</span>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    {lead.email === 'verified' ? (
                                        <span className="text-green-500">EMAIL_VERIFIED</span>
                                    ) : (
                                        <span className="text-amber-500">PENDING_VERIFICATION</span>
                                    )}
                                </span>
                            </div>

                            <button className="text-[10px] bg-slate-800 hover:bg-cyan-900 text-slate-400 hover:text-cyan-200 px-3 py-1 rounded border border-slate-700 hover:border-cyan-500/50 transition-all uppercase font-mono tracking-wider">
                                {lead.action}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
