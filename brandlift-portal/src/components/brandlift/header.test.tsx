
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './header'

describe('Header', () => {
    it('renders user greeting', () => {
        render(<Header />)
        expect(screen.getByText(/brandlift portal/i)).toBeInTheDocument()
    })

    it('renders user avatar', () => {
        render(<Header />)
        // Assuming we use an Avatar fallback or image
        const avatar = screen.getByRole('img', { hidden: true }) // Icons/Images often hidden from screenreader by default or decorative
        expect(avatar).toBeInTheDocument()
    })
})
