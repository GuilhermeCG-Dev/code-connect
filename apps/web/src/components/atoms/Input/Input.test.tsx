import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('accepts typing', async () => {
    render(<Input placeholder="usuario" />)
    const input = screen.getByPlaceholderText('usuario')
    await userEvent.type(input, 'abc')
    expect(input).toHaveValue('abc')
  })
})
