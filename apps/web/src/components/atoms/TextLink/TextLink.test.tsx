import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextLink } from './TextLink'

describe('TextLink', () => {
  it('renders link with href', () => {
    render(<TextLink href="/x">Esqueci a senha</TextLink>)
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toHaveAttribute('href', '/x')
  })
})
