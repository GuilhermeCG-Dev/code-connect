import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile } from '../../../services/auth'
import { likePost, listPosts } from '../../../services/posts'
import type { Paginated, PostSummary } from '../../../services/posts'
import { saveToken } from '../../../services/token'
import { FeedPage } from './FeedPage'

vi.mock('../../../services/auth')
vi.mock('../../../services/posts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/posts')>()),
  listPosts: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

const post: PostSummary = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Resumo',
  tags: ['react'],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana' },
  likesCount: 1,
  commentsCount: 0,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

function result(items: PostSummary[], page = 1, totalPages = 1): Paginated<PostSummary> {
  return { items, meta: { page, limit: 12, total: items.length, totalPages } }
}

function renderFeed(path = '/') {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<FeedPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('lists posts for anonymous users with likes disabled', async () => {
    vi.mocked(listPosts).mockResolvedValue(result([post]))
    renderFeed()

    expect(await screen.findByRole('link', { name: 'Componentes em React' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Faça login para curtir/ })).toBeDisabled()
    expect(listPosts).toHaveBeenCalledWith({ q: undefined, sort: 'recent', page: 1 })
  })

  it('sends the search, sort and page from the URL', async () => {
    vi.mocked(listPosts).mockResolvedValue(result([]))
    renderFeed('/?q=kotlin&sort=popular&page=2')

    expect(await screen.findByText('Nenhum post encontrado para "kotlin".')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resultados para "kotlin"' })).toBeInTheDocument()
    expect(listPosts).toHaveBeenCalledWith({ q: 'kotlin', sort: 'popular', page: 2 })
  })

  it('changes the page and the sort order', async () => {
    vi.mocked(listPosts).mockResolvedValue(result([post], 1, 3))
    renderFeed()

    await userEvent.click(await screen.findByRole('button', { name: 'Próxima' }))
    expect(listPosts).toHaveBeenLastCalledWith({ q: undefined, sort: 'recent', page: 2 })

    await userEvent.click(screen.getByRole('button', { name: 'Populares' }))
    expect(listPosts).toHaveBeenLastCalledWith({ q: undefined, sort: 'popular', page: 1 })
  })

  it('likes a post when logged in', async () => {
    saveToken('token', true)
    vi.mocked(getProfile).mockResolvedValue({ id: 'u2', name: 'Bia', email: 'b@c.d', createdAt: '' })
    vi.mocked(listPosts).mockResolvedValue(result([post]))
    vi.mocked(likePost).mockResolvedValue()
    renderFeed()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir (1)' }))

    expect(likePost).toHaveBeenCalledWith('p1')
    expect(screen.getByRole('button', { name: 'Descurtir (2)' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('rolls back the like when the request fails', async () => {
    saveToken('token', true)
    vi.mocked(getProfile).mockResolvedValue({ id: 'u2', name: 'Bia', email: 'b@c.d', createdAt: '' })
    vi.mocked(listPosts).mockResolvedValue(result([post]))
    vi.mocked(likePost).mockRejectedValue(new Error('fail'))
    renderFeed()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir (1)' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível registrar sua curtida.')
    expect(screen.getByRole('button', { name: 'Curtir (1)' })).toBeInTheDocument()
  })

  it('shows an error when the API is down', async () => {
    vi.mocked(listPosts).mockRejectedValue(new Error('Network Error'))
    renderFeed()

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os posts.')
  })
})
