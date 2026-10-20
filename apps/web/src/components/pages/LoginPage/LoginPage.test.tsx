import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile, login } from '../../../services/auth'
import { getToken } from '../../../services/token'
import { LoginPage } from './LoginPage'

vi.mock('../../../services/auth')

function renderPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>feed</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

function httpError(status: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: {},
  })
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), 'ana@codeconnect.dev')
  await userEvent.type(screen.getByLabelText('Senha'), 'supersecret')
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders form, social login and signup link', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('img', { name: /CodeConnect/ })).toBeInTheDocument()
  })

  it('logs in, stores the token and opens the feed', async () => {
    vi.mocked(login).mockResolvedValue({ accessToken: 'token-123' })
    vi.mocked(getProfile).mockResolvedValue({
      id: '1',
      name: 'Ana Souza',
      email: 'ana@codeconnect.dev',
      createdAt: '2026-10-19T12:00:00.000Z',
    })
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByText('feed')).toBeInTheDocument()
    expect(getProfile).toHaveBeenCalled()
    expect(login).toHaveBeenCalledWith({ email: 'ana@codeconnect.dev', password: 'supersecret' })
    expect(getToken()).toBe('token-123')
  })

  it('shows an error for invalid credentials', async () => {
    vi.mocked(login).mockRejectedValue(httpError(401))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha inválidos.')
    expect(getToken()).toBeNull()
  })

  it('shows a connection error when the API is down', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Network Error'))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.')
  })
})
