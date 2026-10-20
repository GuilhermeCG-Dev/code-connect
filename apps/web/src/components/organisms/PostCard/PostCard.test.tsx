import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { PostCard } from './PostCard'

const post: PostSummary = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Como organizar componentes.',
  tags: ['react', 'front-end'],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana Souza' },
  likesCount: 3,
  commentsCount: 2,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

function renderCard(canInteract: boolean, onToggleLike = vi.fn()) {
  render(
    <MemoryRouter>
      <PostCard post={post} canInteract={canInteract} onToggleLike={onToggleLike} />
    </MemoryRouter>,
  )
  return onToggleLike
}

describe('PostCard', () => {
  it('renders the post summary with a link to the detail page', () => {
    renderCard(true)

    expect(screen.getByRole('link', { name: 'Componentes em React' })).toHaveAttribute('href', '/posts/p1')
    expect(screen.getByText('Como organizar componentes.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['react', 'front-end'])
    expect(screen.getByText('@anasouza')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comentários (2)' })).toHaveAttribute('href', '/posts/p1#comentarios')
  })

  it('shows the placeholder when the post has no thumbnail', () => {
    renderCard(true)
    expect(screen.getByRole('img', { name: 'Capa do post Componentes em React (sem imagem)' })).toBeInTheDocument()
  })

  it('likes the post when logged in', async () => {
    const onToggleLike = renderCard(true)

    await userEvent.click(screen.getByRole('button', { name: 'Curtir (3)' }))

    expect(onToggleLike).toHaveBeenCalledWith(post)
  })

  it('disables the like button for anonymous users', () => {
    renderCard(false)
    expect(screen.getByRole('button', { name: /Faça login para curtir/ })).toBeDisabled()
  })
})
