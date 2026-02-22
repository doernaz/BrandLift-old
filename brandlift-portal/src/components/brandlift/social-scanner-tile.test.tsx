
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SocialScannerTile } from './social-scanner-tile'

describe('SocialScannerTile', () => {

    it('renders correctly and initiates scan with mocked results', async () => {
        // Mock console
        const consoleSpy = vi.spyOn(console, 'log')
        window.alert = vi.fn()

        render(<SocialScannerTile />)

        // Find Inputs by aria-label
        const industrySelect = screen.getByRole('combobox', { name: /select industry/i })
        const stateSelect = screen.getByRole('combobox', { name: /select state/i })

        // Initially Button SHOULD be disabled
        const button = screen.getByRole('button', { name: /initiate sequence/i })
        expect(button).toBeDisabled()

        // Select Values - Use Valid Options!
        fireEvent.change(industrySelect, { target: { value: 'HVAC & Cooling' } })
        fireEvent.change(stateSelect, { target: { value: 'AZ' } })

        // Now Button enabled
        expect(button).not.toBeDisabled()

        // Click
        fireEvent.click(button)

        // Expect Scanner State (Badge change)
        expect(screen.getByText(/SCANNING.../i)).toBeInTheDocument()

        // Expect Results to appear (mock data "HVAC & Cooling Pro")
        await waitFor(() => {
            const rows = screen.getAllByText(/HVAC & Cooling Pro/i)
            expect(rows.length).toBeGreaterThan(0)
        })

        // Check logs appearing in UI
        expect(screen.getByText(/\[SUCCESS\] Generated/i)).toBeInTheDocument()

        consoleSpy.mockRestore()
    })
})
