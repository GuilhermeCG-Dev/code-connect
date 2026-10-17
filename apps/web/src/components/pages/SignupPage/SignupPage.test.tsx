import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SignupPage } from './SignupPage'

describe('SignupPage', () => {
  it('renders form, social login and login link', () => {
    render(<SignupPage />)
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('img', { name: /CodeConnect/ })).toBeInTheDocument()
  })
})
