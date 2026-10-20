import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('submits typed values', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Email'), 'ana@codeconnect.dev')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'ana@codeconnect.dev',
      password: 'segredo',
      remember: true,
    })
  })

  it('shows title and forgot password link', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toBeInTheDocument()
  })

  it('disables the button while submitting', () => {
    render(<LoginForm onSubmit={vi.fn()} isSubmitting />)
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
  })

  it('shows the error message', () => {
    render(<LoginForm onSubmit={vi.fn()} error="Email ou senha inválidos." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email ou senha inválidos.')
  })
})
