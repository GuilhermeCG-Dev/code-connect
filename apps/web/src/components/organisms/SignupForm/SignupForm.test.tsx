import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SignupForm } from './SignupForm'

describe('SignupForm', () => {
  it('submits typed values', async () => {
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Bia Souza')
    await userEvent.type(screen.getByLabelText('Email'), 'bia@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Bia Souza',
      email: 'bia@email.com',
      password: 'segredo123',
      remember: true,
    })
  })

  it('shows title and subtitle', () => {
    render(<SignupForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
  })

  it('disables the button while submitting', () => {
    render(<SignupForm onSubmit={vi.fn()} isSubmitting />)
    expect(screen.getByRole('button', { name: 'Cadastrando...' })).toBeDisabled()
  })

  it('shows the error message', () => {
    render(<SignupForm onSubmit={vi.fn()} error="Este email já está cadastrado." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Este email já está cadastrado.')
  })
})
