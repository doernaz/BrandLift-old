
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
// We'll just define the layout func here to test integration logic or import if setup correctly
// Since layout.tsx is default export but uses aliases
import DashboardLayout from './layout'

// Mock components
vi.mock('@/components/brandlift/sidebar', () => ({
    Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>
}))
vi.mock('@/components/brandlift/header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>
}))

describe('DashboardLayout', () => {
    it('integrates sidebar and header', () => {
        render(
            <DashboardLayout>
                <div data-testid="child-content">Child Content</div>
            </DashboardLayout>
        )

        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('mock-header')).toBeInTheDocument()
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })
})
