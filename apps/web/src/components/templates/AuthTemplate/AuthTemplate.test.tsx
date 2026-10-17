import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders banner, content and footer slots', () => {
    render(
      <AuthTemplate bannerSrc="/b.png" bannerAlt="Banner de teste" footer={<p>rodapé</p>}>
        <p>conteúdo</p>
      </AuthTemplate>,
    )
    expect(screen.getByRole('img', { name: 'Banner de teste' })).toHaveAttribute('src', '/b.png')
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(screen.getByText('rodapé')).toBeInTheDocument()
  })
})
