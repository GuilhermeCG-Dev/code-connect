import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from './Logo'

describe('Logo', () => {
  it('renders the CodeConnect logo', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'CodeConnect' })).toHaveAttribute('src', '/logo.svg')
  })
})
