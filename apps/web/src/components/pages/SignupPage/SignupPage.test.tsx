import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile, login, signup } from '../../../services/auth'
import { getToken } from '../../../services/token'
import { SignupPage } from './SignupPage'

vi.mock('../../../services/auth')

function renderPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/cadastro']}>
        <Routes>
          <Route path="/cadastro" element={<SignupPage />} />
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
  await userEvent.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await userEvent.type(screen.getByLabelText('Email'), 'ana@codeconnect.dev')
  await userEvent.type(screen.getByLabelText('Senha'), 'supersecret')
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders form, social login and login link', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('img', { name: /CodeConnect/ })).toBeInTheDocument()
  })

  it('creates the account, signs in and opens the feed', async () => {
    vi.mocked(signup).mockResolvedValue({
      id: '1',
      name: 'Ana Souza',
      email: 'ana@codeconnect.dev',
      createdAt: '2026-10-19T12:00:00.000Z',
    })
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
    expect(signup).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    })
    expect(getToken()).toBe('token-123')
  })

  it('shows an error when the email is taken', async () => {
    vi.mocked(signup).mockRejectedValue(httpError(409))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Este email já está cadastrado.')
    expect(login).not.toHaveBeenCalled()
  })
})
