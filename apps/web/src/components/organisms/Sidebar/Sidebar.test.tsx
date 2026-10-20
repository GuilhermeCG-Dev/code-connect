import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

function renderSidebar(isAuthenticated: boolean, onSignOut = vi.fn()) {
  render(
    <MemoryRouter>
      <Sidebar isAuthenticated={isAuthenticated} onSignOut={onSignOut} />
    </MemoryRouter>,
  )
  return onSignOut
}

describe('Sidebar', () => {
  it('shows the login link for anonymous users', () => {
    renderSidebar(false)
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publicar' })).not.toBeInTheDocument()
  })

  it('shows publish and sign out for logged users', async () => {
    const onSignOut = renderSidebar(true)

    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/posts/new')
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(onSignOut).toHaveBeenCalledTimes(1)
  })
})
