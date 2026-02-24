
import React from 'react';
import { SeoInjectionPackage } from '../types';

interface SeoOverlayProps {
  seoPackage: SeoInjectionPackage | null;
  isVisible: boolean;
  onClose: () => void;
}

const CodeBlock: React.FC<{ title: string; language: string; code: string }> = ({ title, language, code }) => (
  <div className="bg-slate-900/80 rounded-md border border-slate-700 overflow-hidden">
    <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
      <h3 className="text-sm font-semibold text-cyan-400">{title}</h3>
    </div>
    <pre className="p-4 text-xs text-slate-300 overflow-x-auto">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
);

const SeoOverlay: React.FC<SeoOverlayProps> = ({ seoPackage, isVisible, onClose }) => {
  if (!isVisible || !seoPackage) return null;

  const { jsonLd, metaTags, openGraph, twitterCard } = seoPackage;

  const metaHtml = `
<title>${metaTags.title}</title>
<meta name="description" content="${metaTags.description}">
  `.trim();

  const ogHtml = Object.entries(openGraph)
    .map(([key, value]) => `<meta property="${key}" content="${value}">`)
    .join('\n');

  const twitterHtml = Object.entries(twitterCard)
    .map(([key, value]) => `<meta name="${key}" content="${value}">`)
    .join('\n');

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-lg border border-slate-700 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white">BrandLift SEO Injections</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-slate-400">
            The following structured data and meta tags would be injected into the &lt;head&gt; of the website non-intrusively.
          </p>
          <CodeBlock
            title="JSON-LD Structured Data"
            language="json"
            code={JSON.stringify(jsonLd, null, 2)}
          />
          <CodeBlock
            title="Meta Tags"
            language="html"
            code={metaHtml}
          />
          <CodeBlock
            title="OpenGraph Tags (for social sharing)"
            language="html"
code={ogHtml}
          />
          <CodeBlock
            title="Twitter Card Tags (for Twitter sharing)"
            language="html"
            code={twitterHtml}
          />
        </div>
      </div>
    </div>
  );
};

export default SeoOverlay;
