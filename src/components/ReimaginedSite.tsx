
import React, { useState, useEffect } from 'react';
import { SiteData } from '../types';

// --- Shared Props Interface ---
interface SiteProps {
    hasWebsite: boolean;
    seoKeywords: string[];
    siteData?: SiteData;
}

// --- Shared Layout Components ---
const Section: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <section className={`w-full max-w-7xl mx-auto py-16 px-6 md:py-24 ${className}`}>
        {children}
    </section>
);

const Navbar: React.FC<{ brandName: string }> = ({ brandName }) => (
    <nav className="w-full py-6 px-8 flex justify-between items-center border-b border-[#00FFCC]/20 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold text-white tracking-tight">{brandName}</div>
        <div className="hidden md:flex space-x-8 text-sm font-mono text-slate-400">
            <span className="hover:text-[#00FFCC] cursor-pointer transition-colors">The Property</span>
            <span className="hover:text-[#00FFCC] cursor-pointer transition-colors">Amenities</span>
            <span className="hover:text-[#00FFCC] cursor-pointer transition-colors">Gallery</span>
            <span className="text-[#00FFCC] cursor-pointer">Book Now</span>
        </div>
    </nav>
);

const Footer: React.FC<{ brandName: string }> = ({ brandName }) => (
    <footer className="w-full bg-black py-12 border-t border-[#00FFCC]/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">{brandName}</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                    Experience the ultimate getaway. Luxury, comfort, and unforgettable memories await.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Location</h4>
                <div className="flex flex-col space-y-2 text-slate-500 text-sm">
                    <span>Directions</span>
                    <span>Local Attractions</span>
                    <span>Weather</span>
                </div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Guest Info</h4>
                <div className="flex flex-col space-y-2 text-slate-500 text-sm">
                    <span>House Rules</span>
                    <span>Check-in Guide</span>
                    <span>FAQs</span>
                </div>
            </div>
        </div>
        <div className="mt-12 text-center text-xs text-slate-700 font-mono">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
    </footer>
);

const BookingForm = () => (
    <div className="w-full max-w-md p-8 border border-[#00FFCC]/20 bg-black">
        <h3 className="text-2xl font-bold text-white mb-1">Check Availability</h3>
        <p className="text-sm text-slate-400 mb-6 font-mono">Secure your dates before they're gone.</p>
        <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Check-in" onFocus={(e) => e.target.type = 'date'} className="w-full bg-transparent border border-slate-700 px-4 py-2 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#00FFCC] focus:outline-none font-mono" />
                <input type="text" placeholder="Check-out" onFocus={(e) => e.target.type = 'date'} className="w-full bg-transparent border border-slate-700 px-4 py-2 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#00FFCC] focus:outline-none font-mono" />
            </div>
            <select className="w-full bg-transparent border border-slate-700 px-4 py-2 text-white placeholder-slate-600 focus:ring-1 focus:ring-[#00FFCC] focus:outline-none font-mono">
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
            </select>
            <button type="submit" className="w-full bg-[#00FFCC] text-black font-bold py-3 hover:bg-white transition-colors">
                View Rates
            </button>
        </form>
    </div>
);

// --- Component Helpers ---
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=2400"; // Abstract tech

const cleanHeadline = (text: string, brandName: string) => {
    let cleaned = text;
    // Context-aware replacements
    const isSedona = brandName.toLowerCase().includes('sedona') || text.toLowerCase().includes('sedona');

    cleaned = cleaned.replace(/\[City\]/g, isSedona ? "Sedona" : "Paradise");
    cleaned = cleaned.replace(/\[Topic\]/g, "Luxury Stays");
    cleaned = cleaned.replace(/\[Brand\]/g, brandName);

    // Replace B2B terms with B2C Hospitality terms if they snuck in
    cleaned = cleaned.replace(/Platform/gi, "Experience");
    cleaned = cleaned.replace(/Infrastructure/gi, "Amenities");
    cleaned = cleaned.replace(/Solution/gi, "Getaway");
    cleaned = cleaned.replace(/Service/gi, "Stay");

    return cleaned;
};

// --- Variation A: The Modern Sanctuary ---
// Theme: Sleek, high-end amenities, "Smart Home" feel, dark mode luxury.
export const TechnicalPowerhouse: React.FC<SiteProps> = ({ hasWebsite, seoKeywords, siteData }) => {
    const brandName = siteData?.brandName || "Your Brand";
    const heroImg = siteData?.heroImage || PLACEHOLDER_IMG;
    const features = siteData?.listItems?.slice(0, 6) || ["Infinity Pool", "Smart Home System", "Chef's Kitchen", "Mountain Views", "Private Spa", "High-Speed WiFi"];
    const blurb = siteData?.paragraphs?.[0] || "Escape to a world of unparalleled comfort and style.";

    let headline = seoKeywords?.length > 0
        ? `The Ultimate ${seoKeywords[0]} Retreat.`
        : "Modern Luxury in Nature.";

    headline = cleanHeadline(headline, brandName);

    return (
        <div className="bg-[#050505] text-white font-sans selection:bg-[#00FFCC] selection:text-black">
            <Navbar brandName={brandName} />

            {/* Hero */}
            <header className="relative min-h-[90vh] flex items-center border-b border-[#00FFCC]/10 overflow-hidden group">
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="Hero" className="w-full h-full object-cover opacity-60 transition-transform duration-[20s] ease-in-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-[#00FFCC] text-[#00FFCC] text-xs font-mono tracking-widest uppercase bg-[#00FFCC]/5">
                            <span className="w-2 h-2 rounded-full bg-[#00FFCC] animate-pulse" />
                            Available Now
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
                            {headline}
                        </h1>
                        <p className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed border-l-2 border-[#00FFCC] pl-6">
                            {blurb}
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-[#00FFCC] text-black font-bold px-8 py-4 hover:bg-white transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                                View Photos
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrics Band */}
            <div className="border-b border-[#00FFCC]/10 bg-black">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Guests", value: "Up to 8" },
                        { label: "Rating", value: "5 Stars" },
                        { label: "Location", value: "Prime View" },
                        { label: "WiFi", value: "1Gbps" }
                    ].map((m, i) => (
                        <div key={i} className="text-center md:text-left border-l border-[#222] pl-8">
                            <div className="text-3xl font-bold text-white font-mono mb-1">{m.value}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <Section>
                <div className="mb-16 flex flex-col md:flex-row justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Premium Amenities</h2>
                        <p className="text-slate-500 mt-2 font-mono">/ Everything you need for a perfect stay</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-1">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 border border-[#222] bg-[#0A0A0A] hover:bg-[#111] transition-colors group">
                            <div className="w-10 h-10 rounded-sm bg-[#222] mb-6 flex items-center justify-center text-[#00FFCC] font-mono text-sm group-hover:bg-[#00FFCC] group-hover:text-black transition-colors">
                                0{i + 1}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-200">{feature.length > 50 ? "Feature " + (i + 1) : feature}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Thoughtfully designed to enhance your relaxation and comfort.</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Big Image / Content Split */}
            <section className="w-full grid md:grid-cols-2 min-h-[700px] border-y border-[#00FFCC]/10">
                <div className="bg-[#0A0A0A] p-12 md:p-24 flex flex-col justify-center relative overflow-hidden">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white relative z-10">Designed for Living.</h2>
                    <p className="text-slate-400 mb-10 leading-relaxed text-lg relative z-10">
                        {siteData?.paragraphs?.[1] || "Every corner of our residence is curated to provide a sense of peace and luxury. From the expansive decks to the cozy interiors, you'll feel right at home."}
                    </p>
                    <ul className="space-y-4 font-mono text-sm text-[#00FFCC] relative z-10">
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-[#00FFCC]"></span>
                            Private Hiking Access
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-[#00FFCC]"></span>
                            Concierge Services
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-[#00FFCC]"></span>
                            Luxury Linens
                        </li>
                    </ul>
                </div>
                <div className="relative h-[400px] md:h-auto overflow-hidden">
                    {siteData?.images?.[0] ? (
                        <img src={siteData.images[0]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" alt="Detail" />
                    ) : (
                        <div className="absolute inset-0 bg-[#111] flex items-center justify-center text-[#222]">NO SIGNAL</div>
                    )}
                </div>
            </section>

            {/* Footer Contact */}
            <Section className="flex justify-center bg-black">
                <BookingForm />
            </Section>

            <Footer brandName={brandName} />
        </div>
    );
}

// --- Variation B: The Serene Minimalist ---
// Theme: Big type, clean, white space, inviting, easy to book.
export const ConversionMinimalist: React.FC<SiteProps> = ({ hasWebsite, seoKeywords, siteData }) => {
    const brandName = siteData?.brandName || "Brand";
    const heroImg = siteData?.heroImage || PLACEHOLDER_IMG;

    let headline = seoKeywords?.length > 0
        ? `${seoKeywords[0]}. Reimagined.`
        : "Relaxation Redefined.";
    headline = cleanHeadline(headline, brandName);

    let subheadline = seoKeywords?.[1]
        ? `Your private escape for ${seoKeywords[1]}.`
        : "Simple. Peaceful. Beautiful.";
    subheadline = cleanHeadline(subheadline, brandName);

    return (
        <div className="bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Nav */}
            <nav className="fixed w-full z-50 mix-blend-difference text-white px-8 py-6 flex justify-between items-center bg-transparent">
                <div className="font-bold text-2xl tracking-tighter">{brandName}</div>
                <button className="bg-white text-black font-medium px-6 py-2 rounded-full hover:scale-105 transition-transform">
                    Reserve
                </button>
            </nav>

            {/* Hero */}
            <div className="relative h-screen w-full overflow-hidden">
                <img src={heroImg} className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
                <div className="absolute inset-0 bg-black/20" />

                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 drop-shadow-2xl">
                        {headline}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/95 max-w-2xl font-light mb-12 drop-shadow-md">
                        {subheadline}
                    </p>

                    <button className="bg-white text-black text-lg font-bold px-10 py-5 rounded-full hover:bg-slate-200 transition-colors shadow-xl">
                        View Availability
                    </button>
                </div>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                    ↓
                </div>
            </div>

            {/* Value Prop Grid */}
            <div className="py-32 px-6 md:px-24 bg-white relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24 text-center max-w-3xl mx-auto">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">The Experience</h2>
                        <p className="text-4xl md:text-5xl font-medium leading-tight text-slate-900">
                            {siteData?.paragraphs?.[0] || "We believe in simplicity and comfort. Every detail is crafted to enhance your vacation."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {(siteData?.listItems?.slice(0, 3) || ["Premium Quality", "Self Check-in", "Superhost Status"]).map((item, i) => (
                            <div key={i} className="bg-slate-50 p-10 rounded-3xl hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-black rounded-2xl mb-8 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    {i + 1}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900">{item}</h3>
                                <p className="text-slate-500 leading-relaxed">Relax and unwind. We take care of the details so you can focus on making memories.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery / Showcase */}
            <section className="py-24 px-6 bg-slate-950 text-white rounded-t-[4rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1">
                            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">Unmatched Beauty.</h2>
                            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                                {siteData?.paragraphs?.[1] || "Immerse yourself in spectacular views and refined interiors."}
                            </p>
                            <ul className="space-y-6 mb-12">
                                {siteData?.listItems?.slice(3, 6).map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-xl font-medium">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="text-white font-bold text-xl border-b-2 border-white pb-2 hover:opacity-70 transition-opacity">
                                See All Photos
                            </button>
                        </div>
                        <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-12">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                                    {siteData?.images?.[1] && <img src={siteData.images[1]} className="w-full h-full object-cover" alt="Gallery 1" />}
                                </div>
                                <div className="aspect-square rounded-2xl overflow-hidden">
                                    {siteData?.images?.[2] && <img src={siteData.images[2]} className="w-full h-full object-cover" alt="Gallery 2" />}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square rounded-2xl overflow-hidden">
                                    {siteData?.images?.[0] && <img src={siteData.images[0]} className="w-full h-full object-cover" alt="Gallery 3" />}
                                </div>
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                                    {siteData?.images?.[3] && <img src={siteData.images[3]} className="w-full h-full object-cover" alt="Gallery 4" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-slate-950 text-white py-32 text-center border-t border-white/10">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-5xl font-bold mb-8">Ready to book?</h2>
                    <div className="flex justify-center">
                        <BookingForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Variation C: The Local Expert ---
// Theme: Editorial, guide-focused, "Live like a local", magazine style.
export const SeoContentLeader: React.FC<SiteProps> = ({ hasWebsite, seoKeywords, siteData }) => {
    const brandName = siteData?.brandName || "Brand Journal";
    const heroImg = siteData?.heroImage || PLACEHOLDER_IMG;
    const authorImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

    let headline = seoKeywords?.length > 0
        ? `The Definitive Guide to ${seoKeywords[0]}`
        : "Curated Living in the Heart of Nature";
    headline = cleanHeadline(headline, brandName);

    return (
        <div className="bg-[#fffefe] text-[#1a1a1a] font-serif">
            {/* Header */}
            <header className="border-b border-black/5 bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="font-serif text-3xl font-bold italic tracking-tight">{brandName}</div>
                    <nav className="hidden md:flex gap-8 font-sans text-xs font-semibold tracking-widest uppercase text-slate-500">
                        <span className="hover:text-black transition-colors cursor-pointer">The Stay</span>
                        <span className="hover:text-black transition-colors cursor-pointer">Local Guide</span>
                        <span className="hover:text-black transition-colors cursor-pointer">Our Story</span>
                        <span className="hover:text-black transition-colors cursor-pointer">Book Now</span>
                    </nav>
                </div>
            </header>

            {/* Article Hero */}
            <article className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#d4a373] mb-6">
                        Your Host Recommends
                    </div>
                    <h1 className="text-6xl md:text-8xl font-medium leading-[0.95] mb-8 text-[#111]">
                        {headline}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-sans font-light max-w-2xl mx-auto">
                        {siteData?.description || "An in-depth look at what makes this location the perfect destination for your next adventure."}
                    </p>
                </div>

                {/* Featured Image - Full Width */}
                <div className="w-full h-[600px] mb-20 relative">
                    <img src={heroImg} className="w-full h-full object-cover" alt="Featured" />
                    <div className="absolute bottom-0 left-0 bg-white p-6 max-w-md">
                        <div className="font-sans text-xs font-bold uppercase tracking-widest text-[#d4a373]">Location</div>
                        <div className="font-serif italic text-lg">{brandName}</div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="grid md:grid-cols-12 gap-16">
                    <div className="hidden md:block col-span-3 sticky top-32 h-fit">
                        <div className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-black/10 pb-2">Guide</div>
                        <ul className="space-y-4 font-sans text-sm text-slate-500">
                            <li className="text-black font-semibold cursor-pointer">01. The Property</li>
                            <li className="hover:text-black cursor-pointer transition-colors">02. Hiking Trails</li>
                            <li className="hover:text-black cursor-pointer transition-colors">03. Dining</li>
                            <li className="hover:text-black cursor-pointer transition-colors">04. House Rules</li>
                        </ul>
                    </div>

                    <div className="col-span-12 md:col-span-8 prose prose-lg prose-slate font-serif max-w-none prose-headings:font-serif prose-headings:font-normal">
                        <p className="lead first-letter:text-6xl first-letter:font-normal first-letter:float-left first-letter:mr-4 first-letter:mt-[-10px] first-letter:text-[#d4a373]">
                            {siteData?.paragraphs?.[0] || "Hospitality is not just a service; it is a feeling. When you step into our home, you leave the ordinary behind."}
                        </p>

                        <h2 className="text-4xl italic mt-12 mb-8">Redefining {seoKeywords?.[1] || "Your Stay"}</h2>
                        <p>
                            {siteData?.paragraphs?.[1] || "We have curated a collection of amenities that define what it means to truly relax. From the linens to the coffee, everything is intentional."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 my-12 not-prose">
                            <img src={siteData?.images?.[1] || PLACEHOLDER_IMG} className="w-full aspect-[4/5] object-cover" alt="Detail 1" />
                            <img src={siteData?.images?.[2] || PLACEHOLDER_IMG} className="w-full aspect-[4/5] object-cover mt-8" alt="Detail 2" />
                        </div>

                        <h3>Highlights</h3>
                        <ul>
                            {(siteData?.listItems || ["Private entrance", "Self check-in", "Free parking"]).slice(0, 5).map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <blockquote className="border-l-4 border-[#d4a373] pl-6 italic text-2xl my-12 text-[#111]">
                            "{siteData?.brandName || "Our Home"} is your home away from home. We can't wait to host you."
                        </blockquote>
                    </div>
                </div>
            </article>

            {/* Footer */}
            <div className="bg-[#111] text-[#f8f5f2] py-24 px-6 font-sans border-t border-black">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-1 bg-[#d4a373] mx-auto mb-8" />
                    <h2 className="text-4xl font-serif italic mb-8">Experience {brandName}</h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto">Book your stay today and discover the magic.</p>
                    <div className="flex justify-center">
                        <BookingForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
