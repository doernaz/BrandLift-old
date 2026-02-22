import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SeoAuditResults } from '../../../components/dashboard/SeoAuditResults';
import React from 'react';

// Mock dependencies
vi.mock('../../icons/Icons', () => ({
    ChevronLeftIcon: () => <div data-testid="icon-chevron-left" />,
    ArrowDownTrayIcon: () => <div data-testid="icon-arrow-down" />,
    ShareIcon: () => <div data-testid="icon-share" />,
    ExclamationTriangleIcon: () => <div data-testid="icon-exclamation" />,
    CheckCircleIcon: () => <div data-testid="icon-check-circle" />,
    CodeBracketIcon: () => <div data-testid="icon-code" />,
    GlobeAltIcon: () => <div data-testid="icon-globe" />,
    DocumentTextIcon: () => <div data-testid="icon-document" />,
    SparklesIcon: () => <div data-testid="icon-sparkles" />,
}));

vi.mock('lucide-react', () => ({
    Layout: () => <div data-testid="icon-layout" />,
    MousePointer: () => <div data-testid="icon-mouse" />,
    Maximize: () => <div data-testid="icon-maximize" />,
    X: () => <div data-testid="icon-x" />,
    FileText: () => <div data-testid="icon-file-text" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

vi.mock('./tiles/VariantConfigTile', () => ({
    VariantConfig: () => <div data-testid="variant-config-tile" />,
}));

describe('SeoAuditResults Component', () => {
    // Basic mock props aligned with the component's expectations
    const mockProps = {
        analysisResults: {
            originalScore: 45,
            variants: [],
        },
        selectedLead: {
            id: '1',
            name: 'Test Business Inc.',
            website: 'www.testbusiness.com',
            address: '123 Test St',
            primaryType: 'plumbing_contractor',
            socials: [],
        },
        onBack: vi.fn(),
    };

    beforeEach(() => {
        vi.useFakeTimers();
        // Mock window.open
        vi.spyOn(window, 'open').mockImplementation(() => {
            const documentWriteMock = vi.fn();
            return {
                document: {
                    write: documentWriteMock,
                    close: vi.fn(),
                },
                close: vi.fn(),
                focus: vi.fn(),
            } as unknown as Window;
        });
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders correctly', async () => {
        render(<SeoAuditResults {...mockProps} />);

        // Fast-forward past the loading state (800ms or 3500ms)
        act(() => {
            vi.runAllTimers();
        });

        // Check for a key element rendered - use getByText since we advanced timers
        expect(screen.getByText('BRANDLIFT OPTIMIZED')).toBeInTheDocument();
    });

    it('generates proposal HTML when button is clicked', async () => {
        render(<SeoAuditResults {...mockProps} />);

        // Fast-forward past the loading state
        act(() => {
            vi.runAllTimers();
        });

        // Find the Generate Proposal button
        // There are multiple buttons with this text, grab the first one
        const generateButtons = screen.getAllByText(/GENERATE PROPOSAL/i);
        const generateBtn = generateButtons[0];

        // Click it
        fireEvent.click(generateBtn);


        // Verify window.open was called
        expect(window.open).toHaveBeenCalled();

        // Get the return value of the mocked window.open (which is our fake window object)
        const openedWindow = (window.open as unknown as Mock).mock.results[0].value;
        const documentWriteMock = openedWindow.document.write;

        // Verify document.write was called
        expect(documentWriteMock).toHaveBeenCalled();

        // Get the HTML string passed to document.write
        const generatedHtml = documentWriteMock.mock.calls[0][0];

        // CRITICAL CHECKS:
        // 1. Check for business name injection
        expect(generatedHtml).toContain('Test Business Inc.');

        // 2. Check for the audit section header
        expect(generatedHtml).toContain('Technical Optimization Audit');

        // 3. Check for the specific variable injection that caused the crash
        // The code does: const businessType = "plumbing contractor"; (after replace)
        expect(generatedHtml).toContain('const businessType = "plumbing contractor"');
    });
});
