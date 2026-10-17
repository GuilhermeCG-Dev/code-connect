import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthFooterLink } from './AuthFooterLink'

describe('AuthFooterLink', () => {
  it('renders question and link', () => {
    render(
      <AuthFooterLink
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        href="/cadastro"
      />,
    )
    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
  })

  it('renders the chosen icon inside the link', () => {
    render(
      <AuthFooterLink
        question="Já tem conta?"
        linkText="Faça seu login!"
        href="/"
        icon="login"
        layout="inline"
      />,
    )
    const link = screen.getByRole('link', { name: 'Faça seu login!' })
    expect(link.querySelector('svg')).toHaveAttribute('data-icon', 'login')
  })
})
