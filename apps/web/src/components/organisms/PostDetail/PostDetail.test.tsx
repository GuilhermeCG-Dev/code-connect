import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PostDetail as PostDetailData } from '../../../services/posts'
import { PostDetail } from './PostDetail'

const post: PostDetailData = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Resumo',
  body: 'Primeiro parágrafo.\n\nSegundo parágrafo.',
  tags: ['react'],
  thumbnailUrl: '/uploads/capa.png',
  author: { id: 'u1', name: 'Ana Souza' },
  likesCount: 5,
  commentsCount: 1,
  likedByMe: true,
  createdAt: '2026-10-19T12:00:00.000Z',
}

describe('PostDetail', () => {
  it('renders the full post', () => {
    render(<PostDetail post={post} canInteract onToggleLike={vi.fn()} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Componentes em React' })).toBeInTheDocument()
    expect(screen.getByText(/Segundo parágrafo/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Capa do post Componentes em React' })).toHaveAttribute(
      'src',
      '/api/uploads/capa.png',
    )
  })

  it('removes the like when already liked', async () => {
    const onToggleLike = vi.fn()
    render(<PostDetail post={post} canInteract onToggleLike={onToggleLike} />)

    const button = screen.getByRole('button', { name: 'Descurtir (5)' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(button)

    expect(onToggleLike).toHaveBeenCalledTimes(1)
  })
})
