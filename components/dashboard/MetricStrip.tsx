import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
    { label: 'TOTAL SITES HOSTED', value: 100, suffix: '+', color: 'text-cyan-400' },
    { label: 'ACTIVE AI AUDITS', value: 'LIVE', suffix: '', color: 'text-green-400 animate-pulse' },
    { label: 'INVISIBLE WINS (SEO)', value: 842, suffix: '', color: 'text-purple-400' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export const MetricStrip = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col md:flex-row gap-6 w-full"
        >
            {STATS.map((stat, idx) => (
                <motion.div
                    key={idx}
                    variants={item}
                    className="flex-1 bg-[#0a0a0a] border border-slate-800 p-6 rounded flex flex-col justify-between hover:border-cyan-500/30 transition-colors group relative overflow-hidden"
                >
                    <h3 className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-2 group-hover:text-slate-300 transition-colors">
                        {stat.label}
                    </h3>
                    <div className={`text-4xl font-bold font-mono ${stat.color} flex items-baseline gap-1`}>
                        {stat.value}
                        <span className="text-lg opacity-50">{stat.suffix}</span>
                    </div>
                    {/* Scan effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </motion.div>
            ))}
        </motion.div>
    );
};
