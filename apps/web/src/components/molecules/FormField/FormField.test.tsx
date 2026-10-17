import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associates label with input', async () => {
    render(<FormField label="Email ou usuário" />)
    const input = screen.getByLabelText('Email ou usuário')
    await userEvent.type(input, 'abc')
    expect(input).toHaveValue('abc')
  })
})
