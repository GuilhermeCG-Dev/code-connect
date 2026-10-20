import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('accepts typed text', async () => {
    render(<Textarea aria-label="Comentário" />)
    await userEvent.type(screen.getByRole('textbox', { name: 'Comentário' }), 'Olá')
    expect(screen.getByRole('textbox', { name: 'Comentário' })).toHaveValue('Olá')
  })
})
