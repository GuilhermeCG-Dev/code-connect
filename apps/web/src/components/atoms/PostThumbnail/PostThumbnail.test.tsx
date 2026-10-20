import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostThumbnail } from './PostThumbnail'

describe('PostThumbnail', () => {
  it('renders the post image', () => {
    render(<PostThumbnail src="/api/uploads/a.png" alt="Capa do post React" />)
    expect(screen.getByRole('img', { name: 'Capa do post React' })).toHaveAttribute('src', '/api/uploads/a.png')
  })

  it('shows the placeholder when the post has no thumbnail', () => {
    render(<PostThumbnail src={null} alt="Capa do post React" />)
    expect(screen.getByRole('img', { name: 'Capa do post React (sem imagem)' })).toHaveAttribute(
      'src',
      '/thumbnail-placeholder.png',
    )
  })

  it('switches to the placeholder when the image fails to load', () => {
    render(<PostThumbnail src="/api/uploads/missing.png" alt="Capa" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img', { name: 'Capa (sem imagem)' })).toHaveAttribute('src', '/thumbnail-placeholder.png')
  })
})
