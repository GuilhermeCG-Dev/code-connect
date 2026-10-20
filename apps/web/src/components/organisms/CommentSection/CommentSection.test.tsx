import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Comment } from '../../../services/posts'
import { CommentSection } from './CommentSection'

const comment: Comment = {
  id: 'c1',
  body: 'Ótimo post!',
  author: { id: 'u1', name: 'Bruno Lima' },
  createdAt: '2026-10-19T12:00:00.000Z',
}

function renderSection(canComment: boolean, overrides = {}) {
  const props = {
    comments: [comment],
    total: 3,
    canComment,
    hasMore: true,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onLoadMore: vi.fn(),
    ...overrides,
  }
  render(
    <MemoryRouter>
      <CommentSection {...props} />
    </MemoryRouter>,
  )
  return props
}

describe('CommentSection', () => {
  it('asks anonymous users to log in instead of showing the form', () => {
    renderSection(false)

    expect(screen.getByRole('heading', { name: 'Comentários (3)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça login para comentar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByLabelText('Seu comentário')).not.toBeInTheDocument()
    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
  })

  it('lets logged users comment and load more', async () => {
    const props = renderSection(true)

    await userEvent.type(screen.getByLabelText('Seu comentário'), 'Concordo')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais comentários' }))

    expect(props.onSubmit).toHaveBeenCalledWith('Concordo')
    expect(props.onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('shows an empty message without comments', () => {
    renderSection(true, { comments: [], total: 0, hasMore: false })
    expect(screen.getByText('Seja o primeiro a comentar.')).toBeInTheDocument()
  })
})
