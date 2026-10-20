import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { NavItem } from './NavItem'

describe('NavItem', () => {
  it('renders a link marked as current on its route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavItem icon="feed" label="Feed" to="/" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders a button when it has an action', async () => {
    const onClick = vi.fn()
    render(<NavItem icon="logout" label="Sair" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
