import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders level 1 by default', () => {
    render(<Heading>Login</Heading>)
    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
  })

  it('renders level 2 via as', () => {
    render(<Heading as="h2">Cadastro</Heading>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
