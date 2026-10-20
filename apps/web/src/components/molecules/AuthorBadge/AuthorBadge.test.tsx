import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthorBadge } from './AuthorBadge'

describe('AuthorBadge', () => {
  it('shows the author handle', () => {
    render(<AuthorBadge name="Ana Souza Ávila" />)
    expect(screen.getByText('@anasouzaavila')).toBeInTheDocument()
  })
})
