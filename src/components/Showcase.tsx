
import React from 'react';
import { createPortal } from 'react-dom';
import { SeoAnalysisResult, SiteData } from '../types';
import { CheckCircleIcon } from './icons/Icons';
import { TechnicalPowerhouse, ConversionMinimalist, SeoContentLeader } from './ReimaginedSite';

// --- Audit & Preview Components ---

interface AuditResultProps {
  score: number;
  title: string;
  improvements: string[];
}

const AuditResult: React.FC<AuditResultProps> = ({ score, title, improvements }) => (
  <div className="bg-slate-800 p-6 rounded-t-lg border-x border-t border-slate-700">
    <h3 className="text-lg font-bold text-cyan-400">{title}</h3>
    <p className="text-5xl font-bold text-green-400 my-3">{score}<span className="text-2xl text-slate-500">/100</span></p>
    <p className="text-sm text-slate-400 mb-4">Simulated SEO Score & Implemented Opportunities</p>
    <ul className="space-y-2">
      {improvements.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
          <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const VariantPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-[600px] w-full border border-slate-700 rounded-b-lg overflow-hidden bg-[#0A0A0A]">
    <div className="w-full h-full overflow-y-auto">
      {children}
    </div>
  </div>
);


// --- Main Showcase Component ---

interface ShowcaseProps {
  analysisResult: SeoAnalysisResult | null;
  siteData: SiteData | null;
}

const Showcase: React.FC<ShowcaseProps> = ({ analysisResult, siteData }) => {
  const [activeVariant, setActiveVariant] = React.useState<number | null>(null);

  if (!analysisResult || !analysisResult.variants || analysisResult.variants.length < 3) {
    return null;
  }

  // Helper to extract keywords safely
  const getKeywords = (variant: any) => {
    try {
      const title = variant?.seoPackage?.metaTags?.title || "";
      const parts = title.split(/[|\-]/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      return parts.length > 0 ? parts : ["Optimized Site", "SEO Services"];
    } catch (e) {
      return ["Optimized Site", "SEO Services"];
    }
  };

  const hasWebsite = true;
  const baselineScore = 42; // Simulated baseline for "Impact" calc

  // Pre-calculate variant data with safety
  const safeVariant = (v: any) => ({
    name: v?.name || "Standard Optimization",
    optimizedScore: v?.optimizedScore || 85,
    opportunities: v?.opportunities || ["Standard SEO Fixes", "Metadata Optimization", "Content Structure"]
  });

  const v0 = safeVariant(analysisResult.variants[0]);
  const v1 = safeVariant(analysisResult.variants[1]);
  const v2 = safeVariant(analysisResult.variants[2]);

  const variantData = [
    {
      title: `Strategy A: ${v0.name}`,
      score: v0.optimizedScore,
      Component: TechnicalPowerhouse,
      keywords: getKeywords(analysisResult.variants[0]),
      improvements: v0.opportunities
    },
    {
      title: `Strategy B: ${v1.name}`,
      score: v1.optimizedScore,
      Component: ConversionMinimalist,
      keywords: getKeywords(analysisResult.variants[1]),
      improvements: v1.opportunities
    },
    {
      title: `Strategy C: ${v2.name}`,
      score: v2.optimizedScore,
      Component: SeoContentLeader,
      keywords: getKeywords(analysisResult.variants[2]),
      improvements: v2.opportunities
    }
  ];

  return (
    <div className="w-full py-12 space-y-12">
      <div className="text-center border-t border-slate-700 pt-8">
        <h2 className="text-3xl font-bold text-cyan-400 font-sans">Creative Possibilities</h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          Click on a design below to view the full interactive website.
        </p>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {variantData.map((variant, index) => (
          <div
            key={index}
            className="group relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col h-full"
            onClick={() => setActiveVariant(index)}
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{variant.title.split(':')[0]}</h3>
                <div className="text-xs text-cyan-400 truncate max-w-[150px]">{variant.title.split(':')[1]}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-green-400">{variant.score}</span>
                <span className="text-[10px] text-green-500/80 font-mono">+{variant.score - baselineScore} IMPACT</span>
              </div>
            </div>

            {/* Thumbnail - Adjusted Scaling */}
            {/* Aspect ratio container */}
            <div className="relative w-full aspect-[16/10] bg-white overflow-hidden cursor-pointer border-b border-slate-800 group-hover:opacity-90 transition-opacity">
              {/* 
                   Scaling Logic:
                   - Parent width (approx 400px on desktop grid)
                   - Inner width set to 1280px (standard desktop)
                   - Scale = 400 / 1280 = 0.3125
                   - We use percentage width to be responsive: w-[320%] is 3.2x parent. 100/320 = 0.3125.
                */}
              <div className="absolute top-0 left-0 w-[320%] h-[320%] origin-top-left transform scale-[0.3125] pointer-events-none select-none">
                <variant.Component
                  hasWebsite={hasWebsite}
                  seoKeywords={variant.keywords}
                  siteData={siteData || undefined}
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="bg-cyan-500/90 text-white font-bold px-6 py-2 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg backdrop-blur-sm">
                  View Interactive Site
                </div>
              </div>
            </div>

            {/* SEO Impact Details */}
            <div className="p-5 flex-1 bg-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-slate-800"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Applied Strategies</span>
                <div className="h-px flex-1 bg-slate-800"></div>
              </div>
              <ul className="space-y-2.5">
                {variant.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ))}
      </div>

      {/* Full Screen Modal */}
      {activeVariant !== null && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black flex flex-col h-screen w-screen overflow-hidden">
          {/* Toolbar */}
          <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-50">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-white font-bold text-lg leading-none">
                  {variantData[activeVariant].title.split(':')[1]}
                </h2>
                <span className="text-slate-500 text-xs uppercase tracking-wider">{variantData[activeVariant].title.split(':')[0]}</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-400">{variantData[activeVariant].score}</span>
                <div className="flex flex-col text-[10px] leading-tight text-slate-400 font-mono">
                  <span>PREDICTED</span>
                  <span>SEQ SCORE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveVariant(null)}
                className="group p-2 hover:bg-red-500/20 rounded-full transition-colors relative"
              >
                <div className="bg-slate-800 px-3 py-1 rounded text-slate-300 text-xs font-mono group-hover:bg-red-500 group-hover:text-white transition-colors">
                  CLOSE [ESC]
                </div>
              </button>
            </div>
          </div>

          {/* Content Scroller */}
          <div className="flex-1 overflow-y-auto bg-black relative z-40">
            <div className="min-h-full w-full text-white">
              {React.createElement(variantData[activeVariant].Component, {
                hasWebsite: hasWebsite,
                seoKeywords: variantData[activeVariant].keywords,
                siteData: siteData || undefined
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Showcase;
