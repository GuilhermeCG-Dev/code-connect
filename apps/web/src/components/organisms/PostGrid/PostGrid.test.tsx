import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { PostSummary } from '../../../services/posts'
import { PostGrid } from './PostGrid'

const post: PostSummary = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Resumo',
  tags: [],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana' },
  likesCount: 0,
  commentsCount: 0,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

describe('PostGrid', () => {
  it('renders one card per post', () => {
    render(
      <MemoryRouter>
        <PostGrid posts={[post, { ...post, id: 'p2', title: 'Outro' }]} canInteract={false} onToggleLike={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('shows an empty state for a search without results', () => {
    render(<PostGrid posts={[]} query="kotlin" canInteract={false} onToggleLike={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum post encontrado para "kotlin".')
  })
})
