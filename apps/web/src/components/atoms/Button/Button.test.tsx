import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children and handles click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Login</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders icon next to label', () => {
    render(<Button icon={<span data-testid="icon" />}>Login</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders the outline variant as a disabled button', () => {
    render(
      <Button variant="outline" disabled>
        Publicar
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled()
  })
})
