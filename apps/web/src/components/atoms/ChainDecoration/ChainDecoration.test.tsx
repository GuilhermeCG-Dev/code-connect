import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChainDecoration } from './ChainDecoration'

describe('ChainDecoration', () => {
  it('is hidden from assistive tech', () => {
    render(<ChainDecoration />)
    expect(screen.getByTestId('chain-decoration')).toHaveAttribute('aria-hidden', 'true')
  })
})
