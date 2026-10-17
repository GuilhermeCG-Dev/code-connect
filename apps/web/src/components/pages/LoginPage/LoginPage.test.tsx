import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders form, social login and signup link', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('img', { name: /CodeConnect/ })).toBeInTheDocument()
  })
})
