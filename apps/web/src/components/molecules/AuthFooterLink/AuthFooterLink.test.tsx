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
})
