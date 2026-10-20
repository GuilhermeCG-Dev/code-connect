import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile } from '../../../services/auth'
import { getToken, saveToken } from '../../../services/token'
import { AppLayout } from './AppLayout'

vi.mock('../../../services/auth')

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

function renderLayout(path = '/posts/1') {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="*" element={<LocationProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows the login link for anonymous users', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })

  it('shows sign out for logged users and signs out', async () => {
    saveToken('token', true)
    vi.mocked(getProfile).mockResolvedValue({ id: '1', name: 'Ana', email: 'a@b.c', createdAt: '' })
    renderLayout()

    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }))

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('searches by going to the feed with the query', async () => {
    renderLayout()

    await userEvent.type(screen.getByRole('searchbox'), 'react hooks{Enter}')

    expect(screen.getByTestId('location')).toHaveTextContent('/?q=react+hooks')
  })
})
