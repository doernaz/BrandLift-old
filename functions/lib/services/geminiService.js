"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeoPackage = void 0;
const generateSeoPackage = async (htmlContent, url) => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ htmlContent, url }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        const result = await response.json();
        return result;
    }
    catch (error) {
        console.error("Error generating SEO package:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate SEO analysis.");
    }
};
exports.generateSeoPackage = generateSeoPackage;
//# sourceMappingURL=geminiService.js.map