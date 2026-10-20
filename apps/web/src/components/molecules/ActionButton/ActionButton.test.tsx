import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('shows the count and handles click', async () => {
    const onClick = vi.fn()
    render(<ActionButton icon="thumb-up" label="Curtir" count={3} pressed={false} onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Curtir (3)' })
    expect(button).toHaveTextContent('3')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled with an explanation', async () => {
    const onClick = vi.fn()
    render(<ActionButton icon="thumb-up" label="Curtir" disabledReason="Faça login para curtir" onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Curtir - Faça login para curtir' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
