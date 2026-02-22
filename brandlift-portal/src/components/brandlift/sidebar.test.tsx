
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sidebar } from './sidebar'

// Mock usePathname
vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
}))

describe('Sidebar', () => {
    it('renders navigation links', () => {
        render(<Sidebar />)

        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
        expect(screen.getByRole('link', { name: /scanner/i })).toHaveAttribute('href', '/dashboard/scanner')
        expect(screen.getByRole('link', { name: /deployments/i })).toHaveAttribute('href', '/dashboard/deployments')
    })

    it('renders the brand logo/title', () => {
        render(<Sidebar />)
        expect(screen.getByText(/brandlift/i)).toBeInTheDocument()
    })
})
