import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_EXPIRED_EVENT } from '../services/api'
import { getProfile } from '../services/auth'
import { getToken, saveToken } from '../services/token'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../services/auth')

const ana = { id: '1', name: 'Ana Souza', email: 'ana@codeconnect.dev', createdAt: '2026-10-19T12:00:00.000Z' }

function Probe() {
  const { user, status, signIn, signOut } = useAuth()
  return (
    <div>
      <p>status: {status}</p>
      <p>user: {user?.name ?? 'none'}</p>
      <button onClick={() => void signIn('new-token', false)}>entrar</button>
      <button onClick={signOut}>sair</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('starts anonymous without a stored token', () => {
    renderProvider()
    expect(screen.getByText('status: anonymous')).toBeInTheDocument()
    expect(getProfile).not.toHaveBeenCalled()
  })

  it('restores the session from a stored token', async () => {
    saveToken('stored', true)
    vi.mocked(getProfile).mockResolvedValue(ana)
    renderProvider()

    expect(screen.getByText('status: loading')).toBeInTheDocument()
    expect(await screen.findByText('user: Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('status: authenticated')).toBeInTheDocument()
  })

  it('drops an invalid stored token', async () => {
    saveToken('expired', true)
    vi.mocked(getProfile).mockRejectedValue(new Error('401'))
    renderProvider()

    expect(await screen.findByText('status: anonymous')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('signs in and signs out', async () => {
    vi.mocked(getProfile).mockResolvedValue(ana)
    renderProvider()

    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
    expect(await screen.findByText('user: Ana Souza')).toBeInTheDocument()
    expect(getToken()).toBe('new-token')

    await userEvent.click(screen.getByRole('button', { name: 'sair' }))
    expect(screen.getByText('status: anonymous')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('signs out when the API reports an expired session', async () => {
    vi.mocked(getProfile).mockResolvedValue(ana)
    renderProvider()
    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
    await screen.findByText('status: authenticated')

    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    })

    expect(screen.getByText('status: anonymous')).toBeInTheDocument()
  })
})
