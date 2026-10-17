import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('toggles when clicked', async () => {
    render(<Checkbox label="Lembrar-me" />)
    const box = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
  })
})
