
import { SeoAnalysisResult } from '../types';

export const generateSeoPackage = async (htmlContent: string, url: string): Promise<SeoAnalysisResult> => {
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

        const result = await response.json() as SeoAnalysisResult;
        return result;

    } catch (error) {
        console.error("Error generating SEO package:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate SEO analysis.");
    }
};