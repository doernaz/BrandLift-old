"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSiteData = void 0;
/**
 * Extracts key brand information and assets from the HTML string.
 */
const extractSiteData = (html, originalUrl) => {
    var _a;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    // Extract Brand Name
    // Priority: 1. meta[property="og:site_name"], 2. title (before pipe), 3. Domain
    let brandName = '';
    const metaSiteName = doc.querySelector('meta[property="og:site_name"]');
    if (metaSiteName) {
        brandName = metaSiteName.getAttribute('content') || '';
    }
    if (!brandName) {
        const title = ((_a = doc.querySelector('title')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        brandName = title.split('|')[0].split('-')[0].trim();
    }
    if (!brandName && originalUrl) {
        try {
            brandName = new URL(originalUrl).hostname.replace('www.', '').split('.')[0];
            // Capitalize first letter
            brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
        }
        catch (e) {
            brandName = 'Brand';
        }
    }
    // Extract Hero Image
    // Priority: 1. og:image, 2. First large image in header/main
    let heroImage = null;
    const ogImage = doc.querySelector('meta[property="og:image"]');
    if (ogImage) {
        heroImage = ogImage.getAttribute('content');
    }
    if (!heroImage) {
        // Basic heuristic: find the first large image
        const imgs = Array.from(doc.querySelectorAll('img'));
        for (const img of imgs) {
            // Skip tiny icons or tracking pixels if possible (hard without layout info)
            const src = img.getAttribute('src');
            if (src && !src.includes('icon') && !src.includes('logo') && src.length > 20) {
                heroImage = src;
                break;
            }
        }
    }
    // Ensure absolute URL for image
    if (heroImage && !heroImage.startsWith('http')) {
        try {
            const urlObj = new URL(originalUrl);
            // Handle root relative
            if (heroImage.startsWith('/')) {
                heroImage = `${urlObj.origin}${heroImage}`;
            }
            else {
                // Handle relative to path (simplified)
                heroImage = `${urlObj.origin}/${heroImage}`;
            }
        }
        catch (e) {
            // If URL parsing fails, keep as is or discard
        }
    }
    // Extract Headings
    const headings = [];
    doc.querySelectorAll('h1, h2').forEach(el => {
        var _a;
        const text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
        if (text && text.length > 10 && headings.length < 5) {
            headings.push(text);
        }
    });
    // Extract Description
    let description = '';
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) {
        description = metaDesc.getAttribute('content') || '';
    }
    // Extract Images (up to 6)
    const images = [];
    doc.querySelectorAll('img').forEach(img => {
        let src = img.getAttribute('src');
        if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('tracking') && (src.length > 20 || src.startsWith('http'))) {
            // Ensure absolute URL
            if (!src.startsWith('http')) {
                try {
                    const urlObj = new URL(originalUrl);
                    if (src.startsWith('/')) {
                        src = `${urlObj.origin}${src}`;
                    }
                    else {
                        src = `${urlObj.origin}/${src}`;
                    }
                }
                catch (e) {
                    return;
                }
            }
            if (images.length < 6)
                images.push(src);
        }
    });
    // Extract Content Paragraphs
    const paragraphs = [];
    doc.querySelectorAll('p').forEach(p => {
        var _a;
        const text = (_a = p.textContent) === null || _a === void 0 ? void 0 : _a.trim();
        if (text && text.length > 50 && paragraphs.length < 5) {
            paragraphs.push(text);
        }
    });
    // Extract List Items (Features/Services)
    const listItems = [];
    doc.querySelectorAll('li').forEach(li => {
        var _a;
        const text = (_a = li.textContent) === null || _a === void 0 ? void 0 : _a.trim();
        if (text && text.length > 10 && text.length < 100 && listItems.length < 8) {
            listItems.push(text);
        }
    });
    return {
        brandName: brandName || 'Your Brand',
        heroImage,
        headings,
        description,
        images: images,
        paragraphs,
        listItems
    };
};
exports.extractSiteData = extractSiteData;
//# sourceMappingURL=siteParser.js.map