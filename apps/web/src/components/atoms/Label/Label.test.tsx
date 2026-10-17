import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renders text and links to control', () => {
    render(
      <>
        <Label htmlFor="x">Senha</Label>
        <input id="x" />
      </>,
    )
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })
})
