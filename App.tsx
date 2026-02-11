import React, { useState, useCallback } from 'react';
import { SeoAnalysisResult, SeoVariant, SiteData } from './types';
import { generateSeoPackage } from './services/geminiService';
import { extractSiteData } from './services/siteParser';
import SeoOverlay from './components/SeoOverlay';
import ToggleSwitch from './components/ToggleSwitch';
import { SparklesIcon, ExclamationTriangleIcon, ChevronLeftIcon, RocketLaunchIcon } from './components/icons/Icons';
import Showcase from './components/Showcase';
import Dashboard from './components/Dashboard';
import { LeadEnrichmentView } from './components/LeadEnrichmentView';
import { MonitorView } from './components/MonitorView';
import { AnalyticsView } from './components/AnalyticsView';

import { SubsiteBuilder } from './components/builder/SubsiteBuilder';
import { twentyiService } from './services/twentyiService';
import { sessionStore } from './services/sessionStore';

// Fetches the HTML content via our own backend proxy to avoid CORS issues and secure the request.
const fetchHtml = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Proxy fetch failed:", error);
    throw new Error("Could not fetch the URL. The site may be blocking requests or is unreachable.");
  }
};

const ScoreDisplay = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s < 50) return 'text-red-400';
    if (s < 80) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="text-center my-4">
      <p className={`text-6xl font-bold ${getColor(score)}`}>{score}<span className="text-3xl text-slate-500">/100</span></p>
    </div>
  );
};

type AppMode = 'dashboard' | 'seo' | 'enrichment' | 'monitor' | 'analytics' | 'builder';

export default function App() {
  const [currentApp, setCurrentApp] = useState<AppMode>('dashboard');

  // Seo App State
  const [urlValue, setUrlValue] = useState<string>('https://www.stayinsedona.com');
  const [htmlForPreview, setHtmlForPreview] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SeoAnalysisResult | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  // Full Screen Preview State
  const [activeFullPreview, setActiveFullPreview] = useState<{ html: string; title: string } | null>(null);

  // Extracted scan logic
  const performScan = useCallback(async (targetUrl: string) => {
    setError(null);
    setAnalysisResult(null);
    setIsOverlayVisible(false);
    setHtmlForPreview('');
    setIsLoading(true);
    setSelectedVariantIndex(0);
    setSiteData(null);

    try {
      let url: URL;
      try {
        url = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      } catch (err) {
        setError('Please enter a valid URL.');
        setIsLoading(false);
        return;
      }
      const analysisUrl = url.href;
      const htmlContent = await fetchHtml(analysisUrl);

      // Extract site data for variants
      const data = extractSiteData(htmlContent, analysisUrl);
      setSiteData(data);

      const sanitizedHtml = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      const MAX_CONTENT_LENGTH = 15000;
      const truncatedHtml = sanitizedHtml.substring(0, MAX_CONTENT_LENGTH);

      const generatedResult = await generateSeoPackage(truncatedHtml, analysisUrl);
      setAnalysisResult(generatedResult);
      setHtmlForPreview(htmlContent);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performScan(urlValue);
  }, [urlValue, performScan]);

  const handleReimagine = useCallback((target: string | any) => {
    // Check if target is a Virtual Source (Lead Object) or URL
    if (typeof target === 'string') {
      setUrlValue(target);

      // Start the "Walk the Flow" session
      sessionStore.startReimagineSession({ originalUrl: target });

      // Start the scan (background)
      performScan(target);
    } else {
      // Virtual Source Flow
      console.log("[App] Initiating Virtual Hand-off for:", target.name);

      // 1. Create source object
      const virtualSource = sessionStore.createVirtualSourceObject({
        businessName: target.name,
        industry: target.primaryType || 'Local Business',
        keywords: [target.primaryType, target.city, 'Service'].filter(Boolean),
        location: target.address || 'Unknown'
      });

      // 2. Start Session (Virtual Mode)
      sessionStore.startReimagineSession({ virtualSource });

      // 3. Skip performScan (SEO Scan) and go straight to dashboard
    }

    // Navigate to Dashboard to see the "Walk the Flow" tile
    setCurrentApp('dashboard');
  }, [performScan]);

  const currentVariant: SeoVariant | null = analysisResult ? analysisResult.variants[selectedVariantIndex] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentApp !== 'dashboard' && (
            <button
              onClick={() => setCurrentApp('dashboard')}
              className="p-2 -ml-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1
              className={`font-bold tracking-tight text-cyan-400 cursor-pointer transition-all ${currentApp === 'dashboard' ? 'text-2xl' : 'text-xl'}`}
              onClick={() => setCurrentApp('dashboard')}
            >
              BrandLift<span className="text-white opacity-50 font-normal">.Command</span>
            </h1>
          </div>
        </div>

        {currentApp !== 'dashboard' && (
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-full">
            MODULE: <span className="text-cyan-500">{currentApp}</span>
          </div>
        )}
      </header>

      {/* Full Screen Preview Modal */}
      {activeFullPreview && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col">
          <div className="h-16 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 backdrop-blur-md">
            <h2 className="text-white font-bold text-lg">{activeFullPreview.title}</h2>
            <button
              onClick={() => setActiveFullPreview(null)}
              className="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative bg-white">
            <iframe
              srcDoc={activeFullPreview.html}
              title="Full Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col">
        {currentApp === 'dashboard' && (
          <Dashboard
            onNavigate={setCurrentApp}
            recentSeoScore={analysisResult?.originalScore || null}
          />
        )}

        {currentApp === 'enrichment' && <LeadEnrichmentView onReimagine={handleReimagine} />}

        {currentApp === 'monitor' && <MonitorView />}

        {currentApp === 'analytics' && <AnalyticsView />}

        {currentApp === 'builder' && (
          <SubsiteBuilder
            analysisResults={analysisResult}
            targetUrl={urlValue}
            onBack={() => setCurrentApp('seo')}
          />
        )}

        {currentApp === 'seo' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-slate-300 mb-1">Target URL</label>
                <div className="flex gap-2">
                  <input
                    id="url-input"
                    type="text"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="Enter a URL (e.g., example.com)"
                    className="flex-grow bg-slate-900 border border-slate-700 rounded-md px-4 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder-slate-600 font-mono text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2 rounded-md disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        PROCESSING
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        INITIATE SCAN
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 px-4 py-3 rounded-md flex items-center gap-3 font-mono text-sm">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>ERROR: {error}</span>
              </div>
            )}

            {analysisResult && currentVariant ? (
              <>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-slate-400 font-mono text-sm">ANALYSIS_COMPLETE // {analysisResult.variants.length} STRATEGIES GENERATED</span>
                  </div>
                  <button
                    onClick={() => setCurrentApp('builder')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-md transition-all shadow-lg flex items-center gap-2 font-mono text-sm"
                  >
                    <RocketLaunchIcon className="w-4 h-4" />
                    BUILD CLIENT SUBSITE
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left Panel: Original */}
                  <div className="flex flex-col space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Current Deployment</h2>
                    <ScoreDisplay score={analysisResult.originalScore} />
                    <div className="space-y-2">
                      <h3 className="font-bold text-cyan-400 text-sm font-mono">DETECTED_VULNERABILITIES</h3>
                      <ul className="text-slate-400 space-y-2 text-xs font-mono border-l-2 border-slate-800 pl-4">
                        {currentVariant.opportunities.map((opp, index) => <li key={index}>[!] {opp}</li>)}
                      </ul>
                    </div>

                    {/* Original Thumbnail */}
                    <div
                      className="group relative w-full aspect-[16/10] bg-white rounded-md overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-500/10 mt-4"
                      onClick={() => setActiveFullPreview({ html: htmlForPreview, title: 'Current Deployment' })}
                    >
                      <div className="absolute top-0 left-0 w-[320%] h-[320%] origin-top-left transform scale-[0.3125] pointer-events-none select-none">
                        <iframe srcDoc={htmlForPreview} title="Original Thumbnail" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-cyan-500/90 text-white font-bold px-6 py-2 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg backdrop-blur-sm">
                          View Analysis
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Optimized */}
                  <div className="flex flex-col space-y-4 bg-slate-900/50 p-6 rounded-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                    <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest text-center">Optimized Target</h2>

                    {/* Variant Tabs */}
                    <div className="flex space-x-1 justify-center bg-slate-950 p-1 rounded-lg self-center border border-slate-800">
                      {analysisResult.variants.map((variant, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariantIndex(idx)}
                          className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${selectedVariantIndex === idx
                            ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                            }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-500 mt-2 font-mono max-w-sm mx-auto">{currentVariant.description}</p>
                    </div>

                    <ScoreDisplay score={currentVariant.optimizedScore} />

                    <div className="flex justify-center pt-2 pb-4">
                      <ToggleSwitch
                        label="OVERLAY_HUD"
                        checked={isOverlayVisible}
                        onChange={setIsOverlayVisible}
                      />
                    </div>

                    {/* Optimized Thumbnail */}
                    <div
                      className="group relative w-full aspect-[16/10] bg-white rounded-md overflow-hidden cursor-pointer border border-cyan-900/30 hover:border-cyan-400 transition-all shadow-lg hover:shadow-cyan-500/20 mt-4"
                      onClick={() => setActiveFullPreview({ html: htmlForPreview, title: 'Optimized Target' })}
                    >
                      <div className="absolute top-0 left-0 w-[320%] h-[320%] origin-top-left transform scale-[0.3125] pointer-events-none select-none">
                        <iframe srcDoc={htmlForPreview} title="Optimized Thumbnail" className="w-full h-full border-0 opacity-80" sandbox="allow-scripts allow-same-origin" />
                      </div>
                      <div className="absolute inset-0 pointer-events-none bg-cyan-500/5 mix-blend-overlay"></div>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-cyan-500/90 text-white font-bold px-6 py-2 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg backdrop-blur-sm">
                          Expand View
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <Showcase analysisResult={analysisResult} siteData={siteData} />
                </div>
              </>
            ) : (
              <div className="flex-grow bg-slate-900/30 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center min-h-[40vh]">
                <div className="text-center text-slate-600 font-mono">
                  {isLoading ? "SCANNING TARGET SYSTEM..." : "AWAITING TARGET URL INPUT //"}
                </div>
              </div>
            )}

            <SeoOverlay
              seoPackage={currentVariant ? currentVariant.seoPackage : null}
              isVisible={isOverlayVisible}
              onClose={() => setIsOverlayVisible(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}